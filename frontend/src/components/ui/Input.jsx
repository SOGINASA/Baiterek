export default function Input({ label, error, leftIcon, className = '', ...rest }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-primary/80">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          className={`w-full rounded-lg border bg-surface px-4 py-2.5 text-sm placeholder:text-primary/40 outline-none
            transition-[border-color,box-shadow] duration-150
            ${leftIcon ? 'pl-10' : ''}
            ${error
              ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200'
              : 'border-primary/20 focus:border-accent focus:ring-2 focus:ring-accent/20'
            } ${className}`}
          {...rest}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
