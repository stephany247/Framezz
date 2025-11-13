import React from "react";
import { Tabs } from "expo-router";
import { View, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Authenticated } from "convex/react";

function UploadButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        top: -24,
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
      }}
      accessibilityRole="button"
      accessibilityLabel="Create post"
    >
      <View className="w-16 h-16 rounded-full bg-sky-500 justify-center items-center shadow-lg">
        <Ionicons name="add" size={24} color="#fff" />
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Authenticated>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerTitle: "Framez",
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 24,
            color: "#0ea5e9",
            fontFamily: "Lobster_400Regular",
          },
          headerStyle: {
            backgroundColor: "#000",
            borderBottomWidth: 1,
            borderBottomColor: "#374151",
          },
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 64,
            paddingBottom: 8,
            backgroundColor: "#000",
            borderTopColor: "#222",
          },
        }}
      >
        <Tabs.Screen
          name="feed"
          options={{
            title: "Framez",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={focused ? "#0ea5e9" : "#fff"}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            tabBarButton: () => (
              <UploadButton onPress={() => router.push("/(tabs)/create")} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "person-sharp" : "person-outline"}
                size={24}
                color={focused ? "#0ea5e9" : "#fff"}
              />
            ),
          }}
        />
      </Tabs>
    </Authenticated>
  );
}
