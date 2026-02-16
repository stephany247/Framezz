// app/_app.tsx  (or wherever this component lives)
import React from "react";
import { View, Text, ActivityIndicator, Image } from "react-native";
import "../global.css";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { api } from "@/convex/_generated/api";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import SignInCTA from "@/components/SignInCTA";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignOutButton } from "@/components/SignOutButton";
import { Redirect } from "expo-router";

export default function App() {
  const { isLoading, isAuthenticated } = useStoreUserEffect();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="mt-3 text-gray-500">Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

 if (isAuthenticated) {
  return <Redirect href="/(tabs)/feed" />;
}

  return (
    <SafeAreaView className="flex-1 items-center bg-white dark:bg-black">
      <View className="flex-1 items-center justify-center px-6 space-y-6">
        <View className="p-8 mb-8 bg-sky-500/10 rounded-2xl">
          <Image
            source={require("../assets/images/icon-logo.png")}
            className="w-150 h-150"
          />
        </View>
        <Text className="text-6xl font-bold text-black dark:text-white">
          Framez
        </Text>

        <Text className="text-gray-500 mb-8 text-center text-base font-bold uppercase tracking-widest">
          Capture Life
        </Text>
      </View>
      <SignInCTA />
    </SafeAreaView>
  );
}

function AuthenticatedHeader() {
  const { user } = useUser();
  const profile = useQuery(api.users.getUserProfile);

  // keep logging only on real errors (no noisy logs here)
  if (!profile) {
    return <>{user ? (user.firstName ?? user.username) : "user"}!</>;
  }

  return <>{profile.name ?? (user ? user.username : "user")}!</>;
}
