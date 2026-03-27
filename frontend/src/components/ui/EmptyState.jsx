/**
 * EmptyState — reusable empty/no-data UI.
 */
export default function EmptyState({ icon: Icon, title, subtitle, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-theme-secondary">
      {Icon && <Icon className="text-5xl opacity-20" />}
      {title && <p className="text-base font-semibold text-theme-primary">{title}</p>}
      {subtitle && <p className="text-sm text-center px-8">{subtitle}</p>}
      {action && actionLabel && (
        <button
          onClick={action}
          className="mt-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
