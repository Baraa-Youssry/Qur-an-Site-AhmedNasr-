export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700">
          {label}
        </label>
      )}
      <input className={`input-field ${error ? '!ring-red-500/50 !border-red-500/50' : ''} ${className}`} {...props} />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
