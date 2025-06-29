import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useContext, useMemo } from "react";
import { ChildContext } from "../layouts/ParentLayout";

const TabHeader = () => {
  const { children, selectedChild, handleSelectChild } = useContext(ChildContext);
  const navigate = useNavigate();
  const location = useLocation();

  const menu = useMemo(
    () =>
      [
        {
          label: "Hồ sơ sức khỏe",
          to: selectedChild ? `/parent/edit/${selectedChild.id}/health-profile` : "#",
        },
        {
          label: "Thông tin tiêm chủng",
          to: selectedChild ? `/parent/edit/${selectedChild.id}/vaccine-info` : "#",
        },
        {
          label: "Khám sức khỏe định kỳ",
          to: selectedChild ? `/parent/edit/${selectedChild.id}/regular-checkup` : "#",
        },
        {
          label: "Gửi thuốc cho nhà trường",
          to: selectedChild ? `/parent/edit/${selectedChild.id}/drug-table` : "#",
        },
        {
          label: "Sức khỏe hằng ngày",
          to: selectedChild ? `/parent/edit/${selectedChild.id}/health-record` : "#",
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
      // Fallback to a default tab if no valid tab is in the URL
      navigate(`/parent/edit/${newChildId}/health-profile`);
    }
  };

  return (
    <nav className="w-full bg-white text-[14px] pt-5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-2 px-2 sm:px-4">
        {/* Child Selector Dropdown */}
        <div className="mb-4 sm:mb-0">
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

        {/* Tab Navigation */}
        <div className="flex gap-2 flex-wrap">
          {menu.map((item) => (
            <NavLink
              key={item.to}
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
          ))}
        </div>
      </div>
    </nav>
  );
};

export default TabHeader;