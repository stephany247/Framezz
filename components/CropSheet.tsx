// components/CropSheet.tsx
import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.4)]">
        <View className="bg-[#071012] p-4 rounded-t-xl">
          <Text className="text-white mb-3 text-lg font-semibold border-b border-gray-700 pb-2">
            Choose crop
          </Text>

          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              onPress={() => onSelect(opt.w, opt.h)}
              className="py-3"
              accessibilityRole="button"
            >
              <Text className="text-white">{opt.label}</Text>
            </TouchableOpacity>
          ))}

          {onReset ? (
            <TouchableOpacity
              onPress={onReset}
              className="py-3"
              accessibilityRole="button"
            >
              <Text className="text-amber-400">Reset to original</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={onClose}
            className="py-3"
            accessibilityRole="button"
          >
            <Text className="text-gray-400">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
