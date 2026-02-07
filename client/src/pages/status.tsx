import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/status-dot";
import { BackButton } from "@/components/back-button";
import { apiCategories, BASE_API_URL } from "@/lib/endpoints";
import type { EndpointStatus, VisitorStats } from "@shared/schema";
import {
  Brain, Download, Shuffle, Wrench, Search, Info, Repeat, Activity,
  Zap, RefreshCw, Clock, CheckCircle2, XCircle, Eye, Users,
  CalendarDays, Server, Wifi, Globe,
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";

const iconMap: Record<string, typeof Brain> = {
  brain: Brain, download: Download, shuffle: Shuffle, wrench: Wrench,
  search: Search, info: Info, repeat: Repeat, activity: Activity,
};

const categoryIconBg = [
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  "bg-red-500/10 text-red-600 dark:text-red-400",
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
  const onlineCount = statusMap ? Object.values(statusMap).filter((s) => s.isOnline).length : 0;
  const offlineCount = statusMap ? Object.values(statusMap).filter((s) => !s.isOnline).length : 0;
  const totalEndpoints = allEndpoints.length;
  const overallHealthy = statusMap ? onlineCount / totalEndpoints > 0.8 : null;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/endpoints/status"] });
    refetchStatus();
  };

  return (
    <div className="min-h-screen pt-16">
      <section className="py-10 md:py-14 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <BackButton to="/" label="Home" />
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mt-3 mb-1 anim-up" data-testid="text-status-title">
                System Status
              </h1>
              <p className="text-sm text-muted-foreground anim-up d1">
                Real-time monitoring of all API endpoints
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 mt-6"
              onClick={handleRefresh}
              disabled={statusLoading}
              data-testid="button-refresh-status"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${statusLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 pb-16">
        <Card className="p-5 md:p-6 mb-6 anim-up d1" data-testid="card-overall-status">
          <div className="flex items-center gap-4 mb-5 flex-wrap">
            <div className={`w-12 h-12 rounded-md flex items-center justify-center ${overallHealthy === null ? "bg-muted" : overallHealthy ? "bg-green-500/10" : "bg-red-500/10"}`}>
              <StatusDot isOnline={overallHealthy} size="lg" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                {overallHealthy === null ? "Checking systems..." : overallHealthy ? "All Systems Operational" : "Some Systems Degraded"}
              </h2>
              {dataUpdatedAt && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 flex-wrap">
                  <Clock className="h-3 w-3" />
                  Last checked: {new Date(dataUpdatedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Server, label: "Total", value: totalEndpoints, color: "text-primary" },
              { icon: CheckCircle2, label: "Online", value: statusMap ? onlineCount : "...", color: "text-green-500" },
              { icon: XCircle, label: "Offline", value: statusMap ? offlineCount : "...", color: "text-red-500" },
              { icon: Wifi, label: "Uptime", value: statusMap ? `${Math.round((onlineCount / totalEndpoints) * 100)}%` : "...", color: "text-primary" },
            ].map((item, i) => (
              <div key={i} className="text-center p-3 rounded-md bg-muted/50">
                <item.icon className={`h-5 w-5 mx-auto mb-1.5 ${item.color}`} />
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 md:p-6 mb-6 anim-up d2" data-testid="card-visitor-stats">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2 flex-wrap">
            <Eye className="h-4 w-4 text-primary" />
            Visitor Analytics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Globe, label: "Total Views", value: visitorStats?.totalVisits?.toLocaleString() || "0", testId: "text-total-views" },
              { icon: Users, label: "Unique Visitors", value: visitorStats?.uniqueVisitors?.toLocaleString() || "0", testId: "text-unique-visitors" },
              { icon: CalendarDays, label: "Today", value: visitorStats?.todayVisits?.toLocaleString() || "0", testId: "text-today-views" },
            ].map((item, i) => (
              <div key={i} className="text-center p-3 rounded-md bg-muted/50">
                <item.icon className="h-5 w-5 mx-auto mb-1.5 text-primary" />
                <p className="text-xl font-bold text-foreground" data-testid={item.testId}>{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {statusLoading && !statusMap && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <div className="p-4 border-b border-border">
                  <div className="animate-pulse flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-md" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-24 bg-muted rounded-md" />
                      <div className="h-3 w-40 bg-muted rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="animate-pulse flex items-center justify-between gap-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted rounded-full" />
                        <div className="h-3 w-28 bg-muted rounded-md" />
                      </div>
                      <div className="h-5 w-16 bg-muted rounded-md" />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {statusMap && (
          <div className="space-y-4">
            {apiCategories.map((category, catIndex) => {
              const Icon = iconMap[category.icon] || Zap;
              const catOnline = category.endpoints.filter((ep) => statusMap?.[ep.path]?.isOnline).length;
              const catTotal = category.endpoints.length;

              return (
                <Card
                  key={category.name}
                  className="anim-up overflow-visible"
                  style={{ animationDelay: `${catIndex * 0.06}s` }}
                  data-testid={`card-status-${category.name.toLowerCase()}`}
                >
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${categoryIconBg[catIndex % categoryIconBg.length]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">{category.name}</h3>
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {catOnline}/{catTotal} online
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
                          className="px-4 py-2.5 flex items-center justify-between gap-3"
                          data-testid={`row-endpoint-${category.name.toLowerCase()}-${epIndex}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <StatusDot isOnline={isOnline} size="sm" />
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">{endpoint.name}</p>
                              <code className="text-[11px] text-muted-foreground font-mono">{endpoint.method} {endpoint.path}</code>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {responseTime != null && (
                              <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">{responseTime}ms</span>
                            )}
                            <Badge
                              variant={isOnline === null ? "secondary" : isOnline ? "secondary" : "destructive"}
                              className="text-[11px]"
                            >
                              {isOnline === null ? "Checking" : isOnline ? "Operational" : "Down"}
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

      <footer className="border-t border-border py-6 px-4 mt-8">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">Toxic-APIs</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Built by{" "}
              <a href="https://github.com/xhclintohn" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                xh_clintohn
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
