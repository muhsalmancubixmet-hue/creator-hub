/**
 * Social Feed & Cross-Portal Collab API Client (Creator Hub)
 * -----------------------------------------------------------
 * Connects Creator Hub (Port 8080) to Django `/api/v1/posts/*` & `/api/v1/mentions/*`.
 * Supports unlimited-size videos (auto client-side JPEG poster extraction), 10 MB images,
 * multiple external platform links, @mentions, Co-Author Collabs, and Bookmarks.
 */

import { apiClient } from "./api-client";

export type PostType = "IMAGE" | "VIDEO" | "REEL" | "CAROUSEL";

export interface ExternalPlatformLink {
  platform: string;
  label?: string;
  url: string;
}

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
  external_links: ExternalPlatformLink[];
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
  thumbnail_url?: string;
  file_name: string;
  media_type: "IMAGE" | "VIDEO";
  file_size_bytes: number;
}

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export const PLATFORM_LINK_OPTIONS = [
  "Instagram",
  "YouTube",
  "Facebook",
  "TikTok",
  "X / Twitter",
  "LinkedIn",
  "Website / Product Link",
] as const;

export function formatPostTimestamp(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  let relative = "Just now";
  if (diffSec >= 86400) {
    const days = Math.floor(diffSec / 86400);
    relative = `${days}d ago`;
  } else if (diffSec >= 3600) {
    const hrs = Math.floor(diffSec / 3600);
    relative = `${hrs}h ago`;
  } else if (diffSec >= 60) {
    const mins = Math.floor(diffSec / 60);
    relative = `${mins}m ago`;
  }
  const formatted = date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${relative} · ${formatted}`;
}

/**
 * Extracts a JPEG poster frame from a local video File directly in the browser using HTML5 Canvas
 * so videos always display an instant crisp thumbnail even when OS ffmpeg is absent.
 */
async function extractVideoPosterFile(videoFile: File): Promise<File | null> {
  if (typeof document === "undefined" || typeof URL === "undefined") return null;
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(videoFile);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    let settled = false;

    const cleanup = (result: File | null) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(objectUrl);
      resolve(result);
    };

    const timer = setTimeout(() => cleanup(null), 6000);

    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(0.5, Math.max(0, (video.duration || 1) * 0.1));
      } catch {
        clearTimeout(timer);
        cleanup(null);
      }
    };

    video.onseeked = () => {
      try {
        const w = Math.min(720, video.videoWidth || 720);
        const ratio = video.videoWidth && video.videoHeight ? video.videoHeight / video.videoWidth : 1.25;
        const h = Math.round(w * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          clearTimeout(timer);
          cleanup(null);
          return;
        }
        ctx.drawImage(video, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            clearTimeout(timer);
            if (!blob) {
              cleanup(null);
              return;
            }
            const posterName = `${videoFile.name.replace(/\.[^.]+$/, "")}_poster.jpg`;
            cleanup(new File([blob], posterName, { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.82,
        );
      } catch {
        clearTimeout(timer);
        cleanup(null);
      }
    };

    video.onerror = () => {
      clearTimeout(timer);
      cleanup(null);
    };

    video.src = objectUrl;
  });
}

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
    const isVideo = /\.(mp4|mov|webm|m4v)$/i.test(file.name) || file.type.startsWith("video/");
    if (!isVideo && file.size > MAX_IMAGE_BYTES) {
      throw new Error("Image exceeds 10 MB upload limit.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", isVideo ? "VIDEO" : "IMAGE");

    const res = await apiClient.post<UploadedFeedMedia>("/posts/media/upload/", formData, {
      timeout: 0, // Allow large / unlimited video uploads without artificial timeout
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.min(95, Math.round((evt.loaded * 95) / evt.total)));
        }
      },
    });

    const uploaded = res.data;
    if (isVideo) {
      const posterFile = await extractVideoPosterFile(file);
      if (posterFile) {
        try {
          const posterForm = new FormData();
          posterForm.append("file", posterFile);
          posterForm.append("file_type", "IMAGE");
          const posterRes = await apiClient.post<UploadedFeedMedia>("/posts/media/upload/", posterForm);
          uploaded.thumbnail_url = posterRes.data.url;
        } catch {
          // Non-blocking fallback
        }
      }
    }
    if (onProgress) onProgress(100);
    return uploaded;
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
      thumbnail_url?: string;
      aspect_ratio?: string;
      file_size_bytes?: number;
    }>;
    external_links: ExternalPlatformLink[];
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
