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
  Brain, Download, Shuffle, Wrench, Search, Info, Repeat, Activity,
  ChevronDown, Play, Copy, Check, ExternalLink, RotateCcw, Loader2,
  Zap, X, FileSearch, Code2, Globe, Terminal,
} from "lucide-react";

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

function extractParams(path: string): string[] {
  const matches = path.match(/[?&]([^=]+)=/g);
  if (!matches) return [];
  return matches.map((m) => m.replace(/[?&]/g, "").replace("=", ""));
}

function generateCodeExamples(endpoint: { path: string; method: string; name: string }, params: Record<string, string>) {
  const queryParams = Object.entries(params).filter(([, v]) => v);
  let fullUrl = `${BASE_API_URL}${endpoint.path}`;
  if (queryParams.length > 0) {
    const basePath = endpoint.path.split("?")[0];
    const qs = queryParams.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    fullUrl = `${BASE_API_URL}${basePath}?${qs}`;
  }

  const js = `const response = await fetch('${fullUrl}');
const data = await response.json();
console.log(data);`;

  const python = `import requests

response = requests.get('${fullUrl}')
print(response.json())`;

  const curl = `curl -X ${endpoint.method} "${fullUrl}"`;

  return { js, python, curl, fullUrl };
}

export default function Docs() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const categoryFromUrl = searchParams.get("category");

  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({});
  const [testParams, setTestParams] = useState<Record<string, Record<string, string>>>({});
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; data: any; isImage?: boolean; imageUrl?: string }>>({});
  const [testLoading, setTestLoading] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState("");
  const [codeTab, setCodeTab] = useState<Record<string, number>>({});
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: statusMap } = useQuery<Record<string, EndpointStatus>>({
    queryKey: ["/api/endpoints/status"],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (categoryFromUrl) setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedCategory]);

  const filteredCategories = useMemo(() => {
    if (!searchInput && !selectedCategory) return apiCategories;
    return apiCategories
      .filter((cat) => !selectedCategory || cat.name === selectedCategory)
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

  const totalShown = filteredCategories.reduce((sum, cat) => sum + cat.endpoints.length, 0);

  const toggleEndpoint = useCallback((key: string) => {
    setExpandedEndpoints((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  }, []);

  const handleTest = useCallback(
    async (endpoint: { path: string; example?: string }, key: string) => {
      setTestLoading((prev) => ({ ...prev, [key]: true }));
      setTestResults((prev) => { const n = { ...prev }; delete n[key]; return n; });

      try {
        const params = testParams[key] || {};
        const basePath = endpoint.path.split("?")[0];
        const queryParts: string[] = [`path=${encodeURIComponent(basePath)}`];
        Object.entries(params).forEach(([paramKey, value]) => {
          if (value) queryParts.push(`${paramKey}=${encodeURIComponent(value)}`);
        });
        const proxyUrl = "/api/proxy?" + queryParts.join("&");
        const response = await fetch(proxyUrl);
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.startsWith("image/")) {
          const blob = await response.blob();
          setTestResults((prev) => ({ ...prev, [key]: { success: response.ok, data: null, imageUrl: URL.createObjectURL(blob), isImage: true } }));
        } else {
          const data = await response.json();
          setTestResults((prev) => ({ ...prev, [key]: { success: response.ok, data, isImage: false } }));
        }
      } catch (error: any) {
        setTestResults((prev) => ({ ...prev, [key]: { success: false, data: { error: error.message }, isImage: false } }));
      } finally {
        setTestLoading((prev) => ({ ...prev, [key]: false }));
      }
    },
    [testParams]
  );

  const clearTest = useCallback((key: string) => {
    setTestParams((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setTestResults((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  const updateTestParam = useCallback((endpointKey: string, paramName: string, value: string) => {
    setTestParams((prev) => ({ ...prev, [endpointKey]: { ...(prev[endpointKey] || {}), [paramName]: value } }));
  }, []);

  const getEndpointStatus = (path: string): boolean | null => {
    if (!statusMap) return null;
    const basePath = path.split("?")[0];
    const status = statusMap[basePath];
    return status ? status.isOnline : null;
  };

  return (
    <div className="min-h-screen pt-16">
      <section className="py-10 md:py-14 px-4">
        <div className="container mx-auto max-w-5xl">
          <BackButton to="/" label="Home" />
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mt-3 mb-1 anim-up" data-testid="text-docs-title">
            API Documentation
          </h1>
          <p className="text-sm text-muted-foreground anim-up d1">
            {getTotalEndpoints()} endpoints across {apiCategories.length} categories
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 pb-16" ref={contentRef}>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-56 flex-shrink-0">
            <div className="lg:sticky lg:top-20">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 hidden lg:block">
                Categories
              </h3>
              <div className="flex lg:flex-col flex-nowrap overflow-x-auto gap-1 pb-2 lg:pb-0" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
                <Button
                  variant={selectedCategory === null ? "secondary" : "ghost"}
                  size="sm"
                  className="justify-start gap-1.5 flex-shrink-0 text-xs"
                  onClick={() => setSelectedCategory(null)}
                  data-testid="button-category-all"
                >
                  <Zap className="h-3.5 w-3.5" />
                  All ({getTotalEndpoints()})
                </Button>
                {apiCategories.map((cat) => {
                  const Icon = iconMap[cat.icon] || Zap;
                  return (
                    <Button
                      key={cat.name}
                      variant={selectedCategory === cat.name ? "secondary" : "ghost"}
                      size="sm"
                      className="justify-start gap-1.5 flex-shrink-0 text-xs"
                      onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                      data-testid={`button-category-${cat.name.toLowerCase()}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {cat.name} ({cat.endpoints.length})
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search endpoints..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
              {searchInput && (
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setSearchInput("")} data-testid="button-clear-search">
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {searchInput && (
              <p className="text-xs text-muted-foreground mb-4 anim-up">
                Found {totalShown} endpoint{totalShown !== 1 ? "s" : ""} matching &quot;{searchInput}&quot;
              </p>
            )}

            {!statusMap && (
              <div className="space-y-3 mb-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <div className="animate-pulse space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        <div className="h-5 w-10 bg-muted rounded-md" />
                        <div className="h-5 w-28 bg-muted rounded-md" />
                      </div>
                      <div className="h-4 w-40 bg-muted rounded-md" />
                      <div className="h-3 w-56 bg-muted rounded-md" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {statusMap && filteredCategories.length === 0 && (
              <div className="text-center py-16 anim-up">
                <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center mx-auto mb-3">
                  <FileSearch className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">No endpoints found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Try adjusting your search or selecting a different category.
                </p>
                <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => { setSearchInput(""); setSelectedCategory(null); }} data-testid="button-reset-filters">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </div>
            )}

            {statusMap && (
              <div className="space-y-8">
                {filteredCategories.map((category, catIndex) => {
                  const Icon = iconMap[category.icon] || Zap;
                  const originalIndex = apiCategories.findIndex((c) => c.name === category.name);
                  return (
                    <div key={category.name} className="anim-up" style={{ animationDelay: `${catIndex * 0.04}s` }} data-testid={`section-category-${category.name.toLowerCase()}`}>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${categoryIconBg[originalIndex % categoryIconBg.length]}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-foreground">{category.name}</h2>
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {category.endpoints.map((endpoint, epIndex) => {
                          const key = `${category.name}-${epIndex}`;
                          const isExpanded = expandedEndpoints[key] || false;
                          const params = extractParams(endpoint.path);
                          const needsParam = !!endpoint.example || params.length > 0;
                          const result = testResults[key];
                          const isLoading = testLoading[key] || false;
                          const epStatus = getEndpointStatus(endpoint.path);
                          const currentCodeTab = codeTab[key] || 0;
                          const codeExamples = generateCodeExamples(endpoint, testParams[key] || {});

                          return (
                            <Card key={key} className={`transition-all duration-200 overflow-visible ${isExpanded ? "ring-1 ring-primary/20" : ""}`} data-testid={`card-endpoint-${key}`}>
                              <div className="p-3.5 md:p-4 cursor-pointer hover-elevate" onClick={() => toggleEndpoint(key)} data-testid={`button-toggle-${key}`}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                      <Badge variant="secondary" className={`text-[11px] font-mono px-1.5 ${endpoint.method === "GET" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"}`}>
                                        {endpoint.method}
                                      </Badge>
                                      <code className="text-[11px] text-muted-foreground break-all font-mono">{endpoint.path}</code>
                                      <StatusDot isOnline={epStatus} size="sm" />
                                    </div>
                                    <h3 className="font-semibold text-sm text-foreground">{endpoint.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">{endpoint.desc}</p>
                                  </div>
                                  <div className="flex-shrink-0 mt-0.5">
                                    <div className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className={`expand-content ${isExpanded ? "expanded" : ""}`}>
                                <div className="expand-inner">
                                  <div className="border-t border-border">
                                    <div className="p-3.5 md:p-4 space-y-4">
                                      <div className="flex items-center gap-1.5 text-primary">
                                        <Code2 className="h-3.5 w-3.5" />
                                        <h4 className="font-bold text-xs uppercase tracking-wider">Try It Out</h4>
                                      </div>

                                      <div className="flex items-center gap-1.5 flex-wrap rounded-md bg-muted/50 p-2.5">
                                        <Badge variant="secondary" className="text-[11px] font-mono">{endpoint.method}</Badge>
                                        <code className="text-[11px] text-muted-foreground font-mono break-all flex-1">{BASE_API_URL}{endpoint.path}</code>
                                        <Button variant="ghost" size="icon" onClick={() => handleCopy(`${BASE_API_URL}${endpoint.path}`, `url-${key}`)} data-testid={`button-copy-url-${key}`}>
                                          {copied === `url-${key}` ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                        </Button>
                                      </div>

                                      {endpoint.method === "POST" && (
                                        <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground" data-testid={`notice-post-${key}`}>
                                          This endpoint requires a POST request with file upload. Use the code examples below to test it programmatically.
                                        </div>
                                      )}

                                      {endpoint.method !== "POST" && needsParam && (
                                        <div className="space-y-2.5">
                                          <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <h5 className="text-xs font-medium text-foreground">Parameters</h5>
                                            <Button variant="ghost" size="sm" onClick={() => clearTest(key)} className="gap-1 text-[11px]" data-testid={`button-clear-${key}`}>
                                              <RotateCcw className="h-3 w-3" />
                                              Clear
                                            </Button>
                                          </div>
                                          {params.length > 0 ? (
                                            params.map((param) => (
                                              <div key={`${key}-${param}`} className="space-y-1">
                                                <label className="block text-[11px] font-medium text-muted-foreground">
                                                  {param} <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                  placeholder={endpoint.example || `Enter ${param}...`}
                                                  value={testParams[key]?.[param] || ""}
                                                  onChange={(e) => updateTestParam(key, param, e.target.value)}
                                                  className="text-sm"
                                                  data-testid={`input-param-${key}-${param}`}
                                                />
                                              </div>
                                            ))
                                          ) : (
                                            <div className="space-y-1">
                                              <label className="block text-[11px] font-medium text-muted-foreground">
                                                value <span className="text-red-500">*</span>
                                              </label>
                                              <Input
                                                placeholder={endpoint.example || "Enter value..."}
                                                value={testParams[key]?.["value"] || ""}
                                                onChange={(e) => updateTestParam(key, "value", e.target.value)}
                                                className="text-sm"
                                                data-testid={`input-param-${key}-value`}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {endpoint.method !== "POST" && (
                                        <div className="flex gap-2 flex-wrap">
                                          <Button onClick={() => handleTest(endpoint, key)} disabled={isLoading} size="sm" className="gap-1.5" data-testid={`button-execute-${key}`}>
                                            {isLoading ? (
                                              <><Loader2 className="h-3.5 w-3.5 animate-spin" />Executing...</>
                                            ) : (
                                              <><Play className="h-3.5 w-3.5" />Execute</>
                                            )}
                                          </Button>
                                          <a href={`${BASE_API_URL}${endpoint.path}`} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm" className="gap-1.5" data-testid={`button-open-${key}`}>
                                              <ExternalLink className="h-3.5 w-3.5" />
                                              Open
                                            </Button>
                                          </a>
                                        </div>
                                      )}

                                      {isLoading && (
                                        <div className="flex items-center gap-2.5 p-3 rounded-md bg-muted/50">
                                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                          <div>
                                            <p className="text-xs font-medium text-foreground">Fetching response...</p>
                                            <p className="text-[11px] text-muted-foreground">Please wait</p>
                                          </div>
                                        </div>
                                      )}

                                      {result && !isLoading && (
                                        <div className={`rounded-md overflow-hidden border ${result.success ? "border-green-500/20" : "border-red-500/20"}`}>
                                          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/50 border-b border-border">
                                            <div className="flex items-center gap-1.5">
                                              <StatusDot isOnline={result.success} size="sm" />
                                              <span className={`font-semibold text-xs ${result.success ? "text-green-500" : "text-red-500"}`}>
                                                {result.success ? "200 OK" : "Error"}
                                              </span>
                                            </div>
                                            {!result.isImage && result.data && (
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleCopy(JSON.stringify(result.data, null, 2), `response-${key}`)}
                                                data-testid={`button-copy-response-${key}`}
                                              >
                                                {copied === `response-${key}` ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                              </Button>
                                            )}
                                          </div>
                                          <div className="p-3 bg-gray-950 dark:bg-gray-950">
                                            {result.isImage && result.imageUrl ? (
                                              <img src={result.imageUrl} alt="API Response" className="max-w-full h-auto rounded-md" data-testid={`img-response-${key}`} />
                                            ) : (
                                              <pre className="text-[11px] text-green-400 overflow-x-auto font-mono leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap" data-testid={`text-response-${key}`}>
                                                {JSON.stringify(result.data, null, 2)}
                                              </pre>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      <div className="rounded-md overflow-hidden border border-border">
                                        <div className="flex items-center justify-between border-b border-border bg-muted/30">
                                          <div className="flex flex-wrap gap-0">
                                            {[
                                              { label: "JavaScript", icon: Globe },
                                              { label: "Python", icon: Terminal },
                                              { label: "cURL", icon: Terminal },
                                            ].map((tab, ti) => (
                                              <button
                                                key={ti}
                                                onClick={() => setCodeTab((prev) => ({ ...prev, [key]: ti }))}
                                                className={`flex items-center gap-1 px-3 py-2 text-[11px] font-medium transition-colors ${
                                                  currentCodeTab === ti ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                                                }`}
                                                data-testid={`button-code-tab-${key}-${ti}`}
                                              >
                                                <tab.icon className="h-3 w-3" />
                                                {tab.label}
                                              </button>
                                            ))}
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="mr-1"
                                            onClick={() => {
                                              const code = currentCodeTab === 0 ? codeExamples.js : currentCodeTab === 1 ? codeExamples.python : codeExamples.curl;
                                              handleCopy(code, `code-${key}-${currentCodeTab}`);
                                            }}
                                            data-testid={`button-copy-code-${key}`}
                                          >
                                            {copied === `code-${key}-${currentCodeTab}` ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                          </Button>
                                        </div>
                                        <div className="p-3 bg-muted/20">
                                          <pre className="text-[11px] text-foreground overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap" data-testid={`text-code-${key}`}>
                                            {currentCodeTab === 0 ? codeExamples.js : currentCodeTab === 1 ? codeExamples.python : codeExamples.curl}
                                          </pre>
                                        </div>
                                      </div>
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
