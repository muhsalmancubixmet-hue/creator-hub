import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CircleDollarSign,
  Eye,
  FileText,
  Globe2,
  Grid3X3,
  LayoutDashboard,
  Mail,
  Settings,
  Share2,
  Sparkles,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type PageKey =
  | "dashboard"
  | "profile"
  | "social"
  | "portfolio"
  | "services"
  | "website"
  | "media-kit"
  | "opportunities"
  | "inquiries"
  | "analytics"
  | "settings"
  | "subscription"
  | "collab";

export type AppPath =
  | "/"
  | "/profile"
  | "/social-media"
  | "/portfolio"
  | "/services"
  | "/website"
  | "/media-kit"
  | "/opportunities"
  | "/inquiries"
  | "/analytics"
  | "/settings"
  | "/subscription";

export const nav: Array<{
  to: AppPath;
  label: string;
  icon: LucideIcon;
  key: PageKey;
  hint?: string;
}> = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
  { to: "/profile", label: "My Profile", icon: UserRound, key: "profile", hint: "Action needed" },
  { to: "/social-media", label: "Social Media", icon: Share2, key: "social" },
  { to: "/portfolio", label: "Portfolio", icon: Grid3X3, key: "portfolio" },
  { to: "/services", label: "Services & Pricing", icon: CircleDollarSign, key: "services" },
  { to: "/website", label: "My Website", icon: Globe2, key: "website" },
  { to: "/media-kit", label: "Media Kit", icon: FileText, key: "media-kit" },
  { to: "/opportunities", label: "Opportunities", icon: Sparkles, key: "opportunities" },
  { to: "/inquiries", label: "Inquiries", icon: Mail, key: "inquiries" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, key: "analytics" },
  { to: "/subscription", label: "Plans & Pro AI", icon: Zap, key: "subscription", hint: "PRO AI" },
  { to: "/settings", label: "Settings", icon: Settings, key: "settings" },
];

export const titles: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Creator dashboard",
    subtitle: "Your business, content and community at a glance.",
  },
  profile: { title: "My profile", subtitle: "Shape how brands and your audience see you." },
  social: { title: "Social media", subtitle: "Your connected channels and audience health." },
  portfolio: { title: "Portfolio", subtitle: "Curate the work that tells your story best." },
  services: {
    title: "Services & pricing",
    subtitle: "Package your creativity for the right partnerships.",
  },
  website: { title: "My website", subtitle: "A beautiful home for your creator business." },
  "media-kit": { title: "Media kit", subtitle: "Everything a brand needs to say yes." },
  opportunities: {
    title: "Opportunities",
    subtitle: "Campaigns thoughtfully matched to your work.",
  },
  collab: {
    title: "Collaboration",
    subtitle: "Milestones, drafts and brand feedback in one place.",
  },
  inquiries: { title: "Inquiries", subtitle: "Keep every brand conversation moving." },
  analytics: { title: "Analytics", subtitle: "Understand what is earning attention." },
  subscription: {
    title: "Plans & Pro AI",
    subtitle: "Supercharge your creator sponsorships with Google Gemini AI and Pro privileges.",
  },
  settings: { title: "Settings", subtitle: "Manage your workspace, visibility and security." },
};

export function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-coral">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl leading-tight sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "coral" | "teal" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold",
        tone === "neutral" && "bg-muted text-muted-foreground",
        tone === "coral" && "bg-coral-soft text-coral",
        tone === "teal" && "bg-teal-soft text-teal",
        tone === "dark" && "bg-primary text-primary-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PageTop({
  label,
  title,
  subtitle,
  badge,
  children,
}: {
  label?: string;
  title?: string;
  subtitle?: string;
  badge?: ReactNode;
  children?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pageKey = (
    pathname === "/" ? "dashboard" : pathname.slice(1).replace("social-media", "social")
  ) as PageKey;
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-coral">
            {label || "CREATOR WORKSPACE"}
          </p>
          {badge}
        </div>
        <h2 className="mt-1 font-display text-3xl sm:text-4xl">
          {title || titles[pageKey]?.title || "Creator workspace"}
        </h2>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function FormSection({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <section className="creator-card p-5 sm:p-6">
      <h3 className="text-lg font-extrabold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

export function MiniChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-9 items-end gap-1">
      {values.map((v, i) => (
        <span
          key={i}
          className="w-1.5 rounded-t-sm bg-coral/60"
          style={{ height: `${Math.max(18, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function StatCard({
  s,
  index,
}: {
  s: { label: string; value: string; change: string; series: number[] };
  index: number;
}) {
  return (
    <div className="creator-card creator-card-hover min-w-[220px] flex-1 p-4 sm:min-w-0">
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold text-muted-foreground">{s.label}</p>
        <span
          className={cn(
            "grid size-8 place-items-center rounded-lg",
            index % 2 ? "bg-teal-soft text-teal" : "bg-coral-soft text-coral",
          )}
        >
          {index === 0 ? <Eye /> : index === 1 ? <Globe2 /> : index === 2 ? <Users /> : <Mail />}
        </span>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-2xl font-extrabold tracking-tight">{s.value}</p>
          <p className="mt-1 text-[10px] font-bold text-teal">{s.change}</p>
        </div>
        <MiniChart values={s.series} />
      </div>
    </div>
  );
}

export function WorkspacePageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl hidden lg:block" />
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}
