import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Feather from "@expo/vector-icons/Feather";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const storeUser = useMutation(api.users.storeUser);

  const [username, setUsername] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateUsername = (u: string) => {
    if (!u || u.length < 4 || u.length > 64) {
      return "Username must be 4–64 characters.";
    }
    const re = /^[A-Za-z0-9._-]+$/;
    if (!re.test(u)) return "Use letters, numbers, dot, underscore or hyphen.";
    return null;
  };

  const onSignUpPress = async () => {
    if (!isLoaded) {
      Alert.alert("Authentication not ready");
      return;
    }

    const usernameErr = validateUsername(username);
    if (usernameErr) {
      Alert.alert("Invalid username", usernameErr);
      return;
    }
    if (!emailAddress || !password) {
      Alert.alert("Missing fields", "Please provide email and password.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        emailAddress,
        password,
        username,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
      Alert.alert("Verification sent", "Check your email for the code.");
    } catch (err: any) {
      console.error("Sign up error:", err);
      const msg =
        err?.errors?.[0]?.longMessage ?? err?.message ?? "Sign up failed.";
      Alert.alert("Sign up failed", String(msg));
    } finally {
      setLoading(false);
    }
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });
      console.log("signUpAttempt:", signUpAttempt);

      if (signUpAttempt.status !== "complete") {
        console.error("Verification incomplete:", signUpAttempt);
        Alert.alert("Verification incomplete", "Check console for details.");
        return;
      }

      const createdSessionId = signUpAttempt.createdSessionId;
      console.log("createdSessionId:", createdSessionId);

      if (!createdSessionId) {
        // unexpected: no session id — abort and show message
        Alert.alert("No session created", "Please try signing in instead.");
        return;
      }

      // activate session
      await setActive({ session: createdSessionId });
      console.log(
        "setActive returned; now waiting briefly for auth propagation...",
      );

      // wait a short bit for Clerk to propagate session/auth to other libs
      await sleep(600);

      // try storing user, with small retry loop (server needs auth present)
      const maxTries = 4;
      let lastErr: any = null;
      for (let i = 0; i < maxTries; i++) {
        try {
          console.log(`Attempting storeUser (try ${i + 1})`);
          await storeUser({ username });
          lastErr = null;
          break; // success
        } catch (e) {
          lastErr = e;
          console.warn(`storeUser attempt ${i + 1} failed:`, e);
          // If server says "Called store without authentication present", wait and retry
          await sleep(500 * (i + 1));
        }
      }
      if (lastErr) {
        console.warn("Failed to store username after retries:", lastErr);
        // Non-blocking: continue to app but show warning
        Alert.alert(
          "Saved session",
          "Signed in, but username not stored. Please retry later.",
        );
      }

      router.replace("/(tabs)/feed");
    } catch (err: any) {
      console.error("Verify error:", err);
      const msg =
        err?.errors?.[0]?.longMessage ?? err?.message ?? "Verification failed.";
      Alert.alert("Verification failed", String(msg));
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView className="flex-1 p-5 justify-cente bg-gray-950">
        <Text className="text-2xl font-bold mb-5 text-center">
          Verify your email
        </Text>

        <TextInput
          className="border border-gray-200 p-3 rounded-lg mb-3 text-gray-100 placeholder:text-gray-400"
          value={code}
          placeholder="Enter verification code"
          onChangeText={setCode}
          autoCapitalize="none"
        />

        <Pressable
          onPress={onVerifyPress}
          disabled={loading}
          className="bg-sky-500 py-3 rounded-lg items-center"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold">Verify</Text>
          )}
        </Pressable>

        <View className="h-3" />

        <View className="flex-row items-center space-x-2 justify-center mt-3">
          <Text className="text-sm text-gray-700">
            Already have an account?
          </Text>
          <Link href="/sign-in">
            <Text className="text-sky-500">Sign in</Text>
          </Link>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 p-5 justify-center bg-gray-100 dark:bg-gray-950 gap-2"
    >
      <Text className="text-3xl font-bold text-center text-black dark:text-white">
        Join Framez
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 text-center mb-8">
        Create your account to get started
      </Text>

      {/* Username */}
      <View className="mb-4 gap-1">
        <Text className="mb-1 font-medium text-gray-600 dark:text-gray-200 text-lg">
          Username
        </Text>
        <TextInput
          className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-black dark:text-white"
          autoCapitalize="none"
          value={username}
          placeholder="yourname123"
          placeholderTextColor="#9CA3AF"
          onChangeText={setUsername}
        />
      </View>

      {/* Email */}
      <View className="mb-4 gap-1">
        <Text className="mb-1 font-medium text-gray-600 dark:text-gray-200 text-lg">
          Email Address
        </Text>
        <TextInput
          className="border border-gray-300 dark:border-gray-700 
        bg-gray-50 dark:bg-gray-900
        p-4 rounded-xl
        text-black dark:text-white"
          autoCapitalize="none"
          value={emailAddress}
          placeholder="you@email.com"
          placeholderTextColor="#9CA3AF"
          onChangeText={setEmailAddress}
        />
      </View>

      {/* Password */}
      <View className="mb-4 gap-1">
        <Text className="mb-1 font-medium text-gray-600 dark:text-gray-200 text-lg">
          Password
        </Text>

        <View className="relative">
          <TextInput
            className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 pr-12 rounded-xl text-black dark:text-white"
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

      {/* Confirm Password */}
      <View className="mb-6 gap-1">
        <Text className="mb-1 font-medium text-gray-600 dark:text-gray-200 text-lg">
          Confirm Password
        </Text>

        <View className="relative">
          <TextInput
            className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 pr-12 rounded-xl text-black dark:text-white"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            onChangeText={setConfirmPassword}
          />

          <Pressable
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-3"
          >
            <Text className="text-gray-500">
              <Feather
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={24}
              />
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={onSignUpPress}
        disabled={loading}
        className="bg-sky-500 py-4 rounded-xl items-center"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-xl uppercase">
            Sign up
          </Text>
        )}
      </Pressable>

      <View className="flex-row items-center gap-2 justify-center mt-2">
        <Text className="text-gray-600 dark:text-gray-400">
          Already have an account?
        </Text>
        <Link href="/sign-in">
          <Text className="text-sky-500 font-semibold">Log in</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
