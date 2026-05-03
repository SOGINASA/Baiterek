import { motion } from 'framer-motion';
import Spinner from './Spinner';

const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer select-none';

const variants = {
  primary:   'bg-accent text-primary hover:bg-accent-light',
  secondary: 'bg-secondary text-white hover:bg-secondary/90',
  outline:   'border border-accent text-accent hover:bg-accent/10',
  ghost:     'text-secondary hover:bg-secondary/10',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export default function Button({
  variant = 'primary', size = 'md', loading = false,
  leftIcon, rightIcon, children, disabled, className = '', ...rest
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {loading ? <Spinner size="sm" color={variant === 'primary' ? 'primary' : 'accent'} /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </motion.button>
  );
}
