import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { SplashScreen, Stack, useRouter } from "expo-router";
// import { useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useFonts } from "@expo-google-fonts/lobster/useFonts";
import { Lobster_400Regular } from "@expo-google-fonts/lobster/400Regular";
import { useEffect } from "react";
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

// Simple full-screen loading/fallback (used while fonts or auth state resolve)
function LoadingFallBack({ label = "Loading…" }: { label?: string }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
      }}
    >
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 12, color: "#6b7280" }}>{label}</Text>
    </View>
  );
}

// AuthRedirect will push signed-in users into the tabbed app
function AuthRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // wait until clerk finishes loading auth state
    if (!isLoaded) return;

    if (isSignedIn) {
      // signed in -> replace to tabs feed
      router.replace("/(tabs)/feed");
    } else {
      // not signed in -> ensure user sees index (landing / auth)
      // if you want a dedicated auth route, change this
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // while clerk loads, show fallback
  if (!isLoaded) return <LoadingFallBack label="Checking authentication…" />;

  // once loaded, nothing to render since router.replace will run
  return null;
}

export default function RootLayout() {
  const [fontloaded, fonterror] = useFonts({
    lobster: Lobster_400Regular,
  });

  useEffect(() => {
    if (fontloaded || fonterror) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontloaded, fonterror]);

  if (!fontloaded && !fonterror)
    return <LoadingFallBack label="Loading fonts…" />;

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={CLERK_PUBLISHABLE_KEY}
    >
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        <AuthRedirect />
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
