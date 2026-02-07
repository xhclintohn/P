import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatusDot } from "@/components/status-dot";
import { BackButton } from "@/components/back-button";
import { apiCategories, BASE_API_URL, getTotalEndpoints } from "@/lib/endpoints";
import type { EndpointStatus } from "@shared/schema";
import {
  Brain,
  Download,
  Shuffle,
  Wrench,
  Search,
  Info,
  Repeat,
  Activity,
  ChevronDown,
  ChevronUp,
  Play,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  Loader2,
  Zap,
  ArrowLeft,
  X,
  FileSearch,
  Code2,
} from "lucide-react";

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

function extractParams(path: string): string[] {
  const matches = path.match(/[?&]([^=]+)=/g);
  if (!matches) return [];
  return matches.map((m) => m.replace(/[?&]/g, "").replace("=", ""));
}

export default function Docs() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const categoryFromUrl = searchParams.get("category");

  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categoryFromUrl
  );
  const [expandedEndpoints, setExpandedEndpoints] = useState<
    Record<string, boolean>
  >({});
  const [testParams, setTestParams] = useState<
    Record<string, Record<string, string>>
  >({});
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; data: any; isImage?: boolean; imageUrl?: string }>
  >({});
  const [testLoading, setTestLoading] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: statusMap } = useQuery<Record<string, EndpointStatus>>({
    queryKey: ["/api/endpoints/status"],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedCategory]);

  const filteredCategories = useMemo(() => {
    if (!searchInput && !selectedCategory) return apiCategories;

    return apiCategories
      .filter((cat) => {
        if (selectedCategory && cat.name !== selectedCategory) return false;
        return true;
      })
      .map((cat) => ({
        ...cat,
        endpoints: cat.endpoints.filter(
          (ep) =>
            !searchInput ||
            ep.name.toLowerCase().includes(searchInput.toLowerCase()) ||
            ep.desc.toLowerCase().includes(searchInput.toLowerCase()) ||
            ep.path.toLowerCase().includes(searchInput.toLowerCase())
        ),
      }))
      .filter((cat) => cat.endpoints.length > 0);
  }, [searchInput, selectedCategory]);

  const totalShown = filteredCategories.reduce(
    (sum, cat) => sum + cat.endpoints.length,
    0
  );

  const toggleEndpoint = useCallback((key: string) => {
    setExpandedEndpoints((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  }, []);

  const handleTest = useCallback(
    async (
      endpoint: { path: string; example?: string },
      key: string
    ) => {
      setTestLoading((prev) => ({ ...prev, [key]: true }));
      setTestResults((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });

      try {
        const params = testParams[key] || {};
        const queryParts: string[] = [`path=${encodeURIComponent(endpoint.path)}`];
        Object.entries(params).forEach(([paramKey, value]) => {
          if (value) queryParts.push(`${paramKey}=${encodeURIComponent(value)}`);
        });
        const proxyUrl = "/api/proxy?" + queryParts.join("&");

        const response = await fetch(proxyUrl);
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.startsWith("image/")) {
          const blob = await response.blob();
          setTestResults((prev) => ({
            ...prev,
            [key]: {
              success: response.ok,
              data: null,
              imageUrl: URL.createObjectURL(blob),
              isImage: true,
            },
          }));
        } else {
          const data = await response.json();
          setTestResults((prev) => ({
            ...prev,
            [key]: { success: response.ok, data, isImage: false },
          }));
        }
      } catch (error: any) {
        setTestResults((prev) => ({
          ...prev,
          [key]: {
            success: false,
            data: { error: error.message },
            isImage: false,
          },
        }));
      } finally {
        setTestLoading((prev) => ({ ...prev, [key]: false }));
      }
    },
    [testParams]
  );

  const clearTest = useCallback((key: string) => {
    setTestParams((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
    setTestResults((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  }, []);

  const updateTestParam = useCallback(
    (endpointKey: string, paramName: string, value: string) => {
      setTestParams((prev) => ({
        ...prev,
        [endpointKey]: { ...(prev[endpointKey] || {}), [paramName]: value },
      }));
    },
    []
  );

  const getEndpointStatus = (path: string): boolean | null => {
    if (!statusMap) return null;
    const status = statusMap[path];
    return status ? status.isOnline : null;
  };

  return (
    <div className="min-h-screen pt-16">
      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; opacity: 0; }
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .expand-content { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s ease-out; }
        .expand-content.expanded { grid-template-rows: 1fr; }
        .expand-inner { overflow: hidden; }
      `}</style>

      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-15" style={{ background: "linear-gradient(135deg, rgb(34 197 94), rgb(16 185 129))" }} />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full blur-[100px] opacity-10" style={{ background: "linear-gradient(135deg, rgb(59 130 246), rgb(99 102 241))" }} />
        </div>
        <div className="container mx-auto max-w-7xl px-4 relative">
          <BackButton to="/" label="Home" />
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mt-4 mb-2 animate-fade-in-up" data-testid="text-docs-title">
            API Documentation
          </h1>
          <p className="text-muted-foreground text-lg animate-fade-in-up animation-delay-100">
            {getTotalEndpoints()} endpoints across {apiCategories.length} categories
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 pb-16" ref={contentRef}>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-20">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 hidden lg:block">
                Categories
              </h3>
              <div className="flex lg:flex-col flex-nowrap overflow-x-auto gap-1.5 pb-2 lg:pb-0" style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
                <Button
                  variant={selectedCategory === null ? "secondary" : "ghost"}
                  size="sm"
                  className="justify-start gap-2 flex-shrink-0"
                  onClick={() => setSelectedCategory(null)}
                  data-testid="button-category-all"
                >
                  <Zap className="h-4 w-4" />
                  All ({getTotalEndpoints()})
                </Button>
                {apiCategories.map((cat, i) => {
                  const Icon = iconMap[cat.icon] || Zap;
                  return (
                    <Button
                      key={cat.name}
                      variant={
                        selectedCategory === cat.name ? "secondary" : "ghost"
                      }
                      size="sm"
                      className="justify-start gap-2 flex-shrink-0"
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === cat.name ? null : cat.name
                        )
                      }
                      data-testid={`button-category-${cat.name.toLowerCase()}`}
                    >
                      <Icon className="h-4 w-4" />
                      {cat.name} ({cat.endpoints.length})
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search endpoints by name, description, or path..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 transition-shadow duration-200 focus:ring-2 focus:ring-primary/30"
                data-testid="input-search"
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchInput("")}
                  data-testid="button-clear-search"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {searchInput && (
              <p className="text-sm text-muted-foreground mb-4 animate-fade-in-up">
                Found {totalShown} endpoint{totalShown !== 1 ? "s" : ""} matching
                &quot;{searchInput}&quot;
              </p>
            )}

            {!statusMap && (
              <div className="space-y-3 mb-8">
                {[1,2,3].map(i => (
                  <Card key={i} className="p-5">
                    <div className="animate-pulse space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        <div className="h-5 w-12 bg-muted rounded-md" />
                        <div className="h-5 w-32 bg-muted rounded-md" />
                      </div>
                      <div className="h-4 w-48 bg-muted rounded-md" />
                      <div className="h-3 w-64 bg-muted rounded-md" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {statusMap && filteredCategories.length === 0 && (
              <div className="text-center py-16 animate-fade-in-up">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileSearch className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No endpoints found</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Try adjusting your search or selecting a different category.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={() => { setSearchInput(""); setSelectedCategory(null); }}
                  data-testid="button-reset-filters"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Filters
                </Button>
              </div>
            )}

            {statusMap && (
              <div className="space-y-8">
                {filteredCategories.map((category, catIndex) => {
                  const Icon = iconMap[category.icon] || Zap;
                  return (
                    <div key={category.name} className="animate-fade-in-up" style={{ animationDelay: `${catIndex * 0.05}s` }} data-testid={`section-category-${category.name.toLowerCase()}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-8 h-8 bg-gradient-to-br ${categoryColors[apiCategories.findIndex((c) => c.name === category.name) % categoryColors.length]} rounded-md flex items-center justify-center`}
                        >
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-foreground">
                            {category.name}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {category.endpoints.map((endpoint, epIndex) => {
                          const key = `${category.name}-${epIndex}`;
                          const isExpanded = expandedEndpoints[key] || false;
                          const params = extractParams(endpoint.path);
                          const needsParam =
                            !!endpoint.example || params.length > 0;
                          const result = testResults[key];
                          const isLoading = testLoading[key] || false;
                          const epStatus = getEndpointStatus(endpoint.path);

                          return (
                            <Card
                              key={key}
                              className={`transition-all duration-200 ${isExpanded ? "ring-1 ring-primary/30" : ""}`}
                              data-testid={`card-endpoint-${key}`}
                            >
                              <div
                                className="p-4 md:p-5 cursor-pointer hover-elevate"
                                onClick={() => toggleEndpoint(key)}
                                data-testid={`button-toggle-${key}`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                      <Badge
                                        variant="secondary"
                                        className={`text-xs font-mono ${endpoint.method === "GET" ? "bg-green-500/15 text-green-500 dark:text-green-400" : "bg-blue-500/15 text-blue-500 dark:text-blue-400"}`}
                                      >
                                        {endpoint.method}
                                      </Badge>
                                      <code className="text-xs text-muted-foreground break-all font-mono">
                                        {endpoint.path}
                                      </code>
                                      <StatusDot
                                        isOnline={epStatus}
                                        size="sm"
                                      />
                                    </div>
                                    <h3 className="font-semibold text-foreground">
                                      {endpoint.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                      {endpoint.desc}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0 mt-1">
                                    <div className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className={`expand-content ${isExpanded ? "expanded" : ""}`}>
                                <div className="expand-inner">
                                  <div className="border-t border-border bg-muted/30">
                                    <div className="p-4 md:p-5 space-y-4">
                                      <div className="flex items-center gap-2 text-primary">
                                        <Code2 className="h-4 w-4" />
                                        <h4 className="font-bold text-sm uppercase tracking-wider">
                                          Try It Out
                                        </h4>
                                      </div>

                                      <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="secondary" className="text-xs font-mono">
                                          {endpoint.method}
                                        </Badge>
                                        <code className="text-xs text-muted-foreground font-mono break-all">
                                          {BASE_API_URL}{endpoint.path}
                                        </code>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleCopy(`${BASE_API_URL}${endpoint.path}`, `url-${key}`)}
                                          data-testid={`button-copy-${key}`}
                                        >
                                          {copied === `url-${key}` ? (
                                            <Check className="h-3.5 w-3.5 text-green-500" />
                                          ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                          )}
                                        </Button>
                                      </div>

                                      {needsParam && (
                                        <div className="space-y-3">
                                          <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <h5 className="text-sm font-medium text-foreground">
                                              Parameters
                                            </h5>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => clearTest(key)}
                                              className="gap-1 text-xs"
                                              data-testid={`button-clear-${key}`}
                                            >
                                              <RotateCcw className="h-3 w-3" />
                                              Clear
                                            </Button>
                                          </div>
                                          {params.length > 0 ? (
                                            params.map((param) => (
                                              <div key={`${key}-${param}`} className="space-y-1.5">
                                                <label className="block text-xs font-medium text-muted-foreground">
                                                  {param}{" "}
                                                  <span className="text-red-500">
                                                    *
                                                  </span>
                                                </label>
                                                <Input
                                                  placeholder={
                                                    endpoint.example ||
                                                    `Enter ${param}...`
                                                  }
                                                  value={
                                                    testParams[key]?.[param] || ""
                                                  }
                                                  onChange={(e) =>
                                                    updateTestParam(
                                                      key,
                                                      param,
                                                      e.target.value
                                                    )
                                                  }
                                                  className="text-sm"
                                                  data-testid={`input-param-${key}-${param}`}
                                                />
                                              </div>
                                            ))
                                          ) : (
                                            <div className="space-y-1.5">
                                              <label className="block text-xs font-medium text-muted-foreground">
                                                value{" "}
                                                <span className="text-red-500">
                                                  *
                                                </span>
                                              </label>
                                              <Input
                                                placeholder={
                                                  endpoint.example ||
                                                  "Enter value..."
                                                }
                                                value={
                                                  testParams[key]?.["value"] || ""
                                                }
                                                onChange={(e) =>
                                                  updateTestParam(
                                                    key,
                                                    "value",
                                                    e.target.value
                                                  )
                                                }
                                                className="text-sm"
                                                data-testid={`input-param-${key}-value`}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      <div className="flex gap-2 flex-wrap">
                                        <Button
                                          onClick={() => handleTest(endpoint, key)}
                                          disabled={isLoading}
                                          className="gap-2"
                                          data-testid={`button-execute-${key}`}
                                        >
                                          {isLoading ? (
                                            <>
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                              Executing...
                                            </>
                                          ) : (
                                            <>
                                              <Play className="h-4 w-4" />
                                              Execute
                                            </>
                                          )}
                                        </Button>
                                        <a
                                          href={`${BASE_API_URL}${endpoint.path}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <Button
                                            variant="outline"
                                            className="gap-2"
                                            data-testid={`button-open-${key}`}
                                          >
                                            <ExternalLink className="h-4 w-4" />
                                            Open in Browser
                                          </Button>
                                        </a>
                                      </div>

                                      {isLoading && (
                                        <div className="flex items-center gap-3 p-4 rounded-md bg-muted/50">
                                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                          <div>
                                            <p className="text-sm font-medium text-foreground">
                                              Fetching response...
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              Please wait
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      {result && !isLoading && (
                                        <div className={`rounded-md overflow-hidden border ${result.success ? "border-green-500/30" : "border-red-500/30"}`}>
                                          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
                                            <StatusDot isOnline={result.success} size="sm" />
                                            <span className={`font-semibold text-sm ${result.success ? "text-green-500" : "text-red-500"}`}>
                                              {result.success ? "200 OK" : "Error"}
                                            </span>
                                          </div>
                                          <div className="p-4 bg-gray-950 dark:bg-gray-950">
                                            {result.isImage && result.imageUrl ? (
                                              <img
                                                src={result.imageUrl}
                                                alt="API Response"
                                                className="max-w-full h-auto rounded-md"
                                              />
                                            ) : (
                                              <pre className="text-xs text-green-400 overflow-x-auto font-mono leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap">
                                                {JSON.stringify(
                                                  result.data,
                                                  null,
                                                  2
                                                )}
                                              </pre>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
