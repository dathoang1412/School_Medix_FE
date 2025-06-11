export const Services = ({ services }) => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="mb-6">{service.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {service.title}
              </h3>
              <p className="text-gray-600">{service.description}</p>
              {service.info && (
                <p className="mt-4 text-sm text-gray-500">
                  <strong>{service.info}</strong>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
