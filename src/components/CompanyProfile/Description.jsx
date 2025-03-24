import React from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const Counter = ({ target, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const isInView = useInView(elementRef);

  useEffect(() => {
    if (isInView) {
      let startTime;
      const startValue = 1;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / (duration * 1000);

        if (progress < 1) {
          const currentCount = Math.floor(startValue + (target - startValue) * progress);
          setCount(currentCount);
          requestAnimationFrame(animate);
        } else {
          setCount(target);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, target, duration]);

  return <span ref={elementRef}>{count}</span>;
};

const Description = ({ company }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const statsData = [
    { value: company?.branches, label: 'Branches' },
    { value: company?.projects, label: 'No. of Projects' },
    { value: company?.experience, label: 'Years of Experience' },
    { value: company?.numberOfProjectsCompleted || 2023, label: 'Years of Awards' }
  ];

  return (
    <div className="container w-[100%] sm:w-[80%] mx-auto p-6">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={containerVariants}
        className="flex flex-col p-4 gap-20 md:flex-row items-center sm:gap-6 bg-white sm:p-6 rounded-lg shadow-md"
      >
        <motion.div
          variants={itemVariants}
          className="w-full md:w-1/2"
        >
          <img
            // src="./images/Description.png"
            src="/images/Description.png"
            alt="Interior Design"
            className="w-full rounded-lg"
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="w-full md:w-1/2"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold mb-4"
          >
            {company?.name}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-gray-700"
          >
            {/* Decorpot is a leading and people's favorite home interior brand which was founded in 2015 with an aim of creating premium and luxury end-to-end home interiors at fair prices and delivering the dreams of the clients. With 8250+ happy homes delivered, our team of 400+ design experts help us bring life to dream home interiors across 8 different cities Bengaluru, Hyderabad, Chennai, Coimbatore, Pune, Noida, Kolkata and Thane Mumbai with 14 exclusive world-class experience centers that showcase the world's best design styles and practical interiors like which we create and deliver for your home spaces. */}
            {company?.description}
            {/* {company?.name} */}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 bg-gradient-to-r rounded-2xl from-[#006452] to-[#c2f8ee] md:grid-cols-2 gap-4 py-4 mt-6"
          >
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-white rounded-lg text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <p className="text-2xl font-bold">
                  <Counter target={stat.value} />
                  {stat.value !== 2023 && '+'}
                </p>
                <p className="text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Description;