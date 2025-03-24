import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Features = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size on component mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on initial load
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);
    
    // Cleanup event listener
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const features = [
    {
      image: "/images/feature1.png",
      heading: "Compare. Choose. Design.",
      description: "Side-by-side comparison dashboard for smart decisions.",
    },
    {
      image: "/images/feature2.png",
      heading: "Verified Listings, Trusted Experts.",
      description: "Handpicked interior companies you can rely on.",
    },
    {
      image: "/images/feature3.png",
      heading: "Your Style, Your Budget.",
      description: "Filter and find the perfect match.",
    },
    {
      image: "/images/feature4.png",
      heading: "Seamless Experience, Zero Hassle.",
      description: "One platform for all your interior needs.",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
    className: "center",
    centerMode: true,
    centerPadding: "40px",
    responsive: [
      {
        breakpoint: 480,
        settings: {
          centerPadding: "20px",
        }
      }
    ]
  };

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50">
      {/* Headings with improved spacing */}
      <div className="text-center mb-12">
        <h3 className="text-[#006452] text-lg font-semibold tracking-wide uppercase">Our Features</h3>
        <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-800">
          Why We Stand Out
        </h2>
      </div>

      {/* Feature Cards - Desktop Row or Mobile Carousel */}
      <div className="max-w-7xl mx-auto">
        {isMobile ? (
          // Mobile Carousel with custom styling
          <div className="slick-container pb-10">
            <Slider {...settings}>
              {features.map((feature, index) => (
                <div key={index} className="px-1 pb-2">
                  <FeatureCard feature={feature} index={index} />
                </div>
              ))}
            </Slider>
          </div>
        ) : (
          // Desktop Row with even spacing
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Enhanced Feature Card component
const FeatureCard = ({ feature, index }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col transition-all duration-300 h-full hover:shadow-xl hover:transform hover:-translate-y-1"
      data-aos="fade-up"
      data-aos-delay={index * 100}
    >
      <div className="p-6 bg-gray-50 flex justify-center">
        <img
          src={feature.image}
          alt={`Feature ${index + 1}`}
          className="h-16 md:h-20 object-contain"
        />
      </div>
      <div className="p-6 flex flex-col justify-between flex-grow">
        <h4 className="text-gray-900 text-xl font-bold mb-3 text-center">
          {feature.heading}
        </h4>
        <p className="text-gray-600 text-center">
          {feature.description}
        </p>
      </div>
    </div>
  );
};

export default Features;