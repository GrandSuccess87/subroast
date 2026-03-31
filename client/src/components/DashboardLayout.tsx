import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { trpc } from "@/lib/trpc";
import {
  BarChart2,
  CalendarClock,
  History,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MessageSquarePlus,
  PanelLeft,
  Settings,
  Sparkles,
  Zap,
  Clock,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [{ icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" }],
  },
  {
    title: "Compose",
    items: [
      { icon: Sparkles, label: "Draft & Roast", path: "/dashboard/roast" },
      { icon: CalendarClock, label: "Scheduled Posts", path: "/dashboard/schedule" },
    ],
  },
  {
    title: "Outreach",
    items: [
      { icon: MessageSquare, label: "DM Campaigns", path: "/dashboard/campaigns" },
    ],
  },
  {
    title: "Analyze",
    items: [
      { icon: History, label: "History", path: "/dashboard/history" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: Settings, label: "Settings", path: "/dashboard/settings" },
      { icon: MessageSquarePlus, label: "Feedback", path: "/dashboard/feedback" },
    ],
  },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 200;
const MAX_WIDTH = 320;

/* ── Early-access banner ── */
function EarlyAccessBanner() {
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem("ea_banner_dismissed") === "1"
  );
  if (dismissed) return null;
  return (
    <div
      style={{
        background: "oklch(0.14 0.007 60)",
        borderBottom: "0.5px solid oklch(0.22 0.007 60)",
        padding: "0.6rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Sparkles
          style={{ width: "0.875rem", height: "0.875rem", color: "oklch(0.88 0.025 85)", flexShrink: 0 }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "oklch(0.75 0.010 80)",
          }}
        >
          Founder pricing available for the first 10 users — lock in $25/mo before it goes up
        </span>
        <a
          href="/pricing"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "oklch(0.88 0.14 65)",
            textDecoration: "none",
            border: "0.5px solid oklch(0.88 0.14 65 / 0.4)",
            padding: "0.2rem 0.6rem",
            flexShrink: 0,
          }}
        >
          Get Founder Access →
        </a>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={() => {
            sessionStorage.setItem("ea_banner_dismissed", "1");
            setDismissed(true);
          }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "oklch(0.50 0.006 80)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: 'oklch(0.09 0.008 60)' }}
      >
        {/* Ambient glow */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 50% 30%, oklch(0.88 0.025 85 / 0.04) 0%, transparent 70%)'
        }} />
        <div className="flex flex-col items-center gap-10 p-10" style={{ maxWidth: 380, width: '100%', position: 'relative' }}>
          {/* Debossed logo mark */}
          <div style={{ position: 'relative' }}>
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663208942813/D6eMQgvSZZr9tsyS9zVhzn/subroast-logo-debossed_490a86ef.png"
              alt="SubRoast"
              style={{ width: 72, height: 72, objectFit: 'contain', filter: 'drop-shadow(0 0 12px oklch(0.88 0.025 85 / 0.15))' }}
            />
          </div>
          {/* Wordmark */}
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: '2rem',
              letterSpacing: '0.02em',
              color: 'oklch(0.94 0.008 80)',
              lineHeight: 1.1,
              margin: 0,
            }}>SubRoast</h1>
            {/* Hairline rule */}
            <div style={{ width: 40, height: '0.5px', background: 'oklch(0.88 0.025 85 / 0.4)', margin: '4px 0' }} />
            <p style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'oklch(0.52 0.006 80)',
              margin: 0,
            }}>Intelligence for Reddit founders</p>
          </div>
          {/* Sign in button */}
          <button
            onClick={() => { window.location.href = getLoginUrl(); }}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: 'oklch(0.88 0.025 85)',
              color: 'oklch(0.09 0.008 60)',
              border: 'none',
              borderRadius: 0,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.7rem',
              fontWeight: 500,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Sign In
          </button>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.72rem',
            color: 'oklch(0.38 0.004 80)',
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.6,
          }}>By signing in you agree to our Terms of Service<br />and Privacy Policy.</p>
        </div>
      </div>
    );
  }

  return (
    <OnboardingGate>
      <SidebarProvider
        style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
      >
        <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
          {children}
        </DashboardLayoutContent>
      </SidebarProvider>
    </OnboardingGate>
  );
}

/**
 * Checks whether the signed-in user has completed qualification onboarding.
 * If not, redirects to /onboarding. Renders children only once confirmed.
 */
function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { data, isLoading } = trpc.onboarding.getQualificationStatus.useQuery();

  useEffect(() => {
    if (!isLoading && data && !data.completed) {
      navigate("/onboarding");
    }
  }, [isLoading, data, navigate]);

  if (isLoading || (data && !data.completed)) {
    return <DashboardLayoutSkeleton />;
  }

  return <>{children}</>;
}

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: {
  children: React.ReactNode;
  setSidebarWidth: (w: number) => void;
}) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { data: allLeads } = trpc.outreach.getAllLeads.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  const { data: syncStats } = trpc.outreach.getSyncStats.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  const { data: subStatus } = trpc.subscription.getStatus.useQuery(undefined, {
    refetchInterval: 5 * 60_000,
  });

  const { data: scheduledPosts } = trpc.schedule.list.useQuery(undefined, {
    refetchInterval: 60_000,
  });
  const pendingPostCount = scheduledPosts?.filter((p) => p.status === "pending").length ?? 0;

  const totalLeads = allLeads?.length ?? 0;
  // Show progress toward a soft milestone of 50 leads
  const leadsPct = Math.min(Math.round((totalLeads / 50) * 100), 100);

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  const activeLabel = NAV_SECTIONS.flatMap((s) => s.items).find(
    (item) => item.path === "/dashboard" ? location === "/dashboard" : location.startsWith(item.path)
  )?.label ?? "SubRoast";

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-sidebar-border" disableTransition={isResizing}>
          {/* Header */}
          <SidebarHeader className="h-14 justify-center border-b border-sidebar-border">
            <div className="flex items-center gap-2.5 px-2 w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-sidebar-accent rounded-lg transition-colors focus:outline-none shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-sidebar-foreground/50" />
              </button>
              {!isCollapsed && (
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663208942813/D6eMQgvSZZr9tsyS9zVhzn/subroast-logo-debossed_490a86ef.png"
                    alt="SubRoast"
                    className="w-6 h-6 rounded-md shrink-0 object-cover"
                  />
                  <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, fontSize: '1rem', letterSpacing: '0.01em' }} className="text-sidebar-foreground truncate">
                    SubRoast
                  </span>
                </div>
              )}
            </div>
          </SidebarHeader>

          {/* Nav sections */}
          <SidebarContent className="gap-0 pt-2 pb-2">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="mb-1">
                {!isCollapsed && (
                  <p className="nav-section-label">{section.title}</p>
                )}
                <SidebarMenu className="px-2">
                  {section.items.map((item) => {
                    const isActive =
                      item.path === "/dashboard"
                        ? location === "/dashboard"
                        : location.startsWith(item.path);
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setLocation(item.path)}
                          tooltip={item.label}
                          className="h-9 transition-all"
                          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 300, letterSpacing: '0.08em' }}
                        >
                          <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                          <span>{item.label}</span>
                          {item.path === "/dashboard/schedule" && pendingPostCount > 0 && !isCollapsed && (
                            <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary shrink-0">
                              {pendingPostCount}
                            </span>
                          )}
                          {isActive && !isCollapsed && item.path !== "/dashboard/schedule" && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                          {isActive && !isCollapsed && item.path === "/dashboard/schedule" && pendingPostCount === 0 && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </div>
            ))}
            {/* Activity widget */}
            {!isCollapsed && (
            <div className="mx-3 mb-3 mt-2 p-3 bg-sidebar-accent" style={{ border: '0.5px solid oklch(0.18 0.004 280)', borderRadius: 0 }}>
              <div className="flex items-center gap-1.5 mb-2.5">
                <BarChart2 className="w-3.5 h-3.5 text-primary" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 300, letterSpacing: '0.14em', textTransform: 'uppercase' }} className="text-sidebar-foreground/70">Activity</span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-sidebar-foreground/50">Leads found</span>
                    <span className="font-medium text-sidebar-foreground">{totalLeads}</span>
                  </div>
                  <div className="overflow-hidden" style={{ height: '0.5px', background: 'oklch(0.20 0.004 280)' }}>
                    <div
                      className="h-full transition-all"
                      style={{ width: `${Math.max(leadsPct, 2)}%`, background: 'oklch(0.88 0.025 85 / 0.7)', borderRadius: 0 }}
                    />
                  </div>
                </div>
                {syncStats && (
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-sidebar-foreground/50">Syncs today</span>
                      <span className={`font-medium ${
                        syncStats.syncsToday >= syncStats.dailyLimit
                          ? "text-orange-400"
                          : "text-sidebar-foreground"
                      }`}>
                        {syncStats.syncsToday}/{syncStats.dailyLimit}
                      </span>
                    </div>
                    <div className="overflow-hidden" style={{ height: '0.5px', background: 'oklch(0.20 0.004 280)' }}>
                      <div
                        className="h-full transition-all"
                        style={{ width: `${Math.min(Math.round((syncStats.syncsToday / syncStats.dailyLimit) * 100), 100)}%`, background: syncStats.syncsToday >= syncStats.dailyLimit ? 'oklch(0.65 0.18 45)' : 'oklch(0.88 0.025 85 / 0.7)', borderRadius: 0 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          </SidebarContent>

          {/* Discord CTA */}
          {!isCollapsed && (
            <div className="mx-3 mb-2">
              <a
                href="https://discord.gg/RD8ZCtt7Y"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-3 py-2 transition-colors group"
                style={{ background: 'oklch(0.22 0.06 270 / 0.5)', border: '0.5px solid oklch(0.40 0.12 270 / 0.5)', borderRadius: 0 }}
              >
                <svg className="h-3.5 w-3.5 shrink-0" style={{ color: 'oklch(0.72 0.14 270)' }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 300, letterSpacing: '0.08em', textTransform: 'uppercase' }} className="text-sidebar-foreground/80 group-hover:text-sidebar-foreground transition-colors flex-1">
                  Join Discord
                </span>
                <ExternalLink className="h-3 w-3 text-sidebar-foreground/30 group-hover:text-sidebar-foreground/60 transition-colors shrink-0" />
              </a>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center mb-2">
              <a
                href="https://discord.gg/RD8ZCtt7Y"
                target="_blank"
                rel="noopener noreferrer"
                title="Join Discord"
                className="h-8 w-8 flex items-center justify-center transition-colors"
                style={{ border: '0.5px solid oklch(0.40 0.12 270 / 0.5)', borderRadius: 0 }}
              >
                <svg className="h-4 w-4" style={{ color: 'oklch(0.72 0.14 270)' }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
          )}
          {/* User footer */}
          <SidebarFooter className="p-3" style={{ borderTop: '0.5px solid oklch(0.16 0.004 280)' }}>
            {isCollapsed ? (
              /* Collapsed: just avatar + logout icon stacked */
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-7 w-7 border border-sidebar-border shrink-0">
                  <AvatarFallback className="text-xs font-semibold bg-primary/20 text-primary">
                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={logout}
                  className="h-7 w-7 flex items-center justify-center hover:bg-sidebar-accent/60 transition-colors focus:outline-none"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors" />
                </button>
              </div>
            ) : (
              /* Expanded: avatar + name/email + logout button */
              <div className="flex items-center gap-2.5 w-full">
                <Avatar className="h-8 w-8 border border-sidebar-border shrink-0">
                  <AvatarFallback className="text-xs font-semibold bg-primary/20 text-primary">
                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 400 }} className="truncate text-sidebar-foreground">
                    {user?.name ?? user?.email?.split('@')[0] ?? 'Account'}
                  </p>
                  {(user?.email) && (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.04em' }} className="text-sidebar-foreground/40 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-2 py-1 hover:bg-sidebar-accent/60 transition-colors focus:outline-none shrink-0"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase' }} className="text-sidebar-foreground/60">Sign out</span>
                </button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        {/* Resize handle */}
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => { if (!isCollapsed) setIsResizing(true); }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b border-border h-14 items-center justify-between bg-background/95 px-4 backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-8 w-8 rounded-lg" />
              <span className="font-medium text-sm">{activeLabel}</span>
            </div>
          </div>
        )}
        {/* Early-access banner — persistent during beta */}
        <EarlyAccessBanner />
        <main className="flex-1 p-6" style={{ overflowX: "hidden", minWidth: 0 }}>{children}</main>
      </SidebarInset>
    </>
  );
}
