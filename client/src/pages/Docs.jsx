import { useState, useEffect, useCallback, useContext } from 'react'
import { Link } from 'react-router-dom'
import { NotificationContext } from '../App'

const extractParams = (path) => {
  const matches = path.match(/[?&]([^=]+)=/g)
  if (!matches) return []
  return matches.map(m => m.replace(/[?&]/g, '').replace('=', ''))
}

const SkeletonLoader = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-10 bg-dark-hover rounded-xl w-1/3"></div>
    <div className="h-6 bg-dark-hover rounded-lg w-2/3"></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="h-4 bg-dark-hover rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-dark-hover rounded w-2/3"></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="h-6 bg-dark-hover rounded w-1/4 mb-3"></div>
          <div className="h-4 bg-dark-hover rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-dark-hover rounded w-1/2"></div>
        </div>
      ))}
    </div>
  </div>
)

const ResponseLoader = () => (
  <div className="flex items-center gap-3 p-4">
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 rounded-full border-2 border-primary/30"></div>
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-300">Fetching response...</p>
      <p className="text-xs text-gray-500">Please wait</p>
    </div>
  </div>
)

const EndpointItem = ({ endpoint, category, index, isExpanded, onToggle, testParams, onUpdateTestParam, onTest, onClearParams, testResult, isTestLoading, copied, onCopy }) => {
  const key = `${category}-${index}`
  const params = extractParams(endpoint.path)

  return (
    <div className={`border border-dark-border rounded-2xl overflow-hidden bg-dark-card transition-all duration-500 hover:border-primary/30 ${isExpanded ? 'shadow-xl shadow-primary/5 border-primary/30' : ''}`}>
      <div className="p-5 md:p-6 cursor-pointer hover:bg-dark-hover/50 transition-all duration-300" onClick={() => onToggle(category, index)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <span className="px-3 py-1 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary text-xs font-bold rounded-lg border border-primary/20">
                {endpoint.method}
              </span>
              <code className="text-secondary text-xs md:text-sm break-all">{endpoint.path}</code>
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1">{endpoint.name}</h3>
            <p className="text-gray-400 text-sm">{endpoint.desc}</p>
          </div>
          <div className={`p-2 rounded-lg bg-dark-hover transition-all duration-300 ${isExpanded ? 'rotate-180 bg-primary/20' : ''}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-dark-border bg-dark-bg/50">
          <div className="p-5 md:p-6 space-y-5">
            <div className="flex items-center gap-2 text-primary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h4 className="font-bold text-sm uppercase tracking-wider">Try It Out</h4>
            </div>

            {params.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-semibold text-gray-300">Parameters</h5>
                  <button onClick={() => onClearParams(key)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-dark-hover hover:bg-dark-border rounded-lg transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Clear
                  </button>
                </div>
                {params.map(param => (
                  <div key={`${key}-${param}`}>
                    <label className="block text-xs text-gray-400 mb-1.5">{param} <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      placeholder={endpoint.example || `Enter ${param}...`}
                      value={testParams[key]?.[param] || ''}
                      onChange={(e) => onUpdateTestParam(key, param, e.target.value)}
                      className="w-full px-4 py-2.5 bg-dark-card border border-dark-border rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => onTest(endpoint, key)}
                disabled={isTestLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 text-white"
                data-testid={`button-execute-${key}`}
              >
                {isTestLoading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Executing...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>Execute</>
                )}
              </button>
              {testResult && (
                <button onClick={() => onClearParams(key)} className="px-5 py-2.5 bg-dark-hover hover:bg-dark-border rounded-xl font-medium transition-colors text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Reset
                </button>
              )}
            </div>

            {isTestLoading && <ResponseLoader />}

            {testResult && !isTestLoading && (
              <div className={`rounded-xl border overflow-hidden animate-scale-in ${testResult.success ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-border/50">
                  <div className={`w-2.5 h-2.5 rounded-full ${testResult.success ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                  <span className={`font-semibold text-sm ${testResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {testResult.success ? 'Success (200)' : 'Error'}
                  </span>
                </div>
                <div className="p-4">
                  {testResult.isImage ? (
                    <img src={testResult.imageUrl} alt="API Response" className="max-w-full h-auto rounded-lg border border-dark-border" />
                  ) : (
                    <pre className="text-xs md:text-sm text-gray-300 overflow-x-auto font-['Fira_Code',monospace] leading-relaxed max-h-96 overflow-y-auto">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Code Example</span>
              </div>
              <div className="relative bg-dark-card border border-dark-border rounded-xl p-4">
                <pre className="text-xs md:text-sm text-gray-300 overflow-x-auto font-['Fira_Code',monospace] pr-10 leading-relaxed">{`fetch("${endpoint.path}${endpoint.example ? endpoint.example : ''}")
  .then(res => res.json())
  .then(data => console.log(data))`}</pre>
                <button
                  onClick={() => onCopy(endpoint.path, `code-${key}`)}
                  className="absolute top-3 right-3 p-2 hover:bg-dark-hover rounded-lg transition-colors"
                >
                  {copied === `code-${key}` ? (
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const categoryIcons = {
  ai: '🤖', openai: '🤖', downloader: '📥', download: '📥', random: '🎴', tools: '🔧', api: '📡'
}

const Docs = () => {
  const [endpoints, setEndpoints] = useState({})
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedEndpoints, setExpandedEndpoints] = useState({})
  const [testParams, setTestParams] = useState({})
  const [testResults, setTestResults] = useState({})
  const [testLoading, setTestLoading] = useState({})
  const [copied, setCopied] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [totalRequests, setTotalRequests] = useState('0')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const { addNotification } = useContext(NotificationContext)

  useEffect(() => {
    Promise.all([
      fetch('/api/endpoints').then(r => r.json()),
      fetch('/api/status').then(r => r.json())
    ]).then(([endpointsData, statusData]) => {
      if (endpointsData.status && endpointsData.result) setEndpoints(endpointsData.result)
      if (statusData.status && statusData.result) setTotalRequests(statusData.result.reqTotal || '0')
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalFeatures = Object.values(endpoints).reduce((sum, items) => sum + items.length, 0)
  const totalCategories = Object.keys(endpoints).length

  const handleCopy = useCallback((text, id) => {
    const fullUrl = window.location.origin + text
    navigator.clipboard.writeText(fullUrl)
    setCopied(id)
    addNotification('Copied to clipboard!', 'success', 2000)
    setTimeout(() => setCopied(''), 2000)
  }, [addNotification])

  const toggleEndpoint = useCallback((cat, idx) => {
    setExpandedEndpoints(prev => ({ ...prev, [`${cat}-${idx}`]: !prev[`${cat}-${idx}`] }))
  }, [])

  const handleTest = useCallback(async (endpoint, key) => {
    setTestLoading(prev => ({ ...prev, [key]: true }))
    setTestResults(prev => ({ ...prev, [key]: null }))
    try {
      let url = endpoint.path
      const params = testParams[key] || {}
      Object.entries(params).forEach(([paramKey, value]) => {
        url = url.replace(`${paramKey}=`, `${paramKey}=${encodeURIComponent(value)}`)
      })
      const response = await fetch(url)
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.startsWith('image/')) {
        const blob = await response.blob()
        setTestResults(prev => ({ ...prev, [key]: { success: response.ok, data: null, imageUrl: URL.createObjectURL(blob), isImage: true } }))
      } else {
        const data = await response.json()
        setTestResults(prev => ({ ...prev, [key]: { success: response.ok, data, isImage: false } }))
      }
      addNotification(response.ok ? 'Request successful!' : 'Request returned an error', response.ok ? 'success' : 'error')
    } catch (error) {
      setTestResults(prev => ({ ...prev, [key]: { success: false, data: { error: error.message }, isImage: false } }))
      addNotification('Request failed: ' + error.message, 'error')
    } finally {
      setTestLoading(prev => ({ ...prev, [key]: false }))
    }
  }, [testParams, addNotification])

  const clearParams = useCallback((key) => {
    setTestParams(prev => { const n = { ...prev }; delete n[key]; return n })
    setTestResults(prev => { const n = { ...prev }; delete n[key]; return n })
  }, [])

  const updateTestParam = useCallback((endpointKey, paramName, value) => {
    setTestParams(prev => ({ ...prev, [endpointKey]: { ...(prev[endpointKey] || {}), [paramName]: value } }))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg text-gray-100 flex">
        <div className="w-72 bg-dark-card border-r border-dark-border p-4 hidden lg:block">
          <div className="space-y-3 animate-pulse">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-dark-hover rounded-xl"></div>)}
          </div>
        </div>
        <div className="flex-1 p-6 md:p-12"><SkeletonLoader /></div>
      </div>
    )
  }

  const DashboardView = () => {
    const allEndpoints = Object.entries(endpoints).flatMap(([cat, items]) => items.map(e => ({ ...e, category: cat })))
    const filtered = searchInput ? allEndpoints.filter(e => e.name.toLowerCase().includes(searchInput.toLowerCase()) || e.desc.toLowerCase().includes(searchInput.toLowerCase()) || e.path.toLowerCase().includes(searchInput.toLowerCase())) : []

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="pb-4 border-b border-dark-border">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">Toxic-APIs Documentation</h1>
          <p className="text-base md:text-lg text-gray-400">Explore and test all available endpoints</p>
        </div>

        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search all endpoints..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-dark-card border border-dark-border rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            data-testid="input-search-endpoints"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {searchInput && filtered.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((ep, i) => (
                <EndpointItem key={i} endpoint={ep} category={ep.category} index={i} isExpanded={expandedEndpoints[`${ep.category}-${i}`]} onToggle={toggleEndpoint} testParams={testParams} onUpdateTestParam={updateTestParam} onTest={handleTest} onClearParams={clearParams} testResult={testResults[`${ep.category}-${i}`]} isTestLoading={testLoading[`${ep.category}-${i}`]} copied={copied} onCopy={handleCopy} />
              ))}
            </div>
          </div>
        )}

        {!searchInput && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Status', value: 'Live', icon: '🟢', accent: 'border-emerald-500/30' },
                { label: 'Categories', value: totalCategories, icon: '📂', accent: 'border-blue-500/30' },
                { label: 'Requests', value: totalRequests, icon: '📊', accent: 'border-purple-500/30' },
                { label: 'Endpoints', value: totalFeatures, icon: '🔌', accent: 'border-cyan-500/30' }
              ].map((s, i) => (
                <div key={i} className={`bg-dark-card border ${s.accent} rounded-2xl p-5 hover:shadow-lg transition-all duration-300 animate-slide-up opacity-0`} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-5 gradient-text">Quick Start</h2>
              <div className="grid gap-4">
                {[
                  { step: '1', title: 'Browse Categories', desc: `Choose from ${totalCategories} categories in the sidebar` },
                  { step: '2', title: 'Select an Endpoint', desc: 'Click to view details, parameters, and code examples' },
                  { step: '3', title: 'Try It Out', desc: 'Test endpoints live in the browser with the interactive tool' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 animate-slide-right opacity-0" style={{ animationDelay: `${i * 0.15}s` }}>
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-white flex-shrink-0">{item.step}</div>
                    <div>
                      <p className="font-semibold mb-0.5">{item.title}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  const CategoryView = () => {
    const categoryEndpoints = endpoints[selectedCategory] || []
    const filtered = categoryEndpoints.filter(e =>
      e.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      e.desc.toLowerCase().includes(searchInput.toLowerCase()) ||
      e.path.toLowerCase().includes(searchInput.toLowerCase())
    )

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="pb-4 border-b border-dark-border">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{categoryIcons[selectedCategory?.toLowerCase()] || '📡'}</span>
            <h1 className="text-3xl md:text-4xl font-bold capitalize gradient-text">{selectedCategory}</h1>
          </div>
          <p className="text-gray-400">{categoryEndpoints.length} endpoint{categoryEndpoints.length !== 1 ? 's' : ''} available</p>
        </div>

        <div className="relative w-full lg:w-2/3">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search endpoints..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-card border border-dark-border rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {filtered.map((endpoint, index) => (
            <EndpointItem
              key={`${selectedCategory}-${index}`}
              endpoint={endpoint}
              category={selectedCategory}
              index={index}
              isExpanded={expandedEndpoints[`${selectedCategory}-${index}`]}
              onToggle={toggleEndpoint}
              testParams={testParams}
              onUpdateTestParam={updateTestParam}
              onTest={handleTest}
              onClearParams={clearParams}
              testResult={testResults[`${selectedCategory}-${index}`]}
              isTestLoading={testLoading[`${selectedCategory}-${index}`]}
              copied={copied}
              onCopy={handleCopy}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex">
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={() => setSidebarOpen(false)} />}

      <div className={`fixed lg:static inset-y-0 left-0 z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} w-72 bg-dark-card border-r border-dark-border transition-transform duration-300 flex flex-col`}>
        <div className="p-4 border-b border-dark-border">
          <Link to="/" className="text-xl font-bold gradient-text">Toxic-APIs</Link>
          <p className="text-xs text-gray-500 mt-1">API Documentation</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            <button
              onClick={() => { setSelectedCategory(null); setSearchInput(''); if (window.innerWidth < 1024) setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm ${!selectedCategory ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border border-primary/30' : 'hover:bg-dark-hover'}`}
            >
              <span>🏠</span>
              <span className="font-medium">Dashboard</span>
            </button>

            <div className="pt-4 pb-2 px-2">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Categories</p>
            </div>

            {Object.entries(endpoints).map(([category, items]) => (
              <button
                key={category}
                onClick={() => { setSelectedCategory(category); setSearchInput(''); if (window.innerWidth < 1024) setSidebarOpen(false) }}
                className={`w-full group rounded-xl transition-all duration-300 ${selectedCategory === category ? 'bg-gradient-to-r from-primary/15 to-secondary/15 border border-primary/40 shadow-lg shadow-primary/5' : 'bg-dark-hover/30 border border-transparent hover:border-dark-border hover:bg-dark-hover'}`}
              >
                <div className="p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{categoryIcons[category.toLowerCase()] || '📡'}</span>
                      <span className={`font-semibold capitalize text-sm ${selectedCategory === category ? 'text-primary' : 'text-gray-200'}`}>{category}</span>
                    </div>
                    <svg className={`w-4 h-4 transition-transform duration-300 ${selectedCategory === category ? 'text-primary rotate-0' : 'text-gray-500 -rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                  <div className="flex items-center justify-between pl-8">
                    <span className="text-xs text-gray-500">{items.length} endpoint{items.length !== 1 ? 's' : ''}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${selectedCategory === category ? 'bg-primary/30 text-primary' : 'bg-dark-border text-gray-400'}`}>
                      {items.filter(e => e.status === 'Active').length} active
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-dark-border">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span></span>
            All systems operational
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-dark-card border border-dark-border rounded-xl hover:bg-dark-hover transition-colors shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        <div className="container mx-auto px-4 md:px-8 py-6 md:py-10 max-w-7xl pt-16 lg:pt-6">
          {selectedCategory ? <CategoryView /> : <DashboardView />}
        </div>
      </div>
    </div>
  )
}

export default Docs
