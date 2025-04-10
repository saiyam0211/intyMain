import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; 
import Magnet from "./Magnet.jsx";
import Squares from "./Squares.jsx";

const InteriorPlatform = () => {
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
  const avatars = [
    {
      id: 1,
      position: { top: "10%", left: "-10%" },
      img: "/images/avatar.jpg",
      arrowRotation: 90, 
    },
    {
      id: 2,
      position: { top: "10%", right: "-10%" },
      img: "/images/avatar.jpg",
      arrowRotation: 180, 
    },
    {
      id: 3,
      position: { bottom: "5%", left: "-10%" },
      img: "/images/avatar.jpg",
      arrowRotation: 10, 
    },
    {
      id: 4,
      position: { bottom: "5%", right: "-10%" },
      img: "/images/avatar.jpg",
      arrowRotation: -90, 
    },
  ];

  const ArrowSvg = ({ rotation }) => (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="25px"
      height="25px"
      viewBox="0 0 188.324 188.324"
      style={{ transform: rotation && `rotate(${rotation}deg)` }}
    >
      <g>
        <path
          fill="#030303"
          d="M104.552,188.324l-1.126-0.023c-8.686-0.485-16.159-6.421-18.601-14.758l-14.164-48.403
               l-52.088-10.344c-8.548-1.675-15.124-8.622-16.348-17.279c-1.224-8.638,3.162-17.134,10.91-21.137L156.295,2.228
               c7.49-3.883,17.143-2.596,23.369,3.119c6.336,5.827,8.371,15.078,5.083,23.018l-61.193,147.287
               C120.334,183.355,112.872,188.324,104.552,188.324z"
        />
      </g>
    </svg>
  );

  const AvatarWithArrow = ({ img, arrowRotation }) => (
    <div className="relative group">
      <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-white shadow-sm ">
        <img
          src={img}
          alt="Designer"
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      <div
        className="absolute"
        style={{
          ...(arrowRotation === 90 && { left: "50px", top: "100%" }),
          ...(arrowRotation === 180 && { right: "45px", top: "120%" }),
          ...(arrowRotation === 10 && { left: "55px", bottom: "45%" }),
          ...(arrowRotation === -90 && { right: "50px", bottom: "50%" }),
          transform: "translateY(-50%)",
        }}
      >
        <ArrowSvg rotation={arrowRotation} />
      </div>
    </div>
  );

  return (
    <div className="relative  w-full min-h-screen bg-white overflow-x-hidden">
      <div className="absolute mt-0 inset-0 z-0">
        <Squares
          speed={0.2}
          squareSize={80}
          direction="diagonal"
          borderColor="rgb(0, 96, 69, 0.1)"
        />
      </div>

      <div className="relative z-10 mt-0 flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-8 md:py-16">
        <motion.h1
          className="text-[2rem] md:text-[3rem] font-bold text-center text-emerald-800 mb-6 mt-0 md:mt-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Your Trusted Interior Platform    
          <br />
          – Find the Perfect Fit
        </motion.h1>

        {/* Grid layout updated for 2 cards per row in mobile view */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 w-full pb-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-full w-full"
              data-aos="fade-up"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 md:p-6 flex flex-col flex-grow">
                <h3 className="text-md font-semibold text-center">{service.title}</h3>
                <div className="flex-grow"></div>
                <button
                  onClick={() => navigate(service.href)}
                  className="mt-4 cursor-pointer px-6 py-2 bg-[#006452] text-white rounded-lg shadow-md hover:bg-[#005552] w-full"
                >
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>

        {avatars.map(({ id, position, img, arrowRotation }) => (
          <div 
            key={id} 
            className="absolute hidden md:block" 
            style={position}
          >
            <Magnet
              padding={100}
              magnetStrength={5}
              activeTransition="transform 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67)"
              inactiveTransition="transform 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67)"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * id }}
              >
                <AvatarWithArrow img={img} arrowRotation={arrowRotation} />
              </motion.div>
            </Magnet>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteriorPlatform;
