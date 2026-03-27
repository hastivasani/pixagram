/**
 * LoadingSkeleton — animated placeholder cards.
 * @param {number} count   - number of skeleton cards
 * @param {string} type    - "card" | "row" | "circle"
 * @param {string} className
 */
export default function LoadingSkeleton({ count = 4, type = "card", className = "" }) {
  const items = Array.from({ length: count });

  if (type === "row") {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-theme-secondary flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-theme-secondary rounded w-1/3" />
              <div className="h-3 bg-theme-secondary rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "circle") {
    return (
      <div className={`flex gap-3 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
            <div className="w-14 h-14 rounded-full bg-theme-secondary" />
            <div className="h-2 w-12 bg-theme-secondary rounded" />
          </div>
        ))}
      </div>
    );
  }

  // default: card grid
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="bg-theme-secondary rounded-2xl overflow-hidden animate-pulse">
          <div className="h-44 bg-gray-700/30" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-700/30 rounded w-3/4" />
            <div className="h-3 bg-gray-700/30 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
