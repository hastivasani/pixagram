/**
 * PageHeader — consistent page header with back button, title, and optional action.
 */
export default function PageHeader({ title, subtitle, onBack, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-theme-secondary hover:bg-theme-hover transition-colors text-theme-secondary"
          >
            ←
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">{title}</h1>
          {subtitle && <p className="text-theme-secondary text-sm">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
