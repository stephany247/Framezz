import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Stack } from "expo-router";
// import { useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from 'convex/react'

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL!;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
}
if (!CONVEX_URL || !/^https?:\/\//.test(CONVEX_URL)) {
  throw new Error(`Missing or invalid EXPO_PUBLIC_CONVEX_URL. Must be absolute (https://...). Value: ${CONVEX_URL}`);
}

const convexClient = new ConvexReactClient(CONVEX_URL);

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={CLERK_PUBLISHABLE_KEY}>
       <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
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
