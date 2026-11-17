import creatorPhoto from "@/assets/creator-ananya.jpg";
import backwaters from "@/assets/portfolio-backwaters.jpg";
import sadya from "@/assets/portfolio-sadya.jpg";
import fashion from "@/assets/portfolio-fashion.jpg";
import munnar from "@/assets/portfolio-munnar.jpg";
import varkala from "@/assets/portfolio-varkala.jpg";

import { places, type Money, type MoneyRange, type Place } from "@/lib/platform-config";

// DEMO DATA ONLY — fictional records used to make the prototype feel real. Regions here never define logic.
export const isDemoData = true;
const place = (id: string): Place => places.find((p) => p.id === id)!;

export const creator = {
  id: "cr_demo_001",
  name: "Ananya Nair",
  displayName: "Ananya Explores",
  handle: "@ananyaexplores",
  categories: ["Travel", "Food", "Lifestyle"],
  category: "Travel · Food · Lifestyle",
  verified: true,
  completion: 85,
  locations: {
    primary: place("in-mum"),
    current: place("ae-dxb"),
    serviceAreas: [place("in-mum"), place("in-kochi"), place("ae-dxb"), place("gb-lon")],
    remote: true,
    travelAvailable: true,
  },
  get location() {
    return `${this.locations.primary.name}, ${this.locations.primary.country}`;
  },
  currency: "USD" as const,
  languageCodes: ["en", "hi", "ml"],
  timezone: "Asia/Kolkata",
  photo: creatorPhoto,
  cover: backwaters,
  bio: "Slow travel, street food and places worth crossing the world for.",
  about:
    "I create vivid, thoughtful stories around places, plates and people. My work helps travel and lifestyle brands feel local, useful and beautifully human — wherever they are.",
  languages: ["English", "Hindi", "Malayalam"],
  creatorType: "Lifestyle & Travel Creator",
  email: "hello@ananyaexplores.com",
  profileUrl: "http://localhost:8082/creator/ananya",
  websiteUrl: "http://localhost:8082/creator/ananya",
};

export const stats = [
  {
    label: "Profile views",
    value: "24.8K",
    change: "+18.2%",
    series: [18, 24, 22, 30, 27, 38, 42],
  },
  {
    label: "Website visitors",
    value: "8,642",
    change: "+12.4%",
    series: [12, 18, 14, 24, 30, 28, 35],
  },
  {
    label: "Social followers",
    value: "438K",
    change: "+5.8%",
    series: [24, 25, 27, 29, 31, 34, 37],
  },
  {
    label: "Collab requests",
    value: "36",
    change: "+8 this month",
    series: [8, 14, 12, 19, 16, 24, 28],
  },
];

export const socialAccounts = [
  {
    id: "soc_01",
    platform: "Instagram",
    username: "@ananyaexplores",
    followers: "284K",
    following: "892",
    engagement: "5.8%",
    verified: true,
    updated: "2 hours ago",
    connected: true,
  },
  {
    id: "soc_02",
    platform: "YouTube",
    username: "Ananya Explores",
    followers: "126K",
    following: "—",
    engagement: "6.2%",
    verified: true,
    updated: "Yesterday",
    connected: true,
  },
  {
    id: "soc_03",
    platform: "Threads",
    username: "@ananyaexplores",
    followers: "18.6K",
    following: "318",
    engagement: "4.1%",
    verified: false,
    updated: "3 days ago",
    connected: true,
  },
  {
    id: "soc_04",
    platform: "Pinterest",
    username: "Ananya Explores",
    followers: "9.4K",
    following: "112",
    engagement: "3.7%",
    verified: false,
    updated: "1 week ago",
    connected: true,
  },
];

export const portfolio = [
  {
    id: "port_01",
    title: "Stillness on the Backwaters",
    category: "Travel",
    brand: "Incredible Voyages",
    date: "Sep 2026",
    image: backwaters,
    format: "Reel",
    views: "486K",
    tags: ["Alappuzha", "Slow travel"],
  },
  {
    id: "port_02",
    title: "A Modern Festive Table",
    category: "Food",
    brand: "Nila Kitchens",
    date: "Aug 2026",
    image: sadya,
    format: "Campaign",
    views: "312K",
    tags: ["Festive", "Food"],
  },
  {
    id: "port_03",
    title: "Handloom, Reimagined",
    category: "Fashion",
    brand: "Maya Weaves",
    date: "Aug 2026",
    image: fashion,
    format: "Editorial",
    views: "274K",
    tags: ["Handloom", "Craft"],
  },
  {
    id: "port_04",
    title: "Before the World Wakes",
    category: "Travel",
    brand: "Wild Routes",
    date: "Jul 2026",
    image: munnar,
    format: "Video",
    views: "629K",
    tags: ["Mountains", "Hiking"],
  },
  {
    id: "port_05",
    title: "A Weekend on the Cliffs",
    category: "Lifestyle",
    brand: "Cliff House",
    date: "Jun 2026",
    image: varkala,
    format: "Campaign",
    views: "358K",
    tags: ["Coast", "Stay"],
  },
];

const usd = (amount: number): Money => ({ amount, currency: "USD" });
export const services: {
  id: string;
  name: string;
  description: string;
  price: Money | null;
  deliverables: string;
  turnaround: string;
  active: boolean;
}[] = [
  {
    id: "srv_01",
    name: "Instagram Reel",
    description: "Concept-led vertical video with original voiceover and edit.",
    price: usd(420),
    deliverables: "1 reel · 3 story frames",
    turnaround: "7–10 days",
    active: true,
  },
  {
    id: "srv_02",
    name: "Travel Story Package",
    description: "Immersive destination story across short and long-form formats.",
    price: usd(1000),
    deliverables: "2 reels · 8 stories · 12 photos",
    turnaround: "14 days",
    active: true,
  },
  {
    id: "srv_03",
    name: "UGC Content",
    description: "Natural product storytelling licensed for brand channels.",
    price: usd(260),
    deliverables: "2 edited videos · raw selects",
    turnaround: "7 days",
    active: true,
  },
  {
    id: "srv_04",
    name: "Event Appearance",
    description: "Creator appearance, live coverage and post-event recap.",
    price: null,
    deliverables: "Up to 4 hours · live stories",
    turnaround: "By schedule",
    active: false,
  },
  {
    id: "srv_05",
    name: "Product Photography",
    description: "Warm editorial product imagery in a lifestyle setting.",
    price: usd(340),
    deliverables: "15 edited photographs",
    turnaround: "10 days",
    active: true,
  },
];

export interface Opportunity {
  id: string;
  name: string;
  business: string;
  category: string;
  place: Place;
  remote?: boolean;
  platform: string;
  deliverables: string;
  budget: MoneyRange;
  deadline: string;
  creators: number;
  match: number;
}
export const opportunities: Opportunity[] = [
  {
    id: "opp_01",
    name: "Desert Weekends",
    business: "Dune & Co. Resorts",
    category: "Travel",
    place: place("ae-dxb"),
    platform: "Instagram",
    deliverables: "2 reels + 6 stories",
    budget: { min: 3000, max: 4500, currency: "AED" },
    deadline: "Oct 12",
    creators: 3,
    match: 96,
  },
  {
    id: "opp_02",
    name: "Great Breakfast Stories",
    business: "Morning Table",
    category: "Food",
    place: place("gb-lon"),
    remote: true,
    platform: "Instagram, YouTube",
    deliverables: "1 reel + 1 short",
    budget: { min: 600, max: 900, currency: "GBP" },
    deadline: "Oct 18",
    creators: 5,
    match: 91,
  },
  {
    id: "opp_03",
    name: "Responsible Coastlines",
    business: "Blue Earth Collective",
    category: "Sustainability",
    place: place("in-goa"),
    platform: "YouTube",
    deliverables: "1 feature video",
    budget: { min: 90000, max: 120000, currency: "INR" },
    deadline: "Oct 24",
    creators: 2,
    match: 88,
  },
  {
    id: "opp_04",
    name: "Festive Handloom Edit",
    business: "Thari Studio",
    category: "Fashion",
    place: place("in-jaipur"),
    platform: "Instagram",
    deliverables: "1 reel + 1 carousel",
    budget: { min: 40000, max: 55000, currency: "INR" },
    deadline: "Nov 2",
    creators: 4,
    match: 84,
  },
  {
    id: "opp_05",
    name: "City Food Crawl",
    business: "Hawker Lane",
    category: "Food",
    place: place("sg"),
    platform: "TikTok",
    deliverables: "3 short videos",
    budget: { min: 1200, max: 1800, currency: "SGD" },
    deadline: "Nov 6",
    creators: 6,
    match: 82,
  },
  {
    id: "opp_06",
    name: "Autumn Capsule",
    business: "Maison Lune",
    category: "Fashion",
    place: place("fr-par"),
    platform: "Instagram",
    deliverables: "1 reel + 4 photos",
    budget: { min: 800, max: 1200, currency: "EUR" },
    deadline: "Nov 10",
    creators: 2,
    match: 79,
  },
  {
    id: "opp_07",
    name: "Rooftop Launch Night",
    business: "Skyline Social",
    category: "Lifestyle",
    place: place("us-nyc"),
    platform: "Instagram, TikTok",
    deliverables: "Live stories + recap",
    budget: { min: 1500, max: 2200, currency: "USD" },
    deadline: "Nov 14",
    creators: 8,
    match: 77,
  },
  {
    id: "opp_08",
    name: "Monsoon in the Hills",
    business: "Misty Trails Resorts",
    category: "Travel",
    place: place("in-wayanad"),
    platform: "Instagram",
    deliverables: "2 reels + 6 stories",
    budget: { min: 60000, max: 85000, currency: "INR" },
    deadline: "Nov 20",
    creators: 3,
    match: 86,
  },
  {
    id: "opp_09",
    name: "Lakeshore Fitness",
    business: "North Loop Athletics",
    category: "Fitness",
    place: place("ca-tor"),
    remote: true,
    platform: "YouTube",
    deliverables: "1 video + 2 shorts",
    budget: { min: 1400, max: 2000, currency: "CAD" },
    deadline: "Nov 28",
    creators: 3,
    match: 72,
  },
];

export const inquiries: {
  id: string;
  business: string;
  campaign: string;
  message: string;
  budget: string;
  date: string;
  status: string;
}[] = [
  {
    id: "inq_01",
    business: "Maya Weaves",
    campaign: "Festive Handloom Edit",
    message: "We loved your handloom story and would like to explore a festive collaboration.",
    budget: formatMoneyLite({ amount: 65000, currency: "INR" }),
    date: "Today, 9:42 AM",
    status: "New",
  },
  {
    id: "inq_02",
    business: "Coconut Grove Hotels",
    campaign: "Quiet Coastal Escapes",
    message: "Could you share availability for a three-night property experience in Bali?",
    budget: formatMoneyLite({ amount: 1150, currency: "USD" }),
    date: "Yesterday",
    status: "Negotiating",
  },
  {
    id: "inq_03",
    business: "Nila Kitchens",
    campaign: "Festive Table",
    message: "Thank you for the beautiful campaign. We'd love to reserve a December slot.",
    budget: formatMoneyLite({ amount: 2100, currency: "AED" }),
    date: "Sep 25",
    status: "Responded",
  },
  {
    id: "inq_04",
    business: "Terra Footwear",
    campaign: "Walk Local",
    message: "Inviting you to our multi-city creator campaign this November.",
    budget: formatMoneyLite({ amount: 720, currency: "GBP" }),
    date: "Sep 22",
    status: "Accepted",
  },
];
function formatMoneyLite(m: Money) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: m.currency,
    maximumFractionDigits: 0,
  }).format(m.amount);
}

export const notifications = [
  {
    id: "n1",
    title: "New collaboration inquiry",
    text: "Maya Weaves sent a festive campaign brief.",
    time: "8 min",
    unread: true,
    type: "inquiry",
  },
  {
    id: "n2",
    title: "Campaign invitation",
    text: "Misty Trails invited you to Monsoon in the Hills.",
    time: "2h",
    unread: true,
    type: "campaign",
  },
  {
    id: "n3",
    title: "Profile verified",
    text: "Your professional profile is now verified.",
    time: "Yesterday",
    unread: false,
    type: "verified",
  },
  {
    id: "n4",
    title: "Portfolio is trending",
    text: "Your Munnar reel crossed 600K views.",
    time: "2d",
    unread: false,
    type: "activity",
  },
];

export const analytics = [
  { day: "Sep 1", views: 1800, visitors: 620, clicks: 210 },
  { day: "Sep 5", views: 2400, visitors: 760, clicks: 280 },
  { day: "Sep 9", views: 2100, visitors: 710, clicks: 260 },
  { day: "Sep 13", views: 3200, visitors: 980, clicks: 350 },
  { day: "Sep 17", views: 2900, visitors: 920, clicks: 390 },
  { day: "Sep 21", views: 4100, visitors: 1240, clicks: 470 },
  { day: "Sep 26", views: 4800, visitors: 1410, clicks: 560 },
];

export const websiteTemplates = [
  "Minimal Creator",
  "Fashion",
  "Travel",
  "Food",
  "Lifestyle",
  "Professional",
  "Photography",
  "Gaming",
];

export interface CollabMessage {
  id: string;
  from: "brand" | "creator";
  text: string;
  time: string;
  revision?: "Approved" | "Changes requested" | "In review";
}
export interface Collaboration {
  id: string;
  brand: string;
  campaign: string;
  deliverables: string;
  dueDate: string;
  currentStep: number;
  source: { type: "inquiry" | "opportunity"; id: string };
  messages: CollabMessage[];
}
export const milestoneSteps = [
  "Agreement Signed",
  "Concept Approved",
  "Draft Upload",
  "Brand Feedback",
  "Published Live",
];
export const collaborations: Collaboration[] = [
  {
    id: "col_01",
    brand: "Terra Footwear",
    campaign: "Walk Local",
    deliverables: "1 reel + 4 story frames",
    dueDate: "2026-10-14",
    currentStep: 2,
    source: { type: "inquiry", id: "inq_04" },
    messages: [
      {
        id: "m1",
        from: "brand",
        text: "Contract countersigned — welcome aboard! Brief and product are on the way.",
        time: "Sep 23",
      },
      {
        id: "m2",
        from: "creator",
        text: "Concept deck attached: three city walks, morning light, product in motion.",
        time: "Sep 25",
        revision: "In review",
      },
      {
        id: "m3",
        from: "brand",
        text: "Love concept B. Approved — please keep the logo visible in the first 3 seconds.",
        time: "Sep 27",
        revision: "Approved",
      },
    ],
  },
  {
    id: "col_02",
    brand: "Dune & Co. Resorts",
    campaign: "Desert Weekends",
    deliverables: "2 reels + 6 stories",
    dueDate: "2026-10-20",
    currentStep: 2,
    source: { type: "opportunity", id: "opp_01" },
    messages: [
      {
        id: "m1",
        from: "brand",
        text: "Thrilled to have you. Stay dates confirmed for Oct 8–10.",
        time: "Sep 26",
      },
      {
        id: "m2",
        from: "creator",
        text: "Shot list shared. Planning a sunrise dune sequence for reel one.",
        time: "Sep 27",
        revision: "Approved",
      },
    ],
  },
];
export const collabFor = (type: "inquiry" | "opportunity", id: string) =>
  collaborations.find((c) => c.source.type === type && c.source.id === id);
