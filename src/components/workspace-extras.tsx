import { useRef, useState, type ReactNode } from "react";
import { Copy, ImagePlus, Inbox, Plus, Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories, currencies, type Money } from "@/lib/platform-config";
import { creator, type portfolio, type services } from "@/lib/creator-data";

type Open = { open: boolean; onOpenChange: (v: boolean) => void };
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-2 text-xs font-bold"><span>{label}</span>{children}</label>;
}

/** Real file input with instant local preview (object URL; nothing is uploaded). */
export function useImagePicker(initial: string) {
  const [src, setSrc] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  const input = <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setSrc(URL.createObjectURL(f)); toast.success("Image updated (local preview)"); } }} />;
  return { src, input, pick: () => ref.current?.click() };
}

export function EditProfileDrawer({ open, onOpenChange }: Open) {
  const [sel, setSel] = useState<string[]>(creator.categories);
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="w-full overflow-y-auto sm:max-w-md"><SheetHeader><SheetTitle>Edit profile</SheetTitle><SheetDescription>Update the essentials brands see first.</SheetDescription></SheetHeader>
    <form className="grid gap-4 p-4" onSubmit={e => { e.preventDefault(); const name = new FormData(e.currentTarget).get("name"); if (!String(name).trim()) { toast.error("Name is required"); return; } onOpenChange(false); toast.success("Profile saved (demo — not stored yet)"); }}>
      <Field label="Full name"><Input name="name" defaultValue={creator.name} /></Field>
      <Field label="Bio"><Textarea name="bio" rows={4} defaultValue={creator.bio} /></Field>
      <Field label="Categories"><div className="flex flex-wrap gap-2">{categories.map(c => <button type="button" key={c} onClick={() => setSel(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c])} className={`rounded-full border px-3 py-1 text-xs font-bold ${sel.includes(c) ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{c}</button>)}</div></Field>
      <Field label="Primary location"><Input name="location" defaultValue={creator.location} /></Field>
      <Field label="Available for (comma separated)"><Input name="areas" defaultValue={[...creator.locations.serviceAreas.map(a => a.name), "Remote"].join(", ")} /></Field>
      <Button type="submit">Save changes</Button>
    </form></SheetContent></Sheet>;
}

type PItem = typeof portfolio[number];
export function EditPortfolioDialog({ item, onClose }: { item: PItem | null; onClose: () => void }) {
  const img = useImagePicker(item?.image ?? "");
  return <Dialog open={!!item} onOpenChange={o => !o && onClose()}><DialogContent>{item && <><DialogHeader><DialogTitle>Edit portfolio item</DialogTitle><DialogDescription>Changes stay in this demo session.</DialogDescription></DialogHeader>
    <div className="relative h-40 overflow-hidden rounded-md bg-muted"><img src={img.src || item.image} alt="" className="h-full w-full object-cover" /><Button size="sm" variant="secondary" className="absolute bottom-2 right-2" onClick={img.pick}><ImagePlus />Replace media</Button>{img.input}</div>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Title"><Input defaultValue={item.title} /></Field><Field label="Brand / client"><Input defaultValue={item.brand} /></Field>
      <Field label="Category"><Select defaultValue={item.category}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field><Field label="Date"><Input defaultValue={item.date} /></Field></div>
    <DialogFooter><Button onClick={() => { onClose(); toast.success("Portfolio item updated (demo)"); }}>Save item</Button></DialogFooter></>}</DialogContent></Dialog>;
}

type SItem = typeof services[number];
export function EditServiceDialog({ service, onClose }: { service: SItem | null; onClose: () => void }) {
  const [contact, setContact] = useState(false);
  const p: Money | null = service?.price ?? null;
  return <Dialog open={!!service} onOpenChange={o => { if (!o) onClose(); }}><DialogContent>{service && <><DialogHeader><DialogTitle>Edit service</DialogTitle><DialogDescription>Set how brands see this offer.</DialogDescription></DialogHeader>
    <Field label="Service name"><Input defaultValue={service.name} /></Field>
    <Field label="Deliverables"><Textarea rows={2} defaultValue={service.deliverables} /></Field>
    <Field label="Turnaround (days)"><Input type="number" min={1} defaultValue={parseInt(service.turnaround) || 7} /></Field>
    <div className="flex items-center justify-between rounded-md border p-3"><div><p className="text-sm font-bold">Contact for price</p><p className="text-xs text-muted-foreground">Hide the price and invite brands to ask.</p></div><Switch checked={contact || !p} onCheckedChange={setContact} /></div>
    {!(contact || !p) && <div className="grid grid-cols-[1fr_120px] gap-3"><Field label="Starting price"><Input type="number" defaultValue={p?.amount} /></Field><Field label="Currency"><Select defaultValue={p?.currency}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}</SelectContent></Select></Field></div>}
    <DialogFooter><Button onClick={() => { onClose(); toast.success("Service updated (demo)"); }}>Save service</Button></DialogFooter></>}</DialogContent></Dialog>;
}

export function ComposeDialog({ open, onOpenChange, to }: Open & { to?: string }) {
  const [text, setText] = useState("");
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{to ? `Reply to ${to}` : "New message"}</DialogTitle><DialogDescription>Messages are simulated in this prototype.</DialogDescription></DialogHeader>
    {!to && <Field label="To"><Input placeholder="Brand or business name" /></Field>}
    <Field label="Message"><Textarea rows={5} value={text} onChange={e => setText(e.target.value)} placeholder="Write a thoughtful message…" /></Field>
    <DialogFooter><Button disabled={!text.trim()} onClick={() => { setText(""); onOpenChange(false); toast.success("Message sent (demo)"); }}><Send />Send</Button></DialogFooter></DialogContent></Dialog>;
}

export function DomainDialog({ open, onOpenChange }: Open) {
  const rows = [["Apex (root)", "A", "@", "76.76.21.21"], ["Subdomain", "CNAME", "www", "sites.influencers.com"]];
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>Connect your custom domain</DialogTitle><DialogDescription>Add these records at your domain provider. Demo values — no DNS is checked yet.</DialogDescription></DialogHeader>
    <Field label="Your domain"><Input placeholder="ananyaexplores.com" /></Field>
    <div className="overflow-x-auto rounded-md border"><table className="w-full text-left text-xs"><thead className="bg-muted"><tr>{["Record", "Type", "Name", "Value", ""].map(h => <th key={h} className="px-3 py-2 font-bold">{h}</th>)}</tr></thead><tbody>{rows.map(r => <tr key={r[1]} className="border-t">{r.map((c, i) => <td key={i} className="px-3 py-2 font-mono">{c}</td>)}<td className="px-2"><Button size="icon" variant="ghost" aria-label={`Copy ${r[1]} value`} onClick={() => { void navigator.clipboard?.writeText(r[3] ?? ""); toast.success("Copied"); }}><Copy /></Button></td></tr>)}</tbody></table></div>
    <DialogFooter><Button onClick={() => { onOpenChange(false); toast.success("Domain saved — verification is simulated"); }}>Verify domain</Button></DialogFooter></DialogContent></Dialog>;
}

export function EmptyState({ title, text, cta, onCta }: { title: string; text: string; cta: string; onCta: () => void }) {
  return <div className="creator-card grid place-items-center gap-3 p-10 text-center"><span className="relative grid size-20 place-items-center rounded-full bg-coral-soft"><Inbox className="size-8 text-coral" /><span className="absolute -right-1 -top-1 size-5 rounded-full bg-teal-soft" /></span><h3 className="text-lg font-extrabold">{title}</h3><p className="max-w-sm text-sm text-muted-foreground">{text}</p><Button onClick={onCta}><Plus />{cta}</Button></div>;
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">{Array.from({ length: count }, (_, i) => <Skeleton key={i} className="aspect-square rounded-md" />)}</div>;
}
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return <div className="divide-y">{Array.from({ length: rows }, (_, i) => <div key={i} className="space-y-2 p-4"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-3/4" /><Skeleton className="h-3 w-full" /></div>)}</div>;
}

export function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const [over, setOver] = useState(false); const ref = useRef<HTMLInputElement>(null);
  return <div onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }} onClick={() => ref.current?.click()} role="button" tabIndex={0} className={`grid min-h-36 cursor-pointer place-items-center rounded-md border-2 border-dashed p-4 text-center transition ${over ? "border-coral bg-coral-soft" : "bg-muted/50 hover:bg-muted"}`}>
    <span><Upload className="mx-auto mb-2 text-coral" /><strong className="block text-sm">Drop your draft video or image</strong><small className="text-muted-foreground">or click to browse</small></span>
    <input ref={ref} type="file" accept="image/*,video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
  </div>;
}
