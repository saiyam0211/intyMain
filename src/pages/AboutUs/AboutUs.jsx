import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import Header from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import backgroundImage from "../../assets/background.png";
import teamImage from "../../assets/team.png"; // Add this image to your assets folder

export default function AboutUs() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      bio: "With over 15 years of experience in interior design, Sarah founded inty to bridge the gap between homeowners and quality design professionals.",
      image: "/assets/team1.jpg"
    },
    {
      name: "Michael Chen",
      role: "Head of Partnerships",
      bio: "Michael brings 10+ years of industry knowledge and has built our network of verified designers and carpenters across the country.",
      image: "/assets/team2.jpg"
    },
    {
      name: "Elena Rodriguez",
      role: "Chief Design Officer",
      bio: "Award-winning designer with a passion for creating spaces that reflect clients' unique personalities and lifestyles.",
      image: "/assets/team3.jpg"
    },
    {
      name: "David Williams",
      role: "Technology Director",
      bio: "David leads our tech team, ensuring inty's platform provides a seamless experience connecting clients with the right professionals.",
      image: "/assets/team4.jpg"
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="absolute top-0 left-0 w-full bg-transparent z-50">
        <Header />
      </div>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-[400px] bg-cover bg-center text-white flex items-center justify-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(250,250,250,0.85)] to-[rgba(0,100,82,0.85)]"></div>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="z-50 font-inter font-black text-4xl md:text-[64px] leading-[77.45px] tracking-normal text-white"
        >
          About inty
        </motion.h2>
      </motion.section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.8 }}
            className="order-2 md:order-1"
          >
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-3xl font-bold text-[#006452] mb-6"
            >
              Welcome to inty
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-gray-600 mb-4"
            >
              Your one-stop destination for discovering and connecting with the best interior design service providers in your area. At inty, we simplify the process of finding trusted interior companies, carpenters, and designers by bringing them all together on one platform.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-gray-600 mb-4"
            >
              Our mission is to empower customers with transparency, choice, and convenience while enabling interior service providers to showcase their expertise to a wider audience. Whether you're renovating a home, designing a workspace, or building from scratch, inty ensures that you have access to verified experts who can bring your vision to life.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-gray-600 font-medium"
            >
              At inty, we believe that designing a space should be a joyful and stress-free experience. Join us to simplify your journey to creating your dream interiors.
            </motion.p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="order-1 md:order-2"
          >
            <img 
              src={teamImage} 
              alt="inty team" 
              className="rounded-xl shadow-lg w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gray-50 py-16"
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-3xl font-bold text-center text-[#006452] mb-12"
          >
            Our Core Values
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Trust & Quality",
                description: "We rigorously verify all professionals on our platform to ensure the highest quality of service for our customers.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#006452]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              {
                title: "Innovation",
                description: "We're constantly improving our platform to make finding and connecting with interior design professionals easier than ever.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#006452]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )
              },
              {
                title: "Transparency",
                description: "We believe in complete transparency in ratings, reviews, and pricing to help you make informed decisions for your projects.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#006452]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.2), duration: 0.8 }}
                className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-3xl font-bold text-center text-[#006452] mb-12"
        >
          Meet Our Team
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (index * 0.1), duration: 0.6 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="h-64 bg-gray-200">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(/api/placeholder/400/320)` }}
                ></motion.div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                <p className="text-[#006452] font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="bg-gray-50 py-16"
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-3xl font-bold text-center text-[#006452] mb-12"
          >
            What Our Clients Say
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "inty made finding the perfect interior designer for our home renovation incredibly easy. We're thrilled with the results!",
                author: "Jessica T.",
                location: "New York"
              },
              {
                quote: "As a carpenter, joining inty has connected me with clients I wouldn't have found otherwise. My business has grown significantly.",
                author: "Robert M.",
                location: "Chicago"
              },
              {
                quote: "The verification process gave us confidence that we were hiring qualified professionals. Our office redesign turned out beautifully.",
                author: "Amanda L.",
                location: "Los Angeles"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (index * 0.2), duration: 0.6 }}
                className="bg-white p-8 rounded-xl shadow-md"
              >
                <svg className="h-8 w-8 text-[#006452] mb-4 opacity-60" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M10 8v8h6c0 3.314-2.686 6-6 6v2c4.418 0 8-3.582 8-8v-8h-8zM22 8v8h6c0 3.314-2.686 6-6 6v2c4.418 0 8-3.582 8-8v-8h-8z" />
                </svg>
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#006452] flex items-center justify-center text-white font-bold mr-3">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-gray-500 text-sm">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-16 px-4"
      >
        <div className="max-w-4xl mx-auto bg-[#006452] rounded-2xl p-12 text-center text-white">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-3xl font-bold mb-6"
          >
            Transforming interiors, one connection at a time.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg mb-8 text-gray-100"
          >
            Ready to start your interior design journey? Let inty connect you with the perfect professionals for your project.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Button
              onClick={() => navigate("/")}
              className="bg-white text-[#006452] hover:bg-gray-100 px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 font-medium"
            >
              Get Started Today
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}