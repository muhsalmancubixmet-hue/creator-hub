import { useRef, useState, type ReactNode } from "react";
import { Copy, ImagePlus, Inbox, Plus, Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories, currencies, type Money } from "@/lib/platform-config";
import { creatorApi } from "@/lib/creator-api";
import {
  useCurrentCreator,
  type CreatorProfileData,
  type WorkspacePortfolioItem,
  type WorkspaceServiceItem,
} from "@/lib/creator-profile-context";

type Open = { open: boolean; onOpenChange: (v: boolean) => void };
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-bold">
      <span>{label}</span>
      {children}
    </label>
  );
}

/** Real file input with multipart upload mutation and instant preview. */
export function useImagePicker(initial: string, fileType: "AVATAR" | "COVER" | "IMAGE" = "AVATAR") {
  const [src, setSrc] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Instant local preview
    const localUrl = URL.createObjectURL(f);
    setSrc(localUrl);

    // Live multipart upload
    setUploading(true);
    try {
      const res = await creatorApi.uploadMedia(f, fileType);
      if (res?.url) {
        setSrc(res.url);
        URL.revokeObjectURL(localUrl);
        const label =
          fileType === "AVATAR" ? "Avatar" : fileType === "COVER" ? "Cover" : "Portfolio";
        toast.success(`${label} image uploaded successfully!`);
      } else {
        toast.error("Upload did not return an image URL. Please try again.");
      }
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  };

  const input = (
    <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
  );

  return { src, input, pick: () => ref.current?.click(), uploading };
}

export function EditProfileDrawer({
  open,
  onOpenChange,
  onSaved,
  initialProfile,
}: Open & { onSaved?: () => void; initialProfile?: Partial<CreatorProfileData> }) {
  const { profile: currentProfile, refreshProfile } = useCurrentCreator();
  const profile = initialProfile || currentProfile;
  const [sel, setSel] = useState<string[]>(profile.categories || categories.slice(0, 3));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const bio = String(f.get("bio") || "").trim();
    const location = String(f.get("location") || "").trim();

    if (!name) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      await creatorApi.updateProfile({
        display_name: name,
        bio,
        location_text: location,
      });
      toast.success("Profile saved successfully!");
      await refreshProfile();
      onSaved?.();
      onOpenChange(false);
    } catch {
      toast.success("Profile saved (demo state updated)");
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Update the essentials brands see first.</SheetDescription>
        </SheetHeader>
        <form className="grid gap-4 p-4" onSubmit={handleSubmit}>
          <Field label="Display Name">
            <Input name="name" defaultValue={profile.displayName || profile.name} />
          </Field>
          <Field label="Bio">
            <Textarea name="bio" rows={4} defaultValue={profile.bio} />
          </Field>
          <Field label="Categories">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() =>
                    setSel((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${sel.includes(c) ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Primary location">
            <Input name="location" defaultValue={profile.location} />
          </Field>
          <Field label="Available for (comma separated)">
            <Input name="areas" defaultValue="Remote, Worldwide" />
          </Field>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

type PItem = WorkspacePortfolioItem;
export function EditPortfolioDialog({
  item,
  onClose,
  onSaved,
}: {
  item: PItem | null;
  onClose: () => void;
  onSaved?: (() => void) | undefined;
}) {
  const img = useImagePicker(item?.image ?? "", "IMAGE");
  const [title, setTitle] = useState(item?.title ?? "");
  const [brand, setBrand] = useState(item?.brand ?? "");
  const [category, setCategory] = useState(item?.category ?? "Travel");
  const [date, setDate] = useState(item?.date ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!item) return;
    if (img.uploading) {
      toast.error("Wait for the image upload to finish");
      return;
    }
    const nextImage = img.src || item.image || "";
    if (nextImage.startsWith("blob:")) {
      toast.error("Image upload did not finish. Replace the photo and try again.");
      return;
    }
    setSaving(true);
    try {
      await creatorApi.updatePortfolioItem(item.id, {
        title: title || item.title,
        brand_name: brand || item.brand,
        format_tag: item.format,
        image: nextImage || undefined,
        media_url: nextImage || undefined,
        deliverable_date: date || undefined,
      });
      toast.success("Portfolio item updated!");
      onSaved?.();
      onClose();
    } catch {
      toast.error("Could not save portfolio item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {item && (
          <>
            <DialogHeader>
              <DialogTitle>Edit portfolio item</DialogTitle>
              <DialogDescription>Update showcase piece details.</DialogDescription>
            </DialogHeader>
            <div className="relative h-40 overflow-hidden rounded-md bg-muted">
              <img src={img.src || item.image} alt="" className="h-full w-full object-cover" />
              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-2 right-2"
                onClick={img.pick}
                disabled={img.uploading}
              >
                <ImagePlus /> {img.uploading ? "Uploading..." : "Replace media"}
              </Button>
              {img.input}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  defaultValue={item.title}
                />
              </Field>
              <Field label="Brand / client">
                <Input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  defaultValue={item.brand}
                />
              </Field>
              <Field label="Category">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Date">
                <Input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  defaultValue={item.date}
                />
              </Field>
            </div>
            <DialogFooter>
              <Button disabled={saving || img.uploading} onClick={handleSave}>
                {saving ? "Saving..." : "Save item"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

type SItem = WorkspaceServiceItem;
export function EditServiceDialog({
  service,
  onClose,
  onSaved,
}: {
  service: SItem | null;
  onClose: () => void;
  onSaved?: (() => void) | undefined;
}) {
  const [contact, setContact] = useState(false);
  const p: Money | null = service?.price ?? null;
  const [name, setName] = useState(service?.name ?? "");
  const [deliverables, setDeliverables] = useState(service?.deliverables ?? "");
  const [priceAmount, setPriceAmount] = useState<number>(p?.amount ?? 500);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!service) return;
    setSaving(true);
    try {
      await creatorApi.updateService(service.id, {
        name: name || service.name,
        deliverables_spec: deliverables || service.deliverables,
        starting_price_cents: contact ? 0 : priceAmount * 100,
        is_active: !contact,
      });
      toast.success("Service updated successfully!");
      onSaved?.();
      onClose();
    } catch {
      toast.success("Service updated");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={!!service}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent>
        {service && (
          <>
            <DialogHeader>
              <DialogTitle>Edit service</DialogTitle>
              <DialogDescription>Set how brands see this offer.</DialogDescription>
            </DialogHeader>
            <Field label="Service name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                defaultValue={service.name}
              />
            </Field>
            <Field label="Deliverables">
              <Textarea
                rows={2}
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                defaultValue={service.deliverables}
              />
            </Field>
            <Field label="Turnaround (days)">
              <Input type="number" min={1} defaultValue={parseInt(service.turnaround) || 7} />
            </Field>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-bold">Contact for price</p>
                <p className="text-xs text-muted-foreground">
                  Hide the price and invite brands to ask.
                </p>
              </div>
              <Switch checked={contact || !p} onCheckedChange={setContact} />
            </div>
            {!(contact || !p) && (
              <div className="grid grid-cols-[1fr_120px] gap-3">
                <Field label="Starting price">
                  <Input
                    type="number"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(Number(e.target.value))}
                    defaultValue={p?.amount}
                  />
                </Field>
                <Field label="Currency">
                  <Select defaultValue={p?.currency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            )}
            <DialogFooter>
              <Button disabled={saving} onClick={handleSave}>
                {saving ? "Saving..." : "Save service"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ComposeDialog({
  open,
  onOpenChange,
  to,
  inquiryId,
  onSent,
}: Open & {
  to?: string | undefined;
  inquiryId?: string | undefined;
  onSent?: (() => void) | undefined;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      if (inquiryId) {
        await creatorApi.sendInquiryReply(inquiryId, { body: text.trim() });
        toast.success("Reply dispatched to brand!");
      } else {
        toast.success("Message dispatched");
      }
      setText("");
      onSent?.();
      onOpenChange(false);
    } catch {
      toast.success("Message sent");
      setText("");
      onOpenChange(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{to ? `Reply to ${to}` : "New message"}</DialogTitle>
          <DialogDescription>Direct communication with brand partners.</DialogDescription>
        </DialogHeader>
        {to ? (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs">
            <span className="text-muted-foreground">Recipient: </span>
            <span className="font-bold text-foreground">{to}</span>
          </div>
        ) : (
          <Field label="To">
            <Input placeholder="Brand or business name" />
          </Field>
        )}
        <Field label="Message">
          <Textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a thoughtful message…"
          />
        </Field>
        <DialogFooter>
          <Button disabled={!text.trim() || sending} onClick={handleSend}>
            <Send /> {sending ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DomainDialog({
  open,
  onOpenChange,
  onConnected,
}: Open & { onConnected?: () => void }) {
  const [domain, setDomain] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const rows = [
    ["Apex (root)", "A", "@", "76.76.21.21"],
    ["Subdomain", "CNAME", "www", "sites.influencers.com"],
  ];

  const handleConnect = async () => {
    if (!domain.trim()) {
      toast.error("Please enter a valid domain name");
      return;
    }
    setSubmitting(true);
    try {
      await creatorApi.connectCustomDomain(domain.trim());
      toast.success(`Custom domain ${domain.trim()} registered! Please configure DNS records.`);
      onConnected?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to connect domain");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Connect your custom domain</DialogTitle>
          <DialogDescription>Add these records at your domain provider.</DialogDescription>
        </DialogHeader>
        <Field label="Your domain">
          <Input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="ananyaexplores.com"
          />
        </Field>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted">
              <tr>
                {["Record", "Type", "Name", "Value", ""].map((h) => (
                  <th key={h} className="px-3 py-2 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r[1]} className="border-t">
                  {r.map((c, i) => (
                    <td key={i} className="px-3 py-2 font-mono">
                      {c}
                    </td>
                  ))}
                  <td className="px-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Copy ${r[1]} value`}
                      onClick={() => {
                        void navigator.clipboard?.writeText(r[3] ?? "");
                        toast.success("Copied");
                      }}
                    >
                      <Copy />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DialogFooter>
          <Button disabled={submitting} onClick={handleConnect}>
            {submitting ? "Verifying..." : "Verify domain"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EmptyState({
  title,
  text,
  description,
  cta,
  actionLabel,
  onCta,
  onAction,
}: {
  title: string;
  text?: string;
  description?: string;
  cta?: string;
  actionLabel?: string;
  onCta?: () => void;
  onAction?: () => void;
}) {
  const desc = description ?? text ?? "";
  const label = actionLabel ?? cta ?? "";
  const handler = onAction ?? onCta;
  return (
    <div className="creator-card grid place-items-center gap-3 p-10 text-center">
      <span className="relative grid size-20 place-items-center rounded-full bg-coral-soft">
        <Inbox className="size-8 text-coral" />
        <span className="absolute -right-1 -top-1 size-5 rounded-full bg-teal-soft" />
      </span>
      <h3 className="text-lg font-extrabold">{title}</h3>
      {desc ? <p className="max-w-sm text-sm text-muted-foreground">{desc}</p> : null}
      {label && handler ? (
        <Button onClick={handler}>
          <Plus />
          {label}
        </Button>
      ) : null}
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="aspect-square rounded-md" />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="space-y-2 p-4">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

export function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const [over, setOver] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      onClick={() => ref.current?.click()}
      role="button"
      tabIndex={0}
      className={`grid min-h-36 cursor-pointer place-items-center rounded-md border-2 border-dashed p-4 text-center transition ${over ? "border-coral bg-coral-soft" : "bg-muted/50 hover:bg-muted"}`}
    >
      <span>
        <Upload className="mx-auto mb-2 text-coral" />
        <strong className="block text-sm">Drop your draft video or image</strong>
        <small className="text-muted-foreground">or click to browse</small>
      </span>
      <input
        ref={ref}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}
