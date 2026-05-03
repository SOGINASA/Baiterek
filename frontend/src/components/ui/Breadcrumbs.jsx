import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-primary/50">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden className="text-primary/30">/</span>}
              {isLast || !item.href
                ? <span className={isLast ? 'text-primary/80 font-medium' : ''}>{item.label}</span>
                : <Link to={item.href} className="hover:text-accent transition-colors duration-150">{item.label}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
