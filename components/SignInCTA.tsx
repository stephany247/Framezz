// import { SignInButton } from "@clerk/clerk-react";
import { useRouter } from "expo-router";
import { Platform, Pressable, Text, View } from "react-native";

type AppProps = {
  className?: string;
};

export default function SignInCTA({ className }: AppProps) {
  const router = useRouter();
  const btnStyles =
    "bg-sky-500 hover:to-sky-500/70 py-3 w-1/2 text-white font-medium inline-flex items-center justify-center rounded-lg";

  return (
    <Pressable
      onPress={() => router.push("/(auth)/sign-in")}
      className={`${btnStyles} ${className}`}
    >
      <Text className="text-white font-medium text-lg">Get started</Text>
    </Pressable>
  );
}
