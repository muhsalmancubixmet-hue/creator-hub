/**
 * Social Feed & Cross-Portal Collab API Client (Creator Hub)
 * -----------------------------------------------------------
 * Connects Creator Hub (Port 8080) to Django `/api/v1/posts/*` & `/api/v1/mentions/*`.
 * Supports 150 MB videos (unrestricted duration), 10 MB images, @mentions, Co-Author Collabs, and Bookmarks.
 */

import { apiClient } from "./api-client";

export type PostType = "IMAGE" | "VIDEO" | "REEL" | "CAROUSEL";

export interface ActorCard {
  user_id: string;
  profile_id: string;
  role: "CREATOR" | "BUSINESS";
  handle: string;
  display_name: string;
  avatar_url: string;
  verified: boolean;
  profile_path: string;
}

export interface PostMediaItemData {
  id: string;
  media_type: "IMAGE" | "VIDEO";
  media_url: string;
  thumbnail_url: string;
  aspect_ratio: string;
  file_size_bytes: number;
  duration_seconds: number | null;
  order: number;
}

export interface PendingCollaboratorItem {
  id: string;
  relation_type: "MENTION" | "COLLAB_INVITE";
  invite_status: "PENDING" | "ACCEPTED" | "DECLINED" | "REMOVED";
  responded_at: string | null;
  target: ActorCard;
}

export interface SocialPostData {
  id: string;
  post_type: PostType;
  caption: string;
  hashtags: string[];
  is_public: boolean;
  is_featured: boolean;
  moderation_status: string;
  saves_count: number;
  views_count: number;
  shares_count: number;
  is_saved: boolean;
  location_name: string;
  linked_campaign: string | null;
  linked_campaign_title: string;
  author: ActorCard;
  media_items: PostMediaItemData[];
  accepted_collaborators: ActorCard[];
  mentions: ActorCard[];
  pending_collaborators: PendingCollaboratorItem[];
  created_at: string;
  updated_at: string;
}

export interface CollabInboxEntry {
  id: string;
  relation_type: "MENTION" | "COLLAB_INVITE";
  invite_status: "PENDING" | "ACCEPTED" | "DECLINED" | "REMOVED";
  responded_at: string | null;
  created_at: string;
  post: SocialPostData;
}

export interface UploadedFeedMedia {
  id: string;
  media_asset_id: string;
  url: string;
  file_name: string;
  media_type: "IMAGE" | "VIDEO";
  file_size_bytes: number;
}

export const MAX_VIDEO_BYTES = 150 * 1024 * 1024; // 150 MB unrestricted duration
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export const socialFeedApi = {
  async searchMentions(query: string): Promise<ActorCard[]> {
    const res = await apiClient.get<{ results: ActorCard[] }>("/mentions/search/", {
      params: { q: query, limit: 12 },
    });
    return res.data.results || [];
  },

  async uploadMedia(
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<UploadedFeedMedia> {
    const isVideo = /\.(mp4|mov|webm)$/i.test(file.name) || file.type.startsWith("video/");
    if (isVideo && file.size > MAX_VIDEO_BYTES) {
      throw new Error("Video exceeds 150 MB upload limit.");
    }
    if (!isVideo && file.size > MAX_IMAGE_BYTES) {
      throw new Error("Image exceeds 10 MB upload limit.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", isVideo ? "VIDEO" : "IMAGE");

    const res = await apiClient.post<UploadedFeedMedia>("/posts/media/upload/", formData, {
      timeout: 300000, // 5 min allowance for 150 MB video upload
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.min(100, Math.round((evt.loaded * 100) / evt.total)));
        }
      },
    });
    return res.data;
  },

  async listMyPosts(page = 1): Promise<{ count: number; results: SocialPostData[] }> {
    const res = await apiClient.get<{ count: number; results: SocialPostData[] }>("/posts/", {
      params: { page },
    });
    return res.data;
  },

  async createPost(payload: {
    post_type: PostType;
    caption: string;
    is_public: boolean;
    media_items: Array<{
      media_asset_id?: string;
      media_type: "IMAGE" | "VIDEO";
      media_url: string;
      aspect_ratio?: string;
      file_size_bytes?: number;
    }>;
    collaborator_user_ids: string[];
    mention_user_ids?: string[];
  }): Promise<SocialPostData> {
    const res = await apiClient.post<SocialPostData>("/posts/", payload);
    return res.data;
  },

  async deletePost(postId: string): Promise<void> {
    await apiClient.delete(`/posts/${postId}/`);
  },

  async listCollabRequests(params?: {
    relation_type?: "MENTION" | "COLLAB_INVITE";
    status?: string;
  }): Promise<{ count: number; results: CollabInboxEntry[] }> {
    const res = await apiClient.get<{ count: number; results: CollabInboxEntry[] }>(
      "/posts/collab-requests/",
      { params },
    );
    return res.data;
  },

  async respondCollab(
    postId: string,
    action: "ACCEPT" | "DECLINE" | "REMOVE",
  ): Promise<{ post_id: string; invite_status: string }> {
    const res = await apiClient.post<{ post_id: string; invite_status: string }>(
      `/posts/${postId}/collab-respond/`,
      { action },
    );
    return res.data;
  },

  async toggleSave(postId: string): Promise<{ post_id: string; is_saved: boolean; saves_count: number }> {
    const res = await apiClient.post<{ post_id: string; is_saved: boolean; saves_count: number }>(
      `/posts/${postId}/toggle-save/`,
    );
    return res.data;
  },

  async listSavedPosts(): Promise<{ count: number; results: SocialPostData[] }> {
    const res = await apiClient.get<{ count: number; results: SocialPostData[] }>("/posts/saved/");
    return res.data;
  },
};
