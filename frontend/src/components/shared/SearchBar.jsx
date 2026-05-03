import { useState } from 'react';

export default function SearchBar({
  placeholder = 'Найдите нужную услугу...',
  value: controlledValue,
  onChange,
  onSubmit,
  size = 'hero',
  autoFocus = false,
  className = '',
}) {
  const [localValue, setLocalValue] = useState('');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : localValue;

  const handleChange = (e) => {
    if (!isControlled) setLocalValue(e.target.value);
    onChange?.(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(value);
  };

  const isHero = size === 'hero';

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <div className="relative flex-1">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none">
          <svg width={isHero ? 20 : 16} height={isHero ? 20 : 16} viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 109 1a8 8 0 000 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <input
          type="search"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full bg-surface text-primary placeholder:text-primary/40 outline-none
            transition-[box-shadow] duration-200
            focus:ring-2 focus:ring-accent/30
            ${isHero
              ? 'h-14 pl-12 pr-36 text-base rounded-xl ring-1 ring-primary/15'
              : 'h-10 pl-10 pr-4 text-sm rounded-lg ring-1 ring-primary/15'
            }`}
        />
      </div>
      {isHero && (
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-lg bg-accent text-primary text-sm font-medium
            hover:bg-accent-light transition-colors duration-150"
        >
          Найти
        </button>
      )}
    </form>
  );
}
