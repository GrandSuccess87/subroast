import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  PanelLeft,
  Settings,
  Sparkles,
  Zap,
  Clock,
  CreditCard,
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
      { icon: CalendarClock, label: "Schedule Post", path: "/dashboard/schedule" },
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
    ],
  },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 200;
const MAX_WIDTH = 320;

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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663208942813/BEbgHhBeLfKnEwiD.png"
            alt="SubRoast"
            className="w-10 h-10 rounded-xl object-cover"
          />
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in to SubRoast</h1>
            <p className="text-sm text-muted-foreground max-w-sm">
              Connect your account to start drafting smarter Reddit posts.
            </p>
          </div>
          <Button onClick={() => { window.location.href = getLoginUrl(); }} size="lg" className="w-full">
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
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

  const { data: rateLimits } = trpc.reddit.getRateLimitStatus.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  const { data: subStatus } = trpc.subscription.getStatus.useQuery(undefined, {
    refetchInterval: 5 * 60_000,
  });

  const postsUsed = rateLimits?.postsToday ?? 0;
  const postsMax = rateLimits?.maxPostsPerDay ?? 5;
  const dmsUsed = rateLimits?.dmsToday ?? 0;
  const dmsMax = rateLimits?.maxDmsPerDay ?? 25;
  const postPct = Math.round((postsUsed / postsMax) * 100);
  const dmPct = Math.round((dmsUsed / dmsMax) * 100);

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
                    src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663208942813/BEbgHhBeLfKnEwiD.png"
                    alt="SubRoast"
                    className="w-6 h-6 rounded-md shrink-0 object-cover"
                  />
                  <span className="font-bold tracking-tight text-sidebar-foreground truncate text-sm">
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
                          className="h-9 font-normal transition-all"
                        >
                          <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                          <span>{item.label}</span>
                          {isActive && !isCollapsed && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </div>
            ))}
          </SidebarContent>

          {/* Usage widget */}
          {!isCollapsed && (
            <div className="mx-3 mb-3 p-3 rounded-lg bg-sidebar-accent border border-sidebar-border">
              <div className="flex items-center gap-1.5 mb-2.5">
                <BarChart2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-semibold text-sidebar-foreground">Today's Usage</span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-sidebar-foreground/50">Posts</span>
                    <span className={`font-medium ${postPct >= 80 ? "text-amber-400" : "text-sidebar-foreground"}`}>
                      {postsUsed}/{postsMax}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-sidebar-border overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${postPct >= 80 ? "bg-amber-400" : "bg-primary"}`}
                      style={{ width: `${Math.max(postPct, 2)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-sidebar-foreground/50">DMs</span>
                    <span className={`font-medium ${dmPct >= 80 ? "text-amber-400" : "text-sidebar-foreground"}`}>
                      {dmsUsed}/{dmsMax}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-sidebar-border overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${dmPct >= 80 ? "bg-amber-400" : "bg-primary"}`}
                      style={{ width: `${Math.max(dmPct, 2)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User footer */}
          <SidebarFooter className="p-3 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-sidebar-accent/60 transition-colors w-full text-left focus:outline-none">
                  <Avatar className="h-7 w-7 border border-sidebar-border shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-primary/20 text-primary">
                      {user?.name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-sidebar-foreground">{user?.name ?? "User"}</p>
                      {user?.email && (
                        <p className="text-[11px] text-sidebar-foreground/40 truncate">{user.email}</p>
                      )}
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        {/* Trial banner */}
        {subStatus?.isTrialing && subStatus.trialDaysLeft !== undefined && subStatus.trialDaysLeft <= 3 && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                {subStatus.trialDaysLeft === 0
                  ? "Your free trial expires today!"
                  : `Your free trial expires in ${subStatus.trialDaysLeft} day${subStatus.trialDaysLeft !== 1 ? "s" : ""}.`}
              </span>
            </div>
            <button
              onClick={() => setLocation("/pricing")}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Upgrade now
            </button>
          </div>
        )}
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
