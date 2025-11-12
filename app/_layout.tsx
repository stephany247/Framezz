import { useEffect } from "react";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useFonts } from "@expo-google-fonts/lobster/useFonts";
import { Lobster_400Regular } from "@expo-google-fonts/lobster/400Regular";
import { ActivityIndicator, Text, View } from "react-native";

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL!;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
}
if (!CONVEX_URL || !/^https?:\/\//.test(CONVEX_URL)) {
  throw new Error(
    `Missing or invalid EXPO_PUBLIC_CONVEX_URL. Must be absolute (https://...). Value: ${CONVEX_URL}`
  );
}

const convexClient = new ConvexReactClient(CONVEX_URL);

function LoadingFallBack({ label = "Loading…" }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <ActivityIndicator size="large" color="#0ea5e9" />
      <Text className="mt-3 text-gray-300">{label}</Text>
    </View>
  );
}

function AuthRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace("/(tabs)/feed");
    } else {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return <LoadingFallBack label="Checking authentication…" />;

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    lobster: Lobster_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // hide splash once fonts/authation checks settle
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError)
    return <LoadingFallBack label="Loading fonts…" />;

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={CLERK_PUBLISHABLE_KEY}
    >
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        <AuthRedirect />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#000" },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
