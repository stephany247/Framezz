import { api } from "@/convex/_generated/api";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import { SignInButton, SignOutButton, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { ActivityIndicator, Text, View } from "react-native";
import "../global.css";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SignInCTA from "@/components/SignInCTA";

type AppProps = {
  className?: string;
};

export default function App({ className }: AppProps) {
  const { isLoading, isAuthenticated } = useStoreUserEffect();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-gray-500">Loading…</Text>
      </View>
    );
  }

  const btnStyles =
    "bg-blue-500 hover:to-blue-500/70 py-3 w-1/2 text-white font-medium inline-flex items-center justify-center rounded-lg";

  // Show feed if logged in (optional redirect later)
  if (isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-white space-y-6">
        <Text className="text-2xl font-bold text-blue-600">
          Welcome back, <AuthenticatedHeader />
        </Text>
        <Text className="text-gray-500 mt-2">
          You&apos;re signed in and ready to go!
        </Text>
        <SignOutButton>
          <View className={`${btnStyles} ${className}`}>Sign out</View>
        </SignOutButton>
      </View>
    );
  }

  // Default landing view: welcome text + Clerk auth button
  return (
    <View className="flex-1 items-center justify-center bg-white px-6 space-y-6">
      <Text className="text-6xl font-bold mb-2 text-blue-600 font-lobster italic">Framez</Text>
      <Text className="text-gray-500 mb-8 text-center text-2xl">
        Share your moments in frames <MaterialCommunityIcons name="camera-plus" size={24} color="blue" />
      </Text>

      {/* <SignInButton mode="modal">
        <View className={`${btnStyles} ${className}`}>
          <Text className="text-white font-medium">Get started</Text>
        </View>
      </SignInButton> */}
      <SignInCTA />
    </View>
  );
}

function AuthenticatedHeader() {
  const { user } = useUser(); // Clerk client object
  const profile = useQuery(api.users.getUserProfile); // Convex users doc

  if (!profile) {
    // profile null means user hasn't been stored yet or query still loading
    return <>{user ? (user.firstName ?? user.username) : "user"}!</>;
  }

  return <>{profile.name ?? (user ? user.username : "user")}!</>;
}
