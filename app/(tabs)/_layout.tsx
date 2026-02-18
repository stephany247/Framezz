import Ionicons from "@expo/vector-icons/Ionicons";
import { Authenticated } from "convex/react";
import { Tabs, usePathname, useRouter } from "expo-router";
import React from "react";
import { Pressable, useColorScheme, View } from "react-native";

function UploadButton({
  onPress,
  focused,
  activeColor,
  inactiveColor,
}: {
  onPress?: () => void;
  focused?: boolean;
  activeColor: string;
  inactiveColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        top: -2,
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
      }}
      accessibilityRole="button"
      accessibilityLabel="Create post"
    >
      <View
        className="w-12 h-12 rounded-full justify-center items-center shadow-lg"
        style={{
          backgroundColor: focused ? activeColor : "transparent",
          borderColor: focused ? activeColor : inactiveColor,
          borderWidth: 1,
        }}
      >
        <Ionicons
          name="add"
          size={20}
          color={focused ? "#fff" : inactiveColor}
        />
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const pathname = usePathname();
  const isCreateActive = pathname.includes("/create");

  const activeColor = "#0ea5e9";
  const inactiveColor = isDark ? "#e5e7eb" : "#374151";

  return (
    <Authenticated>
      <Tabs
        screenOptions={{
          headerShown: false,
          headerTitle: "Framez",
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 24,
            color: "#0ea5e9",
            fontFamily: "Lobster_400Regular",
            marginBottom: 8,
          },
          headerStyle: {
            backgroundColor: isDark ? "#030712" : "#fff",
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#374151" : "#e5e7eb",
          },
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 80,
            paddingBottom: 10,
            paddingTop: 10,
            backgroundColor: isDark ? "#030712" : "#fff",
            borderTopColor: isDark ? "#222" : "#e5e7eb",
          },
        }}
      >
        <Tabs.Screen
          name="feed"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={focused ? activeColor : inactiveColor}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            headerShown: true,
            tabBarButton: () => (
              <UploadButton
                onPress={() => router.push("/(tabs)/create")}
                focused={isCreateActive}
                activeColor={activeColor}
                inactiveColor={inactiveColor}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            headerShown: true,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "person-sharp" : "person-outline"}
                size={24}
                color={focused ? activeColor : inactiveColor}
              />
            ),
          }}
        />
      </Tabs>
    </Authenticated>
  );
}
