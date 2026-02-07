import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/status-dot";
import { apiCategories, getTotalEndpoints, getTotalCategories } from "@/lib/endpoints";
import type { VisitorStats } from "@shared/schema";
import {
  Brain,
  Download,
  Shuffle,
  Wrench,
  Search,
  Info,
  Repeat,
  Activity,
  ArrowRight,
  BookOpen,
  Zap,
  Shield,
  Clock,
  Users,
  Eye,
  BarChart3,
  Globe,
  Server,
  Copy,
  Check,
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

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const start = 0;
    const startTime = performance.now();
    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (target - start) * eased));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function Home() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { data: visitorStats } = useQuery<VisitorStats>({
    queryKey: ["/api/visitors/stats"],
  });

  const features = [
    {
      icon: Brain,
      title: "AI Integration",
      desc: "GPT OSS 120B model with thinking mode for deep AI conversations and complex queries",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: Download,
      title: "Media Downloaders",
      desc: "Download from TikTok, Instagram, YouTube, Facebook, Twitter/X, CapCut and more platforms",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      icon: Shuffle,
      title: "Random Content",
      desc: "Anime images, waifu pictures, memes, quotes, jokes, and facts on demand",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      icon: Wrench,
      title: "Image Processing",
      desc: "AI-powered unblur, upscale, screenshots, QR codes, and color palette extraction",
      gradient: "from-emerald-500 to-green-600",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      desc: "Sub-100ms response times with intelligent caching and CDN distribution",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: Shield,
      title: "Reliable & Secure",
      desc: "Multi-tier rate limiting, input validation, and 99.9% uptime guarantee",
      gradient: "from-indigo-500 to-blue-600",
    },
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
      icon: BarChart3,
      code: `# Get a random waifu image
curl -X GET "https://toxic-api-site.vercel.app/random/waifu"

# Unblur an image
curl -X GET "https://toxic-api-site.vercel.app/tools/unblur?url=IMG"`,
    },
  ];

  const [activeTab, setActiveTab] = useState(0);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen pt-16">
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-20 dark:opacity-10" style={{ background: "hsl(var(--primary))" }} />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full blur-[120px] opacity-15 dark:opacity-8" style={{ background: "hsl(var(--chart-2))" }} />
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(hsl(var(--primary)) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 gap-2 px-4 py-1.5" data-testid="badge-status">
              <StatusDot isOnline={true} size="sm" />
              <span className="text-sm font-medium">All Systems Operational</span>
            </Badge>

            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight tracking-tight"
              data-testid="text-hero-title"
            >
              <span className="text-primary">Toxic</span>
              <span className="text-foreground">-APIs</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed" data-testid="text-hero-description">
              Powerful RESTful API with AI integration, media downloaders,
              random content generators, and image processing tools. Built for
              developers who need fast, reliable API services.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
              <Link to="/docs">
                <Button size="lg" className="gap-2 text-base" data-testid="button-explore-docs">
                  <BookOpen className="h-5 w-5" />
                  Explore API Docs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/status">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 text-base"
                  data-testid="button-view-status"
                >
                  <Activity className="h-5 w-5" />
                  View Status
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                label: "API Endpoints",
                value: getTotalEndpoints(),
                icon: Zap,
              },
              {
                label: "Categories",
                value: getTotalCategories(),
                icon: BarChart3,
              },
              {
                label: "Total Visitors",
                value: visitorStats?.totalVisits || 0,
                icon: Eye,
              },
              {
                label: "Unique Visitors",
                value: visitorStats?.uniqueVisitors || 0,
                icon: Users,
              },
            ].map((stat, i) => (
              <Card
                key={i}
                className="p-5 md:p-8 text-center"
                data-testid={`card-stat-${i}`}
              >
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  <AnimatedCounter target={stat.value} />
                  {stat.label === "API Endpoints" ? "+" : ""}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Powerful <span className="text-primary">Features</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build amazing applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 md:p-8 group hover-elevate"
                data-testid={`card-feature-${index}`}
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-md flex items-center justify-center mb-5`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Browse <span className="text-primary">Categories</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore {getTotalEndpoints()}+ endpoints across {getTotalCategories()} categories
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {apiCategories.map((category, index) => {
              const Icon = iconMap[category.icon] || Zap;
              return (
                <Link key={category.name} to={`/docs?category=${encodeURIComponent(category.name)}`}>
                  <Card
                    className="p-5 hover-elevate cursor-pointer group"
                    data-testid={`card-category-${category.name.toLowerCase()}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${categoryColors[index % categoryColors.length]} rounded-md flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground">
                          {category.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {category.endpoints.length} endpoints
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Quick <span className="text-primary">Start</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Integrate in seconds with any language
            </p>
          </div>

          <Card className="overflow-hidden">
            <div className="flex border-b border-border">
              {codeExamples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                    activeTab === i
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-muted-foreground"
                  }`}
                  data-testid={`button-tab-${ex.lang.toLowerCase()}`}
                >
                  <ex.icon className="h-4 w-4" />
                  {ex.lang}
                </button>
              ))}
            </div>
            <div className="relative p-5">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3"
                onClick={() => copyCode(codeExamples[activeTab].code, activeTab)}
                data-testid="button-copy-code"
              >
                {copiedIndex === activeTab ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <pre className="text-sm text-foreground overflow-x-auto font-mono leading-relaxed">
                {codeExamples[activeTab].code}
              </pre>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
            Ready to <span className="text-primary">Get Started</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Start building with Toxic-APIs today. Free to use, no API key required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link to="/docs">
              <Button size="lg" className="gap-2 text-base" data-testid="button-cta-docs">
                <BookOpen className="h-5 w-5" />
                View Documentation
              </Button>
            </Link>
            <a href="https://github.com/xhclintohn" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="gap-2 text-base" data-testid="button-cta-github">
                <Globe className="h-5 w-5" />
                Star on GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Toxic-APIs</span>
              <span className="text-muted-foreground text-sm">v2.1.0</span>
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
