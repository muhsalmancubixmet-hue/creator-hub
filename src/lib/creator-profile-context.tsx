import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { creatorApi } from "@/lib/creator-api";
import { demoAuth } from "@/lib/demo-auth";
import {
  creator as defaultDemoCreator,
  portfolio as demoPortfolio,
  services as demoServices,
  opportunities as demoOpportunities,
  inquiries as demoInquiries,
} from "@/lib/creator-data";
import { cn } from "@/lib/utils";

export interface CreatorPreferences {
  visibility?: {
    public?: boolean;
    insights?: boolean;
    prices?: boolean;
  };
  regional?: {
    language?: string;
    timezone?: string;
  };
  notifications?: {
    inquiries?: boolean;
    campaigns?: boolean;
    digest?: boolean;
  };
}

export interface CreatorProfileData {
  id: string;
  name: string;
  displayName: string;
  handle: string;
  email: string;
  photo?: string | null;
  cover?: string | null;
  bio: string;
  about: string;
  location: string;
  category: string;
  categories: string[];
  completion: number;
  verified: boolean;
  currency: string;
  creatorType: string;
  languageCodes: string[];
  timezone: string;
  profileUrl: string;
  websiteUrl: string;
  views_count?: number;
  mfa_enabled?: boolean;
  preferences?: CreatorPreferences;
}

export interface WorkspacePortfolioItem {
  id: string;
  title: string;
  category: string;
  brand: string;
  date: string;
  image: string;
  format: string;
  views: string;
  tags: string[];
  description?: string;
}

export interface WorkspaceServiceItem {
  id: string;
  name: string;
  description: string;
  price: { amount: number; currency: string } | null;
  deliverables: string;
  turnaround: string;
  active: boolean;
}

export interface WorkspaceOpportunityItem {
  id: string;
  name: string;
  business: string;
  category: string;
  place: any;
  remote?: boolean;
  platform: string;
  deliverables: string;
  budget: { min: number; max: number; currency: string };
  deadline: string;
  creators: number;
  match: number;
}

export interface WorkspaceInquiryItem {
  id: string;
  business: string;
  campaign: string;
  message: string;
  budget: string;
  date: string;
  status: string;
  is_read: boolean;
  unread_count: number;
}

export interface CreatorProfileContextType {
  profile: CreatorProfileData;
  loading: boolean;
  portfolio: WorkspacePortfolioItem[];
  services: WorkspaceServiceItem[];
  opportunities: WorkspaceOpportunityItem[];
  inquiries: WorkspaceInquiryItem[];
  refreshProfile: () => Promise<void>;
  refreshPortfolio: () => Promise<void>;
  refreshServices: () => Promise<void>;
  refreshOpportunities: (params?: Record<string, string | number>) => Promise<void>;
  refreshInquiries: () => Promise<void>;
  markInquiryAsRead: (id: string) => Promise<void>;
  updateProfileState: (partial: Partial<CreatorProfileData>) => void;
}

const CreatorProfileContext = createContext<CreatorProfileContextType | null>(null);

function buildFallbackFromEmail(email: string): CreatorProfileData {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === "ananya@influencers.com") {
    return {
      id: defaultDemoCreator.id,
      name: defaultDemoCreator.name,
      displayName: defaultDemoCreator.displayName,
      handle: defaultDemoCreator.handle,
      email: defaultDemoCreator.email,
      photo: defaultDemoCreator.photo,
      cover: defaultDemoCreator.cover,
      bio: defaultDemoCreator.bio,
      about: defaultDemoCreator.about,
      location: defaultDemoCreator.location,
      category: defaultDemoCreator.category,
      categories: defaultDemoCreator.categories,
      completion: defaultDemoCreator.completion,
      verified: defaultDemoCreator.verified,
      currency: defaultDemoCreator.currency,
      creatorType: defaultDemoCreator.creatorType,
      languageCodes: defaultDemoCreator.languageCodes,
      timezone: defaultDemoCreator.timezone,
      profileUrl: defaultDemoCreator.profileUrl,
      websiteUrl: defaultDemoCreator.websiteUrl,
    };
  }

  // Derive dynamic name and handle from user's email
  const namePart = cleanEmail.split("@")[0] || "Creator";
  const formattedName = namePart
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    id: `cr_${namePart}`,
    name: formattedName,
    displayName: formattedName,
    handle: `@${namePart.replace(/\s+/g, "").toLowerCase()}`,
    email: cleanEmail,
    photo: null,
    cover: null,
    bio: "Content creator & storyteller.",
    about: "Welcome to my creator workspace. Let's create impactful collaborations together.",
    location: "Remote / Worldwide",
    category: "Content Creator",
    categories: ["Lifestyle"],
    completion: 45,
    verified: false,
    currency: "USD",
    creatorType: "Content Creator",
    languageCodes: ["en"],
    timezone: "UTC",
    profileUrl: `influencers.com/${namePart}`,
    websiteUrl: `${namePart}.influencers.com`,
    views_count: 0,
  };
}

export function CreatorProfileProvider({ children }: { children: ReactNode }) {
  const currentEmail = demoAuth.getEmail() || "ananya@influencers.com";
  const isDemoAnanya = currentEmail.trim().toLowerCase() === "ananya@influencers.com";

  const [profile, setProfile] = useState<CreatorProfileData>(() => buildFallbackFromEmail(currentEmail));
  const [portfolio, setPortfolio] = useState<WorkspacePortfolioItem[]>(() =>
    isDemoAnanya ? (demoPortfolio as unknown as WorkspacePortfolioItem[]) : []
  );
  const [services, setServices] = useState<WorkspaceServiceItem[]>(() =>
    isDemoAnanya ? (demoServices as unknown as WorkspaceServiceItem[]) : []
  );
  const [opportunities, setOpportunities] = useState<WorkspaceOpportunityItem[]>([]);
  const [inquiries, setInquiries] = useState<WorkspaceInquiryItem[]>(() =>
    isDemoAnanya ? (demoInquiries as unknown as WorkspaceInquiryItem[]) : []
  );
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await creatorApi.getProfile();
      if (data && (data.handle || data.display_name || data.id)) {
        const rawHandle = data.handle || "creator";
        const handle = rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;
        const displayName = data.display_name || formattedFallbackName(rawHandle);
        const name = displayName;

        // Resolve location string
        let location = data.location_text || "";
        if (!location && data.primary_location_details) {
          const loc = data.primary_location_details;
          location = [loc.city, loc.country_name].filter(Boolean).join(", ");
        }
        if (!location) location = "Remote / Worldwide";

        // Resolve category string
        let category = "Content Creator";
        let categories: string[] = ["Lifestyle"];
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          categories = data.categories
            .map((c: any) => c.category?.name || c.name)
            .filter(Boolean);
          if (categories.length > 0) {
            category = categories.join(" · ");
          }
        }

        const email = data.email || demoAuth.getEmail() || "";

        setProfile({
          id: data.id || `cr_${rawHandle}`,
          name,
          displayName,
          handle,
          email,
          photo: data.photo_url || null,
          cover: data.cover_url || null,
          bio: data.bio || "",
          about: data.about || data.bio || "",
          location,
          category,
          categories,
          completion: typeof data.completion_percentage === "number" ? data.completion_percentage : (data.bio ? 75 : 40),
          verified: data.verification_status === "VERIFIED",
          currency: data.currency || "USD",
          creatorType: data.creator_type || "Content Creator",
          languageCodes: Array.isArray(data.languages) ? data.languages.map((l: any) => l.language_code) : ["en"],
          timezone: data.timezone || "UTC",
          profileUrl: `influencers.com/${rawHandle.replace(/^@/, "")}`,
          websiteUrl: `${rawHandle.replace(/^@/, "")}.influencers.com`,
          views_count: typeof data.views_count === "number" ? data.views_count : 0,
          mfa_enabled: !!data.mfa_enabled,
          preferences: data.preferences || {},
        });
      }
    } catch {
      const activeEmail = demoAuth.getEmail() || "ananya@influencers.com";
      setProfile(buildFallbackFromEmail(activeEmail));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPortfolio = useCallback(async () => {
    try {
      const data = await creatorApi.getPortfolio();
      const rawList = Array.isArray(data) ? data : (data?.results || []);
      const mapped = rawList.map((item: any) => ({
        id: String(item.id),
        title: item.title || "Untitled Project",
        category: item.category || "Lifestyle",
        brand: item.brand || item.brand_name || "Brand Partner",
        date: item.deliverable_date || (item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recent"),
        image: item.image || item.media_url || "",
        format: item.format || item.format_tag || "Reel",
        views: typeof item.views === "number" ? item.views.toLocaleString() : (item.views_count ? item.views_count.toLocaleString() : "0"),
        tags: Array.isArray(item.tags) ? item.tags : [item.format_tag || "Showcase"].filter(Boolean),
        description: item.description || "",
      }));
      setPortfolio(mapped);
    } catch {
      if (isDemoAnanya) {
        setPortfolio(demoPortfolio as unknown as WorkspacePortfolioItem[]);
      } else {
        setPortfolio([]);
      }
    }
  }, [isDemoAnanya]);

  const fetchServices = useCallback(async () => {
    try {
      const data = await creatorApi.getServices();
      const rawList = Array.isArray(data) ? data : (data?.results || []);
      const mapped = rawList.map((item: any) => {
        const priceCents = item.price_cents ?? item.starting_price_cents ?? 0;
        return {
          id: String(item.id),
          name: item.name || "Custom Service",
          description: item.description || "Custom creator deliverable package.",
          price: item.is_contact_for_price || priceCents === 0 ? null : { amount: priceCents / 100, currency: item.currency || "USD" },
          deliverables: item.deliverables || item.deliverables_spec || "1 deliverable",
          turnaround: item.turnaround_days ? `${item.turnaround_days} days` : (item.turnaround || "7–10 days"),
          active: item.is_active ?? true,
        };
      });
      setServices(mapped);
    } catch {
      if (isDemoAnanya) {
        setServices(demoServices as unknown as WorkspaceServiceItem[]);
      } else {
        setServices([]);
      }
    }
  }, [isDemoAnanya]);

  const fetchOpportunities = useCallback(async (params?: Record<string, string | number>) => {
    try {
      const data = await creatorApi.getOpportunities(params);
      const rawList = Array.isArray(data) ? data : (data?.results || []);
      const mapped = rawList.map((item: any) => {
        const budgetNum = typeof item.budget === "number" ? item.budget : (item.total_budget_cents ? item.total_budget_cents / 100 : 500);
        const minBudget = item.budget?.min ?? budgetNum;
        const maxBudget = item.budget?.max ?? minBudget;
        const currency = item.currency || "INR";
        const locName = item.location || item.location_text || "Kerala, India";
        const lat = typeof item.lat === "number" ? item.lat : 9.9312;
        const lng = typeof item.lng === "number" ? item.lng : 76.2673;
        const isRemote = !item.location_text || item.location_text.toLowerCase().includes("remote") || item.location_text.toLowerCase().includes("worldwide");
        return {
          id: String(item.id),
          name: item.title || item.name || "Campaign Opportunity",
          business: item.business || item.business_name || "Partner Brand",
          category: item.category || item.category_name || "General",
          place: {
            id: `loc_${item.id}`,
            name: locName,
            level: "city",
            country: "India",
            countryCode: (locName.toLowerCase().includes("dubai") || locName.toLowerCase().includes("uae")) ? "AE" : "IN",
            lat,
            lng,
          },
          remote: isRemote,
          platform: item.platform || "Instagram, YouTube",
          deliverables: item.deliverables || item.deliverables_spec || "Campaign deliverables",
          budget: { min: minBudget, max: maxBudget, currency },
          deadline: item.deadline ? new Date(item.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Open",
          creators: item.creators || item.creators_needed || 1,
          match: item.match || 95,
        };
      });
      setOpportunities(mapped);
    } catch {
      setOpportunities([]);
    }
  }, []);

  const fetchInquiries = useCallback(async () => {
    try {
      const data = await creatorApi.getInquiries();
      const rawList = Array.isArray(data) ? data : (data?.results || []);
      const mapped = rawList.map((item: any) => {
        const budgetStr = typeof item.budget === "string" ? item.budget : (item.budget_cents ? `$${(item.budget_cents / 100).toLocaleString()}` : (item.budget ? `$${item.budget}` : "Contact"));
        const dateStr = item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent");
        const rawStatus = String(item.status || "New");
        const statusTitle = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

        const isRead = item.is_read !== undefined ? Boolean(item.is_read) : (item.unread_count !== undefined ? item.unread_count === 0 : true);
        const unreadCount = typeof item.unread_count === "number" ? item.unread_count : (isRead ? 0 : 1);

        return {
          id: String(item.id),
          business: item.business || item.business_name || "Brand Partner",
          campaign: item.campaign || item.subject || "Collaboration Proposal",
          message: item.message || "Hi, we are interested in discussing a collaboration with you.",
          budget: budgetStr,
          date: dateStr,
          status: statusTitle,
          is_read: isRead,
          unread_count: unreadCount,
        };
      });
      setInquiries(mapped);
    } catch {
      if (isDemoAnanya) {
        setInquiries(demoInquiries as unknown as WorkspaceInquiryItem[]);
      } else {
        setInquiries([]);
      }
    }
  }, [isDemoAnanya]);

  const markInquiryAsRead = useCallback(async (id: string) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, is_read: true, unread_count: 0 } : inq))
    );
    try {
      await creatorApi.markInquiryRead(id);
    } catch {
      // optimistic UI update retained
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
    void fetchPortfolio();
    void fetchServices();
    void fetchOpportunities();
    void fetchInquiries();
  }, [fetchProfile, fetchPortfolio, fetchServices, fetchOpportunities, fetchInquiries]);

  const updateProfileState = useCallback((partial: Partial<CreatorProfileData>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <CreatorProfileContext.Provider
      value={{
        profile,
        loading,
        portfolio,
        services,
        opportunities,
        inquiries,
        refreshProfile: fetchProfile,
        refreshPortfolio: fetchPortfolio,
        refreshServices: fetchServices,
        refreshOpportunities: fetchOpportunities,
        refreshInquiries: fetchInquiries,
        markInquiryAsRead,
        updateProfileState,
      }}
    >
      {children}
    </CreatorProfileContext.Provider>
  );
}

function formattedFallbackName(handle: string): string {
  const clean = handle.replace(/^@/, "").replace(/[._-]+/g, " ");
  return clean.replace(/\b\w/g, (char) => char.toUpperCase()) || "Creator";
}

export function useCurrentCreator(): CreatorProfileContextType {
  const ctx = useContext(CreatorProfileContext);
  if (!ctx) {
    const fallbackEmail = demoAuth.getEmail() || "ananya@influencers.com";
    return {
      profile: buildFallbackFromEmail(fallbackEmail),
      loading: false,
      portfolio: [],
      services: [],
      opportunities: [],
      inquiries: [],
      refreshProfile: async () => {},
      refreshPortfolio: async () => {},
      refreshServices: async () => {},
      refreshOpportunities: async () => {},
      refreshInquiries: async () => {},
      markInquiryAsRead: async () => {},
      updateProfileState: () => {},
    };
  }
  return ctx;
}

/**
 * Renders the creator's avatar image, or a polished initials placeholder if no photo is uploaded.
 */
export function CreatorAvatar({
  src,
  name,
  className = "size-8 rounded-md object-cover",
  fallbackClassName = "text-xs font-black",
}: {
  src?: string | null | undefined;
  name?: string | undefined;
  className?: string | undefined;
  fallbackClassName?: string | undefined;
}) {
  const [error, setError] = useState(false);
  const initials = (name || "Creator")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "CR";

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name || "Creator avatar"}
        onError={() => setError(true)}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid place-items-center rounded-md bg-gradient-to-br from-coral to-coral-soft text-primary-foreground select-none shrink-0 border border-coral/30 shadow-sm",
        className
      )}
      aria-label={name || "Creator avatar"}
    >
      <span className={fallbackClassName}>{initials}</span>
    </div>
  );
}

/**
 * Renders the creator's cover image or an elegant gradient banner if no cover is uploaded.
 */
export function CreatorCover({
  src,
  alt = "Creator cover photo",
  className = "h-full w-full object-cover",
}: {
  src?: string | null | undefined;
  alt?: string | undefined;
  className?: string | undefined;
}) {
  const [error, setError] = useState(false);
  if (src && !error) {
    return <img src={src} alt={alt} onError={() => setError(true)} className={className} />;
  }
  return (
    <div
      className={cn(
        "h-full w-full bg-gradient-to-br from-primary/10 via-coral/15 to-teal/10 flex items-center justify-center text-muted-foreground/50",
        className
      )}
    >
      <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/60">
        Creator Showcase
      </span>
    </div>
  );
}
