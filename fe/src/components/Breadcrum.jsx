import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Function to format path names (capitalize and replace hyphens/underscores with spaces)
  const formatName = (name) => {
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <nav className="bg-white border-b absolute  px-4 py-3 top-2 left-2 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {/* Home link */}
          <li className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center text-gray-500 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </Link>
          </li>

          {/* Dynamic breadcrumb items */}
          {pathnames.map((name, index) => {
            const routeTo = '/' + pathnames.slice(0, index + 1).join('/');
            const isLast = index === pathnames.length - 1;
            
            return (
              <li key={index} className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                {isLast ? (
                  <span className="text-gray-900 font-semibold">
                    {formatName(name)}
                  </span>
                ) : (
                  <Link 
                    to={routeTo}
                    className="text-gray-500 hover:text-blue-600 transition-colors duration-200 font-medium"
                  >
                    {formatName(name)}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;