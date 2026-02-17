import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) {
      Alert.alert("Auth not ready");
      return;
    }

    if (!identifier || !password) {
      Alert.alert("Enter email/username and password");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn.create({
        identifier,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)/feed");
      } else {
        Alert.alert("Sign in incomplete");
      }
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ?? err?.message ?? "Invalid credentials";
      Alert.alert("Sign-in failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 p-5 justify-center bg-gray-100 dark:bg-gray-950 gap-2"
    >
      <Text className="text-3xl font-bold text-center text-black dark:text-white">
        Framez
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 text-center mb-8">
        Welcome back! Please enter your details.
      </Text>

      {/* Email / Username */}
      <View className="mb-4 gap-1">
        <Text className="mb-1 text-lg font-medium text-gray-600 dark:text-gray-400">
          Email or Username
        </Text>
        <TextInput
          className="border border-gray-300 dark:border-gray-700 
      bg-gray-50 dark:bg-gray-900
      p-4 rounded-xl
      text-black dark:text-white"
          autoCapitalize="none"
          value={identifier}
          placeholder="your@email.com"
          placeholderTextColor="#9CA3AF"
          onChangeText={setIdentifier}
        />
      </View>

      {/* Password */}
      <View className="mb-6 gap-1">
        <View className="flex-row justify-between items-center">
          <Text className="mb-1 text-lg font-medium text-gray-600 dark:text-gray-400">
            Password
          </Text>
          <Link href="/forget-password">
            <Text className="text-sky-500 text-sm mt-2">Forgot password?</Text>
          </Link>
        </View>

        <View className="relative">
          <TextInput
            className="border border-gray-300 dark:border-gray-700 
        bg-gray-50 dark:bg-gray-900
        p-4 pr-12 rounded-xl
        text-black dark:text-white"
            secureTextEntry={!showPassword}
            value={password}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            onChangeText={setPassword}
          />

          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3"
          >
            <Text className="text-gray-500">
              <Feather name={showPassword ? "eye-off" : "eye"} size={24} />
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={onSignInPress}
        disabled={loading}
        className="bg-sky-500 py-4 mt-2 rounded-lg items-center"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-lgr">Log In</Text>
        )}
      </Pressable>

      {/* <View className="h-3" /> */}

      <View className="flex-row gap-2 items-center justify-center mt-2">
        <Text className="text-gray-600 dark:text-gray-400">
          Don't have an account?
        </Text>
        <Link href="/sign-up">
          <Text className="text-sky-500 font-semibold">Sign up for free</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
