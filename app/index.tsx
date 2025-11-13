// app/_app.tsx  (or wherever this component lives)
import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import "../global.css";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { api } from "@/convex/_generated/api";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import SignInCTA from "@/components/SignInCTA";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignOutButton } from "@/components/SignOutButton";

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
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center space-y-6 px-6">
          <Text className="text-2xl font-bold text-sky-500">
            Welcome back, <AuthenticatedHeader />
          </Text>
          <Text className="text-gray-500 text-center">
            You&apos;re signed in and ready to go!
          </Text>

          <SignOutButton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 items-center justify-center px-6 space-y-6">
        <Text className="text-6xl font-bold mb-2 text-sky-500 italic">
          Framez{" "}
          <MaterialCommunityIcons
            name="camera-plus"
            size={40}
            color="#0ea5e9"
          />
        </Text>

        <Text className="text-gray-500 mb-8 text-center text-2xl">
          Share your moments in frames
        </Text>

        <SignInCTA />
      </View>
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
