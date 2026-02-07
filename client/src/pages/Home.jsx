import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { NotificationContext } from '../App'

const AnimatedCounter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const num = parseInt(target) || 0
    if (num === 0) { setCount(target); return }
    let start = 0
    const step = Math.max(1, Math.floor(num / 40))
    const timer = setInterval(() => {
      start += step
      if (start >= num) { setCount(num); clearInterval(timer) }
      else setCount(start)
    }, 30)
    return () => clearInterval(timer)
  }, [target])
  return <span>{typeof count === 'number' ? count : target}{suffix}</span>
}

const Home = () => {
  const [stats, setStats] = useState({ totalEndpoints: '17+', totalRequests: '0', uptime: '99.9%', responseTime: '<100ms' })
  const { addNotification } = useContext(NotificationContext)

  useEffect(() => {
    fetch('/api/status')
      .then(r => r.json())
      .then(data => {
        if (data.status && data.result) {
          setStats({
            totalEndpoints: data.result.featureTotal || '17+',
            totalRequests: data.result.reqTotal || '0',
            uptime: data.result.uptime || '99.9%',
            responseTime: '<100ms'
          })
        }
      })
      .catch(() => {})
  }, [])

  const features = [
    { icon: '🤖', title: 'AI Integration', desc: 'GPT OSS 120B with thinking mode for powerful AI conversations', color: 'from-violet-500 to-purple-600' },
    { icon: '📥', title: 'Media Downloaders', desc: 'Download from CapCut, Facebook, Twitter/X, SnackVideo & MediaFire', color: 'from-cyan-500 to-blue-600' },
    { icon: '🎴', title: 'Random Content', desc: 'Anime images, waifu pictures, Blue Archive characters on demand', color: 'from-pink-500 to-rose-600' },
    { icon: '✨', title: 'Image Processing', desc: 'AI-powered unblur and upscale for crystal clear images', color: 'from-emerald-500 to-green-600' },
    { icon: '⚡', title: 'Lightning Fast', desc: 'Sub-100ms response times with intelligent caching layer', color: 'from-amber-500 to-orange-600' },
    { icon: '🔗', title: 'Easy Integration', desc: 'Simple RESTful endpoints - just make a GET request and go', color: 'from-indigo-500 to-blue-600' },
  ]

  const codeExamples = [
    {
      lang: 'JavaScript',
      icon: '🟨',
      code: `// Download a Facebook video
const response = await fetch(
  'https://your-api.vercel.app/download/facebook?url=VIDEO_URL'
);
const data = await response.json();
console.log(data.result);`
    },
    {
      lang: 'Python',
      icon: '🐍',
      code: `import requests

# Chat with AI
response = requests.get(
    'https://your-api.vercel.app/ai/oss',
    params={'text': 'Hello!'}
)
print(response.json())`
    },
    {
      lang: 'cURL',
      icon: '💻',
      code: `# Get a random waifu image
curl -X GET "https://your-api.vercel.app/random/waifu"

# Unblur an image
curl -X GET "https://your-api.vercel.app/tools/unblur?url=IMAGE_URL"`
    }
  ]

  const [activeTab, setActiveTab] = useState(0)

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    addNotification('Code copied to clipboard!', 'success', 2000)
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 overflow-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="text-xl md:text-2xl font-bold gradient-text" data-testid="link-home">
              Toxic-APIs
            </Link>
            <div className="flex items-center gap-4 md:gap-6">
              <Link to="/docs" className="text-sm md:text-base text-gray-400 hover:text-primary transition-colors font-medium" data-testid="link-docs">
                Docs
              </Link>
              <Link to="/status" className="text-sm md:text-base text-gray-400 hover:text-primary transition-colors font-medium" data-testid="link-status">
                Status
              </Link>
              <a href="https://github.com/xhclintohn" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-gray-400 hover:text-primary transition-colors font-medium" data-testid="link-github">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16 md:pt-20">
        <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center py-16 md:py-24 px-4">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-blob"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-emerald-500/8 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '4s' }}></div>
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          </div>

          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="animate-slide-down inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-full mb-8">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
                </span>
                <span className="text-primary font-medium text-sm">All Systems Operational</span>
              </div>

              <h1 className="animate-slide-up text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight" data-testid="text-hero-title">
                <span className="gradient-text">Toxic</span>
                <span className="text-gray-100">-</span>
                <span className="text-gradient">APIs</span>
              </h1>

              <p className="animate-slide-up stagger-2 text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed opacity-0">
                Powerful RESTful API with AI integration, media downloaders, random content generators, and image processing tools. Built for developers who need fast, reliable API services.
              </p>

              <div className="animate-slide-up stagger-3 flex flex-col sm:flex-row gap-4 justify-center opacity-0">
                <Link
                  to="/docs"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(168,85,247,0.3)] text-white"
                  data-testid="button-explore-docs"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  Explore API Docs
                </Link>
                <Link
                  to="/status"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-dark-card border border-dark-border rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-dark-hover"
                  data-testid="button-view-status"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  View Status
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-4 relative">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">Powerful Features</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Everything you need to build amazing applications
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8 hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 animate-slide-up opacity-0"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-4 bg-dark-card/30">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: 'API Endpoints', value: stats.totalEndpoints, icon: '🔌' },
                { label: 'Total Requests', value: stats.totalRequests, icon: '📊' },
                { label: 'Uptime', value: stats.uptime, icon: '🟢' },
                { label: 'Avg Response', value: stats.responseTime, icon: '⚡' },
              ].map((stat, i) => (
                <div key={i} className="bg-dark-card border border-dark-border rounded-2xl p-5 md:p-8 text-center hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 group animate-bounce-in opacity-0" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="text-3xl mb-3 group-hover:scale-125 transition-transform duration-300">{stat.icon}</div>
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                    <AnimatedCounter target={stat.value} />
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">Quick Start</span>
              </h2>
              <p className="text-lg text-gray-400">Integrate in seconds with any language</p>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex border-b border-dark-border">
                {codeExamples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300 ${activeTab === i ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-200 hover:bg-dark-hover'}`}
                  >
                    <span>{ex.icon}</span>
                    {ex.lang}
                  </button>
                ))}
              </div>
              <div className="relative p-6">
                <button
                  onClick={() => copyCode(codeExamples[activeTab].code)}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-dark-hover hover:bg-primary/20 text-gray-400 hover:text-primary transition-all"
                  title="Copy code"
                  data-testid="button-copy-code"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
                <pre className="text-sm md:text-base text-gray-300 overflow-x-auto font-['Fira_Code',monospace] leading-relaxed">
                  {codeExamples[activeTab].code}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-4 bg-dark-card/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Ready to Get Started?</span>
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
              Explore the full documentation and start integrating Toxic-APIs into your projects today.
            </p>
            <Link
              to="/docs"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary to-secondary rounded-xl font-bold text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(168,85,247,0.3)] text-white animate-glow-pulse"
            >
              View Documentation
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </section>
      </div>

      <footer className="bg-dark-card border-t border-dark-border py-10 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold gradient-text mb-1">Toxic-APIs</h3>
              <p className="text-sm text-gray-500">Built by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧</p>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/docs" className="text-sm text-gray-400 hover:text-primary transition-colors">Docs</Link>
              <Link to="/status" className="text-sm text-gray-400 hover:text-primary transition-colors">Status</Link>
              <a href="https://github.com/xhclintohn" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-primary transition-colors">GitHub</a>
            </div>
            <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Toxic-APIs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
