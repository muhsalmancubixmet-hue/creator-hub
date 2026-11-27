/**
 * Cross-Portal Social Post Composer, Collab Inbox & Saved Bookmarks (Creator Hub)
 * -------------------------------------------------------------------------------
 * Allows creators to upload Videos/Reels (unlimited size/duration with instant poster capture) & Images/Carousels,
 * attach multiple external platform links, @mention Businesses/Creators, and preview/respond to Collab Requests.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AtSign,
  BadgeCheck,
  Bookmark,
  Check,
  Clock,
  ExternalLink,
  Film,
  ImagePlus,
  Link2,
  Loader2,
  Play,
  Plus,
  Send,
  Share2,
  Sparkles,
  Trash2,
  Users,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PLATFORM_LINK_OPTIONS,
  formatPostTimestamp,
  socialFeedApi,
  type ActorCard,
  type CollabInboxEntry,
  type ExternalPlatformLink,
  type PostMediaItemData,
  type PostType,
  type SocialPostData,
  type UploadedFeedMedia,
} from "@/lib/social-feed-api";

const PUBLIC_MARKETPLACE_URL = (
  (import.meta.env["VITE_SITE_URL"] as string) || "http://localhost:8082"
).replace(/\/+$/, "");

function MediaThumbnail({
  media,
  className = "size-16 rounded-xl",
}: {
  media?: PostMediaItemData | undefined;
  className?: string;
}) {
  if (!media) {
    return (
      <div className={`grid place-items-center bg-muted ${className}`}>
        <Video className="size-5 text-muted-foreground" />
      </div>
    );
  }
  if (media.media_type === "VIDEO") {
    return (
      <div className={`relative overflow-hidden bg-black ${className}`}>
        {media.thumbnail_url ? (
          <img src={media.thumbnail_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <video
            src={media.media_url}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        )}
        <span className="absolute inset-0 grid place-items-center bg-black/25">
          <span className="grid size-6 place-items-center rounded-full bg-black/70 text-white">
            <Play className="size-3 fill-current" />
          </span>
        </span>
      </div>
    );
  }
  return <img src={media.media_url} alt="" className={`object-cover bg-muted ${className}`} />;
}

function PostPreviewCard({
  post,
  onDelete,
  onToggleSave,
}: {
  post: SocialPostData;
  onDelete?: ((id: string) => void) | undefined;
  onToggleSave: (id: string) => void;
}) {
  const firstMedia = post.media_items[0];
  const isVideo = firstMedia?.media_type === "VIDEO";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3.5 py-2.5">
        <div className="min-w-0 flex items-center gap-2">
          <div className="flex -space-x-2">
            <img
              src={
                post.author.avatar_url ||
                `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(post.author.display_name)}`
              }
              alt={post.author.display_name}
              className="size-7 rounded-full border border-background object-cover"
            />
            {post.accepted_collaborators.slice(0, 2).map((c) => (
              <img
                key={c.user_id}
                src={
                  c.avatar_url ||
                  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(c.display_name)}`
                }
                alt={c.display_name}
                className="size-7 rounded-full border border-background object-cover"
              />
            ))}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-foreground">
              {post.author.handle ? `@${post.author.handle}` : post.author.display_name}
              {post.accepted_collaborators.length > 0 && (
                <span className="text-coral">
                  {" "}
                  ×{" "}
                  {post.accepted_collaborators
                    .map((c) => (c.handle ? `@${c.handle}` : c.display_name))
                    .join(", ")}
                </span>
              )}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {post.post_type} · {formatPostTimestamp(post.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={`${PUBLIC_MARKETPLACE_URL}/post/${post.id}`}
            target="_blank"
            rel="noreferrer"
            title="Open on Kerala Creator Collab"
            className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="size-3.5" />
          </a>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(post.id)}
              title="Delete post"
              className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative aspect-[4/5] w-full bg-black/90">
        {firstMedia ? (
          isVideo ? (
            <video
              src={firstMedia.media_url}
              poster={firstMedia.thumbnail_url || undefined}
              controls
              playsInline
              muted
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={firstMedia.media_url}
              alt={post.caption || "Showcase media"}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="grid h-full place-items-center text-xs text-white/60">No media</div>
        )}
        {post.media_items.length > 1 && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-bold text-white">
            1 / {post.media_items.length}
          </span>
        )}
      </div>

      <div className="space-y-2 p-3.5">
        <p className="line-clamp-2 text-xs leading-relaxed text-foreground">
          {post.caption || "No caption"}
        </p>

        {post.external_links?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.external_links.map((lnk, idx) => (
              <a
                key={idx}
                href={lnk.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold hover:bg-secondary/80"
              >
                <Link2 className="size-2.5" /> {lnk.label || lnk.platform}
              </a>
            ))}
          </div>
        )}

        {post.pending_collaborators.length > 0 && (
          <p className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
            Waiting for collab accept:{" "}
            {post.pending_collaborators.map((p) => `@${p.target.handle}`).join(", ")}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <span>{post.views_count} views</span>
            <span className="inline-flex items-center gap-0.5">
              <Share2 className="size-3" /> {post.shares_count}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onToggleSave(post.id)}
            className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-coral"
          >
            <Bookmark className={`size-3.5 ${post.is_saved ? "fill-coral text-coral" : ""}`} />
            {post.saves_count} saved
          </button>
        </div>
      </div>
    </div>
  );
}

export function SocialFeedManager() {
  const [subTab, setSubTab] = useState<"posts" | "requests" | "saved">("posts");
  const [posts, setPosts] = useState<SocialPostData[]>([]);
  const [requests, setRequests] = useState<CollabInboxEntry[]>([]);
  const [savedPosts, setSavedPosts] = useState<SocialPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [previewEntry, setPreviewEntry] = useState<CollabInboxEntry | null>(null);

  // Composer state
  const [postType, setPostType] = useState<PostType>("REEL");
  const [caption, setCaption] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [uploadedSlides, setUploadedSlides] = useState<UploadedFeedMedia[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);

  // Multiple external platform links
  const [externalLinks, setExternalLinks] = useState<ExternalPlatformLink[]>([]);
  const [draftPlatform, setDraftPlatform] = useState<string>("Instagram");
  const [draftLinkLabel, setDraftLinkLabel] = useState("");
  const [draftLinkUrl, setDraftLinkUrl] = useState("");

  // @Mention live caption autocomplete state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<ActorCard[]>([]);
  const captionRef = useRef<HTMLTextAreaElement>(null);

  // Explicit Co-Author Collaborator picker
  const [collabSearch, setCollabSearch] = useState("");
  const [collabCandidates, setCollabCandidates] = useState<ActorCard[]>([]);
  const [selectedCollabs, setSelectedCollabs] = useState<ActorCard[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [myRes, reqRes, savedRes] = await Promise.all([
        socialFeedApi.listMyPosts(),
        socialFeedApi.listCollabRequests(),
        socialFeedApi.listSavedPosts(),
      ]);
      setPosts(myRes.results || []);
      setRequests(reqRes.results || []);
      setSavedPosts(savedRes.results || []);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (mentionQuery === null) {
      setMentionSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      void socialFeedApi
        .searchMentions(mentionQuery)
        .then(setMentionSuggestions)
        .catch(() => setMentionSuggestions([]));
    }, 180);
    return () => clearTimeout(timer);
  }, [mentionQuery]);

  useEffect(() => {
    if (!composerOpen) return;
    const timer = setTimeout(() => {
      void socialFeedApi
        .searchMentions(collabSearch)
        .then(setCollabCandidates)
        .catch(() => setCollabCandidates([]));
    }, 200);
    return () => clearTimeout(timer);
  }, [collabSearch, composerOpen]);

  const handleCaptionChange = (val: string) => {
    setCaption(val);
    const cursorPos = captionRef.current?.selectionStart ?? val.length;
    const match = val.slice(0, cursorPos).match(/@([a-zA-Z0-9._-]{0,40})$/);
    setMentionQuery(match ? (match[1] ?? "") : null);
  };

  const insertMentionHandle = (actor: ActorCard) => {
    const cursorPos = captionRef.current?.selectionStart ?? caption.length;
    const replaced = caption
      .slice(0, cursorPos)
      .replace(/@([a-zA-Z0-9._-]{0,40})$/, `@${actor.handle} `);
    setCaption(`${replaced}${caption.slice(cursorPos)}`);
    setMentionQuery(null);
    captionRef.current?.focus();
  };

  const handleAddPlatformLink = () => {
    const cleanUrl = draftLinkUrl.trim();
    if (!cleanUrl) return;
    const normalized =
      cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")
        ? cleanUrl
        : `https://${cleanUrl}`;
    setExternalLinks((prev) => [
      ...prev,
      {
        platform: draftPlatform,
        label: draftLinkLabel.trim() || `Watch on ${draftPlatform}`,
        url: normalized,
      },
    ]);
    setDraftLinkUrl("");
    setDraftLinkLabel("");
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      try {
        setUploadProgress(5);
        const uploaded = await socialFeedApi.uploadMedia(file, (pct) => setUploadProgress(pct));
        setUploadedSlides((prev) => {
          const next = [...prev, uploaded];
          if (next.length > 1) setPostType("CAROUSEL");
          else if (uploaded.media_type === "VIDEO") setPostType("REEL");
          else setPostType("IMAGE");
          return next;
        });
        toast.success(`Uploaded ${file.name}`);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { detail?: string } }; message?: string })?.response?.data
            ?.detail ||
          (err as { message?: string })?.message ||
          `Failed to upload ${file.name}`;
        toast.error(msg);
      } finally {
        setUploadProgress(null);
      }
    }
  };

  const handlePublish = async () => {
    if (uploadedSlides.length === 0) {
      toast.error("Please upload at least one photo or video.");
      return;
    }
    setPublishing(true);
    try {
      await socialFeedApi.createPost({
        post_type: uploadedSlides.length > 1 ? "CAROUSEL" : postType,
        caption,
        is_public: isPublic,
        media_items: uploadedSlides.map((s) => ({
          media_asset_id: s.media_asset_id,
          media_type: s.media_type,
          media_url: s.url,
          ...(s.thumbnail_url ? { thumbnail_url: s.thumbnail_url } : {}),
          aspect_ratio: postType === "REEL" ? "9:16" : "4:5",
          file_size_bytes: s.file_size_bytes,
        })),
        external_links: externalLinks,
        collaborator_user_ids: selectedCollabs.map((c) => c.user_id),
      });
      toast.success(
        isPublic
          ? "Post published to Kerala Creator Collab Explore feed!"
          : "Post saved to your private workspace!",
      );
      setComposerOpen(false);
      setCaption("");
      setUploadedSlides([]);
      setSelectedCollabs([]);
      setExternalLinks([]);
      await loadAll();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Failed to publish post.";
      toast.error(msg);
    } finally {
      setPublishing(false);
    }
  };

  const handleCollabRespond = async (postId: string, action: "ACCEPT" | "DECLINE" | "REMOVE") => {
    try {
      await socialFeedApi.respondCollab(postId, action);
      toast.success(
        action === "ACCEPT"
          ? "Collab accepted! Post now appears on both your profile and public feed."
          : "Collab invite updated.",
      );
      setPreviewEntry(null);
      await loadAll();
    } catch {
      toast.error("Could not update collaboration request.");
    }
  };

  const handleToggleSave = async (postId: string) => {
    try {
      const res = await socialFeedApi.toggleSave(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, is_saved: res.is_saved, saves_count: res.saves_count } : p,
        ),
      );
      const savedList = await socialFeedApi.listSavedPosts();
      setSavedPosts(savedList.results || []);
    } catch {
      toast.error("Could not toggle bookmark.");
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await socialFeedApi.deletePost(postId);
      toast.success("Post deleted.");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      toast.error("Could not delete post.");
    }
  };

  const pendingInvitesCount = requests.filter(
    (r) => r.relation_type === "COLLAB_INVITE" && r.invite_status === "PENDING",
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={subTab === "posts" ? "default" : "outline"}
            onClick={() => setSubTab("posts")}
          >
            <Film className="size-4" /> My Posts & Collabs ({posts.length})
          </Button>
          <Button
            size="sm"
            variant={subTab === "requests" ? "default" : "outline"}
            onClick={() => setSubTab("requests")}
          >
            <Users className="size-4" /> Collab Requests & Tags
            {pendingInvitesCount > 0 && (
              <span className="ml-1 rounded-full bg-coral px-1.5 py-0.5 text-[10px] font-bold text-white">
                {pendingInvitesCount}
              </span>
            )}
          </Button>
          <Button
            size="sm"
            variant={subTab === "saved" ? "default" : "outline"}
            onClick={() => setSubTab("saved")}
          >
            <Bookmark className="size-4" /> Saved ({savedPosts.length})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={`${PUBLIC_MARKETPLACE_URL}/feed`} target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5" /> Public Feed
            </a>
          </Button>
          <Button size="sm" onClick={() => setComposerOpen(true)}>
            <Plus className="size-4" /> Create Post / Reel
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : subTab === "posts" ? (
        posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Sparkles className="mx-auto size-8 text-coral" />
            <h3 className="mt-3 font-display text-lg font-bold">
              Share your first Reel, Video, or Photo
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
              Upload videos with no size/duration limits, attach social links, @mention Businesses,
              and invite them as Co-Author Collaborators.
            </p>
            <Button className="mt-4" onClick={() => setComposerOpen(true)}>
              <Plus className="size-4" /> Create Showcase Post
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostPreviewCard
                key={post.id}
                post={post}
                onDelete={(id) => void handleDelete(id)}
                onToggleSave={(id) => void handleToggleSave(id)}
              />
            ))}
          </div>
        )
      ) : subTab === "requests" ? (
        requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No incoming Brand Collab invitations or @mentions yet.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviewEntry(entry)}
                    className="shrink-0 text-left transition hover:opacity-85"
                    title="Click to watch preview"
                  >
                    <MediaThumbnail media={entry.post.media_items[0]} className="size-20 rounded-xl" />
                  </button>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">
                      @{entry.post.author.handle || entry.post.author.display_name}{" "}
                      <span className="font-normal text-muted-foreground">
                        ({entry.relation_type === "COLLAB_INVITE" ? "Collab Invite" : "@Mentioned you"})
                      </span>
                    </p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="size-3" /> {formatPostTimestamp(entry.created_at)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {entry.post.caption || "No caption"}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">
                        {entry.invite_status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewEntry(entry)}
                        className="text-[11px] font-semibold text-coral hover:underline"
                      >
                        Preview Video / Media
                      </button>
                    </div>
                  </div>
                </div>

                {entry.relation_type === "COLLAB_INVITE" && (
                  <div className="flex flex-wrap gap-2">
                    {entry.invite_status !== "ACCEPTED" && (
                      <Button
                        size="sm"
                        onClick={() => void handleCollabRespond(entry.post.id, "ACCEPT")}
                      >
                        <Check className="size-4" /> Accept Collab
                      </Button>
                    )}
                    {entry.invite_status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void handleCollabRespond(entry.post.id, "DECLINE")}
                      >
                        <X className="size-4" /> Decline
                      </Button>
                    )}
                    {entry.invite_status === "ACCEPTED" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleCollabRespond(entry.post.id, "REMOVE")}
                      >
                        Remove Tag
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : savedPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No saved showcase posts yet. Bookmark inspiring collabs from any feed to keep them here.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedPosts.map((post) => (
            <PostPreviewCard
              key={post.id}
              post={post}
              onToggleSave={(id) => void handleToggleSave(id)}
            />
          ))}
        </div>
      )}

      {/* Video / Media Preview Modal for Collab Requests */}
      <Dialog open={Boolean(previewEntry)} onOpenChange={(o) => !o && setPreviewEntry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Preview from @{previewEntry?.post.author.handle || previewEntry?.post.author.display_name}
            </DialogTitle>
            <DialogDescription>
              {previewEntry ? formatPostTimestamp(previewEntry.created_at) : ""}
            </DialogDescription>
          </DialogHeader>
          {previewEntry && (
            <div className="space-y-3">
              <div className="aspect-[4/5] max-h-[55vh] w-full overflow-hidden rounded-xl bg-black">
                {previewEntry.post.media_items[0]?.media_type === "VIDEO" ? (
                  <video
                    src={previewEntry.post.media_items[0].media_url}
                    poster={previewEntry.post.media_items[0].thumbnail_url || undefined}
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full object-contain"
                  />
                ) : previewEntry.post.media_items[0]?.media_url ? (
                  <img
                    src={previewEntry.post.media_items[0].media_url}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : null}
              </div>
              <p className="text-xs leading-relaxed text-foreground">
                {previewEntry.post.caption || "No caption"}
              </p>
              {previewEntry.post.external_links?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {previewEntry.post.external_links.map((lnk, idx) => (
                    <a
                      key={idx}
                      href={lnk.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold hover:bg-secondary/80"
                    >
                      <ExternalLink className="size-3" /> {lnk.label || lnk.platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {previewEntry?.relation_type === "COLLAB_INVITE" &&
              previewEntry.invite_status !== "ACCEPTED" && (
                <Button onClick={() => void handleCollabRespond(previewEntry.post.id, "ACCEPT")}>
                  <Check className="size-4" /> Accept Collab
                </Button>
              )}
            <Button variant="outline" onClick={() => setPreviewEntry(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Showcase Post Composer */}
      <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Create Showcase Post / Reel
            </DialogTitle>
            <DialogDescription>
              Upload photos (up to 10 MB) or videos (no size/duration limit). Use{" "}
              <code>@handle</code> in caption to mention Businesses or Creators, and attach
              external platform links.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Upload Media Dropzone */}
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  Supports MP4, MOV, WebM, M4V (<strong>unlimited size & duration</strong>) &
                  JPG/PNG/WebP (max 10 MB)
                </div>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                  <ImagePlus className="size-3.5" /> Add Photo / Video
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm,.m4v"
                    className="hidden"
                    onChange={(e) => void handleFilesSelected(e.target.files)}
                  />
                </label>
              </div>

              {uploadProgress !== null && (
                <div className="mt-3 space-y-1">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-[11px] text-muted-foreground">
                    Uploading media & generating thumbnail... {uploadProgress}%
                  </p>
                </div>
              )}

              {uploadedSlides.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {uploadedSlides.map((s, idx) => (
                    <div
                      key={s.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-black"
                    >
                      {s.media_type === "VIDEO" ? (
                        s.thumbnail_url ? (
                          <img src={s.thumbnail_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <video src={s.url} muted className="h-full w-full object-cover" />
                        )
                      ) : (
                        <img src={s.url} alt="" className="h-full w-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setUploadedSlides((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/70 text-white"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post Format */}
            {uploadedSlides.length <= 1 && (
              <div className="flex gap-2">
                {(["REEL", "VIDEO", "IMAGE"] as PostType[]).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={postType === t ? "default" : "outline"}
                    onClick={() => setPostType(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            )}

            {/* Caption with @mention live suggestions */}
            <div className="relative space-y-1.5">
              <label className="text-xs font-semibold">
                Caption (type <code>@</code> to mention Businesses or Creators)
              </label>
              <Textarea
                ref={captionRef}
                rows={3}
                placeholder="Shot this reel for @cafe_aroma_kochi in Fort Kochi! #kochi #collab"
                value={caption}
                onChange={(e) => handleCaptionChange(e.target.value)}
              />
              {mentionQuery !== null && mentionSuggestions.length > 0 && (
                <div className="z-30 max-h-48 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-lg">
                  {mentionSuggestions.map((actor) => (
                    <button
                      key={`${actor.role}-${actor.user_id}`}
                      type="button"
                      onClick={() => insertMentionHandle(actor)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-muted"
                    >
                      <AtSign className="size-3.5 text-coral" />
                      <span className="font-semibold">@{actor.handle}</span>
                      <span className="truncate text-muted-foreground">{actor.display_name}</span>
                      <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[10px]">
                        {actor.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Multiple External Platform Links Builder */}
            <div className="space-y-2 rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold">
                  Original Platform / Destination Links (Optional, Multiple Allowed)
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Shown beside post in public viewer
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-[150px_1fr_1fr_auto]">
                <select
                  value={draftPlatform}
                  onChange={(e) => setDraftPlatform(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2.5 text-xs"
                >
                  {PLATFORM_LINK_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Button label (e.g. Watch Reel)"
                  value={draftLinkLabel}
                  onChange={(e) => setDraftLinkLabel(e.target.value)}
                  className="h-9 text-xs"
                />
                <Input
                  placeholder="https://instagram.com/reel/..."
                  value={draftLinkUrl}
                  onChange={(e) => setDraftLinkUrl(e.target.value)}
                  className="h-9 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddPlatformLink}
                  disabled={!draftLinkUrl.trim()}
                >
                  <Plus className="size-3.5" /> Add
                </Button>
              </div>
              {externalLinks.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {externalLinks.map((lnk, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-2.5 py-1 text-xs"
                    >
                      <Link2 className="size-3 text-coral" />
                      <strong>{lnk.platform}:</strong>
                      <span className="max-w-[140px] truncate">{lnk.label || lnk.url}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setExternalLinks((prev) => prev.filter((_, i) => i !== idx))
                        }
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Co-Author Collab Invite Picker */}
            <div className="space-y-2 rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold">
                  Invite Co-Author Collaborator (Business / Creator)
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Mirrors on their profile once accepted
                </span>
              </div>
              <Input
                placeholder="Search brand or creator @handle..."
                value={collabSearch}
                onChange={(e) => setCollabSearch(e.target.value)}
                className="h-8 text-xs"
              />
              {selectedCollabs.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedCollabs.map((c) => (
                    <span
                      key={c.user_id}
                      className="inline-flex items-center gap-1 rounded-full bg-coral/15 px-2.5 py-1 text-xs font-semibold text-coral"
                    >
                      @{c.handle || c.display_name}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCollabs((prev) =>
                            prev.filter((item) => item.user_id !== c.user_id),
                          )
                        }
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto pt-1">
                {collabCandidates
                  .filter((c) => !selectedCollabs.some((s) => s.user_id === c.user_id))
                  .slice(0, 8)
                  .map((actor) => (
                    <button
                      key={actor.user_id}
                      type="button"
                      onClick={() => setSelectedCollabs((prev) => [...prev, actor])}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] hover:border-coral hover:bg-coral/5"
                    >
                      <Plus className="size-3" />
                      @{actor.handle || actor.display_name}
                      {actor.verified && <BadgeCheck className="size-3 text-teal" />}
                      <span className="text-[9px] text-muted-foreground">({actor.role})</span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border px-3.5 py-2.5">
              <div>
                <p className="text-xs font-semibold">Publish to Public Explore Feed</p>
                <p className="text-[11px] text-muted-foreground">
                  Show this post & accepted collabs on Kerala Creator Collab (Port 8082)
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setComposerOpen(false)} disabled={publishing}>
              Cancel
            </Button>
            <Button onClick={() => void handlePublish()} disabled={publishing || uploadProgress !== null}>
              {publishing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Send className="size-4" /> Publish Post
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
