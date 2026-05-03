const variants = {
  default: 'bg-secondary/10 text-secondary',
  accent:  'bg-accent/15 text-accent',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  error:   'bg-red-100 text-red-700',
  muted:   'bg-primary/8 text-primary/60',
};

const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-xs' };

export default function Badge({ variant = 'default', size = 'sm', children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
