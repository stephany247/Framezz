import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

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

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        try {
          await storeUser({ username });
        } catch (err) {
          console.warn("Failed to store username in DB:", err);
        }
        router.replace("/(tabs)/feed");
      } else {
        console.error("Verification incomplete:", signUpAttempt);
        Alert.alert("Verification incomplete", "Check console for details.");
      }
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
      <View className="flex-1 p-5 justify-cente bg-gray-950">
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

        {loading ? (
          <ActivityIndicator />
        ) : (
          <TouchableOpacity
            onPress={onVerifyPress}
            className="bg-sky-500 py-3 rounded-lg items-center"
          >
            <Text className="text-white font-semibold">Verify</Text>
          </TouchableOpacity>
        )}

        <View className="h-3" />

        <View className="flex-row items-center space-x-2 justify-center mt-3">
          <Text className="text-sm text-gray-700">
            Already have an account?
          </Text>
          <Link href="/sign-in">
            <Text className="text-sky-500">Sign in</Text>
          </Link>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 p-5 justify-center bg-gray-950">
      <Text className="text-2xl font-bold mb-5 text-center text-gray-100">
        Sign up
      </Text>

      <TextInput
        className="border border-gray-600 p-3 rounded-lg mb-3 text-gray-100 placeholder:text-gray-400"
        autoCapitalize="none"
        value={username}
        placeholder="Choose a username"
        onChangeText={setUsername}
      />

      <TextInput
        className="border border-gray-600 p-3 rounded-lg mb-3 text-gray-100 placeholder:text-gray-400"
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={setEmailAddress}
      />

      <TextInput
        className="border border-gray-600 p-3 rounded-lg mb-4 text-gray-100 placeholder:text-gray-400"
        value={password}
        placeholder="Enter password"
        secureTextEntry
        onChangeText={setPassword}
      />

      {loading ? (
        <Pressable className="bg-sky-500 py-3 rounded-lg items-center">
          <ActivityIndicator />
        </Pressable>
      ) : (
        <TouchableOpacity
          onPress={onSignUpPress}
          className="bg-sky-500 py-3 rounded-lg items-center"
        >
          <Text className="text-white font-semibold">Continue</Text>
        </TouchableOpacity>
      )}

      <View className="h-3" />

      <View className="flex-row items-center gap-2 justify-center mt-2">
        <Text className="text-sm text-gray-700">Already have an account?</Text>
        <Link href="/sign-in">
          <Text className="text-sky-500">Sign in</Text>
        </Link>
      </View>
    </View>
  );
}
