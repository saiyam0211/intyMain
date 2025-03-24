import React, { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useAnimation,
  useTransform,
} from "framer-motion";

const RollingGallery = ({ autoplay = true, pauseOnHover = true, company }) => {
  // Create array of placeholder images
  // const images = [
  //   "https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //   "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //   "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //   "https://images.unsplash.com/photo-1495103033382-fe343886b671?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //   "https://images.unsplash.com/photo-1506781961370-37a89d6b3095?q=80&w=3264&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //   "https://images.unsplash.com/photo-1599576838688-8a6c11263108?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //   "https://images.unsplash.com/photo-1494094892896-7f14a4433b7a?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //   "https://plus.unsplash.com/premium_photo-1664910706524-e783eed89e71?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //   "https://images.unsplash.com/photo-1503788311183-fa3bf9c4bc32?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //   "https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5?q=80&w=3774&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  // ];

  const [images, setImages] = useState([])
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    if (!company) return;
    Object.keys(company).forEach((key) => {
      if (key.includes("bannerImage")) {
        setImages(prev => [...prev, company[key]]) 
      }
    });
  }, [company])

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 4;

  // Calculate pagination values
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = images?.slice(indexOfFirstImage, indexOfLastImage);
  const totalPages = Math.ceil((images?.length || 0) / imagesPerPage);

  const cylinderWidth = 2400;
  const faceCount = images.length;
  const faceWidth = (cylinderWidth / faceCount) * 1.55;
  const radius = cylinderWidth / (2 * Math.PI);

  const rotation = useMotionValue(0);
  const controls = useAnimation();
  const transform = useTransform(
    rotation,
    (val) => `rotate3d(0,1,0,${val}deg)`
  );

  React.useEffect(() => {
    if (autoplay) {
      startInfiniteSpin(0);
    }
  }, [autoplay]);

  const startInfiniteSpin = (startAngle) => {
    controls.start({
      rotateY: [startAngle, startAngle - 360],
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Infinity,
      },
    });
  };

  const handleDrag = (_, info) => {
    controls.stop();
    rotation.set(rotation.get() + info.offset.x * 0.05);
  };

  const handleDragEnd = (_, info) => {
    const finalAngle = rotation.get() + info.velocity.x * 0.05;
    rotation.set(finalAngle);
    if (autoplay) startInfiniteSpin(finalAngle);
  };

  const handleMouseEnter = () => {
    if (autoplay && pauseOnHover) controls.stop();
  };

  const handleMouseLeave = () => {
    if (autoplay && pauseOnHover) startInfiniteSpin(rotation.get());
  };

  return (
    <div className="w-full mb-30">
      <h2 className="text-4xl font-bold text-center mb-16 mt-8">
        See our previous works
      </h2>
      
      <div className="flex flex-col min-h-[600px]">
        {/* Rolling Gallery - Desktop only */}
        {!showGrid && (
          <div className="relative hidden md:block h-[500px] w-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-[48px] z-10 bg-gradient-to-l from-transparent to-white" />
            <div className="absolute top-0 right-0 h-full w-[48px] z-10 bg-gradient-to-r from-transparent to-white" />

            <div className="flex h-full items-center justify-center [perspective:1000px]">
              <motion.div
                drag="x"
                dragElastic={0}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                animate={controls}
                style={{
                  transform,
                  rotateY: rotation,
                  width: cylinderWidth,
                  transformStyle: "preserve-3d",
                }}
                className="flex min-h-[200px] cursor-grab items-center justify-center"
              >
                {images?.map((url, i) => (
                  <div
                    key={i}
                    className="group absolute flex h-fit items-center justify-center p-[6%]"
                    style={{
                      width: `${faceWidth}px`,
                      transform: `rotateY(${(360 / faceCount) * i
                        }deg) translateZ(${radius}px)`,
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <div className="relative  w-[290px] h-[200px] md:w-[400px] md:h-[300px] rounded-[30px] overflow-hidden shadow-lg transform transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={url}
                        alt={`gallery-${i}`}
                        className="w-full h-full object-cover border-4 border-white rounded-[30px]"
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        )}

        {/* Grid view - Always show on mobile, show on desktop only when showGrid is true */}
        <div className={`mt-8 px-4 flex-grow ${!showGrid ? 'md:hidden' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Show currentImages on mobile, show all images on desktop */}
            {(window.innerWidth < 768 ? currentImages : images)?.map((url, i) => (
              <div
                key={i}
                className="relative rounded-lg overflow-hidden shadow-lg aspect-video hover:shadow-xl transition-shadow"
              >
                <img
                  src={url}
                  alt={`gallery-${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Pagination Controls - Mobile only */}
          <div className="md:hidden flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-teal-600 text-white disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md bg-teal-600 text-white disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>

        {/* Toggle button - Desktop only */}
        <div className="hidden md:block text-center mt-8">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            {showGrid ? 'Show As Gallery' : 'Show As Grid'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RollingGallery;
