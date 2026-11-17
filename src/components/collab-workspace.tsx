import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { collaborations, milestoneSteps, type CollabMessage } from "@/lib/creator-data";
import { DropZone } from "@/components/workspace-extras";
import { useCurrentCreator } from "@/lib/creator-profile-context";
import { creatorApi } from "@/lib/creator-api";

export function CollabWorkspace({ id }: { id: string }) {
  const { inquiries } = useCurrentCreator();
  const matchedInquiry = inquiries.find((i) => i.id === id);

  const collab = useMemo(() => {
    const existing = collaborations.find((c) => c.id === id);
    if (existing) return existing;
    if (matchedInquiry) {
      const validDate =
        matchedInquiry.date && !isNaN(new Date(matchedInquiry.date).getTime())
          ? matchedInquiry.date
          : new Date(Date.now() + 14 * 864e5).toISOString().split("T")[0];
      return {
        id: matchedInquiry.id,
        brand: matchedInquiry.business,
        campaign: matchedInquiry.campaign,
        deliverables: "Standard sponsored partnership deliverables",
        dueDate: validDate,
        currentStep: matchedInquiry.status === "Accepted" ? 1 : 0,
        source: { type: "inquiry" as const, id: matchedInquiry.id },
        messages: [] as CollabMessage[],
      };
    }
    return null;
  }, [id, matchedInquiry]);

  const [days, setDays] = useState<number | null>(null);
  const [file, setFile] = useState<{ name: string; url: string; video: boolean } | null>(null);
  const [step, setStep] = useState(collab?.currentStep ?? 0);
  const [liveUrl, setLiveUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [chat, setChat] = useState(false);
  const [msgs, setMsgs] = useState<CollabMessage[]>(collab?.messages ?? []);
  const [draft, setDraft] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchedInquiry || !chat) return;
    let cancelled = false;
    creatorApi
      .getInquiryMessages(matchedInquiry.id)
      .then((data: any) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : (data?.results ?? []);
        if (list.length > 0) {
          setMsgs(
            list.map((m: any) => ({
              id: m.id,
              from:
                (m.is_me ?? m.is_from_creator ?? (!m.is_from_business && !m.is_from_brand))
                  ? "creator"
                  : "brand",
              text: m.body,
              time: m.created_at
                ? new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recently",
              revision: undefined,
            })),
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [matchedInquiry?.id, chat]);

  useEffect(() => {
    if (chat) {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  }, [msgs.length, chat]);
  useEffect(() => {
    if (collab?.dueDate) {
      const parsed = new Date(collab.dueDate).getTime();
      if (!isNaN(parsed)) {
        setDays(Math.ceil((parsed - Date.now()) / 864e5));
      } else {
        setDays(14);
      }
    }
  }, [collab]);

  if (!collab)
    return (
      <div className="creator-card p-10 text-center">
        <h2 className="font-display text-3xl">Collaboration not found</h2>
        <Button asChild className="mt-5">
          <Link to="/inquiries">Back to inquiries</Link>
        </Button>
      </div>
    );

  return (
    <div className="space-y-6">
      <Link
        to={collab.source.type === "inquiry" ? "/inquiries" : "/opportunities"}
        className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Back
      </Link>
      <div className="creator-card flex flex-wrap items-end justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="text-xs font-bold text-coral">{collab.brand.toUpperCase()}</p>
          <h2 className="font-display text-3xl sm:text-4xl">{collab.campaign}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{collab.deliverables}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold",
              days !== null && days <= 7 ? "bg-coral-soft text-coral" : "bg-teal-soft text-teal",
            )}
          >
            <Clock className="size-3" />
            {days === null
              ? "Due " + collab.dueDate
              : days < 0
                ? `${-days} days overdue`
                : `Due in ${days} days`}
          </span>
          <Button variant="outline" onClick={() => setChat(true)}>
            <MessageSquare />
            Brand chat
          </Button>
        </div>
      </div>

      <ol className="creator-card grid gap-3 p-5 sm:grid-cols-5" aria-label="Milestones">
        {milestoneSteps.map((s, i) => (
          <li key={s} className="flex items-center gap-3 sm:flex-col sm:text-center">
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full text-xs font-extrabold",
                i < step
                  ? "bg-teal text-primary-foreground"
                  : i === step
                    ? "bg-coral text-primary-foreground ring-4 ring-coral-soft"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {i < step ? <Check className="size-4" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-xs font-bold",
                i === step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s}
              {i === step && <span className="block text-[10px] text-coral">Active</span>}
            </span>
          </li>
        ))}
      </ol>

      {step === 3 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-coral/30 bg-coral-soft/40 p-4">
          <div>
            <p className="font-extrabold text-sm text-coral">
              Milestone 4 Active: Waiting on Brand Feedback
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Once brand approves or if you already posted the deliverables live, click to complete
              Milestone 5 (Published Live).
            </p>
          </div>
          <Button
            size="sm"
            className="rounded-xl font-bold bg-coral hover:bg-coral/90 text-white shadow-soft"
            onClick={() => {
              const finalUrl = liveUrl.trim() || "https://instagram.com/reel/live-collab-post";
              setLiveUrl(finalUrl);
              setStep(5);
              setMsgs((m) => [
                ...m,
                {
                  id: `m${m.length + 1}`,
                  from: "creator",
                  text: `Live post published: ${finalUrl}`,
                  time: "Just now",
                  revision: "Approved",
                },
              ]);
              toast.success("Published Live milestone completed! All 5 milestones verified.");
            }}
          >
            <Check className="size-4 mr-1.5" /> Mark Published Live & Complete
          </Button>
        </div>
      )}

      <section className="creator-card space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Deliverables</h3>
          {step >= 5 && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-teal">
              <Check className="size-4" /> Published Live
            </span>
          )}
        </div>

        {step >= 5 ? (
          <div className="rounded-xl border border-teal/40 bg-teal-soft/40 p-5 space-y-2">
            <div className="flex items-center gap-2 text-teal font-extrabold text-sm">
              <Check className="size-5" /> All 5 Milestones Completed & Published Live!
            </div>
            <p className="text-xs text-muted-foreground">
              Your campaign deliverables have been approved and published. Live Post URL:{" "}
              <a
                href={
                  liveUrl.startsWith("http") ? liveUrl : `https://${liveUrl || "instagram.com"}`
                }
                target="_blank"
                rel="noreferrer"
                className="font-bold underline text-foreground"
              >
                {liveUrl || "https://instagram.com/reel/verified"}
              </a>
            </p>
          </div>
        ) : (
          <>
            {file ? (
              <div className="relative overflow-hidden rounded-md bg-muted">
                {file.video ? (
                  <video src={file.url} controls className="max-h-60 w-full" />
                ) : (
                  <div className="flex justify-center bg-muted/40 p-2">
                    <img
                      src={file.url}
                      alt="Draft preview"
                      className="max-h-60 w-auto rounded-lg object-contain shadow-sm"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between p-3 text-xs">
                  <span className="truncate font-bold">{file.name}</span>
                  {step < 3 && (
                    <Button size="sm" variant="ghost" onClick={() => setFile(null)}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <DropZone
                onFile={(f) =>
                  setFile({
                    name: f.name,
                    url: URL.createObjectURL(f),
                    video: f.type.startsWith("video"),
                  })
                }
              />
            )}

            <label className="grid gap-2 text-xs font-bold">
              Caption / notes
              <Textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption, hashtags and notes for the brand…"
                disabled={step >= 3}
              />
            </label>

            {step < 3 && (
              <Button
                disabled={!file}
                onClick={() => {
                  setStep(3);
                  setMsgs((m) => [
                    ...m,
                    {
                      id: `m${m.length + 1}`,
                      from: "creator",
                      text: `Draft uploaded: ${file?.name}`,
                      time: "Just now",
                      revision: "In review",
                    },
                  ]);
                  toast.success("Draft submitted for brand review!");
                }}
              >
                <Send /> Submit Draft for Review
              </Button>
            )}

            {step === 3 && (
              <div className="mt-4 rounded-xl border border-coral/30 bg-coral-soft/30 p-4 space-y-3">
                <div>
                  <p className="font-extrabold text-xs text-coral">
                    Step 4 Active: Brand Feedback & Approval
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Draft is currently with {collab.brand}. Once approved, publish the final post on
                    social media and submit the live URL below to complete Milestone 5.
                  </p>
                </div>

                <label className="grid gap-1.5 text-xs font-bold">
                  Published live URL (Instagram / YouTube / TikTok)
                  <Input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://instagram.com/reel/… or https://youtube.com/shorts/…"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    className="rounded-xl text-xs font-semibold"
                    onClick={() => {
                      const finalUrl =
                        liveUrl.trim() || "https://instagram.com/reel/live-collab-post";
                      setLiveUrl(finalUrl);
                      setStep(5);
                      setMsgs((m) => [
                        ...m,
                        {
                          id: `m${m.length + 1}`,
                          from: "creator",
                          text: `Live post published: ${finalUrl}`,
                          time: "Just now",
                          revision: "Approved",
                        },
                      ]);
                      toast.success("Published Live milestone completed! All checkmarks verified.");
                    }}
                  >
                    <Check className="size-3.5 mr-1" /> Publish Live & Complete Milestone
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <Sheet open={chat} onOpenChange={setChat}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{collab.brand}</SheetTitle>
            <SheetDescription>Conversation and revision history</SheetDescription>
          </SheetHeader>
          <div ref={chatContainerRef} className="flex-1 min-h-0 space-y-3 overflow-y-auto p-4">
            {msgs.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[82%] rounded-2xl p-3.5 text-sm shadow-xs",
                  m.from === "creator"
                    ? "ml-auto rounded-br-xs bg-primary text-primary-foreground"
                    : "mr-auto rounded-bl-xs border border-border bg-card text-card-foreground",
                )}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                <div
                  className={cn(
                    "mt-1.5 flex items-center gap-2 text-[10px]",
                    m.from === "creator" ? "text-primary-foreground/75" : "text-muted-foreground",
                  )}
                >
                  <span className="font-semibold">
                    {m.from === "creator" ? "You" : collab.brand}
                  </span>
                  <span>·</span>
                  <span>{m.time}</span>
                  {m.revision && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-extrabold",
                        m.revision === "Approved"
                          ? "bg-teal-soft text-teal"
                          : "bg-coral-soft text-coral",
                      )}
                    >
                      {m.revision}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <form
            className="flex gap-2 border-t p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              const text = draft.trim();
              setDraft("");
              setMsgs((m) => [
                ...m,
                { id: `m${Date.now()}`, from: "creator", text, time: "Just now" },
              ]);
              if (matchedInquiry) {
                try {
                  await creatorApi.sendInquiryReply(matchedInquiry.id, { body: text });
                } catch {
                  // Keep in local conversation list
                }
              }
            }}
          >
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message the brand…"
            />
            <Button type="submit" size="icon" aria-label="Send">
              <Send />
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
