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
  Globe, Server, Copy, Check, Sparkles, Cpu, Rocket,
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
  const [activeTab, setActiveTab] = useState(0);

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

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen pt-16">
      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes hero-particle { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; } }
        @keyframes typing-cursor { 0%, 100% { border-color: transparent; } 50% { border-color: hsl(142 76% 36%); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; opacity: 0; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; opacity: 0; }
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-700 { animation-delay: 0.7s; }
        .animation-delay-800 { animation-delay: 0.8s; }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20" style={{ background: "linear-gradient(135deg, rgb(34 197 94), rgb(16 185 129))" }} />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-15" style={{ background: "linear-gradient(135deg, rgb(59 130 246), rgb(99 102 241))" }} />
          <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full blur-[100px] opacity-10" style={{ background: "linear-gradient(135deg, rgb(168 85 247), rgb(236 72 153))" }} />
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "radial-gradient(hsl(var(--primary)) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 2 + "px",
                height: Math.random() * 4 + 2 + "px",
                left: Math.random() * 100 + "%",
                bottom: "-5%",
                background: `rgba(34, 197, 94, ${Math.random() * 0.3 + 0.1})`,
                animation: `hero-particle ${Math.random() * 8 + 6}s linear ${Math.random() * 5}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-fade-in-up">
              <Badge variant="outline" className="mb-6 gap-2 px-4 py-1.5" data-testid="badge-status">
                <StatusDot isOnline={true} size="sm" />
                <span className="text-sm font-medium">All Systems Operational</span>
              </Badge>
            </div>

            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight tracking-tight animate-fade-in-up animation-delay-100"
              data-testid="text-hero-title"
            >
              <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent">Toxic</span>
              <span className="text-foreground">-APIs</span>
            </h1>

            <p
              className="text-lg md:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200"
              data-testid="text-hero-description"
            >
              Powerful RESTful API with AI integration, media downloaders,
              random content generators, and image processing tools. Built for
              developers who need fast, reliable API services.
            </p>

            <p className="text-sm font-mono text-muted-foreground/60 mb-10 animate-fade-in-up animation-delay-300" style={{ borderRight: "2px solid transparent", animation: "fade-in-up 0.6s ease-out 0.3s forwards, typing-cursor 1s step-end infinite", opacity: 0 }}>
              {'> ready to serve requests_'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap animate-fade-in-up animation-delay-400">
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

      {/* Stats Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: "API Endpoints", value: getTotalEndpoints(), icon: Zap },
              { label: "Categories", value: getTotalCategories(), icon: BarChart3 },
              { label: "Total Visitors", value: visitorStats?.totalVisits || 0, icon: Eye },
              { label: "Unique Visitors", value: visitorStats?.uniqueVisitors || 0, icon: Users },
            ].map((stat, i) => (
              <Card
                key={i}
                className={`p-5 md:p-8 text-center animate-fade-in-up animation-delay-${(i + 1) * 100}`}
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

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Features</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Powerful <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build amazing applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`p-6 md:p-8 group hover-elevate animate-fade-in-up animation-delay-${(index + 1) * 100}`}
                data-testid={`card-feature-${index}`}
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-md flex items-center justify-center mb-5`}
                  style={{ animation: "float 3s ease-in-out infinite", animationDelay: `${index * 0.5}s` }}
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

      {/* Categories Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 mb-4">
              <Cpu className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Categories</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Browse <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Categories</span>
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
                    className={`p-5 hover-elevate cursor-pointer group animate-fade-in-up animation-delay-${((index % 4) + 1) * 100}`}
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
                    <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium invisible group-hover:visible transition-all">
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Code Examples Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 mb-4">
              <Rocket className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Quick Start</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Quick <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Start</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Integrate in seconds with any language
            </p>
          </div>

          <Card className="animate-fade-in-up animation-delay-200">
            <div className="flex border-b border-border flex-wrap gap-0">
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

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
              Ready to <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Get Started</span>?
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
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
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
