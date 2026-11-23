import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  UserCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getBrandReputation } from "@/data/brand-trust-data";

interface BrandTrustDialogProps {
  brandName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrandTrustDialog({ brandName, open, onOpenChange }: BrandTrustDialogProps) {
  const rep = getBrandReputation(brandName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-teal-soft font-display text-xl font-extrabold text-teal">
              {rep.brandName.charAt(0)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="font-display text-xl font-extrabold">
                  {rep.brandName}
                </DialogTitle>
                <Badge tone="teal" className="gap-1 text-[10px] font-bold">
                  <ShieldCheck className="size-3" />
                  VERIFIED
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                {rep.location} · {rep.badge}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Top Summary Metric Row */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/60 p-3 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 font-display text-lg font-black text-amber-500">
              <Star className="size-4 fill-amber-500" />
              <span>{rep.rating}</span>
            </div>
            <p className="text-[10px] font-medium text-muted-foreground">
              {rep.reviewCount} creator reviews
            </p>
          </div>
          <div className="border-x border-border/60">
            <strong className="block font-display text-lg font-black text-foreground">
              {rep.firstDraftApprovalRate}%
            </strong>
            <p className="text-[10px] font-medium text-muted-foreground">First-draft approval</p>
          </div>
          <div>
            <strong className="block font-display text-lg font-black text-teal">
              {rep.completedCampaigns}
            </strong>
            <p className="text-[10px] font-medium text-muted-foreground">Completed collabs</p>
          </div>
        </div>

        {/* Escrow Guarantee Banner */}
        <div className="flex items-start gap-3 rounded-xl border border-teal/30 bg-teal-soft/40 p-3 text-xs">
          <ShieldCheck className="size-5 shrink-0 text-teal" />
          <div>
            <strong className="text-teal font-extrabold">100% Escrow Payment Guarantee</strong>
            <p className="mt-0.5 text-muted-foreground leading-relaxed">
              Brand campaign funds are pre-funded in escrow before creators start production.
              Payment release is guaranteed upon deliverable approval.
            </p>
          </div>
        </div>

        {/* Punctuality Highlights */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-3.5 text-teal shrink-0" />
            <span>
              Payout Timing: <strong className="text-foreground">{rep.paymentPunctuality}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ThumbsUp className="size-3.5 text-coral shrink-0" />
            <span>
              Creative Freedom:{" "}
              <strong className="text-foreground">High (No repetitive micromanagement)</strong>
            </span>
          </div>
        </div>

        {/* Community Reviews List */}
        <div className="mt-2 space-y-3">
          <h4 className="flex items-center gap-2 font-display text-sm font-extrabold">
            <UserCheck className="size-4 text-coral" />
            Verified Creator Experiences ({rep.reviews.length})
          </h4>

          <div className="space-y-2.5">
            {rep.reviews.map((rev) => (
              <div key={rev.id} className="rounded-xl border border-border/80 bg-card p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-foreground">{rev.creatorName}</span>
                    <span className="ml-1 text-muted-foreground">· {rev.creatorNiche}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="size-3 fill-amber-500" />
                    <span>{rev.rating}</span>
                  </div>
                </div>
                <Badge variant="outline" className="mt-1 text-[9px] py-0">
                  {rev.campaignType}
                </Badge>
                <p className="mt-2 text-muted-foreground leading-relaxed italic">“{rev.comment}”</p>
                <p className="mt-1 text-[10px] text-muted-foreground/70">{rev.date}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
