import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { collaborations, milestoneSteps, type CollabMessage } from "@/lib/creator-data";
import { DropZone } from "@/components/workspace-extras";

export function CollabWorkspace({ id }: { id: string }) {
  const collab = collaborations.find(c => c.id === id);
  const [days, setDays] = useState<number | null>(null);
  const [file, setFile] = useState<{ name: string; url: string; video: boolean } | null>(null);
  const [step, setStep] = useState(collab?.currentStep ?? 0);
  const [chat, setChat] = useState(false);
  const [msgs, setMsgs] = useState<CollabMessage[]>(collab?.messages ?? []);
  const [draft, setDraft] = useState("");
  useEffect(() => { if (collab) setDays(Math.ceil((new Date(collab.dueDate).getTime() - Date.now()) / 864e5)); }, [collab]);

  if (!collab) return <div className="creator-card p-10 text-center"><h2 className="font-display text-3xl">Collaboration not found</h2><Button asChild className="mt-5"><Link to="/inquiries">Back to inquiries</Link></Button></div>;

  return <div className="space-y-6">
    <Link to={collab.source.type === "inquiry" ? "/inquiries" : "/opportunities"} className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3" />Back</Link>
    <div className="creator-card flex flex-wrap items-end justify-between gap-4 p-5 sm:p-6">
      <div><p className="text-xs font-bold text-coral">{collab.brand.toUpperCase()}</p><h2 className="font-display text-3xl sm:text-4xl">{collab.campaign}</h2><p className="mt-1 text-sm text-muted-foreground">{collab.deliverables}</p></div>
      <div className="flex items-center gap-2"><span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold", days !== null && days <= 7 ? "bg-coral-soft text-coral" : "bg-teal-soft text-teal")}><Clock className="size-3" />{days === null ? "Due " + collab.dueDate : days < 0 ? `${-days} days overdue` : `Due in ${days} days`}</span><Button variant="outline" onClick={() => setChat(true)}><MessageSquare />Brand chat</Button></div>
    </div>

    <ol className="creator-card grid gap-3 p-5 sm:grid-cols-5" aria-label="Milestones">{milestoneSteps.map((s, i) => <li key={s} className="flex items-center gap-3 sm:flex-col sm:text-center"><span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-xs font-extrabold", i < step ? "bg-teal text-primary-foreground" : i === step ? "bg-coral text-primary-foreground ring-4 ring-coral-soft" : "bg-muted text-muted-foreground")}>{i < step ? <Check className="size-4" /> : i + 1}</span><span className={cn("text-xs font-bold", i === step ? "text-foreground" : "text-muted-foreground")}>{s}{i === step && <span className="block text-[10px] text-coral">Active</span>}</span></li>)}</ol>

    <section className="creator-card space-y-4 p-5 sm:p-6"><h3 className="text-lg font-extrabold">Deliverables</h3>
      {file ? <div className="relative overflow-hidden rounded-md bg-muted">{file.video ? <video src={file.url} controls className="max-h-72 w-full" /> : <img src={file.url} alt="Draft preview" className="max-h-72 w-full object-contain" />}<div className="flex items-center justify-between p-3 text-xs"><span className="truncate font-bold">{file.name}</span><Button size="sm" variant="ghost" onClick={() => setFile(null)}>Remove</Button></div></div>
        : <DropZone onFile={f => setFile({ name: f.name, url: URL.createObjectURL(f), video: f.type.startsWith("video") })} />}
      <label className="grid gap-2 text-xs font-bold">Caption / notes<Textarea rows={3} placeholder="Caption, hashtags and notes for the brand…" /></label>
      <label className="grid gap-2 text-xs font-bold">Published live URL<Input type="url" placeholder="https://instagram.com/reel/…" /></label>
      <Button disabled={!file || step > 2} onClick={() => { setStep(3); setMsgs(m => [...m, { id: `m${m.length + 1}`, from: "creator", text: `Draft uploaded: ${file?.name}`, time: "Just now", revision: "In review" }]); toast.success("Submitted for review (demo)"); }}><Send />Submit for Review</Button>
    </section>

    <Sheet open={chat} onOpenChange={setChat}><SheetContent className="flex w-full flex-col sm:max-w-md"><SheetHeader><SheetTitle>{collab.brand}</SheetTitle><SheetDescription>Conversation and revision history</SheetDescription></SheetHeader>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">{msgs.map(m => <div key={m.id} className={cn("max-w-[85%] rounded-md p-3 text-sm", m.from === "creator" ? "ml-auto bg-primary text-primary-foreground" : "border bg-card")}><p>{m.text}</p><div className="mt-2 flex items-center gap-2 text-[10px] opacity-70"><span>{m.time}</span>{m.revision && <span className={cn("rounded-full px-2 py-0.5 font-extrabold", m.revision === "Approved" ? "bg-teal-soft text-teal" : "bg-coral-soft text-coral")}>{m.revision}</span>}</div></div>)}</div>
      <form className="flex gap-2 border-t p-4" onSubmit={e => { e.preventDefault(); if (!draft.trim()) return; setMsgs(m => [...m, { id: `m${m.length + 1}`, from: "creator", text: draft, time: "Just now" }]); setDraft(""); }}><Input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Message the brand…" /><Button type="submit" size="icon" aria-label="Send"><Send /></Button></form>
    </SheetContent></Sheet>
  </div>;
}
