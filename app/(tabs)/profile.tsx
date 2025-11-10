// app/profile.tsx
import React from "react";
import { View, Text, Image, FlatList, TouchableOpacity } from "react-native";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignOutButton } from "@/components/SignOutButton";
import { Id } from "@/convex/_generated/dataModel";
// optional: show videos if you support them
// import { Video } from "expo-av";

export default function ProfilePage() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <SignedIn>
        <ProfileContent />
      </SignedIn>

      <SignedOut>
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <Text style={{ fontSize: 20, marginBottom: 8 }}>
            You are not signed in
          </Text>
          <Text style={{ color: "gray" }}>
            Tap Sign in to see your profile and posts.
          </Text>
        </View>
      </SignedOut>
    </View>
  );
}

function ProfileContent() {
  const { user } = useUser(); // Clerk client-side user
  // Convex query: get the user's stored Convex doc
  const profile = useQuery(api.users.getUserProfile);
    const userId = profile ? (profile._id as Id<"users">) : undefined;
  const myPosts = useQuery(
    api.posts.getPostsByUser,
    userId ? { userId } : "skip"
  );

  // Loading fallback
  if (!profile || myPosts === undefined) {
    return (
      <View style={{ alignItems: "center", marginTop: 60 }}>
        <Text>Loading profile…</Text>
      </View>
    );
  }

  const avatarUrl = profile.profileImage ?? user?.imageUrl ?? null;
  const displayName =
    profile.name ??
    user?.firstName ??
    user?.fullName ??
    user?.username ??
    "Anonymous";
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "";

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 72, height: 72, borderRadius: 36, marginRight: 12 }}
          />
        ) : (
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "#ddd",
              marginRight: 12,
            }}
          />
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "600" }}>{displayName}</Text>
          {email ? (
            <Text style={{ color: "gray", marginTop: 4 }}>{email}</Text>
          ) : null}
        </View>
        <SignOutButton />
      </View>

      <Text style={{ marginBottom: 8, fontSize: 16, fontWeight: "600" }}>
        Your posts
      </Text>

      {myPosts.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Text style={{ color: "gray" }}>You haven't posted yet.</Text>
        </View>
      ) : (
        <FlatList
          data={myPosts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <PostCard post={item} />}
        />
      )}
    </View>
  );
}

function PostCard({ post }: { post: any }) {
  return (
    <View
      style={{
        marginBottom: 16,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#fff",
        elevation: 1,
      }}
    >
      <View style={{ padding: 12 }}>
        <Text style={{ fontWeight: "600" }}>{post.authorName}</Text>
        {post.caption ? (
          <Text style={{ marginTop: 6 }}>{post.caption}</Text>
        ) : null}
      </View>

      {/* media array: show first media as thumbnail and allow mapping */}
      <FlatList
        data={post.media}
        horizontal
        keyExtractor={(_, i) => `${post._id}-m-${i}`}
        renderItem={({ item }) =>
          item.kind === "image" ? (
            <Image
              source={{ uri: item.url }}
              style={{ width: 260, height: 260, marginRight: 8 }}
            />
          ) : (
            // optional video rendering — uncomment expo-av import above to use
            // <Video source={{ uri: item.url }} style={{ width: 260, height: 260 }} useNativeControls resizeMode="cover" />
            <View
              style={{
                width: 260,
                height: 260,
                backgroundColor: "#000",
                marginRight: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff" }}>Video</Text>
            </View>
          )
        }
      />

      <View style={{ padding: 10 }}>
        <Text style={{ color: "gray", fontSize: 12 }}>
          {formatIso(post.createdAt ?? post._creationTime)}
        </Text>
      </View>
    </View>
  );
}

function formatIso(value: any) {
  // Convex stored createdAt as ISO string; fallback to _creationTime (number)
  if (!value) return "";
  if (typeof value === "string") return new Date(value).toLocaleString();
  if (typeof value === "number") return new Date(value).toLocaleString();
  return "";
}
