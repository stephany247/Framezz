// app/(auth)/enter-code.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";

function serializeError(err: any) {
  try {
    return JSON.stringify(err, Object.getOwnPropertyNames(err), 2);
  } catch {
    return String(err);
  }
}

export default function EnterCode() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signInId, emailAddressId } = useLocalSearchParams() as {
    signInId?: string;
    emailAddressId?: string;
  };
  const router = useRouter();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!signInId) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 p-6 justify-center">
          <Text className="text-white text-center mb-4">
            Missing sign-in attempt. Please start sign-in again.
          </Text>
          <Pressable
            onPress={() => router.push("/(auth)/sign-in")}
            className="bg-sky-500 px-4 py-3 rounded-md items-center"
          >
            <Text className="text-black font-medium">Back to sign in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  async function submitCode() {
    if (!isLoaded) return Alert.alert("Auth not ready");
    setLoading(true);
    try {
      // pass signInId so Clerk can find the original attempt if needed
      const res: any = await (signIn as any).attemptFirstFactor({
        strategy: "email_code",
        code,
        // signInId,
      });

      if (res?.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.replace("/(tabs)/feed");
        return;
      }

      Alert.alert("Verification incomplete", JSON.stringify(res));
    } catch (err: any) {
      console.error("verify error", serializeError(err));
      Alert.alert("Could not verify code", err?.message ?? "See logs");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (!emailAddressId)
      return Alert.alert("No email id available to resend to");
    setResending(true);
    try {
      const r: any = await (signIn as any).prepareFirstFactor({
        strategy: "email_code",
        emailAddressId,
      });

      Alert.alert("Code resent", "Check your email");
      return r;
    } catch (err: any) {
      console.error("resend error", serializeError(err));
      Alert.alert("Resend failed", err?.message ?? "See logs");
    } finally {
      setResending(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-black mt-12">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 p-6 justify-center"
      >
        <Text className="text-xl text-white font-semibold mb-4 text-center">
          Enter verification code
        </Text>

        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="6-digit code"
          keyboardType="number-pad"
          placeholderTextColor="#9CA3AF"
          className="border border-gray-600 p-3 rounded-lg mb-5 text-gray-100 placeholder:text-gray-400"
          maxLength={8}
        />

        <View className="mb-3">
          <Pressable
            onPress={submitCode}
            disabled={loading}
            className={`w-full rounded-md px-4 py-3 items-center ${loading ? "bg-gray-700" : "bg-sky-500"}`}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Verify code</Text>
            )}
          </Pressable>
        </View>

        <View className="h-3" />

        <View className="mb-3">
          <Pressable
            onPress={resendCode}
            disabled={resending}
            className="w-full rounded-md px-4 py-3 items-center bg-transparent border border-gray-500"
            accessibilityRole="button"
          >
            {resending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-gray-300">Resend code</Text>
            )}
          </Pressable>
        </View>

        <View className="h-3" />

        <Pressable
          onPress={() => router.push("/(auth)/sign-in")}
          className="w-full rounded-md px-4 py-3 items-center bg-gray-800"
        >
          <Text className="text-gray-300">Back to sign in</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
