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
    if (!identifier) {
      Alert.alert("Enter email or username");
      return;
    }

    setLoading(true);
    try {
      const attempt = await signIn.create({ identifier });
      const a: any = attempt;

      const emailFactor = a.supportedFirstFactors?.find(
        (f: any) => f.strategy === "email_code",
      );

      if (emailFactor?.emailAddressId) {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailFactor.emailAddressId,
        });
        Alert.alert(
          "Verification code sent",
          "Check your email for the verification code.",
        );
        router.push({
          pathname: "/(auth)/enter-code",
          params: {
            signInId: attempt.id,
            emailAddressId: emailFactor.emailAddressId,
          },
        });
        return;
      }

      const supported: string[] =
        a.supportedFirstFactors ??
        a.supportedStrategies ??
        a.firstFactors ??
        a.supported_first_factors ??
        [];

      if (Array.isArray(supported) && supported.includes("password")) {
        const pwResult: any = await signIn.attemptFirstFactor({
          strategy: "password",
          password,
        });

        if (pwResult.status === "complete") {
          await setActive({ session: pwResult.createdSessionId });
          router.replace("/(tabs)/feed");
          return;
        } else {
          Alert.alert("More verification required", JSON.stringify(pwResult));
        }
      } else if (
        Array.isArray(supported) &&
        (supported.includes("email_code") || supported.includes("email_link"))
      ) {
        const emailAddressId: string | undefined =
          a.emailAddresses?.[0]?.id ?? a.email_address_id ?? undefined;

        if (!emailAddressId) {
          console.warn("No emailAddressId found on attempt:", a);
          Alert.alert("Cannot send magic link — no email ID found");
        } else {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId,
          });
          Alert.alert(
            "Magic link/code sent",
            "Check your email for the code or link.",
          );
          return;
        }
      } else if (
        Array.isArray(supported) &&
        supported.some((s) => s?.startsWith?.("oauth") || s === "oauth")
      ) {
        Alert.alert(
          "This account uses OAuth / SSO. Please sign in with the provider.",
        );
        return;
      } else {
        console.warn("Unsupported sign-in strategies:", supported, a);
        Alert.alert("Unsupported sign-in method for this account");
      }
    } catch (err: any) {
      console.error("Clerk error:", err);
      const msg =
        err?.errors?.[0]?.longMessage ?? err?.message ?? JSON.stringify(err);
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
        <Text className="mb-1 text-lg font-medium text-gray-600 dark:text-gray-400">
          Password
        </Text>

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

      {loading ? (
        <Pressable className="bg-sky-500 py-3 rounded-lg items-center">
          <ActivityIndicator color="#fff" />
        </Pressable>
      ) : (
        <TouchableOpacity
          onPress={onSignInPress}
          className="bg-sky-500 py-4 mt-2 rounded-lg items-center"
        >
          <Text className="text-white font-semibold text-xl">Log In</Text>
        </TouchableOpacity>
      )}

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
