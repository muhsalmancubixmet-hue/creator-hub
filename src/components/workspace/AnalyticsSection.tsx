import { useEffect, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge, PageTop, SectionHead } from "@/components/workspace-shared";
import { creatorApi } from "@/lib/creator-api";
import { demoAuth } from "@/lib/demo-auth";
import { analytics } from "@/lib/creator-data";
import { useCurrentCreator } from "@/lib/creator-profile-context";

function Ranking({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div className="creator-card creator-card-hover p-5">
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

export default function AnalyticsSection() {
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
        <div className="flex gap-1 rounded-lg border bg-card p-1">
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
        {loadingAnalytics
          ? Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24 rounded-xl" />
            ))
          : statMetrics.map((x) => (
              <div key={x[0]} className="creator-card creator-card-hover p-4">
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
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  borderColor: "var(--border)",
                  backgroundColor: "var(--card)",
                  color: "var(--foreground)",
                }}
              />
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
