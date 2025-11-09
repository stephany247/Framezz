import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // <- declare this

  const onSignInPress = async () => {
    if (!isLoaded) {
      Alert.alert("Auth not ready");
      return;
    }
    setLoading(true);

    try {
      // 1) Create the sign-in resource with identifier only
      // inside onSignInPress
      const attempt = await signIn.create({ identifier: emailAddress });
      // console.log("signIn.create ->", attempt);

      // find the email_code record
      const emailFactor = (attempt as any).supportedFirstFactors?.find(
        (f: any) => f.strategy === "email_code"
      );

      if (emailFactor?.emailAddressId) {
        // Clerk expects emailAddressId when preparing email_code
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailFactor.emailAddressId,
        });
        // show UX + navigate to enter-code screen
        Alert.alert(
          "Magic code sent",
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

      console.log("signIn.create ->", attempt);

      // 2) Safely inspect the returned shape (cast to any so TS won't complain)
      const a: any = attempt;
      const supported: string[] =
        a.supportedFirstFactors ??
        a.supportedStrategies ??
        a.firstFactors ??
        a.supported_first_factors ??
        [];

      console.log("supported strategies ->", supported);

      // 3) Branch based on available strategies
      if (Array.isArray(supported) && supported.includes("password")) {
        // attempt password first factor
        const pwResult: any = await signIn.attemptFirstFactor({
          strategy: "password",
          password,
        });
        console.log("password attempt ->", pwResult);

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
        // prepareFirstFactor for email_code requires an emailAddressId
        const emailAddressId: string | undefined =
          a.emailAddresses?.[0]?.id ?? a.email_address_id ?? undefined;

        if (!emailAddressId) {
          console.warn("No emailAddressId found on attempt:", a);
          Alert.alert("Cannot send magic link — no email ID found");
        } else {
          const prepareResult: any = await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId,
          });
          // console.log("prepareFirstFactor ->", prepareResult);
          Alert.alert(
            "Magic link/code sent",
            "Check your email for the code or link."
          );
          // Optionally route to a code entry screen to call attemptFirstFactor with the code
          // router.push("/auth/enter-code");
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
        // fallback: Clerk might return next steps in a different prop; log it
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
    <View style={s.container}>
      <Text style={s.title}>Sign in</Text>

      <TextInput
        style={s.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={setEmailAddress}
      />

      <TextInput
        style={s.input}
        value={password}
        placeholder="Enter password (if available)"
        secureTextEntry
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <TouchableOpacity onPress={onSignInPress} style={s.button}>
          <Text style={s.btnText}>Continue</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 12 }} />

      <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
        <Text>Don't have an account?</Text>
        <Link href="/sign-up">
          <Text style={{ color: "#0ea5e9" }}>Sign up</Text>
        </Link>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
});
