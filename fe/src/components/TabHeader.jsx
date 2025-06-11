const TabHeader = ({ activeIndex }) =>{
    const services = [
    "Thông tin cá nhân",
    "Thông tin tiêm chủng",
    "Thông tin bệnh",
    "Khám sức khỏe định kỳ",
    "Đơn thuốc gửi",
  ];
    return (
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Xin chào, phụ huynh Phạm Thành Phúc</h1>
        <ul className="flex flex-wrap gap-2 border-b border-gray-200 mb-4">
          {services.map((service, index) => (
            <li key={index}>
              <div
                className={`px-3 py-2 rounded-t-md transition-colors duration-200
                  ${index === activeIndex
                    ? "text-blue-600 font-semibold border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-700"
                  }`}
              >
                {service}
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
}
export default TabHeader;