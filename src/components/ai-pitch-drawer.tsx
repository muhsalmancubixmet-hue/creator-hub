import { useState } from "react";
import { Check, Copy, Mail, MessageSquare, Send, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  generateCustomBrandPitch,
  type PitchTone,
  type GeneratedPitchSuite,
} from "@/lib/ai-pitch-generator";
import { useCurrentCreator } from "@/lib/creator-profile-context";

interface AiPitchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultBrandName?: string;
  defaultCategory?: string;
}

export function AiPitchDrawer({
  open,
  onOpenChange,
  defaultBrandName = "",
  defaultCategory = "Lifestyle",
}: AiPitchDrawerProps) {
  const { profile } = useCurrentCreator();
  const [brandName, setBrandName] = useState(defaultBrandName);
  const [category, setCategory] = useState(defaultCategory);
  const [platform, setPlatform] = useState("Instagram & YouTube");
  const [tone, setTone] = useState<PitchTone>("creative");
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const [pitches, setPitches] = useState<GeneratedPitchSuite>(() =>
    generateCustomBrandPitch({
      creatorName: profile.displayName || profile.name || "Creator",
      creatorHandle: profile.handle,
      creatorLocation: profile.location,
      creatorCategories: profile.categories,
      brandName: defaultBrandName || "Kochi Cafe",
      brandCategory: defaultCategory,
      platform: "Instagram & YouTube",
      tone: "creative",
    }),
  );

  const handleRegenerate = () => {
    if (!brandName.trim()) {
      toast.error("Please enter a brand name.");
      return;
    }
    const res = generateCustomBrandPitch({
      creatorName: profile.displayName || profile.name || "Creator",
      creatorHandle: profile.handle,
      creatorLocation: profile.location,
      creatorCategories: profile.categories,
      brandName: brandName.trim(),
      brandCategory: category,
      platform,
      tone,
    });
    setPitches(res);
    toast.success("AI Proposal generated successfully!");
  };

  const copyToClipboard = (text: string, tabKey: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedTab(tabKey);
    toast.success("Pitch copied to clipboard!");
    setTimeout(() => setCopiedTab(null), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-coral">
            <Sparkles className="size-5" />
            <DialogTitle className="font-display text-xl font-extrabold text-foreground">
              AI Brand Pitch Studio
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Generate tailored, high-converting collaboration pitches using your verified profile
            metrics and creative focus.
          </DialogDescription>
        </DialogHeader>

        {/* Configuration Row */}
        <div className="mt-2 space-y-3 rounded-xl border border-border/80 bg-muted/30 p-3 text-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-bold text-foreground">Target Brand Name</label>
              <Input
                placeholder="e.g. Kochi Cafe, Kalyan Silks"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-foreground">Brand Industry</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                  <SelectItem value="Fashion & Lifestyle">Fashion & Lifestyle</SelectItem>
                  <SelectItem value="Tech & Apps">Tech & Apps</SelectItem>
                  <SelectItem value="Travel & Hospitality">Travel & Hospitality</SelectItem>
                  <SelectItem value="Beauty & Wellness">Beauty & Wellness</SelectItem>
                  <SelectItem value="Local Kerala Business">Local Kerala Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-bold text-foreground">Target Platforms</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Instagram (Reel + Stories)">Instagram (Reel + Stories)</SelectItem>
                  <SelectItem value="YouTube (Video / Shorts)">YouTube (Video / Shorts)</SelectItem>
                  <SelectItem value="LinkedIn & Professional">LinkedIn & Professional</SelectItem>
                  <SelectItem value="Multi-Platform Bundle">Multi-Platform Bundle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block font-bold text-foreground">Tone of Voice</label>
              <Select value={tone} onValueChange={(v) => setTone(v as PitchTone)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creative">Creative & Storytelling</SelectItem>
                  <SelectItem value="roi">ROI & Conversion Driven</SelectItem>
                  <SelectItem value="concise">Concise & Direct DM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button size="sm" className="w-full gap-2 mt-2" onClick={handleRegenerate}>
            <Wand2 className="size-3.5" /> Generate Tailored Pitch
          </Button>
        </div>

        {/* Multi-Format Output Tabs */}
        <div className="mt-4">
          <Tabs defaultValue="dm">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dm" className="text-xs gap-1">
                <MessageSquare className="size-3.5" /> Social DM
              </TabsTrigger>
              <TabsTrigger value="email" className="text-xs gap-1">
                <Mail className="size-3.5" /> Email Proposal
              </TabsTrigger>
              <TabsTrigger value="quote" className="text-xs gap-1">
                <Send className="size-3.5" /> Rate Card
              </TabsTrigger>
            </TabsList>

            {/* Social DM Tab */}
            <TabsContent value="dm" className="space-y-2 pt-2">
              <div className="relative rounded-xl border border-border/80 bg-card p-3">
                <p className="text-xs leading-relaxed whitespace-pre-wrap text-foreground font-mono">
                  {pitches.dm}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 gap-1.5 w-full text-xs font-bold"
                  onClick={() => copyToClipboard(pitches.dm, "dm")}
                >
                  {copiedTab === "dm" ? <Check className="size-3 text-teal" /> : <Copy className="size-3" />}
                  {copiedTab === "dm" ? "Copied to Clipboard!" : "Copy DM Pitch"}
                </Button>
              </div>
            </TabsContent>

            {/* Email Proposal Tab */}
            <TabsContent value="email" className="space-y-2 pt-2">
              <div className="rounded-xl border border-border/80 bg-card p-3 space-y-2">
                <div className="border-b border-border/60 pb-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Subject Line</span>
                  <p className="text-xs font-bold text-foreground mt-0.5">{pitches.emailSubject}</p>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Email Body</span>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground mt-1 font-mono">
                    {pitches.emailBody}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 gap-1.5 w-full text-xs font-bold"
                  onClick={() =>
                    copyToClipboard(
                      `Subject: ${pitches.emailSubject}\n\n${pitches.emailBody}`,
                      "email",
                    )
                  }
                >
                  {copiedTab === "email" ? <Check className="size-3 text-teal" /> : <Copy className="size-3" />}
                  {copiedTab === "email" ? "Copied Full Email!" : "Copy Subject & Email Body"}
                </Button>
              </div>
            </TabsContent>

            {/* Rate Quote Tab */}
            <TabsContent value="quote" className="space-y-2 pt-2">
              <div className="relative rounded-xl border border-border/80 bg-card p-3">
                <p className="text-xs leading-relaxed whitespace-pre-wrap text-foreground font-mono">
                  {pitches.rateQuote}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 gap-1.5 w-full text-xs font-bold"
                  onClick={() => copyToClipboard(pitches.rateQuote, "quote")}
                >
                  {copiedTab === "quote" ? <Check className="size-3 text-teal" /> : <Copy className="size-3" />}
                  {copiedTab === "quote" ? "Copied Rate Card!" : "Copy Deliverables Quote"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
