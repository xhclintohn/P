import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { StatusDot } from "./status-dot";
import type { EndpointStatus } from "@shared/schema";
import {
  Zap,
  BookOpen,
  Activity,
  Github,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";

export function Navbar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: statusMap } = useQuery<Record<string, EndpointStatus>>({
    queryKey: ["/api/endpoints/status"],
    refetchInterval: 60000,
  });

  const overallOnline = useMemo(() => {
    if (!statusMap) return null;
    const statuses = Object.values(statusMap);
    if (statuses.length === 0) return null;
    const onlineCount = statuses.filter((s) => s.isOnline).length;
    return onlineCount / statuses.length > 0.5;
  }, [statusMap]);

  const navLinks = [
    { label: "Docs", href: "/docs", icon: BookOpen },
    { label: "Status", href: "/status", icon: Activity },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 dark:bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex items-center justify-between gap-4 h-16">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl"
            data-testid="link-home-logo"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-foreground">
              Toxic<span className="text-primary">-APIs</span>
            </span>
            <StatusDot isOnline={overallOnline} size="sm" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Button
                  variant={location === link.href ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-1.5"
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
            <a
              href="https://github.com/xhclintohn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                data-testid="link-nav-github"
              >
                <Github className="h-4 w-4" />
                GitHub
              </Button>
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex md:hidden items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle-mobile"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Button
                  variant={location === link.href ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setMobileOpen(false)}
                  data-testid={`link-mobile-${link.label.toLowerCase()}`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
            <a
              href="https://github.com/xhclintohn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                data-testid="link-mobile-github"
              >
                <Github className="h-4 w-4" />
                GitHub
              </Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
