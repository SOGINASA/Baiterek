import { motion } from 'framer-motion';

export default function Tabs({ tabs = [], activeTab, onChange, variant = 'underline', className = '' }) {
  if (variant === 'pill') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 ${
              activeTab === tab.id ? 'text-primary' : 'text-primary/60 hover:text-primary'
            }`}
          >
            {activeTab === tab.id && (
              <motion.span
                layoutId="pill-indicator"
                className="absolute inset-0 bg-accent rounded-full"
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
            {tab.count != null && (
              <span className={`relative z-10 ml-1.5 text-xs ${activeTab === tab.id ? 'text-primary/60' : 'text-primary/40'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex border-b border-primary/10 ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-3 text-sm font-medium transition-colors duration-150 ${
            activeTab === tab.id ? 'text-accent' : 'text-primary/60 hover:text-primary'
          }`}
        >
          {tab.label}
          {tab.count != null && (
            <span className="ml-1.5 text-xs text-primary/40">{tab.count}</span>
          )}
          {activeTab === tab.id && (
            <motion.span
              layoutId="underline-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
