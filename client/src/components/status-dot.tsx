interface StatusDotProps {
  isOnline: boolean | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function StatusDot({ isOnline, size = "md", showLabel = false }: StatusDotProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  const pingSizeClasses = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  if (isOnline === null) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="relative flex">
          <span className={`relative inline-flex rounded-full ${sizeClasses[size]} bg-muted-foreground/40`} />
        </span>
        {showLabel && <span className="text-xs text-muted-foreground">Checking...</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex">
        {isOnline && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingSizeClasses[size]} opacity-75`}
            style={{ backgroundColor: isOnline ? "rgb(34 197 94)" : "rgb(239 68 68)" }}
          />
        )}
        <span
          className={`relative inline-flex rounded-full ${sizeClasses[size]}`}
          style={{
            backgroundColor: isOnline ? "rgb(34 197 94)" : "rgb(239 68 68)",
            boxShadow: isOnline
              ? "0 0 8px rgba(34, 197, 94, 0.6), 0 0 16px rgba(34, 197, 94, 0.3)"
              : "0 0 8px rgba(239, 68, 68, 0.6), 0 0 16px rgba(239, 68, 68, 0.3)",
          }}
        />
      </span>
      {showLabel && (
        <span className={`text-xs font-medium ${isOnline ? "text-green-400" : "text-red-400"}`}>
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
    </span>
  );
}
