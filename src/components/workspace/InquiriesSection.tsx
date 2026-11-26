import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Loader2,
  Pencil,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComposeDialog, EmptyState, ListSkeleton } from "@/components/workspace-extras";
import { BrandTrustDialog } from "@/components/brand-trust-dialog";
import { Badge, PageTop } from "@/components/workspace-shared";
import { cn } from "@/lib/utils";
import { creatorApi } from "@/lib/creator-api";
import { collabFor } from "@/lib/creator-data";
import { useCurrentCreator, type WorkspaceInquiryItem } from "@/lib/creator-profile-context";
import { useInquirySocket } from "@/lib/use-inquiry-socket";
import { getBrandReputation } from "@/data/brand-trust-data";
import {
  detectMessageIntent,
  getSmartReplies,
  polishQuickCue,
} from "@/lib/chat-smart-reply-engine";
import { useCreatorSubscription } from "@/lib/creator-subscription";
import { aiServiceAdapter } from "@/lib/ai-service-adapter";
import {
  detectContactLeakage,
  reportFlaggedContactAttempt,
} from "@/lib/contact-guard";

export default function InquiriesSection() {
  const { inquiries, refreshInquiries, markInquiryAsRead } = useCurrentCreator();
  const [tab, setTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [active, setActive] = useState<WorkspaceInquiryItem | null>(() => inquiries[0] ?? null);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [compose, setCompose] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active && inquiries.length > 0) {
      setActive(inquiries[0] ?? null);
    } else if (active && !inquiries.some((i) => i.id === active.id)) {
      setActive(inquiries[0] ?? null);
    }
  }, [inquiries, active]);

  useEffect(() => {
    if (
      active &&
      (!active.is_read || (active.unread_count !== undefined && active.unread_count > 0))
    ) {
      void markInquiryAsRead(active.id);
    }
  }, [active?.id]);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [loading]);

  if (inquiries.length === 0) {
    return (
      <div>
        <ComposeDialog
          open={compose}
          onOpenChange={setCompose}
          onSent={() => void refreshInquiries()}
        />
        <PageTop label="COLLABORATIONS, ORGANIZED">
          <Button onClick={() => setCompose(true)}>
            <Pencil />
            New message
          </Button>
        </PageTop>
        <EmptyState
          title="Inbox zero"
          description="You have no active brand inquiries yet."
          actionLabel="Share Media Kit"
          onAction={() => toast.success("Media kit share link copied to clipboard!")}
        />
      </div>
    );
  }

  const visible = inquiries.filter((i) => {
    const matchesTab = tab === "All" || i.status === tab;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      i.business.toLowerCase().includes(q) ||
      i.campaign.toLowerCase().includes(q) ||
      i.message.toLowerCase().includes(q);
    return matchesTab && matchesQuery;
  });

  return (
    <div>
      <ComposeDialog
        open={compose}
        onOpenChange={setCompose}
        to={active?.business}
        inquiryId={active?.id}
        onSent={() => void refreshInquiries()}
      />
      <PageTop label="COLLABORATIONS, ORGANIZED">
        <Button onClick={() => setCompose(true)}>
          <Pencil />
          New message
        </Button>
      </PageTop>
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          setLoading(true);
        }}
        className="mb-5 overflow-x-auto"
      >
        <TabsList>
          {["All", "New", "Responded", "Negotiating", "Accepted", "Declined"].map((x) => (
            <TabsTrigger key={x} value={x}>
              {x}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="creator-card grid h-[680px] max-h-[calc(100vh-14rem)] min-h-[520px] overflow-hidden lg:grid-cols-[360px_1fr]">
        {/* Left Conversations List (hidden on mobile when thread is open) */}
        <div
          className={cn(
            "flex h-full min-h-0 flex-col overflow-hidden border-b lg:border-b-0 lg:border-r",
            mobileShowThread ? "hidden lg:flex" : "flex",
          )}
        >
          <div className="border-b p-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                placeholder="Search brands or campaigns..."
              />
            </div>
          </div>
          <div className="flex-1 min-h-0 divide-y overflow-y-auto">
            {loading && <ListSkeleton />}
            {!loading && !visible.length && (
              <div className="p-4">
                <EmptyState
                  title="No matching threads"
                  text={`No ${tab.toLowerCase()} inquiries match your search.`}
                  cta="Write First Message"
                  onCta={() => setCompose(true)}
                />
              </div>
            )}
            {!loading &&
              visible.map((i) => {
                const isSelected = active?.id === i.id;
                const isUnread = !i.is_read || (i.unread_count !== undefined && i.unread_count > 0);
                const isAccepted = i.status?.toLowerCase() === "accepted";
                const isDeclined = i.status?.toLowerCase() === "declined";

                return (
                  <button
                    key={i.id}
                    onClick={() => {
                      setActive(i);
                      setMobileShowThread(true);
                      if (isUnread) void markInquiryAsRead(i.id);
                    }}
                    className={cn(
                      "relative w-full border-b p-4 text-left transition-colors hover:bg-muted/40",
                      isSelected
                        ? "bg-coral-soft/50 ring-1 ring-inset ring-coral/20"
                        : isUnread
                          ? "bg-muted/20"
                          : "",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {isUnread && (
                          <span
                            className="size-2 shrink-0 rounded-full bg-coral animate-pulse"
                            title="Unread inquiry"
                          />
                        )}
                        <strong
                          className={cn(
                            "truncate text-sm",
                            isUnread
                              ? "font-black text-foreground"
                              : "font-semibold text-foreground/85",
                          )}
                        >
                          {i.business}
                        </strong>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{i.date}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-xs",
                          isUnread
                            ? "font-bold text-foreground"
                            : "font-medium text-muted-foreground",
                        )}
                      >
                        {i.campaign}
                      </p>
                      <Badge
                        tone={
                          isAccepted
                            ? "teal"
                            : isDeclined
                              ? "neutral"
                              : isUnread
                                ? "coral"
                                : "neutral"
                        }
                        className="shrink-0 text-[9px] uppercase px-1.5 py-0.5"
                      >
                        {isAccepted
                          ? "Accepted"
                          : isDeclined
                            ? "Declined"
                            : isUnread
                              ? "New"
                              : i.status}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground/80">{i.message}</p>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right Active Conversation Thread */}
        <div
          className={cn(
            "flex h-full min-h-0 flex-col overflow-hidden",
            mobileShowThread ? "flex" : "hidden lg:flex",
          )}
        >
          <Conversation
            inquiry={active}
            onBackMobile={() => setMobileShowThread(false)}
            onStatusChanged={(newStatus) => {
              setActive((prev) => (prev ? { ...prev, status: newStatus } : null));
            }}
            onReplied={() => void refreshInquiries()}
          />
        </div>
      </div>
    </div>
  );
}

function Conversation({
  inquiry,
  onBackMobile,
  onStatusChanged,
  onReplied,
}: {
  inquiry: WorkspaceInquiryItem | null;
  onBackMobile?: () => void;
  onStatusChanged?: (status: string) => void;
  onReplied?: () => void;
}) {
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      sender: string;
      sender_name?: string;
      body: string;
      created_at: string;
      is_from_business?: boolean;
      is_from_brand?: boolean;
      is_from_creator?: boolean;
      is_me?: boolean;
    }>
  >([]);
  const [reply, setReply] = useState("");
  const [compose, setCompose] = useState(false);
  const [sending, setSending] = useState(false);
  const [trustOpen, setTrustOpen] = useState(false);
  const [quickCue, setQuickCue] = useState("");
  const [showCueBar, setShowCueBar] = useState(false);

  const contactGuard = useMemo(() => detectContactLeakage(reply), [reply]);

  const lastBrandMessage = useMemo(() => {
    const brandMsgs = messages.filter(
      (m) => m.is_from_business || m.is_from_brand || (!m.is_me && !m.is_from_creator),
    );
    if (brandMsgs.length > 0) {
      return brandMsgs[brandMsgs.length - 1].body;
    }
    return inquiry?.message || "";
  }, [messages, inquiry?.message]);

  const detectedIntent = useMemo(() => {
    return detectMessageIntent(lastBrandMessage);
  }, [lastBrandMessage]);

  const smartReplies = useMemo(() => {
    return getSmartReplies(
      lastBrandMessage,
      inquiry?.business || "",
      inquiry?.campaign,
      inquiry?.budget,
    );
  }, [lastBrandMessage, inquiry?.business, inquiry?.campaign, inquiry?.budget]);

  const { isPro, aiCredits, consumeAiCredit } = useCreatorSubscription();
  const [isPolishing, setIsPolishing] = useState(false);

  const handlePolishCue = async () => {
    if (!quickCue.trim()) return;

    if (!isPro && aiCredits <= 0) {
      toast.error(
        "You have used all 5 free AI trial credits! Upgrade to Pro Creator for unlimited Gemini AI.",
      );
      return;
    }

    setIsPolishing(true);
    try {
      const allowed = consumeAiCredit();
      if (!allowed) {
        toast.error("Upgrade to Pro Creator to continue using AI!");
        return;
      }

      const res = await aiServiceAdapter.polishChatReply({
        brandName: inquiry?.business || "Brand",
        campaignName: inquiry?.campaign,
        lastBrandMessage,
        creatorCue: quickCue,
        chatHistory: messages.map((m) => ({
          sender: m.sender_name || (m.is_me ? "You" : inquiry?.business || "Brand"),
          body: m.body,
          isMe: Boolean(m.is_me || m.is_from_creator),
        })),
      });

      setReply(res.text);
      setQuickCue("");
      setShowCueBar(false);

      if (res.provider === "gemini" || res.provider === "backend-proxy") {
        toast.success("✨ Polished with Google Gemini Flash!");
      } else {
        toast.success("AI polished your message!");
      }
    } catch {
      const fallback = polishQuickCue(quickCue, inquiry?.business || "", lastBrandMessage);
      setReply(fallback);
      setShowCueBar(false);
    } finally {
      setIsPolishing(false);
    }
  };

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const collab = inquiry ? collabFor("inquiry", inquiry.id) : null;
  const isAccepted = inquiry?.status?.toLowerCase() === "accepted";
  const isDeclined = inquiry?.status?.toLowerCase() === "declined";
  const isNegotiating = inquiry?.status?.toLowerCase() === "negotiating";

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const {
    isConnected,
    sendMessage: sendWsMessage,
    markRead,
  } = useInquirySocket({
    inquiryId: inquiry ? inquiry.id : null,
    token,
    onNewMessage: (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [
          ...prev,
          {
            id: newMsg.id,
            sender: newMsg.sender_name,
            sender_name: newMsg.sender_name,
            body: newMsg.body,
            created_at: newMsg.created_at,
            is_from_business: newMsg.sender_role === "business",
            is_from_creator: newMsg.sender_role === "creator",
            is_me: newMsg.sender_role === "creator",
          },
        ];
      });
      onReplied?.();
    },
    onMessagesRead: () => {},
  });

  useEffect(() => {
    if (!inquiry || inquiry.id === "empty") {
      setMessages([]);
      return;
    }
    let cancelled = false;
    creatorApi
      .getInquiryMessages(inquiry.id)
      .then((data: any) => {
        if (cancelled) return;
        const msgList = Array.isArray(data) ? data : (data?.results ?? []);
        setMessages(msgList);
        markRead();
      })
      .catch(() => {
        if (cancelled) return;
        setMessages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [inquiry?.id]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (!inquiry) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
        Select an inquiry from the inbox to view thread
      </div>
    );
  }

  const handleSendReply = async () => {
    if (!reply.trim()) {
      setCompose(true);
      return;
    }

    if (contactGuard.isBlocked) {
      toast.error(contactGuard.reason);
      void reportFlaggedContactAttempt({
        portal: "CREATOR_HUB",
        threadId: inquiry.id,
        counterpartyName: inquiry.business,
        rawText: reply,
        violations: contactGuard.violations,
      });
      return;
    }

    const text = reply.trim();
    setSending(true);
    setReply("");

    const sentOverWs = sendWsMessage(text);
    if (!sentOverWs) {
      try {
        await creatorApi.sendInquiryMessage(inquiry.id, text);
        toast.success("Reply dispatched to brand!");
        onReplied?.();
        const data: any = await creatorApi.getInquiryMessages(inquiry.id);
        const msgList = Array.isArray(data) ? data : (data?.results ?? []);
        setMessages(msgList);
      } catch {
        toast.error("Failed to deliver reply");
      }
    } else {
      toast.success("Reply dispatched to brand!");
      onReplied?.();
    }
    setSending(false);
  };

  const handleAccept = async () => {
    if (!inquiry) return;
    try {
      await creatorApi.updateInquiryStatus(inquiry.id, "ACCEPTED");
      toast.success("Inquiry accepted! Collaboration workspace ready.");
      onStatusChanged?.("Accepted");
      onReplied?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update inquiry status.");
    }
  };

  const handleDecline = async () => {
    if (!inquiry) return;
    try {
      await creatorApi.updateInquiryStatus(inquiry.id, "DECLINED");
      toast.warning("Inquiry declined");
      onStatusChanged?.("Declined");
      onReplied?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update inquiry status.");
    }
  };

  const handleNegotiate = async () => {
    if (!inquiry) return;
    try {
      await creatorApi.updateInquiryStatus(inquiry.id, "NEGOTIATING");
      toast.info("Status set to Negotiating. You can now reply to propose revised terms.");
      onStatusChanged?.("Negotiating");
      onReplied?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update inquiry status.");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b p-4 shrink-0 bg-card/40 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {onBackMobile && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0 size-8"
              onClick={onBackMobile}
              aria-label="Back to inbox"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-extrabold">{inquiry.business}</h3>
              <button
                type="button"
                onClick={() => setTrustOpen(true)}
                className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition cursor-pointer shrink-0"
                title="Click to view verified escrow rating and creator reviews"
              >
                <Star className="size-2.5 fill-amber-500 text-amber-500" />
                <span>{getBrandReputation(inquiry.business).rating}</span>
                <span className="text-teal text-[9px] font-semibold hidden sm:inline">
                  · Verified 🛡️
                </span>
              </button>
            </div>
            <p className="truncate text-xs text-muted-foreground mt-0.5">
              {inquiry.campaign} · {inquiry.budget}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setTrustOpen(true)}
            className="h-7 text-[11px] gap-1 font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer hidden sm:inline-flex"
            title="Rate this brand or read verified reviews"
          >
            <Star className="size-3 fill-amber-500 text-amber-500" />
            Rate Brand
          </Button>
          {(collab || isAccepted) && (
            <Button asChild size="sm" variant="secondary">
              <Link to="/collabs/$id" params={{ id: inquiry.id }}>
                Open workspace
              </Link>
            </Button>
          )}
          <Badge tone={isAccepted ? "teal" : isDeclined ? "neutral" : "coral"}>
            {inquiry.status}
          </Badge>
        </div>
      </div>

      <ComposeDialog
        open={compose}
        onOpenChange={setCompose}
        to={inquiry.business}
        inquiryId={inquiry.id}
        onSent={onReplied}
      />

      {/* Scrollable messages container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 space-y-4 overflow-y-auto bg-muted/30 p-5 sm:p-6"
      >
        {messages.length > 0 ? (
          messages.map((m) => {
            const isMe = m.is_me ?? m.is_from_creator ?? (!m.is_from_business && !m.is_from_brand);
            return (
              <div
                key={m.id}
                className={cn(
                  "max-w-[78%] rounded-2xl p-4 text-sm shadow-xs",
                  isMe
                    ? "ml-auto rounded-br-xs bg-primary text-primary-foreground"
                    : "mr-auto rounded-bl-xs border border-border bg-card text-card-foreground",
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-3 text-[10px] opacity-75">
                  <span className="font-bold">
                    {isMe ? "You" : m.sender_name || inquiry.business}
                  </span>
                  <span>
                    {m.created_at
                      ? new Date(m.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{m.body}</p>
              </div>
            );
          })
        ) : (
          <>
            <div className="mr-auto max-w-[78%] rounded-2xl rounded-bl-xs border border-border bg-card p-4 text-card-foreground shadow-xs">
              <div className="mb-1 flex items-center justify-between gap-3 text-[10px] opacity-75">
                <span className="font-bold">{inquiry.business}</span>
                <span>{inquiry.date}</span>
              </div>
              <p className="leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
            </div>
            <div className="ml-auto max-w-[78%] rounded-2xl rounded-br-xs bg-primary/20 border border-primary/30 p-4 text-foreground text-xs shadow-xs">
              <p className="leading-relaxed text-muted-foreground italic">
                You can reply above to introduce yourself, discuss rates, or click Accept to begin
                milestone production.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Sticky Reply Composer with Contact Guard & AI Adapter */}
      <div className="border-t p-4 bg-card shrink-0">
        {contactGuard.isBlocked && (
          <div className="mb-2.5 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive animate-in fade-in duration-150">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-extrabold">Contact Sharing Blocked</p>
              <p className="text-[11px] opacity-90">{contactGuard.reason}</p>
            </div>
          </div>
        )}

        <div className="space-y-2 pb-2.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-coral" /> Quick AI Responses:
              </span>
              {isPro ? (
                <span className="rounded-full bg-teal-soft border border-teal/30 px-2 py-0.5 text-[9px] font-extrabold text-teal flex items-center gap-1">
                  <Sparkles className="size-2.5" /> PRO GEMINI AI
                </span>
              ) : (
                <Link
                  to="/subscription"
                  className="rounded-full bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 transition"
                  title="Click to view subscription plans and unlock unlimited Gemini AI"
                >
                  <span>⚡ Free Trial ({aiCredits}/5 left)</span>
                  <span className="underline font-extrabold">Upgrade</span>
                </Link>
              )}
              <span className="rounded-full bg-coral/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-coral">
                {detectedIntent} query
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowCueBar((v) => !v)}
              className="text-[10px] font-bold text-coral hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Wand2 className="size-3" />
              {showCueBar ? "Hide Custom Cue" : "✨ Polish Custom Cue"}
            </button>
          </div>

          {showCueBar && (
            <div className="flex items-center gap-1.5 rounded-xl border border-coral/30 bg-coral-soft/30 p-2 animate-in fade-in slide-in-from-top-1 duration-150">
              <Input
                value={quickCue}
                onChange={(e) => setQuickCue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handlePolishCue();
                  }
                }}
                placeholder="Type rough note (e.g. 'Friday upload ready', 'Need 2 days more', 'hey how are you')..."
                className="h-7 text-xs bg-background"
              />
              <Button
                type="button"
                size="sm"
                className="h-7 px-3 text-[10px] font-bold shrink-0 gap-1"
                onClick={() => void handlePolishCue()}
                disabled={!quickCue.trim() || isPolishing}
              >
                {isPolishing ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    <span>Polishing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3" /> Polish
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            {smartReplies.map((opt) => (
              <Button
                key={opt.id}
                type="button"
                variant="outline"
                size="sm"
                className="h-6 text-[10px] gap-1 font-bold text-foreground border-border hover:border-coral/50 hover:bg-coral-soft/40 transition"
                onClick={() => setReply(opt.text)}
                title={opt.text}
              >
                <span>{opt.title}</span>
              </Button>
            ))}
          </div>
        </div>

        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSendReply();
            }
          }}
          placeholder="Write a thoughtful reply… (Phone numbers & external links are blocked for Escrow safety)"
          rows={2}
          className={cn(
            "resize-none",
            contactGuard.isBlocked && "border-destructive focus-visible:ring-destructive",
          )}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isAccepted ? (
              <div className="inline-flex items-center gap-1.5 rounded-md bg-teal-soft px-3 py-1.5 text-xs font-bold text-teal">
                <Check className="size-4" /> Collaboration Accepted
              </div>
            ) : isDeclined ? (
              <div className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
                <X className="size-4" /> Collaboration Declined
              </div>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleAccept}>
                  <Check className="size-4" /> Accept
                </Button>
                {!isNegotiating ? (
                  <Button variant="outline" size="sm" onClick={handleNegotiate}>
                    Negotiate
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Negotiating
                  </span>
                )}
                <Button variant="ghost" size="sm" onClick={handleDecline}>
                  Decline
                </Button>
              </>
            )}
            <span className="hidden xl:inline-flex items-center gap-1 text-[10px] text-muted-foreground ml-1">
              <ShieldCheck className="size-3 text-teal" /> Escrow Protected
            </span>
          </div>
          <Button
            disabled={sending || !reply.trim() || contactGuard.isBlocked}
            onClick={() => void handleSendReply()}
          >
            <Send className="size-4" />
            {sending ? "Sending..." : "Reply"}
          </Button>
        </div>
      </div>

      <BrandTrustDialog
        brandName={inquiry.business}
        open={trustOpen}
        onOpenChange={setTrustOpen}
      />
    </div>
  );
}
