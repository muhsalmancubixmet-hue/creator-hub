import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  PencilLine,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  UserCheck,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getBrandReputation, submitBrandReview } from "@/data/brand-trust-data";

interface BrandTrustDialogProps {
  brandName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrandTrustDialog({ brandName, open, onOpenChange }: BrandTrustDialogProps) {
  const [version, setVersion] = useState(0);
  const rep = getBrandReputation(brandName);

  // Review form state (in-memory only)
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [campaignType, setCampaignType] = useState("Sponsored Reel");
  const [paymentSpeed, setPaymentSpeed] = useState("100% On-Time (Within 24h)");
  const [creatorName, setCreatorName] = useState("");

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please add a short comment about your experience.");
      return;
    }

    submitBrandReview(brandName, {
      creatorName: creatorName.trim() || "You (Verified Creator)",
      creatorNiche: "Content Creator",
      rating,
      comment: comment.trim(),
      campaignType,
      paymentSpeed,
    });

    toast.success("Thank you! Your verified creator review has been recorded.");
    setShowReviewForm(false);
    setComment("");
    setVersion((v) => v + 1);
  };

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
                <Badge
                  variant="secondary"
                  className="gap-1 border-teal/20 bg-teal-soft text-[10px] font-bold text-teal"
                >
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

        {/* Community Reviews Header & Rate Toggle */}
        <div className="mt-2 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b pb-2">
            <h4 className="flex items-center gap-2 font-display text-sm font-extrabold">
              <UserCheck className="size-4 text-coral" />
              Verified Creator Experiences ({rep.reviews.length})
            </h4>
            <Button
              type="button"
              variant={showReviewForm ? "secondary" : "outline"}
              size="sm"
              className="h-7 gap-1.5 text-xs font-bold"
              onClick={() => setShowReviewForm((v) => !v)}
            >
              {showReviewForm ? (
                <>
                  <X className="size-3.5" /> Close Form
                </>
              ) : (
                <>
                  <PencilLine className="size-3.5 text-coral" /> Rate Brand
                </>
              )}
            </Button>
          </div>

          {/* Interactive In-Memory Review Form */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="rounded-xl border border-coral/30 bg-coral-soft/30 p-3.5 space-y-3 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const active = (hoverRating || rating) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        className="p-0.5 hover:scale-110 transition cursor-pointer"
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(starVal)}
                        title={`${starVal} Star${starVal > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`size-5 ${
                            active
                              ? "fill-amber-500 text-amber-500"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-1 font-bold text-amber-600 dark:text-amber-400">
                    {rating}.0
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                    Deliverable / Format:
                  </label>
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                  >
                    <option value="Sponsored Reel">Instagram Reel</option>
                    <option value="YouTube Integration">YouTube Integration</option>
                    <option value="Story Series">Story Series</option>
                    <option value="Brand Ambassador">Ambassador Campaign</option>
                    <option value="Podcast Sponsorship">Podcast Sponsorship</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                    Payment Experience:
                  </label>
                  <select
                    value={paymentSpeed}
                    onChange={(e) => setPaymentSpeed(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                  >
                    <option value="100% On-Time (Within 24h)">Paid within 24h</option>
                    <option value="Prompt Payout (2-3 days)">Prompt (2-3 days)</option>
                    <option value="Escrow Released Smoothly">Escrow Released</option>
                    <option value="Minor Payment Delay">Minor Delay</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                  Your Review / Experience:
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the communication, brief clarity, and creative freedom?"
                  rows={2}
                  className="bg-background text-xs resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="h-7 gap-1 text-xs font-bold">
                  <Send className="size-3" /> Submit Review
                </Button>
              </div>
            </form>
          )}

          {/* List of Verified Reviews */}
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
