// app/(tabs)/feed.tsx
import React from "react";
import { View, Text } from "react-native";

export default function FeedScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 18 }}>Feed (signed-in users land here)</Text>
    </View>
  );
}
