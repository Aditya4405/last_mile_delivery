import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Skip rendering on dashboard home pages or public layouts
  if (pathnames.length <= 1) return null;

  return (
    <nav className="flex px-1.5 py-3 text-slate-500" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link
            to={`/${pathnames[0]}`}
            className="inline-flex items-center text-xs font-semibold hover:text-brand-600 transition-colors uppercase tracking-wider"
          >
            <FiHome className="mr-1 h-3.5 w-3.5" />
            {pathnames[0]}
          </Link>
        </li>
        {pathnames.slice(1).map((value, index) => {
          const to = `/${pathnames.slice(0, index + 2).join('/')}`;
          const isLast = index === pathnames.length - 2;
          const displayLabel = value.replace('-', ' ').replace('_', ' ');

          return (
            <li key={to}>
              <div className="flex items-center">
                <FiChevronRight className="h-4.5 w-4.5 text-slate-400" />
                {isLast ? (
                  <span className="ml-1 md:ml-2 text-xs font-semibold text-slate-800 capitalize">
                    {displayLabel}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="ml-1 md:ml-2 text-xs font-semibold hover:text-brand-600 transition-colors capitalize"
                  >
                    {displayLabel}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
