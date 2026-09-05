import { createRootRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { ClipboardPlus, LayoutDashboard, TriangleAlert, LogOut } from "lucide-react";
import { useCallback } from "react";

function GhavNavLogo() {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="6" cy="16" r="3" fill="#0a0a0a" />
        <circle cx="12" cy="7" r="3" fill="#0a0a0a" />
        <circle cx="18" cy="16" r="3" fill="#0a0a0a" />
        <path d="M18 16 C18 16, 18 20, 12 20" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight text-[#0a0a0a]">ghav labs</span>
    </span>
  );
}

function NavLink({
  to,
  children,
  icon: Icon,
}: {
  to: string;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const routerState = useRouterState();
  const isActive =
    routerState.location.pathname === to || (to !== "/dashboard" && routerState.location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
        isActive
          ? "text-[#0a0a0a] font-semibold border-b-2 border-[#0a0a0a]"
          : "text-[#737373] font-medium hover:text-[#0a0a0a]"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}

/** Routes that don't show the app nav bar */
const STANDALONE_ROUTES = ["/", "/login", "/my-wounds", "/pricing", "/slides"];

function RootLayout() {
  const routerState = useRouterState();
  const navigate = useNavigate();
  const pathname = routerState.location.pathname;

  const isStandalone = STANDALONE_ROUTES.includes(pathname);
  const userName = typeof window !== "undefined" ? localStorage.getItem("woundwise-user") : null;

  const handleSignOut = useCallback(() => {
    localStorage.removeItem("woundwise-auth");
    localStorage.removeItem("woundwise-user");
    localStorage.removeItem("woundwise-role");
    localStorage.removeItem("woundwise-nhs");
    void navigate({ to: "/" });
  }, [navigate]);

  // Standalone pages render without the app chrome
  if (isStandalone) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-[#e5e5e5] px-6 py-3 flex items-center gap-8">
        <Link to="/dashboard" className="flex items-center gap-2 mr-2">
          <GhavNavLogo />
        </Link>
        <div className="flex items-center gap-1">
          <NavLink to="/dashboard" icon={LayoutDashboard}>
            Dashboard
          </NavLink>
          <NavLink to="/triage" icon={TriangleAlert}>
            Triage
          </NavLink>
          <NavLink to="/assess" icon={ClipboardPlus}>
            New Assessment
          </NavLink>
        </div>

        {/* User / Sign Out */}
        <div className="ml-auto flex items-center gap-4">
          {userName && <span className="text-sm text-[#0a0a0a] font-medium hidden sm:inline">{userName}</span>}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-[#737373] hover:text-[#0a0a0a] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export const Route = createRootRoute({ component: RootLayout });
