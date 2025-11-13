import React, { useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
  FlatList as RNFlatList,
  ViewToken,
  Image,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Media } from "@/utils/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function MediaVideo({ url, playing }: { url: string; playing: boolean }) {
  const player = useVideoPlayer({ uri: url } as unknown as any as any);
  const [isPlaying, setIsPlaying] = useState(false);

  const [muted, setMuted] = useState(true); // start muted for autoplay

  useEffect(() => {
    if (!player) return;
    // ensure player starts muted for autoplay policy
    try {
      (player as any).muted = muted;
      (player as any).setVolume?.(muted ? 0 : 1);
    } catch {}
  }, [player, muted]);

  // call this when user presses the speaker icon
  const handleUnmute = async () => {
    if (!player) return;
    try {
      (player as any).muted = false;
      (player as any).setVolume?.(1);
      setMuted(!muted);
    } catch (e) {
      console.warn("unmute failed", e);
    }
  };

  useEffect(() => {
    if (!player) return;
    try {
      (player as any).setLoop?.(true);
      (player as any).loop = true;
    } catch {}
    // if parent wants it playing, call play(), otherwise pause
    (async () => {
      try {
        if (playing) {
          await (player as any).play?.();
          setIsPlaying(true);
        } else {
          await (player as any).pause?.();
          setIsPlaying(false);
        }
      } catch {
        setIsPlaying(!!playing);
      }
    })();
  }, [player, playing]);

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH,
        backgroundColor: "#111827",
      }}
    >
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%", backgroundColor: "#111827" }}
      />
      {/* overlay unmute button (show only while muted) */}
      <TouchableOpacity
        onPress={handleUnmute}
        style={{
          position: "absolute",
          right: 16,
          top: 16,
          padding: 8,
          borderRadius: 20,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        {muted ? (
          <Ionicons name="volume-high" size={18} color="#fff" />
        ) : (
          <MaterialCommunityIcons name="volume-off" size={18} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}

function MediaImage({ url }: { url: string }) {
  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH,
        backgroundColor: "#0f172a",
        alignItems: "center",
        justifyContent: "center",
        aspectRatio: "1",
      }}
    >
      <ImageBackground
        source={{ uri: url }}
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_WIDTH,
        }}
        imageStyle={{ resizeMode: "contain" }}
      />
    </View>
  );
}

export default function MediaCarousel({
  media,
  initialIndex = 0,
}: {
  media?: Media[];
  initialIndex?: number;
}) {
  const items = Array.isArray(media) ? media : [];
  const listRef = useRef<RNFlatList<Media> | null>(null);
  const [index, setIndex] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState<number>(0);

  // if initialIndex changes, scroll to it
  useEffect(() => {
    if (!listRef.current) return;
    try {
      listRef.current.scrollToIndex({ index: initialIndex, animated: false });
      setIndex(initialIndex);
      setVisibleIndex(initialIndex);
    } catch {}
  }, [initialIndex]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / SCREEN_WIDTH);
    if (newIndex !== index) setIndex(newIndex);
  };

  // viewability to detect the currently visible item (for autoplay)
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems && viewableItems.length > 0) {
        const first = viewableItems[0];
        const newIndex = first.index ?? 0;
        setVisibleIndex(newIndex);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 75,
  }).current;

  if (items.length === 0) {
    return (
      <View
        style={{
          width: "100%",
          aspectRatio: 1,
          backgroundColor: "#111",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text className="text-[#9CA3AF]">No media</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View
        style={{
          width: "100%",
          aspectRatio: 1,
          backgroundColor: "#111",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#9CA3AF" }}>No media</Text>
      </View>
    );
  }

  return (
    <View style={{ position: "relative" }}>
      <FlatList
        ref={listRef}
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index: itemIndex }) =>
          item.kind === "video" ? (
            <MediaVideo url={item.url} playing={visibleIndex === itemIndex} />
          ) : (
            <MediaImage url={item.url} />
          )
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* indicators */}
      {items.length > 1 && (
        <View className="items-center py-3">
          <View className="flex-row justify-center">
            {items.map((_, i) => (
              <View
                key={i}
                className={`h-2 rounded-full mx-1 ${i === index ? "w-6 bg-sky-500" : "w-2 bg-sky-500/50"}`}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
