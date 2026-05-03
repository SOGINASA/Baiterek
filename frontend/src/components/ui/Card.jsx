import { motion } from 'framer-motion';

const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };

export default function Card({ hoverable = false, padding = 'md', children, className = '', style, ...rest }) {
  const base = `bg-surface rounded-2xl border border-primary/8 ${paddings[padding]} ${className}`;
  const shadow = { boxShadow: 'var(--shadow-card)', ...style };

  if (!hoverable) {
    return <div className={base} style={shadow} {...rest}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: 'var(--shadow-card-hover)' }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className={`${base} cursor-pointer`}
      style={shadow}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
