import AppText from "@/components/ui/AppText";
import { Feather } from "@expo/vector-icons";
import { Image, ImageBackground, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const logo = require("../assets/images/logo.png");
const bgImg = require("../assets/images/bg-2.png");
const smokeIcon = require("../assets/images/smokeImage2.png");
const temperatureIcon = require("../assets/images/Temperature.png");
const flameIcon = require("../assets/images/flame.png");

export default function Home() {
  const router = useRouter();
  return (
    <View className="h-full bg-white">
      {/* Header background and logo */}
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
        <AppText font="baumans" className="text-3xl text-white  pl-4">
          SafeSpark
        </AppText>
      </ImageBackground>

      {/* Main content area */}
      <View className="  bg-white -mt-12 rounded-t-3xl  border-2 border-gray-200 p-4 shadow-3xl h-5/6">
        <AppText className="text-sm bg-white text-left mb-6">
          Last Updated: 18:17:10
        </AppText>

        {/* Cards */}

        <View className="bg-cardBg border-2 border-gray-200 rounded-lg p-4 mb-4 shadow-md  justify-between items-center">
          <TouchableOpacity className="absolute top-2 right-2">
            <Feather name="info" size={12} color="grey" />
          </TouchableOpacity>
          <AppText font="baumans" className="text-3xl mb-6 text-customText ">
            38.5 °C
          </AppText>
          <Image source={temperatureIcon} className="w-12 h-12" />
        </View>

        <View className="bg-cardBg border-2 border-gray-200 rounded-lg p-4 mb-4 shadow-md  justify-between items-center">
          <TouchableOpacity className="absolute top-2 right-2">
            <Feather name="info" size={12} color="grey" />
          </TouchableOpacity>

          <AppText font="baumans" className="text-3xl text-customText mb-6 ">
            238.5 ppm
          </AppText>
          <Image source={smokeIcon} className="w-12 h-12" />
        </View>

        {/* Flame data */}
        <View className="bg-cardBg border-2 border-gray-200 rounded-lg p-4 mb-4 shadow-md  justify-between items-center">
          <TouchableOpacity className="absolute top-2 right-2">
            <Feather name="info" size={12} color="grey" />
          </TouchableOpacity>

          <AppText font="baumans" className="text-3xl text-customText mb-6 ">
            Flame
          </AppText>
          <Image source={flameIcon} className="w-12 h-12 " />
        </View>

        {/* ALert button */}
        <View className="items-center mt-6">
          <TouchableOpacity className="bg-customBg w-24 h-24 border-4 border-red-500 rounded-full justify-center items-center mb-4">
            <AppText className="text-white text-center font-semibold">
              Alert
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
