import AppText from "@/components/ui/AppText";
import { Feather } from "@expo/vector-icons";
import {
  Image,
  ImageBackground,
  View,
  TouchableOpacity,
  Alert, // Import Alert for user feedback
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Popover from "react-native-popover-view";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

const logo = require("../assets/images/logo.png");
const bgImg = require("../assets/images/bg-2.png");
const smokeIcon = require("../assets/images/smoke.png");
const humidityIcon = require("../assets/images/Humidity.png");
const temperatureIcon = require("../assets/images/Temperature.png");
const flameIcon = require("../assets/images/flame.png");

const SERVER_URL = "https://9b23e1ce033d.ngrok-free.app";

type SensorData = {
  temperature: number;
  humidity: number;
  smokeLevel: number;
  flameDetected: boolean;
};

export default function Home() {
  const router = useRouter();
  const [sensorData, setSensorData] = useState<SensorData | null>(null);

  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ["websocket"] });
    socket.on("connect", () =>
      console.log("✅ Connected to WebSocket Server!")
    );
    socket.on("sensor-data", (data: SensorData) => setSensorData(data));
    socket.on("connect_error", (err) =>
      console.error("Connection error:", err.message)
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleAlert = async () => {
    if (!sensorData) {
      Alert.alert("No Data", "Sensor data is not available yet.");
      return;
    }

    try {
      // 1. Get user info from AsyncStorage
      const name = await AsyncStorage.getItem("name");
      const apartment = await AsyncStorage.getItem("apartment");
      const address = await AsyncStorage.getItem("address");
      const district = await AsyncStorage.getItem("district"); // Get the district
      const storedLocation = await AsyncStorage.getItem("location");

      let parsedLocation = null;
      if (storedLocation) {
        try {
          // Attempt to parse as JSON array (new format)
          parsedLocation = JSON.parse(storedLocation);
        } catch (e) {
          console.error(
            "Failed to parse stored location as JSON array, attempting old format:",
            e
          );
          const parts = storedLocation
            .split(",")
            .map((part) => parseFloat(part.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            parsedLocation = [parts[1], parts[0]];
          } else {
            console.error(
              "Stored location is neither valid JSON nor old comma-separated format:",
              storedLocation
            );
            parsedLocation = null;
          }
        }
      }

      const alertPayload = {
        ...sensorData,

        location: parsedLocation,
        address: {
          apartment: apartment || "N/A",
          street: address || "N/A",
          district: district || "N/A",
        },
        name: name || "Unknown User",
        device_id: "ESP32-LivingRoom-01",
      };

      const response = await fetch(
        `${SERVER_URL}/api/fire-alerts/confirm-alert`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(alertPayload),
        }
      );

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Alert Sent!", "The authorities have been notified.");
      } else {
        Alert.alert("Error", result.message || "Could not send the alert.");
      }
    } catch (error) {
      console.error("❌ Error sending alert:", error);
      Alert.alert(
        "Network Error",
        "Failed to send the alert. Please check your connection."
      );
    }
  };

  const lastUpdated = new Date().toLocaleTimeString();

  return (
    <View className="h-full bg-white">
      {/* Header */}
      <ImageBackground
        source={bgImg}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 20,
        }}
        resizeMode="cover"
      >
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          className="absolute top-12 right-4 mt-4 p-2"
        >
          <Feather name="settings" size={20} color="white" />
        </TouchableOpacity>
        <Image source={logo} className="w-12 h-12" />
        <AppText font="baumans" className="text-3xl text-white pl-4">
          SafeSpark
        </AppText>
      </ImageBackground>

      {/* Main content */}
      <View className="bg-white -mt-12 rounded-t-3xl border-2 border-gray-200 p-4 shadow-3xl h-5/6">
        <AppText className="text-sm bg-white text-left mb-6">
          Last Updated: {lastUpdated}
        </AppText>

        {/* Temperature Card */}
        <View className="bg-cardBg border-2 border-gray-200 rounded-lg p-4 mb-4 shadow-md justify-between items-center">
          <AppText weight="bold" className="text-xl">
            Temperature
          </AppText>
          <Popover
            from={
              <TouchableOpacity className="absolute top-2 right-2">
                <Feather name="info" size={16} color="grey" />
              </TouchableOpacity>
            }
          >
            <View className="p-2">
              <AppText>
                Normal: 20-26°C. High temps `{"> 40°C"}` can indicate fire risk.
              </AppText>
            </View>
          </Popover>
          <View className="flex-row gap-4 mt-3">
            <AppText font="baumans" className="text-3xl text-customText">
              {sensorData ? `${sensorData.temperature.toFixed(1)} °C` : "-- °C"}
            </AppText>
            <Image source={temperatureIcon} className="w-12 h-12" />
          </View>
        </View>

        {/* Humidity */}
        <View className="bg-cardBg border-2 border-gray-200 rounded-lg p-4 mb-4 shadow-md justify-between items-center">
          <AppText weight="bold" className="text-xl">
            Humidity
          </AppText>
          <Popover
            from={
              <TouchableOpacity className="absolute top-2 right-2">
                <Feather name="info" size={16} color="grey" />
              </TouchableOpacity>
            }
          >
            <View className="p-2">
              <AppText>
                Measures moisture in the air. Very low humidity can increase
                static electricity.
              </AppText>
            </View>
          </Popover>
          <View className="flex-row gap-4 mt-3">
            <AppText font="baumans" className="text-3xl text-customText">
              {sensorData ? `${sensorData.humidity.toFixed(1)}%` : "-- %"}
            </AppText>
            <Image source={humidityIcon} className="w-12 h-12" />
          </View>
        </View>

        {/* Smoke */}
        <View className="bg-cardBg border-2 border-gray-200 rounded-lg p-4 mb-4 shadow-md justify-between items-center">
          <AppText weight="bold" className="text-xl">
            Smoke
          </AppText>
          <Popover
            from={
              <TouchableOpacity className="absolute top-2 right-2">
                <Feather name="info" size={16} color="grey" />
              </TouchableOpacity>
            }
          >
            <View className="p-2">
              <AppText>
                Detects smoke particles (ppm). Levels above 300 ppm are
                considered dangerous.
              </AppText>
            </View>
          </Popover>
          <View className="flex-row gap-4 mt-3">
            <AppText font="baumans" className="text-3xl text-customText">
              {sensorData ? `${sensorData.smokeLevel} ppm` : "-- ppm"}
            </AppText>
            <Image source={smokeIcon} className="w-12 h-12" />
          </View>
        </View>

        {/* Flame */}
        <View className="bg-cardBg border-2 border-gray-200 rounded-lg p-4 mb-4 shadow-md justify-between items-center">
          <AppText weight="bold" className="text-xl">
            Flame Status
          </AppText>
          <Popover
            from={
              <TouchableOpacity className="absolute top-2 right-2">
                <Feather name="info" size={16} color="grey" />
              </TouchableOpacity>
            }
          >
            <View className="p-2">
              <AppText>
                This sensor looks for the infrared signature of a direct flame.
              </AppText>
            </View>
          </Popover>
          <View className="flex-row gap-4 mt-3 items-center">
            {sensorData?.flameDetected ? (
              <AppText font="baumans" className="text-3xl text-red-600">
                Flame Detected
              </AppText>
            ) : (
              <AppText font="baumans" className="text-3xl text-customText">
                Flame Detected No Flame
              </AppText>
            )}
            <Image source={flameIcon} className="w-12 h-12" />
          </View>
        </View>

        {/* Alert Button */}
        <View className="items-center mt-6">
          <TouchableOpacity
            onPress={handleAlert} // <-- ADDED THIS
            className="bg-customBg w-24 h-24 border-4 border-red-500 rounded-full justify-center items-center mb-4"
          >
            <AppText className="text-white text-center font-semibold">
              Alert
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
