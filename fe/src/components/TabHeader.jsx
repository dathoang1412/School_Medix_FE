import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useContext, useMemo, useState } from "react";
import { ChildContext } from "../layouts/ParentLayout";
import { ChevronDown, User } from "lucide-react";

const TabHeader = () => {
  const { children, selectedChild, handleSelectChild } = useContext(ChildContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const menu = useMemo(
    () => [ 
      {
        label: "Hồ sơ",
        to: selectedChild ? `/parent/edit/${selectedChild.id}/health-profile` : "#",
      },
      {
        label: "Tiêm chủng",
        to: selectedChild ? `/parent/edit/${selectedChild.id}/vaccine-info` : "#",
      },
      {
        label: "Sức khỏe định kỳ",
        to: selectedChild ? `/parent/edit/${selectedChild.id}/regular-checkup` : "#",
      },
      {
        label: "Gửi thuốc",
        to: selectedChild ? `/parent/edit/${selectedChild.id}/drug-table` : "#",
      },
      {
        label: "Sức khỏe hằng ngày",
        to: selectedChild ? `/parent/edit/${selectedChild.id}/health-record` : "#",
      },
      {
        label: "Hồ sơ bệnh",
        to: selectedChild ? `/parent/edit/${selectedChild.id}/health-record-list` : "#",
      },
      {
        label: "Khai báo",
        to: selectedChild ? `/parent/edit/${selectedChild.id}/history-declare-record` : "#",
        subMenu: [
          {
            label: "Lịch sử khai báo",
            to: selectedChild ? `/parent/edit/${selectedChild.id}/history-declare-record` : "#",
          },
          {
            label: "Khai báo tiêm chủng",
            to: selectedChild ? `/parent/edit/${selectedChild.id}/vaccine-declare` : "#",
          },
          {
            label: "Khai báo bệnh",
            to: selectedChild ? `/parent/edit/${selectedChild.id}/disease-declare` : "#",
          },
        ],
      },
    ],
    [selectedChild]
  );

  const updateChildIdInPath = (newChildId) => {
    const pathSegments = location.pathname.split("/");
    if (pathSegments.length > 3) {
      pathSegments[3] = newChildId;
      const newPath = pathSegments.join("/");
      navigate(newPath);
    } else {
      navigate(`/parent/edit/${newChildId}/health-profile`);
    }
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Tab Navigation - Left Side */}
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            {menu.map((item) => (
              <div
                key={item.to}
                className="relative flex-shrink-0"
                onMouseEnter={() => item.subMenu && setIsDropdownOpen(true)}
                onMouseLeave={() => item.subMenu && setIsDropdownOpen(false)}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center px-4 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                      isActive
                        ? "border-blue-600 text-blue-600 bg-blue-50"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }`
                  }
                >
                  <span>{item.label}</span>
                  {item.subMenu && (
                    <ChevronDown className="ml-1 w-4 h-4" />
                  )}
                </NavLink>
                
                {/* Dropdown for submenu */}
                {item.subMenu && isDropdownOpen && (
                  <div className="absolute top-full left-0 z-20 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
                    <div className="py-1">
                      {item.subMenu.map((subItem) => (
                        <NavLink
                          key={subItem.to}
                          to={subItem.to}
                          className={({ isActive }) =>
                            `block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                              isActive ? "bg-blue-50 text-blue-600 font-medium" : ""
                            }`
                          }
                        >
                          {subItem.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Child Selector - Right Side */}
          <div className="flex items-center ml-4">
            <div className="relative">
              <select
                value={selectedChild?.id || ""}
                onChange={(e) => {
                  const child = children.find((c) => c.id === e.target.value);
                  if (child) {
                    handleSelectChild(child);
                    updateChildIdInPath(child.id);
                  }
                }}
                className="appearance-none cursor-pointer bg-white border border-gray-300 rounded-lg pl-10 pr-8 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[150px]"
                disabled={!children.length}
              >
                <option value="" disabled>
                  {children.length ? "Chọn con" : "Không có dữ liệu"}
                </option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    <p className="cursor-pointer">{child.name}</p>
                  </option>
                ))}
              </select>
              
              {/* Custom select styling */}
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
};

export default TabHeader;