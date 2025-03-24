import React from "react";

const OurPartners = () => {
  const partners = [
    { image: "/images/partner1.png" },
    { image: "/images/partner2.png" },
    { image: "/images/partner3.png" },
    { image: "/images/partner4.png" },
  ];

  return (
    <section className="py-12 px-6 md:px-12 lg:px-24 text-center">
      {/* Headings */}
      <h3 className="text-[#006452] text-lg font-semibold">Our Partners</h3>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2">
        Our Long Time Partners
      </h2>

      {/* Partner Logos */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4  gap-6 md:gap-10 lg:gap-14 justify-center items-center">
        {partners.map((partner, index) => (
          <img  data-aos="fade-right"
            key={index}
            src={partner.image}
            className="w-50 md:w-32 sm:w-60 lg:w-40 object-contain mx-auto"
            alt={`Partner ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default OurPartners;
