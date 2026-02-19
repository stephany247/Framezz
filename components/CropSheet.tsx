import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Pressable,
} from "react-native";

type CropOption = { label: string; w: number; h: number };

const OPTIONS: CropOption[] = [
  { label: "Square (1:1)", w: 1, h: 1 },
  { label: "4:3", w: 4, h: 3 },
  { label: "16:9", w: 16, h: 9 },
];

export default function CropSheet({
  visible,
  onClose,
  onSelect,
  onReset,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (w: number, h: number) => void;
  onReset?: () => void;
}) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Dark overlay */}
        <Pressable className="absolute inset-0 bg-black/50" onPress={onClose} />
        <View className=" bg-gray-50 dark:bg-gray-900 text-lg p-4 rounded-t-xl">
          <View className="flex-row justify-between items-center border-b border-gray-700 mb-3">
            <Text className="text-gray-800 dark:text-gray-300 text-lg font-semibold">
              Choose crop
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="py-3"
              accessibilityRole="button"
            >
              <Ionicons
                name="close-circle-outline"
                size={24}
                color={isDark ? "#e5e7eb" : "#374151"}
              />
            </TouchableOpacity>
          </View>

          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              onPress={() => onSelect(opt.w, opt.h)}
              className="py-3"
              accessibilityRole="button"
            >
              <Text className=" text-gray-800 dark:text-gray-300">
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}

          {onReset ? (
            <TouchableOpacity
              onPress={onReset}
              className="py-3"
              accessibilityRole="button"
            >
              <Text className="text-amber-500">Reset to original</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={onClose}
            className="py-3 mb-3"
            accessibilityRole="button"
          >
            <Text className="text-white text-center font-medium text-lg bg-sky-500 p-4 rounded-full">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
