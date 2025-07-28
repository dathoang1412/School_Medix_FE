import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useContext, useMemo, useState } from "react";
import { ChildContext } from "../layouts/ParentLayout";

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
            label: "Lịch sử khai báo ",
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
    <nav className="w-full bg-white text-[14px] pt-5 pb-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 sm:px-4">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 order-2 sm:order-1">
          {menu.map((item) => (
            <div
              key={item.to}
              className="relative"
              onMouseEnter={() => item.subMenu && setIsDropdownOpen(true)}
              onMouseLeave={() => item.subMenu && setIsDropdownOpen(false)}
            >
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-t transition font-medium ${
                    isActive
                      ? "bg-blue-100 text-blue-700 border-b-2 border-blue-600"
                      : "text-gray-700 hover:bg-blue-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
              {/* Dropdown for "Khai báo" */}
              {item.subMenu && isDropdownOpen && (
                <div className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-lg mt-1 min-w-[180px]">
                  {item.subMenu.map((subItem) => (
                    <NavLink
                      key={subItem.to}
                      to={subItem.to}
                      className={({ isActive }) =>
                        `block px-4 py-2 text-gray-700 hover:bg-blue-50 whitespace-nowrap ${
                          isActive ? "bg-blue-100 text-blue-700" : ""
                        }`
                      }
                    >
                      {subItem.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Child Selector - Moved to right */}
        <div className="order-1 sm:order-2">
          <select
            value={selectedChild?.id || ""}
            onChange={(e) => {
              const child = children.find((c) => c.id === e.target.value);
              if (child) {
                handleSelectChild(child);
                updateChildIdInPath(child.id);
              }
            }}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!children.length}
          >
            <option value="" disabled>
              {children.length ? "Chọn con" : "Không có dữ liệu con"}
            </option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
};

export default TabHeader;