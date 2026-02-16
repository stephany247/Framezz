// import { SignInButton } from "@clerk/clerk-react";
import { useRouter } from "expo-router";
import { Platform, Pressable, Text, View } from "react-native";

type AppProps = {
  className?: string;
};

export default function SignInCTA({ className }: AppProps) {
  const router = useRouter();
  const btnStyles =
    "bg-sky-500 hover:to-sky-500/70 py-3 w-4/5 text-white font-medium inline-flex items-center justify-center rounded-full";

  return (
    <Pressable
      onPress={() => router.push("/(auth)/sign-up")}
      className={`${btnStyles} ${className}`}
    >
      <Text className="text-white font-medium text-lg">Get started</Text>
    </Pressable>
  );
}
