import React, { useState, useEffect, useCallback } from 'react';
import '../TestimonialCarousel/TestimonialCarousel.css'; // Reuse the same CSS

const CompanyTestimonials = ({ testimonials = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState('');

  // Skip rendering if there are no testimonials
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const handleTransitionEnd = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const getSlidePosition = useCallback((index) => {
    if (testimonials.length === 0) return '';
    if (index === currentSlide) return 'active';
    if (direction === 'next' && index === (currentSlide + 1) % testimonials.length) return 'next';
    if (direction === 'prev' && index === (currentSlide - 1 + testimonials.length) % testimonials.length) return 'prev';
    return '';
  }, [currentSlide, direction, testimonials.length]);

  const handleNext = useCallback(() => {
    if (isTransitioning || testimonials.length <= 1) return;
    setDirection('next');
    setIsTransitioning(true);
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  }, [isTransitioning, testimonials.length]);

  const handlePrev = useCallback(() => {
    if (isTransitioning || testimonials.length <= 1) return;
    setDirection('prev');
    setIsTransitioning(true);
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [isTransitioning, testimonials.length]);

  useEffect(() => {
    if (testimonials.length <= 1 || !isAutoPlaying || isTransitioning) return;

    const intervalId = setInterval(() => {
      handleNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(intervalId);
  }, [isAutoPlaying, testimonials.length, isTransitioning, handleNext]);

  return (
    <section className="py-12 px-6 md:px-12 lg:px-24 text-center mb-12">
      <h3 className="text-[#006452] text-lg font-semibold">Our Client Testimonials</h3>
      <h2 className="text-3xl md:text-4xl font-bold mt-2">What Our Clients Say</h2>
     
      <div className="carousel-container">
        {testimonials.length > 1 && (
          <button 
            className="nav-button prev"
            onClick={handlePrev}
            aria-label="Previous slide"
            disabled={isTransitioning}
          >
            &#8249;
          </button>
        )}

        <div className="carousel-window">
          <div className="carousel-track" onTransitionEnd={handleTransitionEnd}>
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial._id || `testimonial-${index}`}
                className={`carousel-slide ${getSlidePosition(index)} ${isTransitioning ? 'transitioning' : ''}`}
              >
                <div className="testimonial-content">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="testimonial-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/placeholder.png';
                    }}
                  />
                  <div className="testimonial-text">
                    <p className="testimonial-quote">{testimonial.quote}</p>
                    <h3 className="testimonial-name">{testimonial.name}</h3>
                    <p className="testimonial-title">{testimonial.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {testimonials.length > 1 && (
          <button 
            className="nav-button next"
            onClick={handleNext}
            aria-label="Next slide"
            disabled={isTransitioning}
          >
            &#8250;
          </button>
        )}

        {testimonials.length > 1 && (
          <div className="carousel-indicators">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => {
                  if (!isTransitioning) {
                    setDirection(index > currentSlide ? 'next' : 'prev');
                    setIsTransitioning(true);
                    setIsAutoPlaying(false);
                    setCurrentSlide(index);
                  }
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CompanyTestimonials;