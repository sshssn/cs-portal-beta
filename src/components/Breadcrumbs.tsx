import { ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  const navigate = useNavigate();

  const handleClick = (item: BreadcrumbItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
      {showHome && (
        <>
          <button
            onClick={() => {
              localStorage.setItem('currentView', 'dashboard');
              navigate('/');
            }}
            className="flex items-center gap-1 hover:text-gray-900 transition-colors"
          >
            <Home className="h-4 w-4" />
          </button>
          <ChevronRight className="h-3 w-3 text-gray-400" />
        </>
      )}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5">
            {isLast ? (
              <span className="text-gray-900 font-medium">{item.label}</span>
            ) : (
              <>
                <button
                  onClick={() => handleClick(item)}
                  className="hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </button>
                <ChevronRight className="h-3 w-3 text-gray-400" />
              </>
            )}
          </span>
        );
      })}
    </nav>
  );
}
