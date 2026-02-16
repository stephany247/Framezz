import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

export default function ForgotPasswordPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sendResetCode = async () => {
    if (!isLoaded) return;

    if (!email) {
      Alert.alert("Enter your email");
      return;
    }

    setLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      Alert.alert("Code sent", "Check your email for the reset code.");
      setStep("reset");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.errors?.[0]?.longMessage ?? "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!isLoaded) return;

    if (!code || !newPassword) {
      Alert.alert("Fill all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)/feed");
      } else {
        Alert.alert("Reset incomplete");
      }
    } catch (err: any) {
      Alert.alert(
        "Reset failed",
        err?.errors?.[0]?.longMessage ?? "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white dark:bg-gray-950 px-6 justify-center"
    >
      <Text className="text-3xl font-bold text-center text-black dark:text-white mb-8">
        Reset Password
      </Text>

      {step === "email" ? (
        <>
          <Text className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
            Email
          </Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-700 
            bg-gray-50 dark:bg-gray-900
            p-4 rounded-xl mb-6
            text-black dark:text-white"
            autoCapitalize="none"
            value={email}
            placeholder="you@email.com"
            placeholderTextColor="#9CA3AF"
            onChangeText={setEmail}
          />

          <TouchableOpacity
            onPress={sendResetCode}
            className="bg-sky-500 active:bg-sky-600 py-4 rounded-xl items-center"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Send Reset Code</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text className="mb-2 font-medium text-gray-600 dark:text-gray-400">
            Verification Code
          </Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-700 
            bg-gray-50 dark:bg-gray-900
            p-4 rounded-xl mb-4
            text-black dark:text-white"
            value={code}
            placeholder="Enter code"
            placeholderTextColor="#9CA3AF"
            onChangeText={setCode}
          />

          <Text className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
            New Password
          </Text>

          <View className="relative mb-6">
            <TextInput
              className="border border-gray-300 dark:border-gray-700 
              bg-gray-50 dark:bg-gray-900
              p-4 pr-12 rounded-xl
              text-black dark:text-white"
              secureTextEntry={!showPassword}
              value={newPassword}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              onChangeText={setNewPassword}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4"
            >
              <Text className="text-gray-500">
                <Feather name={showPassword ? "eye-off" : "eye"} size={24} />
              </Text>
            </Pressable>
          </View>

          <TouchableOpacity
            onPress={resetPassword}
            className="bg-sky-500 active:bg-sky-600 py-4 rounded-xl items-center"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Reset Password</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
