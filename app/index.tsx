import { Link } from "expo-router";
import "../global.css";
import { Text, View } from "react-native";
import { Authenticated, useConvexAuth, useMutation, useQuery } from "convex/react";
import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";

export default function App() {
  const { isLoading, isAuthenticated } = useStoreUserEffect();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>

      {isLoading ? (
        <Text>Loading...</Text>
      ) : !isAuthenticated ? (
        <SignInButton>
          <Text>Sign in</Text>
        </SignInButton>
      ) : (
        <>
          <UserButton />
          <Content />
          <AuthenticatedHeader />
        </>
      )}
    </View>
  );
}

function Content() {
  const messages = useQuery(api.messages.getForCurrentUser);
  return <Text>Authenticated content: {messages?.length ?? 0}</Text>;
}

 function AuthenticatedHeader() {
  const { user } = useUser(); // Clerk client object
  const profile = useQuery(api.users.getUserProfile); // Convex users doc

  if (!profile) {
    // profile null means user hasn't been stored yet or query still loading
    return <Text>Welcome {user ? (user.firstName ?? user.username) : "user"}!</Text>;
  }

  return <Text>Welcome {profile.name ?? (user ? user.username : "user")}!</Text>;
}
