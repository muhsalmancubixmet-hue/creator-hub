import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { demoAuth } from "@/lib/demo-auth";
import { creatorApi, type SocialAccountItem, type SocialPlatformItem } from "@/lib/creator-api";
import { authService } from "@/lib/auth-service";
import {
  ComposeDialog,
  DomainDialog,
  EditPortfolioDialog,
  EditProfileDrawer,
  EditServiceDialog,
  EmptyState,
  GridSkeleton,
  ListSkeleton,
  useImagePicker,
} from "@/components/workspace-extras";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Globe2,
  Grid3X3,
  Heart,
  HelpCircle,
  Home,
  ImagePlus,
  Instagram,
  KeyRound,
  LayoutDashboard,
  Link2,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Palette,
  Pencil,
  Play,
  Plus,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  UserRound,
  Users,
  Wand2,
  WandSparkles,
  Youtube,
  X,
  Zap,
} from "lucide-react";
import { BrandTrustDialog } from "@/components/brand-trust-dialog";
import { AiPitchDrawer } from "@/components/ai-pitch-drawer";
import { generateOpportunityPitch, type PitchTone } from "@/lib/ai-pitch-generator";
import { getBrandReputation } from "@/data/brand-trust-data";
import {
  getSmartReplies,
  polishQuickCue,
  detectMessageIntent,
} from "@/lib/chat-smart-reply-engine";
import type { LucideIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useInquirySocket } from "@/lib/use-inquiry-socket";
import { WorldMap } from "@/components/world-map";
import {
  categories,
  currencies,
  distanceKm,
  formatMoney,
  formatRange,
  languages,
  levelLabel,
  placeLabel,
  searchPlaces,
  socialPlatforms,
  timezones,
  type Place,
} from "@/lib/platform-config";
import {
  collabFor,
  websiteTemplates,
  socialAccounts,
  analytics,
  notifications,
} from "@/lib/creator-data";
import {
  CreatorProfileProvider,
  useCurrentCreator,
  CreatorAvatar,
  CreatorCover,
  type WorkspacePortfolioItem,
  type WorkspaceServiceItem,
  type WorkspaceOpportunityItem,
  type WorkspaceInquiryItem,
} from "@/lib/creator-profile-context";

type PageKey =
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
  | "collab";
type AppPath =
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
  | "/settings";

const nav: Array<{ to: AppPath; label: string; icon: LucideIcon; key: PageKey; hint?: string }> = [
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
  { to: "/settings", label: "Settings", icon: Settings, key: "settings" },
];
const titles: Record<PageKey, { title: string; subtitle: string }> = {
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
  settings: { title: "Settings", subtitle: "Manage your workspace, visibility and security." },
};

export function CreatorWorkspace({
  page = "dashboard",
  children,
  applyCampaignId,
}: {
  page?: PageKey;
  children?: ReactNode;
  applyCampaignId?: string;
}) {
  const [authed, setAuthed] = useState(() =>
    typeof window !== "undefined" ? demoAuth.isSignedIn() || authService.isAuthenticated() : false,
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isSigned = demoAuth.isSignedIn() || authService.isAuthenticated();
      if (!isSigned) {
        window.location.replace("/login");
      } else {
        setAuthed(true);
      }
    }
  }, []);

  if (!authed) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <span
          className="size-8 animate-spin rounded-full border-2 border-coral border-t-transparent"
          aria-label="Loading"
        />
      </div>
    );
  }
  return (
    <CreatorProfileProvider>
      <CreatorWorkspaceLayout page={page} {...(applyCampaignId ? { applyCampaignId } : {})}>
        {children}
      </CreatorWorkspaceLayout>
    </CreatorProfileProvider>
  );
}

function CreatorWorkspaceLayout({
  page,
  children,
  applyCampaignId,
}: {
  page: PageKey;
  children?: ReactNode;
  applyCampaignId?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CreatorSidebar />
      <div className="min-w-0 lg:pl-[248px]">
        <CreatorHeader
          page={page}
          onMenu={() => setMobileOpen(true)}
          onSearch={() => setSearchOpen(true)}
          onNotices={() => setNoticeOpen(true)}
        />
        <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-7">
          {page === "dashboard" && <Dashboard />}
          {page === "profile" && <ProfilePage />}
          {page === "social" && <SocialPage />}
          {page === "portfolio" && <PortfolioPage />}
          {page === "services" && <ServicesPage />}
          {page === "website" && <WebsitePage />}
          {page === "media-kit" && <MediaKitPage />}
          {page === "opportunities" && (
            <OpportunitiesPage {...(applyCampaignId ? { initialApplyId: applyCampaignId } : {})} />
          )}
          {page === "inquiries" && <InquiriesPage />}
          {page === "analytics" && <AnalyticsPage />}
          {page === "settings" && <SettingsPage />}
          {page === "collab" && children}
        </main>
      </div>
      <MobileNavigation onMore={() => setMobileOpen(true)} />
      <NavSheet open={mobileOpen} onOpenChange={setMobileOpen} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <NotificationsSheet open={noticeOpen} onOpenChange={setNoticeOpen} />
    </div>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Influencers.com dashboard">
      <span className="grid size-8 place-items-center rounded-md bg-coral text-primary-foreground">
        <Sparkles className="size-4" />
      </span>
      <span className="text-[15px] font-extrabold">
        Influencers<span className="text-coral">.</span>com
      </span>
    </Link>
  );
}
function CreatorSidebar() {
  const { profile, opportunities, inquiries } = useCurrentCreator();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const oppBadge = opportunities.length > 0 ? String(opportunities.length) : undefined;
  const unreadInquiries = inquiries.filter(
    (i) => !i.is_read || (i.unread_count !== undefined && i.unread_count > 0),
  ).length;
  const inqBadge = unreadInquiries > 0 ? String(unreadInquiries) : undefined;
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="px-6 py-7">
        <Brand />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map((n) => {
          const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
          const Icon = n.icon;
          const badge =
            n.key === "opportunities" ? oppBadge : n.key === "inquiries" ? inqBadge : undefined;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-[13px] font-semibold transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className={cn("size-[18px]", active && "text-sidebar-primary")} />
              <span>{n.label}</span>
              {n.hint && (
                <span
                  title="Complete your Bio, Categories and Locations"
                  className="ml-auto animate-pulse rounded-full bg-coral/20 px-2 py-0.5 text-[9px] font-extrabold text-coral"
                >
                  {n.hint}
                </span>
              )}
              {badge && (
                <span className="ml-auto rounded-full bg-sidebar-primary px-2 py-0.5 text-[10px] text-sidebar-primary-foreground">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-md bg-sidebar-accent/60 p-2.5">
          <CreatorAvatar
            src={profile.photo}
            name={profile.name}
            className="size-9 rounded-md object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-sidebar-accent-foreground">
              {profile.name}
            </p>
            <p className="truncate text-[10px] text-sidebar-foreground/55">
              {profile.displayName || "Creator Pro"}
            </p>
          </div>
          <ChevronRight className="ml-auto size-4 text-sidebar-foreground/50" />
        </div>
      </div>
    </aside>
  );
}
function CreatorHeader({
  page,
  onMenu,
  onSearch,
  onNotices,
}: {
  page: PageKey;
  onMenu: () => void;
  onSearch: () => void;
  onNotices: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
      <div className="grid h-[72px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          className="lg:hidden"
          variant="ghost"
          size="icon"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <Menu />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-extrabold sm:text-lg">{titles[page].title}</h1>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {titles[page].subtitle}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="outline"
            className="hidden w-48 justify-start text-muted-foreground xl:flex"
            onClick={onSearch}
          >
            <Search /> Search <kbd className="ml-auto text-[10px]">⌘K</kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearch}
            className="xl:hidden"
            aria-label="Search"
          >
            <Search />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={onNotices}
            aria-label="Notifications"
          >
            <Bell />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-coral ring-2 ring-background" />
          </Button>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
function ProfileMenu() {
  const { profile } = useCurrentCreator();
  const navigate = useNavigate();
  const cleanHandle = (profile.handle || "ananya").replace(/^@/, "");
  const marketplaceBase = (
    (import.meta as any).env?.VITE_MARKETPLACE_URL || "http://localhost:8082"
  ).replace(/\/+$/, "");
  const publicCreatorUrl = `${marketplaceBase}/creator/${cleanHandle}`;

  const handleOpenPublic = () => {
    window.open(publicCreatorUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-1.5">
          <CreatorAvatar
            src={profile.photo}
            name={profile.name}
            className="size-8 rounded-md object-cover"
          />
          <ChevronDown className="hidden size-3 sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate font-bold">{profile.name}</p>
          <p className="truncate font-normal text-muted-foreground">{profile.handle}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleOpenPublic}>
          <Eye />
          View Public Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleOpenPublic}>
          <ExternalLink />
          View Website
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings />
            Account Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            authService.logout();
            void navigate({ to: "/login", replace: true });
            toast("Signed out");
          }}
        >
          <ChevronLeft />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
function MobileNavigation({ onMore }: { onMore: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const links = nav.slice(0, 4);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-background/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
      {links.map((n) => {
        const Icon = n.icon;
        const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
        return (
          <Link
            key={n.to}
            to={n.to}
            className={cn(
              "flex min-w-0 flex-col items-center gap-1 py-1 text-[10px] font-semibold",
              active ? "text-coral" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
            <span className="truncate">{n.label.replace("My ", "")}</span>
          </Link>
        );
      })}
      <button
        onClick={onMore}
        className="flex flex-col items-center gap-1 py-1 text-[10px] font-semibold text-muted-foreground"
      >
        <MoreHorizontal className="size-5" />
        More
      </button>
    </nav>
  );
}
function NavSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle>
            <Brand />
          </SheetTitle>
          <SheetDescription>Creator workspace</SheetDescription>
        </SheetHeader>
        <nav className="grid grid-cols-2 gap-2 p-4">
          {nav.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => onOpenChange(false)}
                className="flex min-h-20 flex-col justify-between rounded-md border bg-card p-3 text-xs font-bold"
              >
                <Icon className="size-5 text-coral" />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const results = nav.filter((n) => n.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[15%] translate-y-0 p-0 sm:max-w-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Search workspace</DialogTitle>
          <DialogDescription>Find pages and creator tools.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="size-5 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pages, campaigns, services…"
            className="h-14 border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-80 p-2">
          {results.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 rounded-md p-3 text-sm font-semibold hover:bg-muted"
              >
                <Icon className="size-4 text-coral" />
                {n.label}
                <ArrowRight className="ml-auto size-4 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
function NotificationsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [liveList, setLiveList] = useState<any[]>([]);
  const [read, setRead] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      creatorApi
        .getNotifications()
        .then((res: any) => {
          const arr = Array.isArray(res) ? res : res?.results || [];
          if (arr.length > 0) {
            setLiveList(
              arr.map((n: any) => ({
                id: String(n.id),
                title: n.title,
                text: n.message,
                time: n.created_at ? new Date(n.created_at).toLocaleString() : "Recent",
                unread: !n.is_read,
              })),
            );
          }
        })
        .catch(() => {});
    }
  }, [open]);

  const items = liveList.length > 0 ? liveList : notifications;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>What’s happening across your creator business.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setRead((r) => [...r, n.id]);
                creatorApi.markNotificationRead(n.id).catch(() => {});
              }}
              className={cn(
                "w-full rounded-md border p-4 text-left transition-colors hover:bg-muted",
                n.unread && !read.includes(n.id) && "border-coral/30 bg-coral-soft/50",
              )}
            >
              <div className="flex gap-3">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-coral" />
                <div>
                  <p className="text-sm font-bold">{n.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{n.text}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase text-muted-foreground">
                    {n.time}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionHead({
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
          <p className="mb-1 text-[10px] font-extrabold uppercase text-coral">{eyebrow}</p>
        )}
        <h2 className="font-display text-2xl leading-tight sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
function Badge({
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
function StatCard({
  s,
  index,
}: {
  s: { label: string; value: string; change: string; series: number[] };
  index: number;
}) {
  return (
    <div className="creator-card min-w-[220px] flex-1 p-4 sm:min-w-0">
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold text-muted-foreground">{s.label}</p>
        <span
          className={cn(
            "grid size-8 place-items-center rounded-md",
            index % 2 ? "bg-teal-soft text-teal" : "bg-coral-soft text-coral",
          )}
        >
          {index === 0 ? <Eye /> : index === 1 ? <Globe2 /> : index === 2 ? <Users /> : <Mail />}
        </span>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-2xl font-extrabold">{s.value}</p>
          <p className="mt-1 text-[10px] font-bold text-teal">{s.change}</p>
        </div>
        <MiniChart values={s.series} />
      </div>
    </div>
  );
}
function MiniChart({ values }: { values: number[] }) {
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
function ProfileCompletion() {
  const { profile } = useCurrentCreator();
  return (
    <div className="creator-card relative overflow-hidden bg-primary p-5 text-primary-foreground sm:p-6">
      <div className="absolute inset-y-0 right-0 w-1/3 subtle-grid opacity-20" />
      <div className="relative grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="coral">
              <Sparkles className="size-3" />
              LEVEL UP
            </Badge>
            <span className="text-xs text-primary-foreground/60">
              Profile {profile.completion}% complete
            </span>
          </div>
          <h2 className="mt-3 max-w-xl font-display text-3xl leading-tight sm:text-4xl">
            Your next opportunity starts with a complete story.
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-primary-foreground/65">
            Add recent brand results and your preferred collaboration formats.
          </p>
        </div>
        <div className="min-w-44">
          <Progress value={profile.completion} className="mb-3 h-2 bg-primary-foreground/15" />
          <Button asChild className="w-full bg-coral text-primary-foreground hover:bg-coral/90">
            <Link to="/profile">
              Complete profile <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { profile, opportunities, inquiries } = useCurrentCreator();
  const firstName = (profile.name || "Creator").split(" ")[0];
  const isDemoUser = (profile.email || "").toLowerCase() === "ananya@influencers.com";
  const requestsCount = inquiries.length;

  const dynamicStats = [
    {
      label: "Profile views",
      value: isDemoUser ? "24.8K" : profile.views_count?.toLocaleString() || "0",
      change: isDemoUser ? "+18.2%" : "0% this week",
      series: isDemoUser ? [18, 24, 22, 30, 27, 38, 42] : [0, 0, 0, 0, 0, 0, 0],
    },
    {
      label: "Website visitors",
      value: isDemoUser ? "8,642" : "0",
      change: isDemoUser ? "+12.4%" : "0% this week",
      series: isDemoUser ? [12, 18, 14, 24, 30, 28, 35] : [0, 0, 0, 0, 0, 0, 0],
    },
    {
      label: "Social followers",
      value: isDemoUser ? "438K" : "0",
      change: isDemoUser ? "+5.8%" : "0% this week",
      series: isDemoUser ? [24, 25, 27, 29, 31, 34, 37] : [0, 0, 0, 0, 0, 0, 0],
    },
    {
      label: "Collab requests",
      value: isDemoUser ? "36" : String(requestsCount),
      change: isDemoUser
        ? "+8 this month"
        : requestsCount > 0
          ? `${requestsCount} total`
          : "0 this month",
      series: isDemoUser ? [8, 14, 12, 19, 16, 24, 28] : [0, 0, 0, 0, 0, 0, requestsCount],
    },
  ];

  return (
    <div className="space-y-7">
      <div className="grid gap-1">
        <p className="text-xs font-bold text-coral">CREATOR OVERVIEW</p>
        <h2 className="font-display text-3xl sm:text-4xl">Good morning, {firstName}.</h2>
      </div>
      <ProfileCompletion />
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 xl:grid-cols-4">
        {dynamicStats.map((s, i) => (
          <StatCard key={s.label} s={s} index={i} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
        <WebsitePrompt />
        <ProfilePreview />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div>
          <SectionHead
            eyebrow="FRESH MATCHES"
            title="Made for your audience"
            action={
              <Button variant="ghost" asChild>
                <Link to="/opportunities">
                  View all <ArrowRight />
                </Link>
              </Button>
            }
          />
          {opportunities.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {opportunities.slice(0, 2).map((o) => (
                <CampaignCard key={o.id} item={o} />
              ))}
            </div>
          ) : (
            <div className="creator-card p-6 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                No open opportunities currently match your profile. Check back soon or explore the
                marketplace.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-4">
                <Link to="/opportunities">
                  Explore Marketplace <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
        </div>
        <div>
          <SectionHead
            eyebrow="LATEST"
            title="Recent inquiries"
            action={
              <Button variant="ghost" asChild>
                <Link to="/inquiries">
                  Inbox <ArrowRight />
                </Link>
              </Button>
            }
          />
          {inquiries.length > 0 ? (
            <div className="creator-card divide-y">
              {inquiries.slice(0, 3).map((i) => (
                <div key={i.id} className="flex gap-3 p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-teal-soft text-xs font-black text-teal">
                    {i.business.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{i.business}</p>
                    <p className="truncate text-xs text-muted-foreground">{i.campaign}</p>
                  </div>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {i.date.split(",")[0]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="creator-card p-6 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                No brand inquiries yet. Complete your profile and share your media kit to receive
                brand pitches.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-4">
                <Link to="/profile">
                  Complete Profile <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function WebsitePrompt() {
  const { profile } = useCurrentCreator();
  const [websiteStatus, setWebsiteStatus] = useState<string>(profile.websiteStatus || "none");

  useEffect(() => {
    creatorApi
      .getWebsite()
      .then((data: any) => {
        if (data && (data.is_published || data.status === "PUBLISHED")) {
          setWebsiteStatus("published");
        }
      })
      .catch(() => {});
  }, []);

  const isLive = websiteStatus === "published" || profile.websiteStatus === "published";
  const cleanHandle = (profile.handle || profile.name || "creator")
    .replace(/^@/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  const displayDomain = `${cleanHandle}.influencers.com`;
  const marketplaceBase = (
    (import.meta as any).env?.VITE_MARKETPLACE_URL || "http://localhost:8082"
  ).replace(/\/+$/, "");
  const liveTargetUrl = profile.websiteUrl?.startsWith("http")
    ? profile.websiteUrl
    : `${marketplaceBase}/creator/${cleanHandle}`;

  const handleOpenWebsite = () => {
    window.open(liveTargetUrl, "_blank", "noopener,noreferrer");
  };

  if (isLive) {
    return (
      <div className="creator-card relative min-h-[300px] overflow-hidden bg-teal-soft/60 border border-teal/20 p-6 sm:p-8 flex flex-col justify-between">
        <div className="absolute right-[-4%] top-[-20%] size-64 rotate-12 rounded-full border-[34px] border-teal/10 pointer-events-none" />
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="teal">
              <Globe2 className="size-3" />
              YOUR SPACE, YOUR STORY
            </Badge>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              WEBSITE IS LIVE
            </span>
          </div>
          <h2 className="mt-4 max-w-lg font-display text-3xl sm:text-4xl">
            Your influencer website is live
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Your portfolio, bio, social media stats, and booking services are live for brand
            partners at:
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-card/80 px-3 py-1.5 border text-xs font-mono font-medium shadow-sm">
            <Globe2 className="size-3.5 text-teal" />
            <span className="font-bold text-foreground">{displayDomain}</span>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            onClick={handleOpenWebsite}
            className="bg-teal hover:bg-teal/90 text-primary-foreground gap-2"
          >
            <ExternalLink className="size-4" /> View Website
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to="/website">
              <Pencil className="size-4" /> Manage Website
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="creator-card relative min-h-[300px] overflow-hidden bg-coral-soft p-6 sm:p-8">
      <div className="absolute right-[-4%] top-[-20%] size-64 rotate-12 rounded-full border-[34px] border-coral/10" />
      <Badge tone="coral">
        <Globe2 className="size-3" />
        YOUR SPACE, YOUR STORY
      </Badge>
      <h2 className="mt-5 max-w-lg font-display text-3xl sm:text-4xl">
        Create your professional influencer website
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
        Turn your profile, portfolio, social media, and services into a professional website.
      </p>
      <Button asChild className="mt-6">
        <Link to="/website">
          Create My Website <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
function ProfilePreview({ locationOverride }: { locationOverride?: string } = {}) {
  const { profile } = useCurrentCreator();
  return (
    <div className="creator-card overflow-hidden">
      <div className="relative h-28">
        <CreatorCover src={profile.cover} />
        <span className="absolute inset-0 bg-primary/20" />
      </div>
      <div className="relative px-5 pb-5">
        <CreatorAvatar
          src={profile.photo}
          name={profile.name}
          className="-mt-10 size-20 rounded-md border-4 border-card object-cover"
          fallbackClassName="text-xl font-black"
        />
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-1 text-lg font-extrabold">
              {profile.name}
              {profile.verified && <BadgeCheck className="size-4 text-teal" />}
            </h3>
            <p className="text-xs text-muted-foreground">{profile.category}</p>
          </div>
          {profile.verified ? (
            <Badge tone="teal">VERIFIED</Badge>
          ) : (
            <Badge tone="neutral">UNVERIFIED</Badge>
          )}
        </div>
        <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          {locationOverride || profile.location || "Remote / Worldwide"}
        </p>
        <div className="mt-5 flex items-center gap-2">
          <Button className="flex-1" asChild>
            <Link to="/profile">View Profile</Link>
          </Button>
          <Button variant="outline" size="icon" onClick={() => toast.success("Public link copied")}>
            <Link2 />
          </Button>
        </div>
      </div>
    </div>
  );
}

function PageTop({ label, children }: { label?: string; children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pageKey = (
    pathname === "/" ? "dashboard" : pathname.slice(1).replace("social-media", "social")
  ) as PageKey;
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold text-coral">{label || "CREATOR WORKSPACE"}</p>
        <h2 className="mt-1 font-display text-3xl sm:text-4xl">
          {titles[pageKey]?.title || "Creator workspace"}
        </h2>
      </div>
      {children}
    </div>
  );
}
function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-bold">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ProfilePage() {
  const { profile, refreshProfile } = useCurrentCreator();
  const isDemo = demoAuth.isDemoUser();
  const [edit, setEdit] = useState(false);
  const avatar = useImagePicker(profile.photo || "", "AVATAR", (url) => {
    void creatorApi.updateProfile({ photo_url: url }).then(() => refreshProfile());
  });
  const cover = useImagePicker(profile.cover || "", "COVER", (url) => {
    void creatorApi.updateProfile({ cover_url: url }).then(() => refreshProfile());
  });
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState(profile.displayName || profile.name);
  const [fullName, setFullName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [about, setAbout] = useState(profile.about);
  const [locationText, setLocationText] = useState(profile.location);
  const [currency, setCurrency] = useState(profile.currency || "USD");
  const [categoriesList, setCategoriesList] = useState<string[]>(profile.categories || []);
  const [languagesText, setLanguagesText] = useState<string>(
    profile.languageCodes?.map((c) => languages.find((l) => l.code === c)?.name ?? c).join(", ") ||
      "English",
  );

  useEffect(() => {
    setDisplayName(profile.displayName || profile.name);
    setFullName(profile.name);
    setBio(profile.bio);
    setAbout(profile.about);
    setLocationText(profile.location);
    if (profile.currency) setCurrency(profile.currency);
    if (profile.categories) setCategoriesList(profile.categories);
    if (profile.languageCodes && profile.languageCodes.length > 0) {
      setLanguagesText(
        profile.languageCodes
          .map((c) => languages.find((l) => l.code === c)?.name ?? c)
          .join(", "),
      );
    }
  }, [profile]);

  const handleSaveProfileDirect = async () => {
    setSaving(true);
    try {
      await creatorApi.updateProfile({
        name: fullName,
        display_name: displayName,
        bio: bio,
        about: about,
        location_text: locationText,
        currency: currency,
        categories: categoriesList,
        languages: languagesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast.success("Profile saved to database!");
      await refreshProfile();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || "Failed to save profile. Please check your inputs.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTop label="MAKE A STRONG FIRST IMPRESSION">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEdit(true)}>
            <Pencil />
            Edit Profile
          </Button>
          <Button disabled={saving} onClick={handleSaveProfileDirect}>
            <Check />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </PageTop>
      <EditProfileDrawer
        open={edit}
        onOpenChange={setEdit}
        initialProfile={profile}
        onSaved={() => void refreshProfile()}
      />
      {avatar.input}
      {cover.input}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <FormSection
            title="Basic information"
            desc="The essentials shown across your public profile."
          >
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="relative shrink-0">
                <CreatorAvatar
                  src={avatar.src || profile.photo}
                  name={profile.name}
                  className="size-24 rounded-md object-cover"
                  fallbackClassName="text-2xl font-black"
                />
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2"
                  aria-label="Change profile photo"
                  onClick={avatar.pick}
                >
                  <Camera />
                </Button>
              </div>
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <Labeled label="Full name">
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </Labeled>
                <Labeled label="Display name">
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </Labeled>
                <Labeled label="Languages">
                  <Input
                    value={languagesText}
                    onChange={(e) => setLanguagesText(e.target.value)}
                    placeholder="e.g. English, Malayalam, Hindi"
                  />
                </Labeled>
                <Labeled label="Primary currency">
                  <CurrencySelect value={currency} onValueChange={setCurrency} />
                </Labeled>
              </div>
            </div>
            <Labeled label="Bio">
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </Labeled>
            <Labeled label="Categories">
              <CategoryPicker categories={categoriesList} onChange={setCategoriesList} />
            </Labeled>
          </FormSection>
          <LocationSection locationStr={locationText} onLocationChange={setLocationText} />
          <FormSection title="Media" desc="Photo and cover shown across your profile and website.">
            <div>
              <p className="mb-2 text-xs font-bold">Cover image</p>
              <div className="relative h-40 overflow-hidden rounded-md">
                <CreatorCover src={cover.src || profile.cover} />
                <Button
                  variant="secondary"
                  className="absolute bottom-3 right-3"
                  onClick={cover.pick}
                >
                  <Upload />
                  Change cover
                </Button>
              </div>
            </div>
          </FormSection>
          <FormSection
            title="Professional information"
            desc="Help brands understand your experience and point of view."
          >
            <Labeled label="About">
              <Textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={5}
                placeholder="Tell brands about your focus, creative vision, and audience..."
              />
            </Labeled>
            <div className="grid gap-4 sm:grid-cols-2">
              <Labeled label="Creator type">
                <Input defaultValue={profile.creatorType || "Content Creator"} />
              </Labeled>
              <Labeled label="Experience">
                <Input
                  defaultValue={isDemo ? "6 years" : ""}
                  placeholder={isDemo ? undefined : "e.g. 3 years"}
                />
              </Labeled>
            </div>
            <Labeled label="Previous collaborations">
              <Input
                defaultValue={
                  isDemo ? "Incredible India, Maya Weaves, Nila Kitchens, Cliff House" : ""
                }
                placeholder={isDemo ? undefined : "Notable brand sponsors and clients"}
              />
            </Labeled>
            <Labeled label="Achievements">
              <Textarea
                defaultValue={isDemo ? "Featured creator · Collab finalist" : ""}
                placeholder={isDemo ? undefined : "Key recognitions, milestones, or awards"}
                rows={2}
              />
            </Labeled>
          </FormSection>
        </div>
        <div className="xl:sticky xl:top-24 xl:self-start">
          <SectionHead eyebrow="LIVE PREVIEW" title="Public profile" />
          <ProfilePreview locationOverride={locationText} />
        </div>
      </div>
    </div>
  );
}
function FormSection({
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

function formatFollowers(count: number): string {
  if (!count || count <= 0) return "0";
  if (count >= 1_000_000) return (count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (count >= 1_000) return (count / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return count.toLocaleString();
}

function SocialPage() {
  const { profile } = useCurrentCreator();
  const isDemo = (profile.email || "").toLowerCase() === "ananya@influencers.com";
  const [request, setRequest] = useState(false);
  const [add, setAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<SocialAccountItem[]>([]);
  const [platforms, setPlatforms] = useState<SocialPlatformItem[]>([]);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const [accs, plats] = await Promise.all([
        creatorApi.getSocialAccounts().catch(() => []),
        creatorApi.getSocialPlatforms().catch(() => []),
      ]);
      if (accs && accs.length > 0) {
        setChannels(accs);
      } else if (isDemo) {
        // Fallback mockup representation if demo creator has no DB accounts seeded yet
        setChannels(
          socialAccounts.map((a) => ({
            id: a.id,
            platform: a.platform,
            platform_name: a.platform,
            platform_slug: a.platform.toLowerCase(),
            platform_icon: a.platform,
            platform_color: "#1f9e96",
            username: a.username,
            profile_url: `https://${a.platform.toLowerCase()}.com/${a.username.replace("@", "")}`,
            followers_count:
              parseInt(a.followers.replace(/[^0-9]/g, "")) * (a.followers.includes("K") ? 1000 : 1),
            following_count:
              parseInt(a.following.replace(/[^0-9]/g, "")) * (a.following.includes("K") ? 1000 : 1),
            engagement_rate: a.engagement,
            is_verified: a.verified,
            created_at: new Date().toISOString(),
          })),
        );
      } else {
        setChannels([]);
      }
      setPlatforms(plats || []);
    } catch {
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [profile.id]);

  const totalFollowersNum = useMemo(() => {
    return channels.reduce((acc, c) => acc + (c.followers_count || 0), 0);
  }, [channels]);

  const avgEngagementStr = useMemo(() => {
    if (channels.length === 0) return "0.0%";
    const sum = channels.reduce((acc, c) => {
      const val =
        typeof c.engagement_rate === "string" ? parseFloat(c.engagement_rate) : c.engagement_rate;
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    return (sum / channels.length).toFixed(1) + "%";
  }, [channels]);

  return (
    <div>
      <PageTop label="YOUR REACH, IN ONE PLACE">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setRequest(true)}>
            Request a Social Platform
          </Button>
          <Button onClick={() => setAdd(true)}>
            <Plus />
            Add Social Platform
          </Button>
        </div>
      </PageTop>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <QuickMetric
          label="Total following"
          value={formatFollowers(totalFollowersNum)}
          detail={
            channels.length > 0
              ? `Across ${channels.length} channel${channels.length > 1 ? "s" : ""}`
              : "No channels linked"
          }
        />
        <QuickMetric
          label="Avg. engagement"
          value={avgEngagementStr}
          detail={channels.length > 0 ? "Real-time average" : "Awaiting first channel"}
        />
        <QuickMetric
          label="Audience quality"
          value={channels.length > 0 ? "Verified Reach" : "New Account"}
          detail={channels.length > 0 ? "Authentic audience" : "Connect your first channel"}
        />
      </div>
      {loading ? (
        <GridSkeleton count={2} />
      ) : channels.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {channels.map((a) => (
            <SocialAccountCard key={a.id} account={a} onDisconnected={fetchChannels} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No connected platforms"
          text="Connect your Instagram, YouTube, TikTok, or other channels to display verified stats and attract sponsors."
          cta="+ Add Social Platform"
          onCta={() => setAdd(true)}
        />
      )}
      <RequestPlatform open={request} onOpenChange={setRequest} />
      <AddSocial open={add} onOpenChange={setAdd} platforms={platforms} onAdded={fetchChannels} />
    </div>
  );
}

function QuickMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="creator-card p-5">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-[11px] text-teal">{detail}</p>
    </div>
  );
}

function PlatformIcon({ name }: { name: string }) {
  const n = (name || "").toLowerCase();
  return (
    <span className="grid size-11 place-items-center rounded-md bg-primary text-primary-foreground">
      {n.includes("instagram") ? (
        <Instagram />
      ) : n.includes("youtube") ? (
        <Youtube />
      ) : n.includes("linkedin") ? (
        <Linkedin />
      ) : (
        <Share2 />
      )}
    </span>
  );
}

function SocialAccountCard({
  account,
  onDisconnected,
}: {
  account: SocialAccountItem;
  onDisconnected?: () => void;
}) {
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      await creatorApi.disconnectSocialAccount(account.id);
      toast.success(`${account.platform_name || account.platform} disconnected`);
      setConfirmOpen(false);
      onDisconnected?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to disconnect account");
    } finally {
      setDisconnecting(false);
    }
  };

  const engagementDisplay =
    typeof account.engagement_rate === "string"
      ? account.engagement_rate.includes("%")
        ? account.engagement_rate
        : `${account.engagement_rate}%`
      : `${Number(account.engagement_rate).toFixed(1)}%`;

  return (
    <div className="creator-card p-5">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
        <PlatformIcon name={account.platform_name || account.platform} />
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="font-extrabold">{account.platform_name || account.platform}</h3>
            {account.is_verified && <BadgeCheck className="size-4 text-teal" />}
          </div>
          <p className="truncate text-xs text-muted-foreground">@{account.username}</p>
        </div>
        <Badge tone="teal">
          <span className="size-1.5 rounded-full bg-teal" />
          CONNECTED
        </Badge>
      </div>
      <div className="mt-6 grid grid-cols-3 divide-x border-y py-4 text-center">
        <div>
          <strong className="block text-lg">{formatFollowers(account.followers_count)}</strong>
          <span className="text-[10px] text-muted-foreground">Followers</span>
        </div>
        <div>
          <strong className="block text-lg">{formatFollowers(account.following_count)}</strong>
          <span className="text-[10px] text-muted-foreground">Following</span>
        </div>
        <div>
          <strong className="block text-lg text-teal">{engagementDisplay}</strong>
          <span className="text-[10px] text-muted-foreground">Engagement</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
        {account.profile_url ? (
          <a
            href={account.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-teal hover:underline"
          >
            <ExternalLink className="size-3" /> View Channel
          </a>
        ) : (
          <span />
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setConfirmOpen(true)}
        >
          Disconnect
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect {account.platform_name || account.platform}?</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect @{account.username}? Brand sponsors will no longer
              see verified metrics for this channel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={disconnecting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisconnect} disabled={disconnecting}>
              {disconnecting ? "Disconnecting..." : "Disconnect Channel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequestPlatform({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [platformUrl, setPlatformUrl] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter the platform name");
      return;
    }
    try {
      setSubmitting(true);
      await creatorApi.requestSocialPlatform({
        platform_name: name.trim(),
        profile_url: profileUrl.trim() || platformUrl.trim(),
        note: notes.trim(),
      });
      toast.success("Platform request submitted for review!");
      onOpenChange(false);
      setName("");
      setPlatformUrl("");
      setProfileUrl("");
      setNotes("");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to submit platform request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a social platform</DialogTitle>
          <DialogDescription>
            Tell us what connection would help your creator business.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Labeled label="Platform name">
            <Input
              placeholder="e.g. ShareChat, Bluesky"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Labeled>
          <Labeled label="Platform homepage URL">
            <Input
              placeholder="https://platform.com"
              value={platformUrl}
              onChange={(e) => setPlatformUrl(e.target.value)}
            />
          </Labeled>
          <Labeled label="Your profile URL">
            <Input
              placeholder="https://platform.com/yourname"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
            />
          </Labeled>
          <Labeled label="Reason / notes">
            <Textarea
              placeholder="How do you use this platform and what features are essential?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Labeled>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddSocial({
  open,
  onOpenChange,
  platforms,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  platforms?: SocialPlatformItem[];
  onAdded?: () => void;
}) {
  const [platform, setPlatform] = useState("");
  const [username, setUsername] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [followers, setFollowers] = useState("");
  const [engagement, setEngagement] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const availablePlatforms = useMemo(() => {
    if (platforms && platforms.length > 0)
      return platforms.map((p) => ({ label: p.name, value: p.id }));
    return [
      { label: "Instagram", value: "Instagram" },
      { label: "YouTube", value: "YouTube" },
      { label: "TikTok", value: "TikTok" },
      { label: "Facebook", value: "Facebook" },
      { label: "LinkedIn", value: "LinkedIn" },
      { label: "X", value: "X" },
      { label: "Pinterest", value: "Pinterest" },
      { label: "Threads", value: "Threads" },
    ];
  }, [platforms]);

  const getSuggestedUrl = (platIdOrName: string, handle: string) => {
    const clean = handle.trim().replace(/^@/, "");
    if (!clean) return "";
    const matched = availablePlatforms.find((x) => x.value === platIdOrName);
    const plat = (matched ? matched.label : platIdOrName).toLowerCase();
    if (plat.includes("instagram")) return `https://instagram.com/${clean}`;
    if (plat.includes("youtube")) return `https://youtube.com/@${clean}`;
    if (plat.includes("tiktok")) return `https://tiktok.com/@${clean}`;
    if (plat.includes("x") || plat.includes("twitter")) return `https://x.com/${clean}`;
    if (plat.includes("linkedin")) return `https://linkedin.com/in/${clean}`;
    if (plat.includes("facebook")) return `https://facebook.com/${clean}`;
    if (plat.includes("pinterest")) return `https://pinterest.com/${clean}`;
    if (plat.includes("threads")) return `https://threads.net/@${clean}`;
    return `https://${plat}.com/${clean}`;
  };

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    if (
      !profileUrl ||
      profileUrl.startsWith("https://instagram.com/") ||
      profileUrl.startsWith("https://youtube.com/") ||
      profileUrl.startsWith("https://tiktok.com/") ||
      profileUrl.startsWith("https://x.com/")
    ) {
      const suggested = getSuggestedUrl(platform, val);
      if (suggested) setProfileUrl(suggested);
    }
  };

  const handlePlatformChange = (val: string) => {
    setPlatform(val);
    if (username.trim()) {
      setProfileUrl(getSuggestedUrl(val, username));
    }
  };

  const handleConnect = async () => {
    if (!platform) {
      toast.error("Please select a platform");
      return;
    }
    if (!username.trim()) {
      toast.error("Please enter your channel handle or username");
      return;
    }
    if (!profileUrl.trim() || !profileUrl.startsWith("http")) {
      toast.error("Please enter a valid URL (starting with https://)");
      return;
    }

    const lower = profileUrl.toLowerCase();
    if (
      lower.includes("google.com/search") ||
      lower.includes("bing.com") ||
      lower.includes("duckduckgo.com")
    ) {
      toast.error(
        "Please enter your direct profile URL (e.g. https://instagram.com/username), not a search query.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await creatorApi.connectSocialAccount({
        platform,
        username: username.trim(),
        profile_url: profileUrl.trim(),
        followers_count: followers ? parseInt(followers.replace(/[^0-9]/g, "")) || 0 : 0,
        engagement_rate: engagement ? parseFloat(engagement.replace(/[^0-9.]/g, "")) || 0 : 0,
      });
      toast.success("Social platform connected successfully!");
      onOpenChange(false);
      setPlatform("");
      setUsername("");
      setProfileUrl("");
      setFollowers("");
      setEngagement("");
      onAdded?.();
    } catch (e: any) {
      const data = e?.response?.data;
      let msg = "Failed to connect social platform";
      if (typeof data === "string") {
        msg = data;
      } else if (data?.detail) {
        msg = data.detail;
      } else if (data?.profile_url) {
        msg = Array.isArray(data.profile_url) ? data.profile_url[0] : String(data.profile_url);
      } else if (data && typeof data === "object") {
        const firstVal = Object.values(data)[0];
        if (Array.isArray(firstVal) && firstVal.length > 0) msg = String(firstVal[0]);
        else if (typeof firstVal === "string") msg = String(firstVal);
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add social platform</DialogTitle>
          <DialogDescription>
            Connect another channel to showcase your verified audience.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Labeled label="Platform">
            <Select value={platform} onValueChange={handlePlatformChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a platform" />
              </SelectTrigger>
              <SelectContent>
                {availablePlatforms.map((x) => (
                  <SelectItem key={x.value} value={x.value}>
                    {x.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Labeled>
          <Labeled label="Username / Handle">
            <Input
              placeholder="e.g. ananya.travels"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
            />
          </Labeled>
          <Labeled label="Profile URL">
            <Input
              placeholder="https://instagram.com/ananya.travels"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
            />
          </Labeled>
          <div className="grid grid-cols-2 gap-3">
            <Labeled label="Followers count">
              <Input
                type="number"
                placeholder="e.g. 50000"
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
              />
            </Labeled>
            <Labeled label="Engagement rate (%)">
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 4.5"
                value={engagement}
                onChange={(e) => setEngagement(e.target.value)}
              />
            </Labeled>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={submitting}>
            {submitting ? "Connecting..." : "Connect platform"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PortfolioPage() {
  const { portfolio, refreshPortfolio } = useCurrentCreator();
  const [reorder, setReorder] = useState(false);
  const [selected, setSelected] = useState<WorkspacePortfolioItem | null>(null);
  const [add, setAdd] = useState(false);
  const [editing, setEditing] = useState<WorkspacePortfolioItem | null>(null);
  const [filter, setFilter] = useState("All work");
  const [loading, setLoading] = useState(false);

  const items = portfolio.filter(
    (p) =>
      filter === "All work" ||
      p.category === filter ||
      (filter === "Reels" && p.format === "Reel") ||
      (filter === "Campaigns" && p.format === "Campaign"),
  );

  return (
    <div>
      <PageTop label="YOUR BEST WORK, BEAUTIFULLY CURATED">
        <div className="flex gap-2">
          <Button
            variant={reorder ? "secondary" : "outline"}
            onClick={() => {
              setReorder(!reorder);
              toast.info(reorder ? "New order saved" : "Drag handles are now active");
            }}
          >
            <Grid3X3 />
            {reorder ? "Save order" : "Reorder"}
          </Button>
          <Button onClick={() => setAdd(true)}>
            <Plus />
            Add Portfolio Item
          </Button>
        </div>
      </PageTop>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {["All work", "Reels", "Campaigns", "Travel", "Food", "Fashion"].map((x) => (
          <Button
            key={x}
            size="sm"
            variant={filter === x ? "default" : "outline"}
            onClick={() => setFilter(x)}
          >
            {x}
          </Button>
        ))}
      </div>
      {loading ? (
        <GridSkeleton />
      ) : items.length ? (
        <PortfolioGrid items={items} onSelect={setSelected} reorder={reorder} />
      ) : (
        <EmptyState
          title="Showcase your best work"
          text="Add your first project or campaign reel to attract brand sponsors."
          cta="+ Add First Item"
          onCta={() => setAdd(true)}
        />
      )}
      <PortfolioPreview
        item={selected}
        onClose={() => setSelected(null)}
        onEdit={(i) => {
          setSelected(null);
          setEditing(i);
        }}
        onDeleted={() => void refreshPortfolio()}
      />
      <EditPortfolioDialog
        key={editing?.id}
        item={editing}
        onClose={() => setEditing(null)}
        onSaved={() => void refreshPortfolio()}
      />
      <AddPortfolio open={add} onOpenChange={setAdd} onAdded={() => void refreshPortfolio()} />
    </div>
  );
}
function PortfolioGrid({
  items,
  onSelect,
  reorder,
}: {
  items: WorkspacePortfolioItem[];
  onSelect: (x: WorkspacePortfolioItem) => void;
  reorder: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
      {items.map((p, i) => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          className={cn(
            "group relative overflow-hidden rounded-md bg-muted text-left",
            i === 0 && "sm:col-span-2 sm:row-span-2",
            reorder && "cursor-grab ring-2 ring-coral/30",
          )}
        >
          {p.image ? (
            <img
              src={p.image}
              alt={p.title}
              loading="lazy"
              className={cn(
                "aspect-square h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]",
                i === 0 && "sm:aspect-auto",
              )}
            />
          ) : (
            <div className="aspect-square h-full w-full bg-gradient-to-br from-primary/10 to-coral/15 flex items-center justify-center p-4 text-center">
              <span className="text-xs font-bold text-muted-foreground">{p.title}</span>
            </div>
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-primary/85 via-transparent to-transparent" />
          <span className="absolute left-3 top-3">
            <Badge tone="dark">{p.format}</Badge>
          </span>
          {reorder && (
            <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-md bg-card">
              <Grid3X3 className="size-4" />
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 p-3 text-primary-foreground sm:p-4">
            <strong className="block text-sm sm:text-base">{p.title}</strong>
            <span className="mt-1 hidden text-xs text-primary-foreground/70 sm:block">
              {p.brand} · {p.views} views
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
function PortfolioPreview({
  item,
  onClose,
  onEdit,
  onDeleted,
}: {
  item: WorkspacePortfolioItem | null;
  onClose: () => void;
  onEdit: (i: WorkspacePortfolioItem) => void;
  onDeleted?: () => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-3xl">
        {item && (
          <div className="grid md:grid-cols-[1.15fr_.85fr]">
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="h-full max-h-[70vh] w-full object-cover"
              />
            ) : (
              <div className="h-full min-h-[300px] w-full bg-muted flex items-center justify-center p-6 text-center text-muted-foreground">
                <span className="font-bold">{item.title}</span>
              </div>
            )}
            <div className="p-6">
              <Badge tone="coral">{item.format}</Badge>
              <h3 className="mt-4 font-display text-3xl">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A high-performing {item.category.toLowerCase()} story created with {item.brand}.
              </p>
              <div className="mt-6 space-y-3 border-y py-4 text-xs">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Client</span>
                  <strong>{item.brand}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Published</span>
                  <strong>{item.date}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <strong>{item.views}</strong>
                </p>
              </div>
              <div className="mt-6 flex gap-2">
                <Button className="flex-1" onClick={() => item && onEdit(item)}>
                  <Pencil />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={async () => {
                    try {
                      await creatorApi.deletePortfolioItem(item.id);
                      toast.success("Item removed from portfolio");
                      onDeleted?.();
                      onClose();
                    } catch (err: any) {
                      toast.error(
                        err?.response?.data?.detail || "Failed to remove portfolio item.",
                      );
                    }
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
function AddPortfolio({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdded?: () => void;
}) {
  const img = useImagePicker("", "IMAGE");
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [cat, setCat] = useState("Travel");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (img.uploading) {
      toast.error("Wait for the image upload to finish");
      return;
    }
    if (img.src?.startsWith("blob:")) {
      toast.error("Image upload did not finish. Replace the photo and try again.");
      return;
    }
    setSaving(true);
    try {
      await creatorApi.createPortfolioItem({
        title: title.trim(),
        brand_name: brand.trim() || "Brand Client",
        format_tag: "Reel",
        image: img.src || undefined,
        media_url: img.src || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        description: desc.trim(),
        category: cat,
        deliverable_date: date || undefined,
      });
      toast.success("Portfolio item added to profile!");
      onAdded?.();
      onOpenChange(false);
    } catch {
      toast.error("Could not add portfolio item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add portfolio item</DialogTitle>
          <DialogDescription>Add campaign work, a reel, video or image story.</DialogDescription>
        </DialogHeader>
        <div className="relative h-32 overflow-hidden rounded-md border border-dashed bg-muted/50">
          {img.src ? (
            <img src={img.src} alt="" className="h-full w-full object-cover" />
          ) : (
            <button
              type="button"
              onClick={img.pick}
              className="grid h-full w-full place-items-center text-center"
            >
              <span>
                <ImagePlus className="mx-auto mb-1 text-coral" />
                <strong className="block text-xs">Upload media</strong>
                <small className="text-[10px] text-muted-foreground">
                  Images or video up to 200MB
                </small>
              </span>
            </button>
          )}
          {img.src && (
            <Button
              size="sm"
              variant="secondary"
              className="absolute bottom-2 right-2"
              onClick={img.pick}
            >
              Replace
            </Button>
          )}
          {img.input}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Labeled label="Title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Campaign title"
            />
          </Labeled>
          <Labeled label="Brand / client">
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Brand name"
            />
          </Labeled>
          <Labeled label="Category">
            <Input
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              placeholder="Travel, Food…"
            />
          </Labeled>
          <Labeled label="Date">
            <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" />
          </Labeled>
        </div>
        <Labeled label="Description">
          <Textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Tell the story behind this work"
          />
        </Labeled>
        <DialogFooter>
          <Button disabled={saving || img.uploading} onClick={handleAdd}>
            {saving ? "Saving..." : img.uploading ? "Uploading..." : "Add to portfolio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ServicesPage() {
  const { services, refreshServices } = useCurrentCreator();
  const [add, setAdd] = useState(false);
  const [sName, setSName] = useState("");
  const [sDesc, setSDesc] = useState("");
  const [sPrice, setSPrice] = useState("500");
  const [sTurnaround, setSTurnaround] = useState("7–10 days");
  const [sDeliv, setSDeliv] = useState("1 video · 2 revisions");
  const [contactPrice, setContactPrice] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAddService = async () => {
    if (!sName.trim()) {
      toast.error("Service name is required");
      return;
    }
    setSaving(true);
    try {
      await creatorApi.createService({
        name: sName.trim(),
        description: sDesc.trim(),
        starting_price_cents: contactPrice ? 0 : Number(sPrice) * 100,
        turnaround_days: parseInt(sTurnaround) || 7,
        deliverables_spec: sDeliv.trim(),
        is_active: !contactPrice,
      });
      toast.success("Service tier added successfully!");
      setAdd(false);
      void refreshServices();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to add service. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTop label="TURN CREATIVITY INTO CLEAR OFFERS">
        <Button onClick={() => setAdd(true)}>
          <Plus />
          Add Service
        </Button>
      </PageTop>
      {services.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s, i) => (
            <ServiceCard
              key={s.id}
              service={s}
              index={i}
              onUpdated={() => void refreshServices()}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No services packaged yet"
          text="Define your rate cards (Reels, Stories, UGC) for brands to book directly."
          cta="+ Add First Service"
          onCta={() => setAdd(true)}
        />
      )}
      <Dialog open={add} onOpenChange={setAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a service</DialogTitle>
            <DialogDescription>Create a clear offer brands can inquire about.</DialogDescription>
          </DialogHeader>
          <Labeled label="Service name">
            <Input
              value={sName}
              onChange={(e) => setSName(e.target.value)}
              placeholder="e.g. YouTube Short"
            />
          </Labeled>
          <Labeled label="Description">
            <Textarea
              value={sDesc}
              onChange={(e) => setSDesc(e.target.value)}
              placeholder="What is included?"
            />
          </Labeled>
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Starting price">
              <Input
                value={sPrice}
                onChange={(e) => setSPrice(e.target.value)}
                placeholder={`e.g. ${formatMoney({ amount: 500, currency: "USD" })}`}
              />
            </Labeled>
            <Labeled label="Turnaround">
              <Input
                value={sTurnaround}
                onChange={(e) => setSTurnaround(e.target.value)}
                placeholder="7–10 days"
              />
            </Labeled>
          </div>
          <Labeled label="Deliverables">
            <Input
              value={sDeliv}
              onChange={(e) => setSDeliv(e.target.value)}
              placeholder="1 video · 2 revisions"
            />
          </Labeled>
          <label className="flex items-center gap-2 text-xs font-bold">
            <Checkbox checked={contactPrice} onCheckedChange={(v) => setContactPrice(!!v)} />{" "}
            Contact for Price
          </label>
          <DialogFooter>
            <Button disabled={saving} onClick={handleAddService}>
              {saving ? "Saving..." : "Add service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function ServiceCard({
  service,
  index,
  onUpdated,
}: {
  service: WorkspaceServiceItem;
  index: number;
  onUpdated?: () => void;
}) {
  const [active, setActive] = useState(service.active);
  const [edit, setEdit] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setActive(checked);
    try {
      await creatorApi.updateService(service.id, { is_active: checked });
      toast.success(`Service is now ${checked ? "active" : "hidden"}`);
      onUpdated?.();
    } catch (err: any) {
      setActive(!checked);
      toast.error(err?.response?.data?.detail || "Failed to update service status.");
    }
  };

  return (
    <div className="creator-card flex min-h-64 flex-col p-5">
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "grid size-10 place-items-center rounded-md",
            index % 2 ? "bg-teal-soft text-teal" : "bg-coral-soft text-coral",
          )}
        >
          {index % 2 ? <Camera /> : <Play />}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground">
            {active ? "ACTIVE" : "HIDDEN"}
          </span>
          <Switch checked={active} onCheckedChange={handleToggle} />
        </div>
      </div>
      <h3 className="mt-5 text-lg font-extrabold">{service.name}</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{service.description}</p>
      <div className="mt-4 flex-1 space-y-2 border-t pt-4 text-xs">
        <p>
          <span className="text-muted-foreground">Includes · </span>
          {service.deliverables}
        </p>
        <p>
          <span className="text-muted-foreground">Turnaround · </span>
          {service.turnaround}
        </p>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Starting at</p>
          <strong className="text-lg">{formatMoney(service.price)}</strong>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setEdit(true)}
          aria-label={`Edit ${service.name}`}
        >
          <Pencil />
        </Button>
      </div>
      <EditServiceDialog
        service={edit ? service : null}
        onClose={() => setEdit(false)}
        onSaved={onUpdated}
      />
    </div>
  );
}

function WebsitePage() {
  const [started, setStarted] = useState(false);
  const [existing, setExisting] = useState<"existing" | "create" | null>(null);
  const [existingUrl, setExistingUrl] = useState("");
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState("Travel");
  const [published, setPublished] = useState(false);
  const [sections, setSections] = useState([
    "About",
    "Social Media",
    "Portfolio",
    "Services",
    "Contact",
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    creatorApi
      .getWebsite()
      .then((data: any) => {
        if (data) {
          if (data.status === "PUBLISHED" || data.is_published) {
            setPublished(true);
          }
          if (data.template) {
            const tmpl =
              data.template.charAt(0).toUpperCase() + data.template.slice(1).toLowerCase();
            setTemplate(tmpl);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handlePublishWebsite = async () => {
    setSaving(true);
    try {
      await creatorApi.updateWebsite({
        template: template.toUpperCase(),
        layout_style: "Editorial",
        status: "PUBLISHED",
        is_published: true,
      });
      toast.success("Your website is now live!");
      setPublished(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to publish website.");
    } finally {
      setSaving(false);
    }
  };

  const handleConnectExisting = async () => {
    if (!existingUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }
    try {
      await creatorApi.updateProfile({ previous_collaborations: existingUrl });
      toast.success("Existing website linked to profile!");
      setExisting(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to connect website.");
    }
  };

  if (published)
    return (
      <WebsiteLive
        onUnpublished={() => setPublished(false)}
        onEdit={() => {
          setPublished(false);
          setStarted(true);
          setExisting("create");
          setStep(4);
        }}
      />
    );
  if (!started)
    return (
      <div>
        <PageTop label="BUILD YOUR HOME ON THE INTERNET" />
        <div className="creator-card overflow-hidden">
          <div className="grid lg:grid-cols-[1fr_.9fr]">
            <div className="p-7 sm:p-10">
              <Badge tone="coral">
                <WandSparkles className="size-3" />
                NO CODE NEEDED
              </Badge>
              <h2 className="mt-5 max-w-lg font-display text-4xl sm:text-5xl">
                Create your professional influencer website
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
                Turn your profile, portfolio, social media, and services into a professional
                website.
              </p>
              <Button size="lg" className="mt-7" onClick={() => setStarted(true)}>
                Create My Website <ArrowRight />
              </Button>
            </div>
            <div className="min-h-80 bg-teal-soft p-6 sm:p-8">
              <WebsitePreview compact />
            </div>
          </div>
        </div>
      </div>
    );
  if (!existing)
    return (
      <div>
        <PageTop label="WEBSITE SETUP" />
        <div className="mx-auto max-w-3xl">
          <StepDots step={0} />
          <SectionHead title="Do you already have a website?" />
          <div className="grid gap-4 sm:grid-cols-2">
            <ChoiceCard
              icon={<Link2 />}
              title="I already have a website"
              desc="Connect your existing website to your profile."
              onClick={() => setExisting("existing")}
            />
            <ChoiceCard
              icon={<Sparkles />}
              title="Create with Influencers.com"
              desc="Build a polished creator website in minutes."
              onClick={() => setExisting("create")}
            />
          </div>
        </div>
      </div>
    );
  if (existing === "existing")
    return (
      <div>
        <PageTop label="CONNECT YOUR WEBSITE" />
        <div className="mx-auto max-w-xl creator-card p-6">
          <Button variant="ghost" size="sm" onClick={() => setExisting(null)}>
            <ChevronLeft />
            Back
          </Button>
          <h2 className="mt-4 font-display text-3xl">Add your existing website</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We’ll show this link across your creator profile.
          </p>
          <div className="mt-6">
            <Labeled label="Existing website URL">
              <Input
                value={existingUrl}
                onChange={(e) => setExistingUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </Labeled>
          </div>
          <Button className="mt-5 w-full" onClick={handleConnectExisting}>
            Connect website
          </Button>
        </div>
      </div>
    );
  return (
    <div>
      <PageTop label={`WEBSITE BUILDER · STEP ${step} OF 4`}>
        <Button
          variant="ghost"
          onClick={() => (step === 1 ? setExisting(null) : setStep(step - 1))}
        >
          <ChevronLeft />
          Back
        </Button>
      </PageTop>
      <div className="mx-auto max-w-6xl">
        <StepDots step={step} />
        {step === 1 && <TemplateStep value={template} onChange={setTemplate} />}{" "}
        {step === 2 && <StyleStep />}{" "}
        {step === 3 && <SectionsStep selected={sections} setSelected={setSections} />}{" "}
        {step === 4 && (
          <div>
            <SectionHead title="Your website is ready for its debut" />
            <div className="creator-card bg-muted p-3 sm:p-6">
              <WebsitePreview />
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button
            disabled={saving}
            size="lg"
            onClick={() => (step < 4 ? setStep(step + 1) : handlePublishWebsite())}
          >
            {step < 4 ? (
              <>
                Continue <ArrowRight />
              </>
            ) : saving ? (
              "Publishing..."
            ) : (
              <>
                Publish Website <Sparkles />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
function StepDots({ step }: { step: number }) {
  return (
    <div className="mb-8 flex items-center gap-2">
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={cn("h-1.5 flex-1 rounded-full", n <= step ? "bg-coral" : "bg-border")}
        />
      ))}
    </div>
  );
}
function ChoiceCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="creator-card group p-6 text-left transition hover:-translate-y-1 hover:border-coral"
    >
      <span className="grid size-12 place-items-center rounded-md bg-coral-soft text-coral">
        {icon}
      </span>
      <h3 className="mt-8 text-lg font-extrabold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
      <ArrowRight className="mt-6 size-5 transition-transform group-hover:translate-x-1" />
    </button>
  );
}
function TemplateStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <SectionHead title="Choose a template that feels like you" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {websiteTemplates.map((t, i) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={cn(
              "overflow-hidden rounded-md border bg-card text-left transition hover:-translate-y-1",
              value === t && "border-coral ring-2 ring-coral/20",
            )}
          >
            <div
              className={cn(
                "aspect-[4/3] p-3",
                i % 3 === 0 ? "bg-coral-soft" : i % 3 === 1 ? "bg-teal-soft" : "bg-secondary",
              )}
            >
              <div className="h-full rounded-sm bg-card p-2 shadow-sm">
                <span className="block h-1.5 w-1/3 bg-primary" />
                <span className="mt-3 block h-8 bg-muted" />
                <span className="mt-2 grid grid-cols-2 gap-1">
                  <i className="h-6 bg-border" />
                  <i className="h-6 bg-border" />
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3">
              <strong className="text-xs">{t}</strong>
              {value === t && <Check className="size-4 text-coral" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
function StyleStep() {
  const [font, setFont] = useState("Editorial");
  return (
    <div>
      <SectionHead title="Set your visual rhythm" />
      <div className="grid gap-5 md:grid-cols-3">
        <OptionGroup
          title="Typography"
          values={["Editorial", "Modern", "Minimal"]}
          value={font}
          onChange={setFont}
        />
        <OptionGroup
          title="Accent style"
          values={["Coral", "Emerald", "Golden"]}
          value="Coral"
          onChange={() => {}}
        />
        <OptionGroup
          title="Layout"
          values={["Magazine", "Gallery", "Story"]}
          value="Magazine"
          onChange={() => {}}
        />
      </div>
    </div>
  );
}
function OptionGroup({
  title,
  values,
  value,
  onChange,
}: {
  title: string;
  values: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="creator-card p-5">
      <h3 className="mb-4 text-sm font-extrabold">{title}</h3>
      <div className="space-y-2">
        {values.map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={cn(
              "flex w-full items-center justify-between rounded-md border p-3 text-xs font-bold",
              value === v && "border-coral bg-coral-soft",
            )}
          >
            {v}
            {value === v && <Check className="size-4 text-coral" />}
          </button>
        ))}
      </div>
    </div>
  );
}
function SectionsStep({
  selected,
  setSelected,
}: {
  selected: string[];
  setSelected: (v: string[]) => void;
}) {
  const all = [
    "About",
    "Social Media",
    "Portfolio",
    "Services",
    "Collaborations",
    "Testimonials",
    "Contact",
  ];
  return (
    <div>
      <SectionHead title="Choose what your website includes" />
      <div className="creator-card grid gap-2 p-5 sm:grid-cols-2">
        {all.map((s) => (
          <label
            key={s}
            className="flex cursor-pointer items-center gap-3 rounded-md border p-4 text-sm font-bold"
          >
            <Checkbox
              checked={selected.includes(s)}
              onCheckedChange={() =>
                setSelected(
                  selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s],
                )
              }
            />
            {s}
          </label>
        ))}
      </div>
    </div>
  );
}
function WebsitePreview({ compact = false }: { compact?: boolean }) {
  const { profile, portfolio } = useCurrentCreator();
  const firstName = (profile.name || "Creator").split(" ")[0];
  const items = portfolio.slice(0, 3);
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border bg-card shadow-xl",
        compact && "rotate-[-1deg]",
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <strong className="font-display">{firstName}.</strong>
        <span className="text-[9px] font-bold">WORK · ABOUT · CONTACT</span>
      </div>
      <div className="relative aspect-[16/9] overflow-hidden">
        <CreatorCover src={profile.cover} alt="Website cover photo" />
        <div className="absolute inset-0 bg-primary/30" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground sm:p-8">
          <p className="text-[9px] font-bold uppercase">{profile.category.toUpperCase()}</p>
          <h3 className={cn("mt-1 font-display", compact ? "text-2xl" : "text-3xl sm:text-5xl")}>
            Stories rooted in place.
          </h3>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        {items.length > 0 ? (
          items.map((p) => (
            <img
              key={p.id}
              src={p.image}
              alt=""
              className="aspect-square w-full rounded-sm object-cover"
            />
          ))
        ) : (
          <div className="col-span-3 flex h-24 items-center justify-center rounded-sm border border-dashed text-xs text-muted-foreground">
            No portfolio items yet
          </div>
        )}
      </div>
    </div>
  );
}

function WebsiteLive({
  onEdit,
  onUnpublished,
}: {
  onEdit: () => void;
  onUnpublished?: () => void;
}) {
  const { profile, refreshProfile } = useCurrentCreator();
  const isDemo = demoAuth.isDemoUser();
  const visitorsCount = isDemo ? "8,642" : "0";
  const [domain, setDomain] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("Travel");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [seoTitle, setSeoTitle] = useState(
    profile.name ? `${profile.name} — Official Portfolio & Media Kit` : "",
  );
  const [seoDesc, setSeoDesc] = useState(
    profile.bio || "Official creator website and brand collaboration portfolio.",
  );
  const [savingSeo, setSavingSeo] = useState(false);

  const handleApplyTemplate = async (tmpl: string) => {
    try {
      setSavingTemplate(true);
      setSelectedTemplate(tmpl);
      await creatorApi.updateWebsite({ template: tmpl });
      toast.success(`Template updated to ${tmpl}`);
      setTemplateOpen(false);
      await refreshProfile();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update template.");
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleSaveSeo = async () => {
    try {
      setSavingSeo(true);
      await creatorApi.updateWebsite({
        title: seoTitle.trim(),
        tagline: seoDesc.trim(),
      });
      toast.success("SEO and metadata settings updated!");
      setSeoOpen(false);
      await refreshProfile();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to save SEO settings.");
    } finally {
      setSavingSeo(false);
    }
  };

  const handleViewWebsite = () => {
    const cleanHandle = (profile.handle || "ananya").replace(/^@/, "");
    const marketplaceBase = (
      (import.meta as any).env?.VITE_MARKETPLACE_URL || "http://localhost:8082"
    ).replace(/\/+$/, "");
    const url = profile.websiteUrl?.startsWith("http")
      ? profile.websiteUrl
      : `${marketplaceBase}/creator/${cleanHandle}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <DomainDialog open={domain} onOpenChange={setDomain} />
      <PageTop label="PUBLISHED & GROWING">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleViewWebsite}>
            <ExternalLink />
            View Website
          </Button>
          <Button onClick={onEdit}>
            <Pencil />
            Edit Website
          </Button>
        </div>
      </PageTop>
      <div className="creator-card border-teal/30 bg-teal-soft/40 p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-teal text-primary-foreground">
            <Check />
          </span>
          <div>
            <h3 className="font-extrabold">Your website is live</h3>
            <p className="text-xs text-muted-foreground">{profile.websiteUrl}</p>
          </div>
          <Badge tone="teal">LIVE</Badge>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <QuickMetric label="Website visitors" value={visitorsCount} detail="Last 30 days" />
        <QuickMetric label="Status" value="Live" detail="Everything looks good" />
        <QuickMetric label="Last updated" value="Today" detail={isDemo ? "10:22 AM" : "Just now"} />
        <QuickMetric label="Template" value={selectedTemplate} detail="Editorial style" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="creator-card bg-muted p-3 sm:p-5">
          <WebsitePreview />
        </div>
        <div className="space-y-4">
          <FormSection title="Website controls" desc="Manage your public site.">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setTemplateOpen(true)}
            >
              <Palette />
              Change Template
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setSeoOpen(true)}
            >
              <Search />
              SEO Settings
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={async () => {
                try {
                  await creatorApi.updateWebsite({ status: "DRAFT", is_published: false });
                  toast.info("Website unpublished");
                  onUnpublished?.();
                } catch (err: any) {
                  toast.error(err?.response?.data?.detail || "Failed to unpublish website.");
                }
              }}
            >
              <X />
              Unpublish
            </Button>
          </FormSection>
          <FormSection title="Domain settings" desc="Using Influencers.com domain">
            <p className="text-sm font-bold">{profile.websiteUrl}</p>
            <Button className="w-full" onClick={() => setDomain(true)}>
              <Globe2 />
              Connect your custom domain
            </Button>
          </FormSection>
        </div>
      </div>

      {/* Template Chooser Dialog */}
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Website Template</DialogTitle>
            <DialogDescription>
              Select an editorial layout theme for your creator site.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2.5 py-3">
            {websiteTemplates.map((tmpl) => (
              <button
                type="button"
                key={tmpl}
                onClick={() => setSelectedTemplate(tmpl)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-md border p-3 text-left transition",
                  selectedTemplate === tmpl
                    ? "border-coral bg-coral-soft/50 ring-1 ring-coral"
                    : "hover:bg-muted",
                )}
              >
                <span className="text-xs font-bold">{tmpl}</span>
                <span className="text-[10px] text-muted-foreground">Modern responsive layout</span>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTemplateOpen(false)}
              disabled={savingTemplate}
            >
              Cancel
            </Button>
            <Button onClick={() => handleApplyTemplate(selectedTemplate)} disabled={savingTemplate}>
              {savingTemplate ? "Applying..." : "Apply Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SEO Settings Dialog */}
      <Dialog open={seoOpen} onOpenChange={setSeoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SEO & Social Metadata</DialogTitle>
            <DialogDescription>
              Configure how your creator site appears in search results and social previews.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Labeled label="Page title">
              <Input
                placeholder="Name — Creator Portfolio"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
            </Labeled>
            <Labeled label="Meta description">
              <Textarea
                placeholder="Brief summary shown in Google search snippets..."
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                rows={3}
              />
            </Labeled>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSeoOpen(false)} disabled={savingSeo}>
              Cancel
            </Button>
            <Button onClick={handleSaveSeo} disabled={savingSeo}>
              {savingSeo ? "Saving..." : "Save SEO Settings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MediaKitPage() {
  const { profile, refreshProfile } = useCurrentCreator();
  const isDemo = demoAuth.isDemoUser();
  const [generating, setGenerating] = useState(false);

  const handleShare = () => {
    const url = profile.profileUrl
      ? profile.profileUrl.startsWith("http")
        ? profile.profileUrl
        : `https://${profile.profileUrl}`
      : typeof window !== "undefined"
        ? `${window.location.origin}/profile`
        : "https://influencers.com";
    if (navigator?.clipboard?.writeText) {
      void navigator.clipboard.writeText(url);
      toast.success("Media kit share link copied to clipboard!");
    } else {
      toast.info(`Public Link: ${url}`);
    }
  };

  const handleDownloadPdf = () => {
    toast.info("Preparing PDF print preview...");
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handlePreview = () => {
    const el = document.getElementById("media-kit-preview-container");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      toast.info("Showing live media kit preview");
    } else {
      toast.info("Media kit preview ready");
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await refreshProfile();
      toast.success("Media kit refreshed with your latest metrics and portfolio!");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to refresh media kit data.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <PageTop label="A POLISHED INTRODUCTION FOR BRANDS">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye />
            Preview Media Kit
          </Button>
          <Button onClick={handleGenerate} disabled={generating}>
            <WandSparkles />
            {generating ? "Generating..." : "Generate Media Kit"}
          </Button>
        </div>
      </PageTop>
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div id="media-kit-preview-container">
          <MediaKitPreview />
        </div>
        <div className="space-y-4">
          <FormSection
            title="Share your media kit"
            desc={isDemo ? "Updated today at 10:22 AM" : "Ready to share with brands"}
          >
            <Button className="w-full" onClick={handleShare}>
              <Share2 />
              Share Media Kit
            </Button>
            <Button variant="outline" className="w-full" onClick={handleDownloadPdf}>
              <Download />
              Download PDF
            </Button>
          </FormSection>
          <FormSection title="Included sections" desc="7 of 7 ready">
            {[
              "Profile & bio",
              "Social statistics",
              "Audience insights",
              "Portfolio highlights",
              "Services",
              "Collaborations",
              "Contact information",
            ].map((x) => (
              <p key={x} className="flex items-center gap-2 text-xs">
                <Check className="size-4 text-teal" />
                {x}
              </p>
            ))}
          </FormSection>
        </div>
      </div>
    </div>
  );
}

function MediaKitPreview() {
  const { profile, portfolio } = useCurrentCreator();
  const isDemo = demoAuth.isDemoUser();
  const reach = isDemo ? "438K" : "0";
  const engagement = isDemo ? "5.4%" : "0.0%";
  const audience = isDemo ? "72%" : "0%";
  const items = portfolio.slice(0, 3);
  return (
    <div className="creator-card overflow-hidden">
      <div className="grid min-h-[760px] md:grid-cols-[.75fr_1.25fr]">
        <div className="bg-primary p-7 text-primary-foreground">
          <p className="text-xs font-bold text-coral">MEDIA KIT · 2026</p>
          <CreatorAvatar
            src={profile.photo}
            name={profile.name}
            className="mt-10 aspect-[4/5] w-full rounded-md object-cover"
            fallbackClassName="text-5xl font-black"
          />
          <h2 className="mt-6 font-display text-4xl">{profile.name}</h2>
          <p className="mt-2 text-sm text-primary-foreground/60">{profile.category}</p>
          <div className="mt-8 space-y-4 border-t border-primary-foreground/15 pt-6 text-xs">
            <p>{profile.location}</p>
            <p>{profile.email}</p>
            <p>{profile.profileUrl}</p>
          </div>
        </div>
        <div className="p-6 sm:p-9">
          <Badge tone="coral">CREATOR</Badge>
          <h3 className="mt-5 font-display text-3xl">
            {isDemo
              ? "Stories that turn a place into a feeling."
              : profile.displayName
                ? `${profile.displayName}'s Creator Portfolio`
                : "Stories rooted in authentic community."}
          </h3>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {profile.about ||
              (isDemo
                ? ""
                : "Welcome to my creator media kit. Available for selected brand partnerships and sponsorships.")}
          </p>
          <div className="mt-8 grid grid-cols-3 gap-2 border-y py-5 text-center">
            <div>
              <strong className="text-xl">{reach}</strong>
              <p className="text-[9px] text-muted-foreground">TOTAL REACH</p>
            </div>
            <div>
              <strong className="text-xl">{engagement}</strong>
              <p className="text-[9px] text-muted-foreground">ENGAGEMENT</p>
            </div>
            <div>
              <strong className="text-xl">{audience}</strong>
              <p className="text-[9px] text-muted-foreground">AUDIENCE</p>
            </div>
          </div>
          <h4 className="mt-8 text-xs font-black uppercase">Selected work</h4>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {items.length > 0 ? (
              items.map((p) => (
                <img
                  key={p.id}
                  src={p.image}
                  alt=""
                  className="aspect-[3/4] w-full rounded-sm object-cover"
                />
              ))
            ) : (
              <div className="col-span-3 flex h-24 items-center justify-center rounded-sm border border-dashed text-xs text-muted-foreground">
                No portfolio items added yet.
              </div>
            )}
          </div>
          <h4 className="mt-8 text-xs font-black uppercase">Trusted by</h4>
          {isDemo ? (
            <p className="mt-3 font-display text-xl text-muted-foreground">
              Incredible Voyages · Maya Weaves · Nila Kitchens · Cliff House
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Open for brand partnerships and sponsorships.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function OpportunityApplyModal({
  apply,
  onClose,
  onApplied,
}: {
  apply: WorkspaceOpportunityItem | null;
  onClose: () => void;
  onApplied?: () => void;
}) {
  const { profile } = useCurrentCreator();
  const [pitch, setPitch] = useState("");
  const [fee, setFee] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (apply) {
      setPitch(generateOpportunityPitch(profile, apply, "creative"));
      setFee(String(apply.budget.min));
    }
  }, [apply, profile]);

  const handleGenerateAiPitch = (tone: PitchTone) => {
    if (!apply) return;
    const generated = generateOpportunityPitch(profile, apply, tone);
    setPitch(generated);
    toast.success(
      `Generated ${tone === "roi" ? "ROI-focused" : tone === "concise" ? "direct" : "creative"} pitch!`,
    );
  };

  const handleSubmit = async () => {
    if (!apply) return;
    if (!pitch.trim()) {
      toast.error("Pitch proposal cannot be empty");
      return;
    }
    setSubmitting(true);
    try {
      await creatorApi.applyOpportunity(apply.id, {
        proposed_fee_cents: Number(fee) * 100,
        pitch_text: pitch.trim(),
      });
      toast.success("Application successfully submitted to brand!");
      onApplied?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail || "Failed to submit application. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!apply} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {apply && (
          <>
            <DialogHeader>
              <DialogTitle>Apply to {apply.name}</DialogTitle>
              <DialogDescription>
                {apply.business} · {formatRange(apply.budget)} · {placeLabel(apply.place)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Pitch Proposal</span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 px-2 text-[11px] font-bold text-coral hover:bg-coral-soft/50"
                    onClick={() => handleGenerateAiPitch("creative")}
                  >
                    <Sparkles className="size-3" /> Creative
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 px-2 text-[11px] font-bold text-teal hover:bg-teal-soft/50"
                    onClick={() => handleGenerateAiPitch("roi")}
                  >
                    <Sparkles className="size-3" /> ROI Focus
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] font-bold text-muted-foreground hover:bg-muted"
                    onClick={() => handleGenerateAiPitch("concise")}
                  >
                    Concise
                  </Button>
                </div>
              </div>
              <Textarea rows={5} value={pitch} onChange={(e) => setPitch(e.target.value)} />
            </div>
            <Labeled label={`Proposed fee (${apply.budget.currency})`}>
              <Input value={fee} onChange={(e) => setFee(e.target.value)} />
            </Labeled>
            <DialogFooter>
              <Button disabled={submitting} onClick={handleSubmit}>
                <Send /> {submitting ? "Sending..." : "Send application"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OpportunitiesPage({ initialApplyId }: { initialApplyId?: string } = {}) {
  const { opportunities, refreshOpportunities } = useCurrentCreator();
  const [apply, setApply] = useState<WorkspaceOpportunityItem | null>(null);
  const [trustBrand, setTrustBrand] = useState<string | null>(null);
  const [pitchStudioOpen, setPitchStudioOpen] = useState(false);
  const [view, setView] = useState<"list" | "map" | "split">("split");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [budgetTier, setBudgetTier] = useState("all");
  const [plat, setPlat] = useState("all");
  const [loc, setLoc] = useState<Place | null>(null);
  const [radius, setRadius] = useState(100);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => {
    if (initialApplyId) {
      const target = opportunities.find((o) => o.id === initialApplyId);
      if (target) {
        setApply(target);
      } else {
        creatorApi
          .getOpportunities({ id: initialApplyId })
          .then((res: any) => {
            const list = Array.isArray(res) ? res : res?.results || [];
            const item = list.find((x: any) => String(x.id) === initialApplyId) || list[0];
            if (item) {
              const budgetNum =
                typeof item.budget === "number"
                  ? item.budget
                  : item.total_budget_cents
                    ? item.total_budget_cents / 100
                    : 500;
              setApply({
                id: String(item.id),
                name: item.title || item.name || "Campaign Opportunity",
                business: item.business || item.business_name || "Partner Brand",
                category: item.category || item.category_name || "General",
                place: {
                  id: `loc_${item.id}`,
                  name: item.location || item.location_text || "Kerala, India",
                  level: "city",
                  country: "India",
                  countryCode: "IN",
                  lat: typeof item.lat === "number" ? item.lat : 9.9312,
                  lng: typeof item.lng === "number" ? item.lng : 76.2673,
                },
                remote: false,
                platform: item.platform || "Instagram",
                deliverables:
                  item.deliverables || item.deliverables_spec || "Campaign deliverables",
                budget: {
                  min: item.budget?.min ?? budgetNum,
                  max: item.budget?.max ?? budgetNum,
                  currency: item.currency || "INR",
                },
                deadline: item.deadline
                  ? new Date(item.deadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Open",
                creators: item.creators || item.creators_needed || 1,
                match: 95,
              });
            }
          })
          .catch(() => {});
      }
    }
  }, [initialApplyId, opportunities]);

  const results = useMemo(() => {
    return opportunities.filter((o) => {
      if (search.trim()) {
        const s = search.toLowerCase();
        const matchesText =
          o.name.toLowerCase().includes(s) ||
          o.business.toLowerCase().includes(s) ||
          (o.category && o.category.toLowerCase().includes(s)) ||
          (o.deliverables && o.deliverables.toLowerCase().includes(s));
        if (!matchesText) return false;
      }
      if (cat !== "all") {
        const cLower = cat.toLowerCase();
        const oCat = (o.category || "").toLowerCase();
        if (!oCat.includes(cLower) && !cLower.includes(oCat)) return false;
      }
      if (plat !== "all") {
        const pLower = plat.toLowerCase();
        const oPlat = (o.platform || "").toLowerCase();
        if (!oPlat.includes(pLower)) return false;
      }
      if (budgetTier === "under500") {
        if (o.budget.max > 50000) return false;
      } else if (budgetTier === "500-2k") {
        if (o.budget.max < 25000 || o.budget.min > 250000) return false;
      } else if (budgetTier === "2k+") {
        if (o.budget.max < 200000) return false;
      }
      if (loc) {
        if (o.remote) return true;
        if (loc.level === "country") {
          if (o.place.countryCode !== loc.countryCode) return false;
        } else if (loc.level === "region") {
          if (o.place.region !== loc.region && o.place.countryCode !== loc.countryCode)
            return false;
        } else {
          if (distanceKm(loc, o.place) > radius) return false;
        }
      }
      return true;
    });
  }, [opportunities, search, cat, plat, budgetTier, loc, radius]);
  const markers = useMemo(
    () =>
      results.map((o) => ({
        id: o.id,
        lat: o.place.lat,
        lng: o.place.lng,
        title: o.name,
        subtitle: `${o.business} · ${placeLabel(o.place)}`,
      })),
    [results],
  );
  const resetFilters = () => {
    setSearch("");
    setCat("all");
    setPlat("all");
    setBudgetTier("all");
    setLoc(null);
    setRadius(100);
  };

  const filters = (
    <div className="grid gap-3">
      <Labeled label="Search">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Keywords, brand..."
            className="pl-8 text-xs h-9"
          />
        </div>
      </Labeled>
      <Labeled label="Location">
        <LocationSearch value={loc} onChange={setLoc} />
      </Labeled>
      {loc && (loc.level === "city" || loc.level === "area" || loc.level === "district") && (
        <Labeled label={`Radius · ${radius} km`}>
          <input
            type="range"
            min={5}
            max={500}
            step={5}
            value={radius}
            onChange={(e) => setRadius(+e.target.value)}
            className="accent-[var(--coral)]"
          />
        </Labeled>
      )}
      <Labeled label="Category">
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Labeled>
      <Labeled label="Platform">
        <Select value={plat} onValueChange={setPlat}>
          <SelectTrigger>
            <SelectValue placeholder="All platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {socialPlatforms.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Labeled>
      <Labeled label="Budget">
        <Select value={budgetTier} onValueChange={setBudgetTier}>
          <SelectTrigger>
            <SelectValue placeholder="Any budget" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any budget</SelectItem>
            <SelectItem value="under500">Under ₹50,000</SelectItem>
            <SelectItem value="500-2k">₹50,000 – ₹2,00,000</SelectItem>
            <SelectItem value="2k+">₹2,00,000+</SelectItem>
          </SelectContent>
        </Select>
      </Labeled>
      <Button variant="ghost" size="sm" onClick={resetFilters}>
        Reset filters
      </Button>
    </div>
  );
  const list = (
    <div
      className={cn(
        "grid gap-4 min-w-0",
        view === "split"
          ? "grid-cols-1 2xl:grid-cols-2 max-h-[calc(100vh-13rem)] overflow-y-auto pr-2 pb-10 scrollbar-thin"
          : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {results.map((o) => (
        <div
          key={o.id}
          className={cn("rounded-2xl transition min-w-0", focus === o.id && "ring-2 ring-coral")}
        >
          <CampaignCard
            item={o}
            onApply={() => setApply(o)}
            onViewTrust={(b) => setTrustBrand(b)}
          />
        </div>
      ))}
      {!results.length && (
        <div className="creator-card col-span-full p-8 text-center text-sm text-muted-foreground">
          {opportunities.length === 0
            ? "No campaigns found matching your criteria."
            : "No opportunities here yet. Try a wider radius or another location."}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <PageTop label="DISCOVER CAMPAIGNS WORLDWIDE">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 font-bold text-xs border-coral/40 text-coral hover:bg-coral-soft/40 cursor-pointer"
            onClick={() => setPitchStudioOpen(true)}
          >
            <Sparkles className="size-3.5" /> AI Pitch Studio
          </Button>
          <Badge tone="coral">
            <Sparkles className="size-3" />
            {results.length} MATCHES
          </Badge>
        </div>
      </PageTop>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="split" className="hidden lg:inline-flex">
              Split
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
            Filters
          </Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="creator-card hidden h-fit p-4 lg:block">{filters}</aside>
        <div
          className={cn(
            "grid gap-6 min-w-0",
            view === "split" && "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]",
          )}
        >
          {view !== "list" && (
            <div
              className={cn(
                "creator-card overflow-hidden p-0 min-w-0",
                view === "split" && "lg:sticky lg:top-24 lg:self-start",
              )}
            >
              <WorldMap
                markers={markers}
                center={loc}
                radiusKm={
                  loc && loc.level !== "country" && loc.level !== "region" ? radius : undefined
                }
                onSelect={setFocus}
                className="h-[420px] w-full lg:h-[560px]"
              />
            </div>
          )}
          {view !== "map" && list}
          {view === "map" &&
            focus &&
            (() => {
              const o = results.find((r) => r.id === focus);
              return (
                o && (
                  <CampaignCard
                    item={o}
                    onApply={() => setApply(o)}
                    onViewTrust={(b) => setTrustBrand(b)}
                  />
                )
              );
            })()}
        </div>
      </div>
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Search any country, region, city or area.</SheetDescription>
          </SheetHeader>
          <div className="p-4">{filters}</div>
        </SheetContent>
      </Sheet>
      <OpportunityApplyModal
        apply={apply}
        onClose={() => setApply(null)}
        onApplied={() => void refreshOpportunities()}
      />
      <BrandTrustDialog
        brandName={trustBrand || ""}
        open={!!trustBrand}
        onOpenChange={(o) => !o && setTrustBrand(null)}
      />
      <AiPitchDrawer open={pitchStudioOpen} onOpenChange={setPitchStudioOpen} />
    </div>
  );
}

function CampaignCard({
  item,
  onApply,
  onViewTrust,
}: {
  item: WorkspaceOpportunityItem;
  onApply?: () => void;
  onViewTrust?: (business: string) => void;
}) {
  const rep = getBrandReputation(item.business);
  return (
    <div className="creator-card flex flex-col justify-between p-5 min-w-0">
      <div>
        {Boolean(item.cover_image_url || item.image) && (
          <div className="relative -mx-5 -mt-5 mb-4 h-36 overflow-hidden rounded-t-[calc(var(--radius)-1px)] bg-muted">
            <img
              src={item.cover_image_url || item.image}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewTrust?.(item.business);
              }}
              className="absolute bottom-2 left-3 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs flex items-center gap-1 hover:bg-black transition cursor-pointer"
              title="Click to view verified escrow rating"
            >
              <span>{item.business}</span>
              <Star className="size-2.5 fill-amber-400 text-amber-400" />
              <span className="text-amber-400">{rep.rating}</span>
            </button>
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => onViewTrust?.(item.business)}
            className="grid size-11 place-items-center rounded-xl bg-teal-soft font-display text-xl text-teal shrink-0 hover:ring-2 hover:ring-teal transition cursor-pointer"
            title="View verified brand reputation"
          >
            {item.business.charAt(0)}
          </button>
          <Badge tone="coral" className="shrink-0">
            {item.match}% MATCH
          </Badge>
        </div>
        <p className="mt-3 truncate text-[11px] font-bold uppercase text-coral">
          {item.category} · {placeLabel(item.place)}
          {item.remote ? " · Remote OK" : ""}
        </p>
        <h3 className="mt-1 font-extrabold text-base sm:text-lg leading-snug line-clamp-2">
          {item.name}
        </h3>
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="truncate text-xs text-muted-foreground">{item.business}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewTrust?.(item.business);
            }}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:text-amber-600 transition hover:underline shrink-0 cursor-pointer"
            title="View verified brand escrow rating and reviews"
          >
            <Star className="size-3 fill-amber-500 text-amber-500" />
            <span>{rep.rating}</span>
            <span className="text-[10px] text-teal font-semibold">({rep.reviewCount})</span>
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-y border-border/60 py-3 text-xs">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Deliverables</p>
            <strong className="line-clamp-1 text-foreground" title={item.deliverables}>
              {item.deliverables}
            </strong>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Budget</p>
            <strong className="text-foreground">{formatRange(item.budget)}</strong>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Platform</p>
            <strong className="truncate block text-foreground">{item.platform}</strong>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Deadline</p>
            <strong className="text-foreground">{item.deadline}</strong>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-[110px] rounded-xl text-xs"
          onClick={onApply || (() => toast.info(`${item.name} details opened`))}
        >
          View Opportunity
        </Button>
        {collabFor("opportunity", item.id) && (
          <Button asChild variant="secondary" size="sm" className="rounded-xl text-xs">
            <Link to="/collabs/$id" params={{ id: collabFor("opportunity", item.id)!.id }}>
              Workspace
            </Link>
          </Button>
        )}
        <Button
          size="sm"
          className="flex-1 min-w-[80px] rounded-xl text-xs font-semibold"
          onClick={onApply || (() => toast.success("Application started"))}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

function InquiriesPage() {
  const { inquiries, refreshInquiries, markInquiryAsRead } = useCurrentCreator();
  const [tab, setTab] = useState("All");
  const [active, setActive] = useState<WorkspaceInquiryItem | null>(() => inquiries[0] ?? null);
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
    const t = setTimeout(() => setLoading(false), 400);
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

  const visible = inquiries.filter((i) => tab === "All" || i.status === tab);
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
      <div className="creator-card grid h-[680px] max-h-[680px] overflow-hidden lg:grid-cols-[360px_1fr]">
        <div className="flex h-full min-h-0 flex-col overflow-hidden border-b lg:border-b-0 lg:border-r">
          <div className="border-b p-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search inquiries" />
            </div>
          </div>
          <div className="flex-1 min-h-0 divide-y overflow-y-auto">
            {loading && <ListSkeleton />}
            {!loading && !visible.length && (
              <div className="p-4">
                <EmptyState
                  title="Inbox zero"
                  text={`No ${tab.toLowerCase()} inquiries right now.`}
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
        <Conversation
          inquiry={active}
          onStatusChanged={(newStatus) => {
            setActive((prev) => (prev ? { ...prev, status: newStatus } : null));
          }}
          onReplied={() => void refreshInquiries()}
        />
      </div>
    </div>
  );
}

function Conversation({
  inquiry,
  onStatusChanged,
  onReplied,
}: {
  inquiry: WorkspaceInquiryItem | null;
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

  // Compute latest message from brand/business to drive context-aware replies
  const lastBrandMessage = useMemo(() => {
    const brandMsgs = messages.filter(
      (m) => m.is_from_business || m.is_from_brand || (!m.is_me && !m.is_from_creator)
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
      inquiry?.budget
    );
  }, [lastBrandMessage, inquiry?.business, inquiry?.campaign, inquiry?.budget]);

  const handlePolishCue = () => {
    if (!quickCue.trim()) return;
    const polished = polishQuickCue(quickCue, inquiry?.business || "", lastBrandMessage);
    setReply(polished);
    setQuickCue("");
    setShowCueBar(false);
    toast.success("AI polished your message!");
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
    onMessagesRead: () => {
      // Broadcasted read receipt from counterpart
    },
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
    const text = reply.trim();
    setSending(true);
    setReply("");

    // Attempt real-time WebSocket dispatch first
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
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b p-4 shrink-0 bg-card/40">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-extrabold">{inquiry.business}</h3>
            <button
              type="button"
              onClick={() => setTrustOpen(true)}
              className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
              title="Click to view verified escrow rating and creator reviews"
            >
              <Star className="size-2.5 fill-amber-500 text-amber-500" />
              <span>{getBrandReputation(inquiry.business).rating}</span>
              <span className="text-teal text-[9px] font-semibold">· Verified Brand 🛡️</span>
            </button>
          </div>
          <p className="truncate text-xs text-muted-foreground mt-0.5">
            {inquiry.campaign} · {inquiry.budget}
          </p>
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
            className="h-7 text-[11px] gap-1 font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
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

      {/* Scrollable messages container with strict height bounds */}
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
            {/* Initial brand brief message on the LEFT */}
            <div className="mr-auto max-w-[78%] rounded-2xl rounded-bl-xs border border-border bg-card p-4 text-card-foreground shadow-xs">
              <div className="mb-1 flex items-center justify-between gap-3 text-[10px] opacity-75">
                <span className="font-bold">{inquiry.business}</span>
                <span>{inquiry.date}</span>
              </div>
              <p className="leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
            </div>
            {/* Draft guidance bubble on the RIGHT */}
            <div className="ml-auto max-w-[78%] rounded-2xl rounded-br-xs bg-primary/20 border border-primary/30 p-4 text-foreground text-xs shadow-xs">
              <p className="leading-relaxed text-muted-foreground italic">
                You can reply above to introduce yourself, discuss rates, or click Accept to begin
                milestone production.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="border-t p-4 bg-card shrink-0">
        <div className="space-y-2 pb-2.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-coral" /> Quick AI Responses:
              </span>
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

          {/* Expandable Quick Cue Polish Bar */}
          {showCueBar && (
            <div className="flex items-center gap-1.5 rounded-xl border border-coral/30 bg-coral-soft/30 p-2 animate-in fade-in slide-in-from-top-1 duration-150">
              <Input
                value={quickCue}
                onChange={(e) => setQuickCue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handlePolishCue();
                  }
                }}
                placeholder="Type rough note (e.g. 'Friday upload ready', 'Need 2 days more', 'Send logo file')..."
                className="h-7 text-xs bg-background"
              />
              <Button
                type="button"
                size="sm"
                className="h-7 px-3 text-[10px] font-bold shrink-0 gap-1"
                onClick={handlePolishCue}
                disabled={!quickCue.trim()}
              >
                <Sparkles className="size-3" /> Polish
              </Button>
            </div>
          )}

          {/* Dynamic Contextual Smart Chips */}
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
              handleSendReply();
            }
          }}
          placeholder="Write a thoughtful reply… (Press Enter to send)"
          rows={2}
          className="resize-none"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
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
          </div>
          <Button disabled={sending || !reply.trim()} onClick={handleSendReply}>
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

function AnalyticsPage() {
  const { profile, portfolio, services } = useCurrentCreator();
  const isDemo = demoAuth.isDemoUser();
  const [period, setPeriod] = useState("30 days");
  const [liveAnalytics, setLiveAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    let mounted = true;
    creatorApi
      .getAnalytics()
      .then((data: any) => {
        if (mounted && data) {
          setLiveAnalytics(data);
        }
      })
      .catch((err) => {
        console.warn("Could not load backend analytics:", err);
      })
      .finally(() => {
        if (mounted) setLoadingAnalytics(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const zeroAnalytics = useMemo(
    () => [
      { day: "Mon", views: 0, visitors: 0 },
      { day: "Tue", views: 0, visitors: 0 },
      { day: "Wed", views: 0, visitors: 0 },
      { day: "Thu", views: 0, visitors: 0 },
      { day: "Fri", views: 0, visitors: 0 },
      { day: "Sat", views: 0, visitors: 0 },
      { day: "Sun", views: 0, visitors: 0 },
    ],
    [],
  );

  const chartData = liveAnalytics?.chart_data?.length
    ? liveAnalytics.chart_data
    : isDemo
      ? analytics
      : zeroAnalytics;

  const statMetrics = liveAnalytics
    ? [
        [
          "Profile views",
          (liveAnalytics.profile_views ?? profile.views_count ?? 0).toLocaleString(),
          "+12.5%",
        ],
        ["Website visitors", (liveAnalytics.website_visitors ?? 0).toLocaleString(), "+8.2%"],
        ["Portfolio views", (liveAnalytics.portfolio_views ?? 0).toLocaleString(), "+15.0%"],
        [
          "Active Inquiries",
          (liveAnalytics.total_inquiries ?? 0).toLocaleString(),
          `${liveAnalytics.new_inquiries ?? 0} new`,
        ],
        [
          "In Negotiation",
          (liveAnalytics.negotiating_inquiries ?? 0).toLocaleString(),
          "In discussion",
        ],
        [
          "Accepted Deals",
          (liveAnalytics.accepted_inquiries ?? 0).toLocaleString(),
          `${liveAnalytics.active_collabs ?? 0} active`,
        ],
      ]
    : isDemo
      ? [
          ["Profile views", "24,812", "+18.2%"],
          ["Website visitors", "8,642", "+12.4%"],
          ["Portfolio views", "62,410", "+24.6%"],
          ["Social clicks", "5,384", "+9.1%"],
          ["Contact clicks", "1,206", "+16.8%"],
          ["Collaboration inquiries", "36", "+8 this month"],
        ]
      : [
          ["Profile views", (profile.views_count ?? 0).toLocaleString(), "0%"],
          ["Website visitors", "0", "0%"],
          ["Portfolio views", "0", "0%"],
          ["Social clicks", "0", "0%"],
          ["Contact clicks", "0", "0%"],
          ["Collaboration inquiries", "0", "0 this month"],
        ];

  const topPortfolioRows: string[][] =
    liveAnalytics?.top_portfolio && liveAnalytics.top_portfolio.length > 0
      ? liveAnalytics.top_portfolio.map((p: any) => [p.title, p.views])
      : isDemo
        ? portfolio.slice(0, 3).map((p) => [p.title, p.views])
        : portfolio.length > 0
          ? portfolio.slice(0, 3).map((p) => [p.title, "0 views"])
          : [["No portfolio items yet", "0 views"]];

  const topTrafficRows: string[][] =
    liveAnalytics?.traffic_sources && liveAnalytics.traffic_sources.length > 0
      ? liveAnalytics.traffic_sources.map((t: any) => [t.source, t.percentage])
      : isDemo
        ? [
            ["Instagram", "46%"],
            ["Google Search", "24%"],
            ["Direct", "18%"],
          ]
        : [
            ["Direct", "0%"],
            ["Instagram", "0%"],
            ["Google Search", "0%"],
          ];

  const topServicesRows: string[][] =
    services.length > 0
      ? services
          .slice(0, 3)
          .map((s) => [s.name, s.price ? `${s.price.currency} ${s.price.amount}` : "Custom"])
      : isDemo
        ? [
            ["Instagram Reel", "2,840"],
            ["Travel Story Package", "1,906"],
            ["UGC Content", "1,420"],
          ]
        : [["No services packaged", "0 views"]];

  return (
    <div>
      <PageTop label="YOUR GROWTH, MADE CLEAR">
        <div className="flex gap-1 rounded-md border bg-card p-1">
          {["7 days", "30 days", "3 months", "1 year"].map((x) => (
            <Button
              key={x}
              size="sm"
              variant={period === x ? "default" : "ghost"}
              onClick={() => setPeriod(x)}
            >
              {x}
            </Button>
          ))}
        </div>
      </PageTop>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {statMetrics.map((x) => (
          <div key={x[0]} className="creator-card p-4">
            <p className="text-xs font-bold text-muted-foreground">{x[0]}</p>
            <div className="mt-3 flex items-end justify-between">
              <strong className="text-2xl">{x[1]}</strong>
              <Badge tone="teal">
                <TrendingUp className="size-3" />
                {x[2]}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      <div className="creator-card mt-6 p-5 sm:p-6">
        <SectionHead eyebrow="PERFORMANCE" title="Attention over time" />
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--coral)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--coral)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={10} />
              <YAxis tickLine={false} axisLine={false} fontSize={10} />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }} />
              <Area
                type="monotone"
                dataKey="views"
                stroke="var(--coral)"
                strokeWidth={3}
                fill="url(#areaFill)"
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="var(--teal)"
                strokeWidth={2}
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Ranking title="Top Portfolio Content" rows={topPortfolioRows} />
        <Ranking title="Top Traffic Sources" rows={topTrafficRows} />
        <Ranking title="Most Viewed Services" rows={topServicesRows} />
      </div>
    </div>
  );
}
function Ranking({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div className="creator-card p-5">
      <h3 className="font-display text-xl">{title}</h3>
      <div className="mt-5 space-y-4">
        {rows.map((r, i) => (
          <div key={r[0]} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
            <span className="grid size-7 place-items-center rounded-md bg-muted text-xs font-black">
              {i + 1}
            </span>
            <span className="truncate text-xs font-bold">{r[0]}</span>
            <strong className="text-xs text-teal">{r[1]}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  const { profile, refreshProfile } = useCurrentCreator();
  const [activeTab, setActiveTab] = useState("Account");

  // Account details state
  const [name, setName] = useState(profile.name || profile.displayName || "");
  const [savingAccount, setSavingAccount] = useState(false);

  // Profile visibility state
  const [pubProfile, setPubProfile] = useState<boolean>(
    profile.preferences?.visibility?.public ?? true,
  );
  const [showInsights, setShowInsights] = useState<boolean>(
    profile.preferences?.visibility?.insights ?? true,
  );
  const [showPrices, setShowPrices] = useState<boolean>(
    profile.preferences?.visibility?.prices ?? false,
  );
  const [savingVisibility, setSavingVisibility] = useState(false);

  // Region & Language state
  const [currency, setCurrency] = useState(profile.currency || "USD");
  const [language, setLanguage] = useState(profile.preferences?.regional?.language || "en");
  const [timezone, setTimezone] = useState(
    profile.timezone || profile.preferences?.regional?.timezone || "UTC",
  );
  const [savingRegion, setSavingRegion] = useState(false);

  // Notification preferences state
  const [notifInquiries, setNotifInquiries] = useState<boolean>(
    profile.preferences?.notifications?.inquiries ?? true,
  );
  const [notifCampaigns, setNotifCampaigns] = useState<boolean>(
    profile.preferences?.notifications?.campaigns ?? true,
  );
  const [notifDigest, setNotifDigest] = useState<boolean>(
    profile.preferences?.notifications?.digest ?? true,
  );
  const [savingNotifs, setSavingNotifs] = useState(false);

  // Security state
  const [mfaEnabled, setMfaEnabled] = useState(!!profile.mfa_enabled);
  const [togglingMfa, setTogglingMfa] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  // Danger zone state
  const [danger, setDanger] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Sync state when profile loads
  useEffect(() => {
    if (profile.name || profile.displayName) setName(profile.name || profile.displayName);
    if (profile.currency) setCurrency(profile.currency);
    if (profile.mfa_enabled !== undefined) setMfaEnabled(profile.mfa_enabled);
    if (profile.preferences?.visibility) {
      if (profile.preferences.visibility.public !== undefined)
        setPubProfile(profile.preferences.visibility.public);
      if (profile.preferences.visibility.insights !== undefined)
        setShowInsights(profile.preferences.visibility.insights);
      if (profile.preferences.visibility.prices !== undefined)
        setShowPrices(profile.preferences.visibility.prices);
    }
    if (profile.preferences?.regional) {
      if (profile.preferences.regional.language) setLanguage(profile.preferences.regional.language);
      if (profile.preferences.regional.timezone) setTimezone(profile.preferences.regional.timezone);
    }
    if (profile.preferences?.notifications) {
      if (profile.preferences.notifications.inquiries !== undefined)
        setNotifInquiries(profile.preferences.notifications.inquiries);
      if (profile.preferences.notifications.campaigns !== undefined)
        setNotifCampaigns(profile.preferences.notifications.campaigns);
      if (profile.preferences.notifications.digest !== undefined)
        setNotifDigest(profile.preferences.notifications.digest);
    }
  }, [profile]);

  const handleSaveAccount = async () => {
    try {
      setSavingAccount(true);
      await creatorApi.updateProfile({ name: name.trim(), display_name: name.trim() });
      await refreshProfile();
      toast.success("Account settings updated successfully!");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to save account settings");
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSaveVisibility = async () => {
    try {
      setSavingVisibility(true);
      await creatorApi.updateProfile({
        preferences: {
          visibility: {
            public: pubProfile,
            insights: showInsights,
            prices: showPrices,
          },
        },
      });
      await refreshProfile();
      toast.success("Profile visibility preferences saved!");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to update visibility preferences");
    } finally {
      setSavingVisibility(false);
    }
  };

  const handleSaveRegion = async () => {
    try {
      setSavingRegion(true);
      await creatorApi.updateProfile({
        currency,
        preferences: {
          regional: {
            language,
            timezone,
          },
        },
      });
      await refreshProfile();
      toast.success("Regional preferences saved successfully!");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to save regional preferences");
    } finally {
      setSavingRegion(false);
    }
  };

  const handleSaveNotifs = async () => {
    try {
      setSavingNotifs(true);
      await creatorApi.updateProfile({
        preferences: {
          notifications: {
            inquiries: notifInquiries,
            campaigns: notifCampaigns,
            digest: notifDigest,
          },
        },
      });
      await refreshProfile();
      toast.success("Notification preferences updated!");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to save notification preferences");
    } finally {
      setSavingNotifs(false);
    }
  };

  const handleToggleMfa = async () => {
    try {
      setTogglingMfa(true);
      const res = await creatorApi.toggleMfa(!mfaEnabled);
      setMfaEnabled(res.mfa_enabled);
      toast.success(
        res.detail || `Two-step verification ${res.mfa_enabled ? "enabled" : "disabled"}`,
      );
      await refreshProfile();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to toggle two-step verification");
    } finally {
      setTogglingMfa(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setChangingPw(true);
      await creatorApi.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully! Keep your credentials safe.");
      setPwModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.current_password?.[0] ||
        e?.response?.data?.new_password?.[0] ||
        "Failed to change password";
      toast.error(msg);
    } finally {
      setChangingPw(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm account deletion");
      return;
    }

    try {
      setDeleting(true);
      await creatorApi.deleteAccount(deletePassword);
      toast.success("Your creator account has been deleted. Logging out...");
      setDanger(false);
      setTimeout(() => {
        authService.logout();
      }, 1200);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.detail ||
          e?.response?.data?.password?.[0] ||
          "Password verification failed",
      );
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    "Account",
    "Profile visibility",
    "Region & language",
    "Notifications",
    "Security",
    "Danger zone",
  ];

  return (
    <div>
      <PageTop label="MAKE THE WORKSPACE YOURS" />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="creator-card h-fit p-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "w-full rounded-md px-3 py-2.5 text-left text-xs font-bold transition",
                activeTab === tab ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              {tab}
            </button>
          ))}
        </aside>

        <div className="space-y-6">
          {activeTab === "Account" && (
            <FormSection title="Account" desc="Your creator account details.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Labeled label="Display Name">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your public name"
                  />
                </Labeled>
                <Labeled label="Email (Primary Credential)">
                  <Input value={profile.email} disabled className="bg-muted cursor-not-allowed" />
                </Labeled>
              </div>
              <Button disabled={savingAccount} onClick={handleSaveAccount}>
                <Check />
                {savingAccount ? "Saving..." : "Save account"}
              </Button>
            </FormSection>
          )}

          {activeTab === "Profile visibility" && (
            <FormSection
              title="Profile visibility"
              desc="Control what potential collaborators and brand sponsors can discover."
            >
              <SettingToggle
                title="Public creator profile"
                desc="Show your profile in marketplace search and brand discovery."
                checked={pubProfile}
                onChange={setPubProfile}
              />
              <SettingToggle
                title="Show audience insights"
                desc="Share summary demographics with verified brands."
                checked={showInsights}
                onChange={setShowInsights}
              />
              <SettingToggle
                title="Show starting prices"
                desc="Display bookable rate card starting pricing on your public profile."
                checked={showPrices}
                onChange={setShowPrices}
              />
              <Button disabled={savingVisibility} onClick={handleSaveVisibility}>
                <Check />
                {savingVisibility ? "Saving..." : "Save visibility"}
              </Button>
            </FormSection>
          )}

          {activeTab === "Region & language" && (
            <FormSection
              title="Region & language"
              desc="Currency, language and timezone apply across your workspace, website and media kit."
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <Labeled label="Currency">
                  <CurrencySelect value={currency} onValueChange={setCurrency} />
                </Labeled>
                <Labeled label="Interface language">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((l) => (
                        <SelectItem key={l.code} value={l.code}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Labeled>
                <Labeled label="Timezone">
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Labeled>
              </div>
              <Button disabled={savingRegion} onClick={handleSaveRegion}>
                <Check />
                {savingRegion ? "Saving..." : "Save preferences"}
              </Button>
            </FormSection>
          )}

          {activeTab === "Notifications" && (
            <FormSection
              title="Notification preferences"
              desc="Choose what deserves your attention."
            >
              <SettingToggle
                title="New collaboration inquiries"
                desc="Instant email and push notifications for inbound brand briefs."
                checked={notifInquiries}
                onChange={setNotifInquiries}
              />
              <SettingToggle
                title="Campaign invitations"
                desc="Receive notifications for opportunities matched above 80%."
                checked={notifCampaigns}
                onChange={setNotifCampaigns}
              />
              <SettingToggle
                title="Weekly performance digest"
                desc="A concise analytics report delivered every Monday."
                checked={notifDigest}
                onChange={setNotifDigest}
              />
              <Button disabled={savingNotifs} onClick={handleSaveNotifs}>
                <Check />
                {savingNotifs ? "Saving..." : "Save notifications"}
              </Button>
            </FormSection>
          )}

          {activeTab === "Security" && (
            <FormSection
              title="Security"
              desc="Keep your workspace protected with two-step verification and strong credentials."
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">Two-step verification</p>
                    <Badge tone={mfaEnabled ? "teal" : "neutral"}>
                      {mfaEnabled ? "ENABLED" : "DISABLED"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add an extra layer of account authentication security.
                  </p>
                </div>
                <Button
                  variant={mfaEnabled ? "outline" : "default"}
                  disabled={togglingMfa}
                  onClick={handleToggleMfa}
                >
                  <ShieldCheck className="size-4" />
                  {togglingMfa ? "Updating..." : mfaEnabled ? "Turn off MFA" : "Enable MFA"}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div>
                  <p className="text-sm font-bold">Password & authentication</p>
                  <p className="text-xs text-muted-foreground">
                    Update your master account login credentials.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setPwModalOpen(true)}>
                  <KeyRound className="size-4" />
                  Change password
                </Button>
              </div>
            </FormSection>
          )}

          {activeTab === "Danger zone" && (
            <section className="creator-card border-destructive/30 p-6">
              <h3 className="font-extrabold text-destructive">Danger zone</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Permanently delete your creator workspace, profile, portfolio, and content.
              </p>
              <Button variant="destructive" className="mt-5" onClick={() => setDanger(true)}>
                <Trash2 />
                Delete account
              </Button>
            </section>
          )}
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={pwModalOpen} onOpenChange={setPwModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change your password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a secure new password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Labeled label="Current password">
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Labeled>
            <Labeled label="New password (min 8 characters)">
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Labeled>
            <Labeled label="Confirm new password">
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Labeled>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwModalOpen(false)} disabled={changingPw}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={changingPw}>
              {changingPw ? "Updating..." : "Update password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Danger Zone Account Deletion Confirmation Dialog */}
      <Dialog open={danger} onOpenChange={setDanger}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Permanently delete your creator account?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your portfolio media, rate cards, custom domain
              mappings, and conversation history will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Labeled label="Enter your password to authorize deletion">
              <Input
                type="password"
                placeholder="Enter your current password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </Labeled>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDanger(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
              {deleting ? "Deleting account..." : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingToggle({
  title,
  desc,
  checked = false,
  onChange,
}: {
  title: string;
  desc: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch
        checked={checked}
        {...(onChange !== undefined ? { onCheckedChange: onChange } : {})}
      />
    </div>
  );
}

function LocationSearch({
  value,
  onChange,
  placeholder = "Search any city, region or country…",
}: {
  value: Place | null;
  onChange: (p: Place | null) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [apiPlaces, setApiPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q || !q.trim()) {
      setApiPlaces([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await creatorApi.searchLocations(q.trim());
        if (active && Array.isArray(results)) {
          const mapped: Place[] = results.map((loc: any) => ({
            id: loc.id,
            name: loc.name,
            level: (loc.type ? loc.type.toLowerCase() : "city") as Place["level"],
            country: loc.country_code === "IN" ? "India" : loc.country_code || "India",
            countryCode: loc.country_code || "IN",
            region: loc.parent_name || undefined,
            lat: loc.latitude ? parseFloat(loc.latitude) : 0,
            lng: loc.longitude ? parseFloat(loc.longitude) : 0,
          }));
          setApiPlaces(mapped);
        }
      } catch {
        if (active) setApiPlaces([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [q]);

  const combinedPlaces = useMemo(() => {
    const staticRes = searchPlaces(q);
    const seen = new Set<string>();
    const list: Place[] = [];
    for (const p of apiPlaces) {
      const key = `${p.name.toLowerCase()}_${p.region?.toLowerCase() || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(p);
      }
    }
    for (const p of staticRes) {
      const key = `${p.name.toLowerCase()}_${p.region?.toLowerCase() || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(p);
      }
    }
    return list;
  }, [apiPlaces, q]);

  const customPlace = useMemo<Place | null>(() => {
    const trimmed = q.trim();
    if (!trimmed) return null;
    const hasExact = combinedPlaces.some((p) => p.name.toLowerCase() === trimmed.toLowerCase());
    if (hasExact) return null;
    return {
      id: `loc_custom_${trimmed}`,
      name: trimmed,
      level: "city",
      country: "India",
      countryCode: "IN",
      lat: 0,
      lng: 0,
    };
  }, [q, combinedPlaces]);

  const handleSelect = (p: Place) => {
    onChange(p);
    setQ("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (combinedPlaces.length > 0 && combinedPlaces[0]) {
        handleSelect(combinedPlaces[0]);
      } else if (customPlace) {
        handleSelect(customPlace);
      }
    }
  };

  return (
    <div className="relative">
      {value ? (
        <div className="flex h-9 items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 text-xs">
          <span className="truncate">
            <MapPin className="mr-1 inline size-3" />
            {placeLabel(value)}
          </span>
          <button
            type="button"
            className="font-bold text-muted-foreground hover:text-foreground"
            onClick={() => onChange(null)}
            aria-label="Clear location"
          >
            ×
          </button>
        </div>
      ) : (
        <Input
          value={q}
          placeholder={placeholder}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={handleKeyDown}
        />
      )}
      {open && !value && (combinedPlaces.length > 0 || customPlace || loading) && (
        <div className="absolute z-[1000] mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover shadow-lg">
          {loading && combinedPlaces.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">Searching locations…</div>
          )}
          {combinedPlaces.map((p) => (
            <button
              type="button"
              key={p.id}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-muted"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(p)}
            >
              <span className="truncate">{placeLabel(p)}</span>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {levelLabel[p.level]?.split(" /")[0] || p.level}
              </span>
            </button>
          ))}
          {customPlace && (
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 border-t px-3 py-2 text-left text-xs text-primary hover:bg-muted"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(customPlace)}
            >
              <span className="truncate">
                <MapPin className="mr-1 inline size-3" /> Use &ldquo;{customPlace.name}&rdquo;
              </span>
              <span className="shrink-0 text-[10px] text-muted-foreground">Custom</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
function CurrencySelect({
  defaultValue,
  value,
  onValueChange,
}: { defaultValue?: string; value?: string; onValueChange?: (v: string) => void } = {}) {
  const { profile } = useCurrentCreator();
  return (
    <Select
      defaultValue={defaultValue || profile.currency || "USD"}
      {...(value !== undefined ? { value } : {})}
      {...(onValueChange !== undefined ? { onValueChange } : {})}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.code} · {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function CategoryPicker({
  initialCategories,
  categories: controlledCategories,
  onChange,
}: {
  initialCategories?: string[];
  categories?: string[];
  onChange?: (cats: string[]) => void;
} = {}) {
  const { profile } = useCurrentCreator();
  const [internalSel, setInternalSel] = useState<string[]>(
    initialCategories ?? profile.categories ?? ["Lifestyle"],
  );
  const sel = controlledCategories !== undefined ? controlledCategories : internalSel;

  const toggle = (c: string) => {
    const next = sel.includes(c) ? sel.filter((x) => x !== c) : [...sel, c];
    if (controlledCategories === undefined) {
      setInternalSel(next);
    }
    onChange?.(next);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => (
        <button
          type="button"
          key={c}
          onClick={() => toggle(c)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-bold transition",
            sel.includes(c)
              ? "border-primary bg-primary text-primary-foreground"
              : "hover:bg-muted",
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
function LocationSection({
  locationStr,
  onLocationChange,
}: { locationStr?: string; onLocationChange?: (loc: string) => void } = {}) {
  const { profile } = useCurrentCreator();
  const loc = locationStr !== undefined ? locationStr : profile.location;
  const initPlace = useMemo<Place | null>(() => {
    if (!loc || loc === "Remote / Worldwide") return null;
    const m = searchPlaces(loc);
    const match = m[0];
    if (match) return match;
    const parts = loc.split(",").map((s) => s.trim());
    return {
      id: "loc_custom",
      name: parts[0] || loc,
      ...(parts[1] ? { region: parts[1] } : {}),
      level: "city",
      country: parts[2] || "India",
      countryCode: "IN",
      lat: 0,
      lng: 0,
    };
  }, [loc]);
  const [primary, setPrimary] = useState<Place | null>(initPlace);
  const [current, setCurrent] = useState<Place | null>(initPlace);
  const [areas, setAreas] = useState<Place[]>([]);
  const [remote, setRemote] = useState(true);
  const [travel, setTravel] = useState(true);

  useEffect(() => {
    if (initPlace) {
      setPrimary(initPlace);
    }
  }, [initPlace]);

  const handlePrimaryChange = (p: Place | null) => {
    setPrimary(p);
    if (onLocationChange) {
      onLocationChange(p ? placeLabel(p) : "Remote / Worldwide");
    }
  };

  return (
    <FormSection
      title="Locations & availability"
      desc="Works for any country — brands anywhere can find you by where you are and where you’ll work."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Labeled label="Primary location">
          <LocationSearch value={primary} onChange={handlePrimaryChange} />
        </Labeled>
        <Labeled label="Current location">
          <LocationSearch value={current} onChange={setCurrent} />
        </Labeled>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold">Available for</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {areas.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1 rounded-full bg-teal-soft px-3 py-1 text-xs font-bold text-teal"
            >
              {a.name}
              <button
                type="button"
                aria-label={`Remove ${a.name}`}
                onClick={() => setAreas((x) => x.filter((y) => y.id !== a.id))}
              >
                ×
              </button>
            </span>
          ))}
          {remote && (
            <span className="rounded-full bg-coral-soft px-3 py-1 text-xs font-bold text-coral">
              Remote / Worldwide
            </span>
          )}
        </div>
        <LocationSearch
          value={null}
          placeholder="Add a city or country you’ll work in…"
          onChange={(p) => p && setAreas((x) => (x.some((y) => y.id === p.id) ? x : [...x, p]))}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SettingToggle
          title="Remote collaborations"
          desc="Accept briefs from anywhere."
          checked={remote}
          onChange={setRemote}
        />
        <SettingToggle
          title="Open to travel"
          desc="Brands can invite you on location."
          checked={travel}
          onChange={setTravel}
        />
      </div>
    </FormSection>
  );
}
