import { Check, ShieldCheck, UserRound, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge, PageTop } from "@/components/workspace-shared";
import { cn } from "@/lib/utils";
import { CREATOR_PLANS, useCreatorSubscription } from "@/lib/creator-subscription";

export default function SubscriptionSection() {
  const { isPro, aiCredits, upgradeToPro, downgradeToFree } = useCreatorSubscription();

  return (
    <div className="space-y-6">
      <PageTop
        title="Subscription & Plans"
        subtitle="Manage your creator privileges, monetization tools, and Google Gemini AI suite."
        badge={
          isPro ? (
            <Badge tone="teal" className="gap-1 font-bold">
              <ShieldCheck className="size-3" /> PRO CREATOR ACTIVE
            </Badge>
          ) : (
            <Badge tone="coral" className="gap-1 font-bold">
              FREE CREATOR
            </Badge>
          )
        }
      />

      {/* Active Tier Highlight Banner */}
      <div
        className={cn(
          "creator-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4",
          isPro ? "border-teal/40 bg-teal-soft/40" : "",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            {isPro ? <Zap className="size-5" /> : <UserRound className="size-5" />}
          </span>
          <div>
            <h3 className="font-display text-lg font-extrabold text-foreground">
              Current Plan: {isPro ? "Pro Creator (₹999/mo)" : "Free Creator (₹0)"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPro
                ? "✨ Unlimited Google Gemini AI, verified badge, and priority brand discovery are active."
                : `⚡ You have ${aiCredits} out of 5 free Google Gemini AI trial credits remaining.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          {isPro ? (
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold"
              onClick={() => {
                downgradeToFree();
                toast.info("Reverted to Free Creator plan (testing mode).");
              }}
            >
              Revert to Free (Test)
            </Button>
          ) : (
            <Button
              size="sm"
              className="gap-1.5 font-bold text-xs bg-coral text-primary-foreground hover:bg-coral/90"
              onClick={() => {
                upgradeToPro();
                toast.success("Welcome to Pro Creator! Google Gemini AI & Pro features unlocked.");
              }}
            >
              <Zap className="size-3.5 fill-current" /> Upgrade to Pro (₹999/mo)
            </Button>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
        {/* FREE PLAN CARD */}
        <div
          className={cn(
            "creator-card creator-card-hover flex flex-col p-6",
            !isPro && "ring-2 ring-primary/35",
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Free Tier
              </p>
              <h4 className="font-display text-2xl font-black mt-1">Free Creator</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Essential portfolio showcase & manual messaging
              </p>
            </div>
            {!isPro && (
              <Badge tone="teal" className="text-[10px] font-bold">
                ACTIVE
              </Badge>
            )}
          </div>

          <div className="my-5">
            <span className="font-display text-3xl font-black">₹0</span>
            <span className="text-xs text-muted-foreground ml-1">/ month forever</span>
          </div>

          <ul className="flex-1 space-y-2.5 text-xs">
            {CREATOR_PLANS.FREE.features.map((feat) => (
              <li key={feat} className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-teal" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-4 border-t">
            {!isPro ? (
              <Button disabled variant="outline" className="w-full text-xs font-bold">
                Current Plan
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full text-xs font-bold"
                onClick={() => {
                  downgradeToFree();
                  toast.info("Reverted to Free Creator.");
                }}
              >
                Switch to Free
              </Button>
            )}
          </div>
        </div>

        {/* PRO CREATOR PLAN CARD */}
        <div
          className={cn(
            "creator-card creator-card-hover flex flex-col p-6 relative",
            isPro ? "border-teal ring-2 ring-teal/50" : "border-coral/50 ring-2 ring-coral/40",
          )}
        >
          <div className="absolute -top-3 right-6">
            <span className="rounded-full bg-coral px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary-foreground shadow-xs">
              Recommended for Monetization
            </span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-coral uppercase tracking-wider">
                Professional Tier
              </p>
              <h4 className="font-display text-2xl font-black mt-1 flex items-center gap-1.5">
                Pro Creator <Zap className="size-5 fill-coral text-coral" />
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Full Google Gemini AI assistant & verified business privileges
              </p>
            </div>
            {isPro && (
              <Badge tone="teal" className="text-[10px] font-bold">
                ACTIVE
              </Badge>
            )}
          </div>

          <div className="my-5">
            <span className="font-display text-3xl font-black text-foreground">₹999</span>
            <span className="text-xs text-muted-foreground ml-1">/ month</span>
          </div>

          <ul className="flex-1 space-y-2.5 text-xs">
            {CREATOR_PLANS.PRO.features.map((feat) => (
              <li key={feat} className="flex items-center gap-2 font-medium">
                <Check className="size-4 shrink-0 text-coral" />
                <span className={feat.includes("Gemini") ? "font-bold text-foreground" : ""}>
                  {feat}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-4 border-t">
            {isPro ? (
              <Button disabled variant="secondary" className="w-full text-xs font-bold text-teal">
                ✓ Pro Privileges Active
              </Button>
            ) : (
              <Button
                className="w-full text-xs font-bold gap-1.5 bg-coral text-primary-foreground hover:bg-coral/90"
                onClick={() => {
                  upgradeToPro();
                  toast.success("Welcome to Pro Creator! Google Gemini AI & Pro features unlocked.");
                }}
              >
                <Zap className="size-4 fill-current" /> Upgrade to Pro Creator (₹999/mo)
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
