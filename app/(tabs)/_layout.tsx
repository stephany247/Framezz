// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { View, Pressable } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from "expo-router";

function UploadButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        top: -18,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        elevation: 6,
      }}
    >
      <View
        style={{
          width: 54,
          height: 54,
          borderRadius: 32,
          backgroundColor: "#0ea5e9",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="add" size={20} color="#fff" />
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { height: 64, paddingBottom: 8 },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={focused ? "#0ea5e9" : "#222"}
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
              color={focused ? "#0ea5e9" : "#222"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
