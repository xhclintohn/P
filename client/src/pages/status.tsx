import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/status-dot";
import { BackButton } from "@/components/back-button";
import { apiCategories, BASE_API_URL } from "@/lib/endpoints";
import type { EndpointStatus, VisitorStats } from "@shared/schema";
import {
  Brain,
  Download,
  Shuffle,
  Wrench,
  Search,
  Info,
  Repeat,
  Activity,
  Zap,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Users,
  CalendarDays,
  Server,
  Wifi,
  Globe,
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";

const iconMap: Record<string, typeof Brain> = {
  brain: Brain,
  download: Download,
  shuffle: Shuffle,
  wrench: Wrench,
  search: Search,
  info: Info,
  repeat: Repeat,
  activity: Activity,
};

const categoryColors = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-green-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-blue-600",
  "from-teal-500 to-cyan-600",
  "from-red-500 to-pink-600",
];

export default function Status() {
  const {
    data: statusMap,
    isLoading: statusLoading,
    refetch: refetchStatus,
    dataUpdatedAt,
  } = useQuery<Record<string, EndpointStatus>>({
    queryKey: ["/api/endpoints/status"],
    refetchInterval: 30000,
  });

  const { data: visitorStats } = useQuery<VisitorStats>({
    queryKey: ["/api/visitors/stats"],
  });

  const allEndpoints = apiCategories.flatMap((c) => c.endpoints);
  const onlineCount = statusMap
    ? Object.values(statusMap).filter((s) => s.isOnline).length
    : 0;
  const offlineCount = statusMap
    ? Object.values(statusMap).filter((s) => !s.isOnline).length
    : 0;
  const totalEndpoints = allEndpoints.length;

  const overallHealthy = statusMap
    ? onlineCount / totalEndpoints > 0.8
    : null;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/endpoints/status"] });
    refetchStatus();
  };

  return (
    <div className="min-h-screen pt-16">
      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; opacity: 0; }
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
      `}</style>

      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-15" style={{ background: "linear-gradient(135deg, rgb(34 197 94), rgb(16 185 129))" }} />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full blur-[100px] opacity-10" style={{ background: "linear-gradient(135deg, rgb(59 130 246), rgb(99 102 241))" }} />
        </div>
        <div className="container mx-auto max-w-7xl px-4 relative">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <BackButton to="/" label="Home" />
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mt-4 mb-2 animate-fade-in-up" data-testid="text-status-title">
                System Status
              </h1>
              <p className="text-muted-foreground text-lg animate-fade-in-up animation-delay-100">
                Real-time monitoring of all API endpoints
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2 mt-6"
              onClick={handleRefresh}
              disabled={statusLoading}
              data-testid="button-refresh-status"
            >
              <RefreshCw
                className={`h-4 w-4 ${statusLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 pb-16">
        <Card className="p-6 md:p-8 mb-8 relative overflow-visible" data-testid="card-overall-status">
          <div className="flex items-center gap-5 mb-6 flex-wrap">
            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${overallHealthy === null ? "bg-muted" : overallHealthy ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20" : "bg-gradient-to-br from-red-500/20 to-orange-500/20"}`}>
                <StatusDot isOnline={overallHealthy} size="lg" />
              </div>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                {overallHealthy === null
                  ? "Checking systems..."
                  : overallHealthy
                    ? "All Systems Operational"
                    : "Some Systems Degraded"}
              </h2>
              {dataUpdatedAt && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1 flex-wrap">
                  <Clock className="h-3.5 w-3.5" />
                  Last checked:{" "}
                  {new Date(dataUpdatedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-md bg-muted/50">
              <Server className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">
                {totalEndpoints}
              </p>
              <p className="text-xs text-muted-foreground">Total Endpoints</p>
            </div>
            <div className="text-center p-4 rounded-md bg-muted/50">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-green-500">
                {statusMap ? onlineCount : "..."}
              </p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <div className="text-center p-4 rounded-md bg-muted/50">
              <XCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold text-red-500">
                {statusMap ? offlineCount : "..."}
              </p>
              <p className="text-xs text-muted-foreground">Offline</p>
            </div>
            <div className="text-center p-4 rounded-md bg-muted/50">
              <Wifi className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">
                {statusMap
                  ? `${Math.round((onlineCount / totalEndpoints) * 100)}%`
                  : "..."}
              </p>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8 mb-8 animate-fade-in-up animation-delay-100" data-testid="card-visitor-stats">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2 flex-wrap">
            <Eye className="h-5 w-5 text-primary" />
            Visitor Analytics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-md bg-muted/50">
              <Globe className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground" data-testid="text-total-views">
                {visitorStats?.totalVisits?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-muted-foreground">Total Page Views</p>
            </div>
            <div className="text-center p-4 rounded-md bg-muted/50">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground" data-testid="text-unique-visitors">
                {visitorStats?.uniqueVisitors?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-muted-foreground">Unique Visitors</p>
            </div>
            <div className="text-center p-4 rounded-md bg-muted/50">
              <CalendarDays className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground" data-testid="text-today-views">
                {visitorStats?.todayVisits?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-muted-foreground">Today's Views</p>
            </div>
          </div>
        </Card>

        {statusLoading && !statusMap && (
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <Card key={i} className="overflow-hidden">
                <div className="p-5 border-b border-border">
                  <div className="animate-pulse flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-md" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded-md" />
                      <div className="h-3 w-40 bg-muted rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {[1,2,3].map(j => (
                    <div key={j} className="animate-pulse flex items-center justify-between gap-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-muted rounded-full" />
                        <div className="h-4 w-32 bg-muted rounded-md" />
                      </div>
                      <div className="h-5 w-20 bg-muted rounded-md" />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {statusMap && (
          <div className="space-y-6">
            {apiCategories.map((category, catIndex) => {
              const Icon = iconMap[category.icon] || Zap;
              const catOnline = category.endpoints.filter(
                (ep) => statusMap?.[ep.path]?.isOnline
              ).length;
              const catTotal = category.endpoints.length;

              return (
                <Card
                  key={category.name}
                  className="overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${catIndex * 0.08}s` }}
                  data-testid={`card-status-${category.name.toLowerCase()}`}
                >
                  <div className="p-4 md:p-5 border-b border-border">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 bg-gradient-to-br ${categoryColors[catIndex % categoryColors.length]} rounded-md flex items-center justify-center`}
                        >
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {category.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {statusMap
                          ? `${catOnline}/${catTotal} online`
                          : `${catTotal} endpoints`}
                      </Badge>
                    </div>
                  </div>

                  <div className="divide-y divide-border">
                    {category.endpoints.map((endpoint, epIndex) => {
                      const epStatus = statusMap?.[endpoint.path];
                      const isOnline = epStatus?.isOnline ?? null;
                      const responseTime = epStatus?.responseTime;

                      return (
                        <div
                          key={epIndex}
                          className="px-4 md:px-5 py-3 flex items-center justify-between gap-3 transition-colors duration-150"
                          data-testid={`row-endpoint-${category.name.toLowerCase()}-${epIndex}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <StatusDot isOnline={isOnline} size="md" />
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">
                                {endpoint.name}
                              </p>
                              <code className="text-xs text-muted-foreground font-mono">
                                {endpoint.method} {endpoint.path}
                              </code>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {responseTime !== undefined && responseTime !== null && (
                              <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
                                {responseTime}ms
                              </span>
                            )}
                            <Badge
                              variant={
                                isOnline === null
                                  ? "secondary"
                                  : isOnline
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {isOnline === null
                                ? "Checking"
                                : isOnline
                                  ? "Operational"
                                  : "Down"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <footer className="border-t border-border py-8 px-4 mt-16">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Toxic-APIs</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built by{" "}
              <a
                href="https://github.com/xhclintohn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                xh_clintohn
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
