import React from "react";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      image: "/images/service-1.png",
      title: "Interior Designing Companies",
      description:
        "Find interior designing companies as per your requirements in affordable cost.",
      href: "/residential-space",
    },
    {
      image: "/images/service-2.png",
      title: "Interior Designer",
      description:
        "Find interior designing companies as per your requirements in affordable cost.",
      href: "/interiordesigner",
    },
    {
      image: "/images/service-3.png",
      title: "Craftsmen",
      description:
        "Find interior designing companies as per your requirements in affordable cost.",
      href: "/craftsmen",
    },
    {
      image: "/images/service-4.png",
      title: "Cost Estimator",
      description:
        "Find interior designing companies as per your requirements in affordable cost.",
      href: "/cost-estimator",
    },
  ];

  return (
    <section className="py-12 px-6 md:px-12 lg:px-24 text-center mb-12">
      <div className="grid grid-cols-1 justify-center items-center px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-10 gap-4 mt-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-full"
            data-aos="fade-up"
          >
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-md font-semibold">{service.title}</h3>
              {/* <p className="text-sm text-gray-600 mt-2">{service.description}</p> */}
              <div className="flex-grow"></div> {/* Pushes the button to the bottom */}
              <button
                onClick={() => navigate(service.href)}
                className="mt-16 cursor-pointer px-6 py-2 bg-[#006452] text-white rounded-lg shadow-md hover:bg-[#005552] w-full"
              >
                Explore
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
