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
} from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
        (f: any) => f.strategy === "email_code"
      );

      if (emailFactor?.emailAddressId) {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailFactor.emailAddressId,
        });
        Alert.alert(
          "Verification code sent",
          "Check your email for the verification code."
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
            "Check your email for the code or link."
          );
          return;
        }
      } else if (
        Array.isArray(supported) &&
        supported.some((s) => s?.startsWith?.("oauth") || s === "oauth")
      ) {
        Alert.alert(
          "This account uses OAuth / SSO. Please sign in with the provider."
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
    <KeyboardAvoidingView className="flex-1 p-5 justify-center bg-gray-950">
      <Text className="text-2xl font-bold mb-5 text-center text-gray-100">
        Sign in
      </Text>

      <TextInput
        className="border border-gray-600 p-3 rounded-lg mb-3 text-gray-100 placeholder:text-gray-400"
        autoCapitalize="none"
        value={identifier}
        placeholder="Email or username"
        onChangeText={setIdentifier}
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
          onPress={onSignInPress}
          className="bg-sky-500 py-3 mt-2 rounded-lg items-center"
        >
          <Text className="text-white font-semibold">Continue</Text>
        </TouchableOpacity>
      )}

      {/* <View className="h-3" /> */}

      <View className="flex-row gap-2 items-center justify-center mt-2">
        <Text className="text-gray-200">Don't have an account?</Text>
        <Link href="/sign-up">
          <Text className="text-sky-500 underline">Sign up</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
