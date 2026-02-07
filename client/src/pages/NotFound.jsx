import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center py-20 px-4">
      <div className="text-center max-w-2xl mx-auto animate-fade-in">
        <div className="relative mb-8">
          <div className="text-[10rem] md:text-[14rem] font-extrabold gradient-text leading-none select-none animate-float">
            404
          </div>
          <div className="absolute inset-0 blur-3xl bg-primary/10 rounded-full pointer-events-none"></div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">Page Not Found</h1>

        <p className="text-lg text-gray-400 mb-10 animate-slide-up stagger-2 opacity-0">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-3 opacity-0">
          <Link to="/" className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(168,85,247,0.3)] text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Go Home
          </Link>
          <Link to="/docs" className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-dark-card border border-dark-border rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            View Docs
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
