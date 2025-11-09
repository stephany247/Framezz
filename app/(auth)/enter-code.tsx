// app/(auth)/enter-code.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";

function serializeError(err: any) {
  try { return JSON.stringify(err, Object.getOwnPropertyNames(err), 2); }
  catch { return String(err); }
}

export default function EnterCode() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signInId, emailAddressId } = useLocalSearchParams() as { signInId?: string; emailAddressId?: string };
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!signInId) {
    return (
      <View style={styles.root}>
        <Text style={styles.msg}>Missing sign-in attempt. Please start sign-in again.</Text>
        <Button title="Back to sign in" onPress={() => router.push("/(auth)/sign-in")} />
      </View>
    );
  }

  async function submitCode() {
    if (!isLoaded) return Alert.alert("Auth not ready");
    setLoading(true);
    try {
      // pass signInId so Clerk can find the original attempt
      const res: any = await (signIn as any).attemptFirstFactor({
        strategy: "email_code",
        code,
        // signInId,
      });
      console.log("attemptFirstFactor ->", res);

      if (res?.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.replace("/(tabs)/feed");
        return;
      }
      Alert.alert("Verification incomplete", JSON.stringify(res));
    } catch (err: any) {
      console.error("verify error", serializeError(err), err?.stack);
      Alert.alert("Could not verify code", err?.message ?? "See logs");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (!emailAddressId) return Alert.alert("No email id available to resend to");
    setResending(true);
    try {
      const r: any = await (signIn as any).prepareFirstFactor({
        strategy: "email_code",
        emailAddressId,
      });
      console.log("resend prepareFirstFactor ->", r);
      Alert.alert("Code resent", "Check your email");
    } catch (err: any) {
      console.error("resend error", serializeError(err));
      Alert.alert("Resend failed", err?.message ?? "See logs");
    } finally {
      setResending(false);
    }
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Enter verification code</Text>

      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="6-digit code"
        keyboardType="number-pad"
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Verify code" onPress={submitCode} />
      )}

      <View style={{ height: 12 }} />

      {resending ? <ActivityIndicator /> : <Button title="Resend code" onPress={resendCode} />}

      <View style={{ height: 12 }} />
      <Button title="Back to sign in" onPress={() => router.push("/(auth)/sign-in")} color="#6b7280" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 12, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#e5e7eb", padding: 10, borderRadius: 8, marginBottom: 12 },
  msg: { textAlign: "center", marginBottom: 12 },
});
