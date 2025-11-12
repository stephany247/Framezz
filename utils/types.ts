// types.ts
import { Id } from "@/convex/_generated/dataModel";


export type Post = {
    _id: Id<"posts">;
    _creationTime: string | number | Date;
    authorName?: string;
    authorProfileImage?: string;
    media?: Media[];
    caption?: string;
};

export type Comment = {
    _id: Id<"comments"> | string;
    _creationTime: number;
    postId: Id<"posts"> | string;
    authorId?: Id<"users"> | string;
    authorName: string;
    authorProfileImage?: string | undefined;
    text: string;
};

export type LikeItem = { userId: string; likeId?: string; profileImage?: string; username?: string; likedAt?: number | string };

export type Media = { kind: string; url: string; poster?: string };