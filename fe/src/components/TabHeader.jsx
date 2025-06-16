import { NavLink } from "react-router-dom";

const TabHeader = () => {
  const menu = [
    {
      label: "Hồ sơ sức khỏe",
      to: `/parent/edit/${JSON.parse(localStorage.getItem("selectedChild"))?.id}/health-profile`,
    },
    {
      label: "Thông tin tiêm chủng",
      to: `/parent/edit/${JSON.parse(localStorage.getItem("selectedChild"))?.id}/vaccine-info`,
    },
    {
      label: "Khám sức khỏe định kỳ",
      to: `/parent/edit/${JSON.parse(localStorage.getItem("selectedChild"))?.id}/regular-checkup`,
    },
    {
      label: "Gửi thuốc cho nhà trường",
      to: `/parent/edit/${JSON.parse(localStorage.getItem("selectedChild"))?.id}/drug-table`,
    },
      {
        label: "Sức khỏe hằng ngày",
        to: `/parent/edit/${JSON.parse(localStorage.getItem("selectedChild"))?.id}/health-record`,
      }
    
  ];
  return (
    <nav className="w-full bg-white text-[14px] pt-5">
      <div className="max-w-7xl mx-auto flex gap-2 px-2 sm:px-4">
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
    </nav>
  );
};
export default TabHeader;
