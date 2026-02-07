import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/status-dot";
import { apiCategories, getTotalEndpoints, getTotalCategories } from "@/lib/endpoints";
import type { VisitorStats } from "@shared/schema";
import {
  Brain, Download, Shuffle, Wrench, Search, Activity,
  ArrowRight, BookOpen, Zap, Shield, Clock,
  Globe, Server, Copy, Check, Sparkles, Rocket, Terminal,
  Code2, Layers, ChevronRight, Cpu, Eye,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

const iconMap: Record<string, typeof Brain> = {
  brain: Brain, download: Download, shuffle: Shuffle, wrench: Wrench,
  search: Search, activity: Activity,
};

const categoryColors = [
  "from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400",
  "from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400",
  "from-pink-500/20 to-rose-500/20 text-pink-600 dark:text-pink-400",
  "from-emerald-500/20 to-green-500/20 text-emerald-600 dark:text-emerald-400",
  "from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400",
  "from-indigo-500/20 to-blue-500/20 text-indigo-600 dark:text-indigo-400",
];

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const startTime = performance.now();
    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `-5%`,
            animationDuration: `${8 + Math.random() * 12}s`,
            animationDelay: `${Math.random() * 8}s`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
          }}
        />
      ))}
    </div>
  );
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function ScrollSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`scroll-fade-in ${className}`}>{children}</div>;
}

export default function Home() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const { data: visitorStats } = useQuery<VisitorStats>({
    queryKey: ["/api/visitors/stats"],
  });

  const features = [
    { icon: Brain, title: "AI Chat & Generation", desc: "Claude, Gemini, NoteGPT and AI image generators for chat, text, and art creation" },
    { icon: Download, title: "Media Downloaders", desc: "Download from Facebook, Instagram, Twitter/X, YouTube, Douyin, TeraBox and more" },
    { icon: Eye, title: "Anime & Manga", desc: "Stream anime, read manga, and browse drama from multiple sources" },
    { icon: Wrench, title: "Utility Tools", desc: "Image upscaling, transcription, currency conversion, and name generators" },
    { icon: Zap, title: "Lightning Fast", desc: "Sub-100ms response times with intelligent caching and CDN distribution" },
    { icon: Shield, title: "Reliable & Free", desc: "No API key required, multi-tier rate limiting, and 99.9% uptime" },
  ];

  const codeExamples = [
    {
      lang: "JavaScript",
      icon: Globe,
      code: `const response = await fetch(
  window.location.origin + '/ai/claude?text=Hello!'
);
const data = await response.json();
console.log(data.result);`,
    },
    {
      lang: "Python",
      icon: Server,
      code: `import requests

response = requests.get(
    'YOUR_REPLIT_URL/download/instagram',
    params={'url': 'https://instagram.com/reel/...'}
)
print(response.json())`,
    },
    {
      lang: "cURL",
      icon: Terminal,
      code: `# Chat with Claude AI
curl -X GET "YOUR_REPLIT_URL/ai/claude?text=Hello"

# Download from YouTube
curl -X GET "YOUR_REPLIT_URL/download/youtube?url=VIDEO_URL"`,
    },
  ];

  const copyCode = useCallback((code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  return (
    <div className="min-h-screen pt-16">
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-20 px-4 overflow-hidden">
        <FloatingParticles />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[180px] opacity-[0.06] pulse-glow-anim" style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent)" }} />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[150px] opacity-[0.04] pulse-glow-anim" style={{ background: "radial-gradient(circle, hsl(173 58% 39%), transparent)", animationDelay: "1.5s" }} />
          <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: "radial-gradient(hsl(var(--foreground)) 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }} />
          <div className="glow-ring w-[300px] h-[300px] top-[15%] right-[10%]" style={{ animationDelay: "0s" }} />
          <div className="glow-ring w-[200px] h-[200px] bottom-[20%] left-[8%]" style={{ animationDelay: "2s" }} />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center">
            <div className="anim-scale">
              <Badge variant="outline" className="mb-8 gap-2 px-4 py-1.5 shimmer-bg" data-testid="badge-status">
                <StatusDot isOnline={true} size="sm" />
                <span className="text-xs font-medium">All Systems Operational</span>
                <Sparkles className="h-3 w-3 text-primary" />
              </Badge>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[1.1] tracking-tight anim-up d1" data-testid="text-hero-title">
              <span className="text-foreground">Toxic</span>
              <span className="gradient-text">-APIs</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed anim-up d2" data-testid="text-hero-description">
              A powerful RESTful API with AI chat, media downloaders,
              anime & manga scrapers, gaming tools, and more.
              <span className="text-primary font-medium"> Free to use, no API key required.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap anim-up d3">
              <Link to="/docs">
                <Button size="lg" className="gap-2" data-testid="button-explore-docs">
                  <Rocket className="h-4 w-4" />
                  Explore Docs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/status">
                <Button variant="outline" size="lg" className="gap-2" data-testid="button-view-status">
                  <Activity className="h-4 w-4" />
                  View Status
                </Button>
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 anim-up d4">
              {[
                { label: "Endpoints", value: getTotalEndpoints(), suffix: "+" },
                { label: "Categories", value: getTotalCategories(), suffix: "" },
                { label: "Visitors", value: visitorStats?.totalVisits || 0, suffix: "" },
                { label: "Unique", value: visitorStats?.uniqueVisitors || 0, suffix: "" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-md" data-testid={`stat-${i}`}>
                  <div className="text-2xl md:text-3xl font-bold text-foreground">
                    <AnimatedCounter target={stat.value} />
                    {stat.suffix}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <ScrollSection>
            <div className="mb-12">
              <Badge variant="secondary" className="mb-3 gap-1.5">
                <Sparkles className="h-3 w-3" />
                Features
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold text-foreground">
                Everything you need
              </h2>
            </div>
          </ScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <ScrollSection key={i}>
                <Card className="p-6 hover-elevate h-full" data-testid={`card-feature-${i}`}>
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </Card>
              </ScrollSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <ScrollSection>
            <div className="mb-12">
              <Badge variant="secondary" className="mb-3 gap-1.5">
                <Layers className="h-3 w-3" />
                Categories
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold text-foreground">
                {getTotalEndpoints()}+ endpoints across {getTotalCategories()} categories
              </h2>
            </div>
          </ScrollSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {apiCategories.map((category, i) => {
              const Icon = iconMap[category.icon] || Zap;
              return (
                <ScrollSection key={category.name}>
                  <Link to={`/docs?category=${encodeURIComponent(category.name)}`}>
                    <Card
                      className="p-5 hover-elevate cursor-pointer group h-full"
                      data-testid={`card-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${categoryColors[i % categoryColors.length]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-sm text-foreground">{category.name}</h3>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{category.description}</p>
                          <Badge variant="secondary" className="mt-2 text-[10px]">
                            {category.endpoints.length} endpoints
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </ScrollSection>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 shimmer-bg pointer-events-none" />
        <div className="container mx-auto max-w-3xl relative z-10">
          <ScrollSection>
            <div className="mb-8">
              <Badge variant="secondary" className="mb-3 gap-1.5">
                <Code2 className="h-3 w-3" />
                Quick Start
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold text-foreground">
                Integrate in seconds
              </h2>
            </div>
          </ScrollSection>

          <ScrollSection>
            <Card className="overflow-visible">
              <div className="flex border-b border-border flex-wrap gap-0">
                {codeExamples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === i
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground"
                    }`}
                    data-testid={`button-tab-${ex.lang.toLowerCase()}`}
                  >
                    <ex.icon className="h-3.5 w-3.5" />
                    {ex.lang}
                  </button>
                ))}
              </div>
              <div className="relative p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyCode(codeExamples[activeTab].code, activeTab)}
                  data-testid="button-copy-code"
                >
                  {copiedIndex === activeTab ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <pre className="text-sm text-foreground overflow-x-auto font-mono leading-relaxed pr-10" data-testid="text-code-example">
                  {codeExamples[activeTab].code}
                </pre>
              </div>
            </Card>
          </ScrollSection>
        </div>
      </section>

      <section className="py-20 px-4">
        <ScrollSection>
          <div className="container mx-auto max-w-3xl text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-md opacity-5 pointer-events-none" style={{ background: "radial-gradient(circle at center, hsl(var(--primary)), transparent 70%)" }} />
              <Cpu className="h-10 w-10 text-primary mx-auto mb-6 float-anim" />
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-foreground">
                Ready to get started?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Free to use, no API key required. Start building with Toxic-APIs today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
                <Link to="/docs">
                  <Button size="lg" className="gap-2" data-testid="button-cta-docs">
                    <BookOpen className="h-4 w-4" />
                    View Documentation
                  </Button>
                </Link>
                <a href="https://github.com/xhclintohn" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="gap-2" data-testid="button-cta-github">
                    <Globe className="h-4 w-4" />
                    GitHub
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </ScrollSection>
      </section>

      <footer className="border-t border-border py-6 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">Toxic-APIs</span>
              <span className="text-muted-foreground text-xs">v2.1.0</span>
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
