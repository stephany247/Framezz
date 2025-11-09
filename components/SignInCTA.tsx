import { Platform, Pressable, Text, View } from "react-native";
import { SignInButton } from "@clerk/clerk-react";
import { useRouter } from "expo-router";

type AppProps = {
  className?: string;
};

export default function SignInCTA({ className }: AppProps) {
  const router = useRouter();
  const btnStyles =
    "bg-blue-500 hover:to-blue-500/70 py-3 w-1/2 text-white font-medium inline-flex items-center justify-center rounded-lg";

  if (Platform.OS === "web") {
    return (
      <SignInButton mode="modal">
        <View className={`${btnStyles} ${className}`}>
          <Text style={{ color: "#fff" }}>Get started</Text>
        </View>
      </SignInButton>
    );
  }

  // mobile: push to your native sign-in screen (you build this using useSignIn)
  return (
    <Pressable
      onPress={() => router.push("/(auth)/sign-in")}
      className={`${btnStyles} ${className}`}
    >
      <Text style={{ color: "#fff" }}>Get started</Text>
    </Pressable>
  );
}
