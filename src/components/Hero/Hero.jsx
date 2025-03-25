import React from "react";

const Hero = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <section
    className="relative w-full min-h-screen flex flex-col lg:flex-row items-center justify-between bg-cover bg-center px-4 sm:px-6 md:px-10 lg:px-16 py-12 lg:py-0"
    style={{ backgroundImage: "url('./images/hero-bg.png')" }}
  >
    {/* Left Content */}
    <div className="max-w-xl text-white text-center lg:text-left lg:ml-16"  data-aos="fade-up">
      <h1 className="text-4xl pt-2 sm:text-5xl md:text-6xl lg:text-6xl font-bold welcome-text">
        Welcome to Inty
      </h1>
      <p className="mt-4 text-xl sm:text-2xl md:text-2xl">
        We help you find and compare the best interior companies, designers, and carpenters.
      </p>
      <button
        className="mt-6 px-6 py-2 bg-[#006452] text-white sm:py-5 text-2xl rounded-lg shadow-md md:text-2xl md:py-5 hover:bg-[#006452] transition duration-300"
        onClick={scrollToTop}
      >
        Explore Services
      </button>
    </div>

    {/* Right Image Section */}
    <div className="relative flex space-x-3  items-center justify-center sm:space-x-5 md:space-x-6 lg:space-x-8 mt-8 lg:mt-0">
      <img src="./images/1.png"  data-aos="zoom-in-up" alt="Designer" className="w-full  h-90 lg:h-130 object-contain translate-y-10" />
      <img src="/images/2.png" alt="Carpenter" data-aos="zoom-in-up" className="w-full h-90  lg:h-130 object-contain -translate-y-10" />
      <img src="/images/3.png" alt="Interior Design" data-aos="zoom-in-up" data-aos-anchor-placement="center-bottom" className="w-full overflow-hidden h-90 lg:h-130 object-contain translate-y-10" />

    </div>
  </section>

  );
};

export default Hero;