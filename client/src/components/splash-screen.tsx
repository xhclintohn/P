import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 2000);
    const completeTimer = setTimeout(() => onComplete(), 2500);
    return () => { clearTimeout(timer); clearTimeout(completeTimer); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 transition-opacity duration-500 ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      data-testid="splash-screen"
    >
      <style>{`
        @keyframes splash-pulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.5); opacity: 0; } }
        @keyframes splash-pulse-delay { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(2); opacity: 0; } }
        @keyframes splash-glow { 0%, 100% { box-shadow: 0 0 20px rgba(34,197,94,0.3); } 50% { box-shadow: 0 0 60px rgba(34,197,94,0.6), 0 0 100px rgba(34,197,94,0.2); } }
        @keyframes float-particle { 0% { transform: translateY(100vh) scale(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-10vh) scale(1); opacity: 0; } }
      `}</style>

      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-green-500/20"
            style={{
              width: Math.random() * 6 + 2 + "px",
              height: Math.random() * 6 + 2 + "px",
              left: Math.random() * 100 + "%",
              animation: `float-particle ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 2}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="text-center relative">
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute w-32 h-32 rounded-full border border-green-500/30" style={{ animation: "splash-pulse 2s ease-in-out infinite" }} />
          <div className="absolute w-48 h-48 rounded-full border border-green-500/20" style={{ animation: "splash-pulse-delay 2s ease-in-out 0.5s infinite" }} />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center" style={{ animation: "splash-glow 2s ease-in-out infinite" }}>
            <Zap className="h-10 w-10 text-white" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
          Toxic<span className="text-green-500">-APIs</span>
        </h1>
        <p className="text-green-400/70 text-sm font-mono animate-pulse">
          Initializing Systems...
        </p>
      </div>
    </div>
  );
}
