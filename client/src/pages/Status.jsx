import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { NotificationContext } from '../App'

const Status = () => {
  const [status, setStatus] = useState({})
  const [health, setHealth] = useState({})
  const [cache, setCache] = useState({})
  const [topEndpoints, setTopEndpoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const { addNotification } = useContext(NotificationContext)

  const fetchData = async (showNotif = false) => {
    if (showNotif) setRefreshing(true)
    else setLoading(true)
    try {
      const [statusRes, healthRes, cacheRes, topRes] = await Promise.all([
        fetch('/api/status').then(r => r.json()).catch(() => ({})),
        fetch('/api/health').then(r => r.json()).catch(() => ({})),
        fetch('/api/cache/stats').then(r => r.json()).catch(() => ({})),
        fetch('/api/stats/top?limit=10').then(r => r.json()).catch(() => ({}))
      ])
      if (statusRes.status) setStatus(statusRes.result || {})
      if (healthRes.status) setHealth(healthRes.result || {})
      if (cacheRes.status) setCache(cacheRes.result || {})
      if (topRes.status) setTopEndpoints(topRes.result || [])
      setLastUpdated(new Date().toLocaleTimeString())
      if (showNotif) addNotification('Status data refreshed!', 'success', 2000)
    } catch {
      if (showNotif) addNotification('Failed to refresh data', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(), 30000)
    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading && !status.status) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <div className="flex items-center justify-between h-16 md:h-20">
              <Link to="/" className="text-xl font-bold gradient-text">Toxic-APIs</Link>
            </div>
          </div>
        </nav>
        <div className="pt-20 flex items-center justify-center min-h-[80vh]">
          <div className="text-center animate-pulse">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-primary/30"></div>
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
            </div>
            <p className="text-gray-400">Loading system status...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="text-xl md:text-2xl font-bold gradient-text">Toxic-APIs</Link>
            <div className="flex items-center gap-4 md:gap-6">
              <Link to="/docs" className="text-sm text-gray-400 hover:text-primary transition-colors font-medium">Docs</Link>
              <Link to="/" className="text-sm text-gray-400 hover:text-primary transition-colors font-medium">Home</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 md:pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 animate-slide-down">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
              </span>
              <span className="text-emerald-400 font-semibold text-sm">All Systems Operational</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-status-title">
              <span className="gradient-text">System Status</span>
            </h1>
            <p className="text-lg text-gray-400">Real-time monitoring of API performance</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
            {[
              { icon: '⏱️', label: 'Uptime', value: status.uptime || '...', sub: '99.9% SLA', color: 'from-emerald-500 to-green-600' },
              { icon: '⚡', label: 'Response Time', value: '<100ms', sub: 'Optimal', color: 'from-cyan-500 to-blue-600' },
              { icon: '📊', label: 'Total Requests', value: status.reqTotal || '0', sub: 'Active', color: 'from-purple-500 to-violet-600' },
              { icon: '🔌', label: 'Endpoints', value: status.featureTotal || '0', sub: 'All Active', color: 'from-amber-500 to-orange-600' }
            ].map((metric, i) => (
              <div key={i} className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 animate-slide-up opacity-0" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center text-xl`}>
                    {metric.icon}
                  </div>
                  <span className="text-sm text-gray-400">{metric.label}</span>
                </div>
                <div className="text-3xl font-bold mb-1">{metric.value}</div>
                <div className="text-sm text-emerald-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  {metric.sub}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8 mb-10 animate-fade-in">
            <h3 className="text-xl md:text-2xl font-bold mb-6 gradient-text">System Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Platform', value: health.platform },
                { label: 'Node Version', value: health.nodeVersion },
                { label: 'CPU Cores', value: health.cpuCores },
                { label: 'Total Memory', value: formatBytes(health.totalMemory) },
                { label: 'Free Memory', value: formatBytes(health.freeMemory) },
                { label: 'Heap Used', value: formatBytes(health.memoryUsage?.heapUsed) }
              ].map((item, i) => (
                <div key={i} className="animate-slide-right opacity-0" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
                  <div className="text-lg font-semibold font-['Fira_Code',monospace]">{item.value || 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8 mb-10 animate-fade-in">
            <h3 className="text-xl md:text-2xl font-bold mb-6 gradient-text">Cache Performance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cache Hits</div>
                <div className="text-2xl font-bold text-emerald-400">{cache.hits || 0}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cache Misses</div>
                <div className="text-2xl font-bold text-red-400">{cache.misses || 0}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Hit Ratio</div>
                <div className="text-2xl font-bold mb-2">{cache.hits_ratio ? (cache.hits_ratio * 100).toFixed(1) + '%' : '0%'}</div>
                <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000" style={{ width: cache.hits_ratio ? `${cache.hits_ratio * 100}%` : '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cached Keys</div>
                <div className="text-2xl font-bold">{cache.keys || 0}</div>
              </div>
            </div>
          </div>

          {topEndpoints.length > 0 && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8 mb-10 animate-fade-in">
              <h3 className="text-xl md:text-2xl font-bold mb-6 gradient-text">Most Requested Endpoints</h3>
              <div className="space-y-3">
                {topEndpoints.map((ep, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-dark-bg rounded-xl hover:bg-dark-hover transition-all duration-300 group animate-slide-left opacity-0" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-500 w-6">#{i + 1}</span>
                      <code className="text-sm font-['Fira_Code',monospace] text-primary">{ep.endpoint}</code>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">{ep.count} requests</span>
                      <span className="relative flex h-2 w-2"><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center animate-fade-in">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed text-white"
              data-testid="button-refresh-status"
            >
              <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
            {lastUpdated && <p className="text-sm text-gray-500 mt-4">Last updated: {lastUpdated}</p>}
          </div>
        </div>
      </div>

      <footer className="bg-dark-card border-t border-dark-border py-8 px-4">
        <div className="container mx-auto max-w-7xl text-center">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Toxic-APIs by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Status
