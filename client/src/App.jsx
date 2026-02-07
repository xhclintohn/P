import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useCallback } from 'react'
import Home from './pages/Home'
import Docs from './pages/Docs'
import Status from './pages/Status'
import NotFound from './pages/NotFound'

export const NotificationContext = createContext()

const notificationIcons = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )
}

const notificationStyles = {
  success: 'from-emerald-500/20 to-green-500/20 border-emerald-500/50',
  error: 'from-red-500/20 to-rose-500/20 border-red-500/50',
  info: 'from-blue-500/20 to-cyan-500/20 border-blue-500/50',
  warning: 'from-amber-500/20 to-yellow-500/20 border-amber-500/50'
}

const notificationIconBg = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500'
}

function App() {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setNotifications(prev => [...prev, { id, message, type, exiting: false }])
    setTimeout(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, exiting: true } : n))
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, 300)
    }, duration)
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, exiting: true } : n))
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 300)
  }, [])

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      <Router>
        <div className="min-h-screen flex flex-col bg-dark-bg">
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/status" element={<Status />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>

        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`pointer-events-auto rounded-xl border bg-gradient-to-r ${notificationStyles[notif.type]} backdrop-blur-xl p-4 shadow-2xl ${notif.exiting ? 'animate-notification-out' : 'animate-notification-in'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${notificationIconBg[notif.type]} flex items-center justify-center text-white`}>
                  {notificationIcons[notif.type]}
                </div>
                <p className="flex-1 text-sm font-medium text-gray-100 pt-1">{notif.message}</p>
                <button
                  onClick={() => removeNotification(notif.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                  data-testid={`button-dismiss-notification-${notif.id}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className={`h-full ${notificationIconBg[notif.type]} rounded-full`} style={{ animation: 'shrink 4s linear forwards' }} />
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </Router>
    </NotificationContext.Provider>
  )
}

export default App
