import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/status-dot";
import { apiCategories, getTotalEndpoints, getTotalCategories } from "@/lib/endpoints";
import type { VisitorStats } from "@shared/schema";
import {
  Brain, Download, Shuffle, Wrench, Search, Info, Repeat, Activity,
  ArrowRight, BookOpen, Zap, Shield, Clock, Users, Eye, BarChart3,
  Globe, Server, Copy, Check, Sparkles, Cpu, Rocket, Terminal,
  Code2, Layers, ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

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

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
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

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function Home() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const { data: visitorStats } = useQuery<VisitorStats>({
    queryKey: ["/api/visitors/stats"],
  });

  const features = [
    { icon: Brain, title: "AI Integration", desc: "GPT OSS 120B model with thinking mode for deep AI conversations and complex queries" },
    { icon: Download, title: "Media Downloaders", desc: "Download from TikTok, Instagram, YouTube, Facebook, Twitter/X, CapCut and more" },
    { icon: Shuffle, title: "Random Content", desc: "Anime images, waifu pictures, memes, quotes, jokes, and facts on demand" },
    { icon: Wrench, title: "Image Processing", desc: "AI-powered unblur, upscale, screenshots, QR codes, and color palette extraction" },
    { icon: Zap, title: "Lightning Fast", desc: "Sub-100ms response times with intelligent caching and CDN distribution" },
    { icon: Shield, title: "Reliable & Secure", desc: "Multi-tier rate limiting, input validation, and 99.9% uptime guarantee" },
  ];

  const codeExamples = [
    {
      lang: "JavaScript",
      icon: Globe,
      code: `const response = await fetch(
  'https://toxic-api-site.vercel.app/download/facebook?url=VIDEO_URL'
);
const data = await response.json();
console.log(data.result);`,
    },
    {
      lang: "Python",
      icon: Server,
      code: `import requests

response = requests.get(
    'https://toxic-api-site.vercel.app/ai/oss',
    params={'text': 'Hello!'}
)
print(response.json())`,
    },
    {
      lang: "cURL",
      icon: Terminal,
      code: `# Get a random waifu image
curl -X GET "https://toxic-api-site.vercel.app/random/waifu"

# Unblur an image
curl -X GET "https://toxic-api-site.vercel.app/tools/unblur?url=IMG"`,
    },
  ];

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen pt-16">
      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse-glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        @keyframes slide-in { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        .anim-up { animation: fade-in-up 0.5s ease-out forwards; opacity: 0; }
        .anim-in { animation: fade-in 0.4s ease-out forwards; opacity: 0; }
        .d1 { animation-delay: 0.08s; } .d2 { animation-delay: 0.16s; } .d3 { animation-delay: 0.24s; }
        .d4 { animation-delay: 0.32s; } .d5 { animation-delay: 0.40s; } .d6 { animation-delay: 0.48s; }
        .d7 { animation-delay: 0.56s; } .d8 { animation-delay: 0.64s; }
      `}</style>

      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/5 w-[600px] h-[600px] rounded-full blur-[180px] opacity-[0.08]" style={{ background: "radial-gradient(circle, rgb(34 197 94), transparent)" }} />
          <div className="absolute bottom-1/4 right-1/5 w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.06]" style={{ background: "radial-gradient(circle, rgb(59 130 246), transparent)" }} />
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{ backgroundImage: "radial-gradient(hsl(var(--foreground)) 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }} />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center">
            <div className="anim-up">
              <Badge variant="outline" className="mb-8 gap-2 px-3 py-1" data-testid="badge-status">
                <StatusDot isOnline={true} size="sm" />
                <span className="text-xs font-medium">All Systems Operational</span>
              </Badge>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[1.1] tracking-tight anim-up d1" data-testid="text-hero-title">
              <span className="text-foreground">Toxic</span>
              <span className="text-primary">-APIs</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed anim-up d2" data-testid="text-hero-description">
              Powerful RESTful API with AI integration, media downloaders,
              random content generators, and image processing tools.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap anim-up d3">
              <Link to="/docs">
                <Button size="lg" className="gap-2" data-testid="button-explore-docs">
                  <BookOpen className="h-4 w-4" />
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
                <div key={i} className="text-center p-4" data-testid={`stat-${i}`}>
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
          <div className="mb-12 anim-up">
            <Badge variant="secondary" className="mb-3 gap-1.5">
              <Sparkles className="h-3 w-3" />
              Features
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground">
              Everything you need
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <Card key={i} className={`p-6 hover-elevate anim-up d${i + 1}`} data-testid={`card-feature-${i}`}>
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-12 anim-up">
            <Badge variant="secondary" className="mb-3 gap-1.5">
              <Layers className="h-3 w-3" />
              Categories
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground">
              {getTotalEndpoints()}+ endpoints across {getTotalCategories()} categories
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {apiCategories.map((category, i) => {
              const Icon = iconMap[category.icon] || Zap;
              return (
                <Link key={category.name} to={`/docs?category=${encodeURIComponent(category.name)}`}>
                  <Card
                    className="p-4 hover-elevate cursor-pointer group"
                    data-testid={`card-category-${category.name.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${categoryIconBg[i % categoryIconBg.length]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-foreground">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">{category.endpoints.length} endpoints</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8 anim-up">
            <Badge variant="secondary" className="mb-3 gap-1.5">
              <Code2 className="h-3 w-3" />
              Quick Start
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground">
              Integrate in seconds
            </h2>
          </div>

          <Card className="anim-up d2 overflow-visible">
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
              <pre className="text-sm text-foreground overflow-x-auto font-mono leading-relaxed pr-10">
                {codeExamples[activeTab].code}
              </pre>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center anim-up">
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
