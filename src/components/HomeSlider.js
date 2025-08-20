import React, { useState, useEffect, useRef } from 'react';
import sliderService from '../services/sliderService';

export default function HomeSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);

  // Fetch sliders from API
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        setLoading(true);
        const response = await sliderService.getAllSliders();
        console.log('API Response:', response);
        if (response?.success && response?.data) {
          // Get API base URL from environment or use default
          const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1100';
          
          // Filter only active sliders and sort by position
          const activeSliders = response.data
            .filter(slider => slider.status === 'Y')
            .sort((a, b) => a.position - b.position)
            .map(slider => ({
              ...slider,
              // Construct URL using image field: API_BASE_URL/sliders/image
              imageUrl: `${API_BASE_URL}/sliders/${slider.image}`
            }));
          console.log('Processed sliders:', activeSliders);
          setSliders(activeSliders);
        }
      } catch (error) {
        console.error('Error fetching sliders:', error);
        // Fallback to default slides if API fails
        setSliders([
          // {
          //   _id: 1,
          //   imageUrl: "img/carousel-1.jpg",
          //   title: "The Best Online Learning Platform",
          //   subtitle: "Best Online Courses",
          //   description: "Vero elitr justo clita lorem. Ipsum dolor at sed stet sit diam no. Kasd rebum ipsum et diam justo clita et kasd rebum sea sanctus eirmod elitr."
          // },
          // {
          //   _id: 2,
          //   imageUrl: "img/carousel-2.jpg",
          //   title: "Get Educated Online From Your Home",
          //   subtitle: "Best Online Courses",
          //   description: "Vero elitr justo clita lorem. Ipsum dolor at sed stet sit diam no. Kasd rebum ipsum et diam justo clita et kasd rebum sea sanctus eirmod elitr."
          // }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  // Auto slide functionality
  useEffect(() => {
    if (sliders.length === 0) return;

    const startAutoSlide = () => {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % sliders.length);
      }, 3000); // Change slide every 3 seconds
    };

    startAutoSlide();

    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sliders.length]);

  // Pause auto-slide on hover
  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % sliders.length);
    }, 3000);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + sliders.length) % sliders.length);
  };

  const goToNext = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % sliders.length);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container-fluid p-0 mb-5">
        <div className="carousel slide">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <div className="d-block w-100 vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f8f9fa" }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no sliders
  if (sliders.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Carousel Start */}
      <div className="container-fluid p-0 mb-5">
        <div
          ref={carouselRef}
          className="carousel slide"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="carousel-inner">
            {sliders.map((slider, index) => (
              <div
                key={slider._id}
                className={`carousel-item ${index === currentSlide ? 'active' : ''}`}
              >
                <img 
                  className="d-block w-100 vh-100 object-fit-cover" 
                  src={slider.imageUrl} 
                  alt={`Slide ${slider._id}`} 
                  onLoad={() => console.log('Image loaded successfully:', slider.imageUrl)}
                  onError={(e) => {
                    console.error('Image failed to load:', slider.imageUrl);
                    console.error('Error details:', e);
                    // // Optionally set a fallback image
                    // e.target.src = 'img/carousel-1.jpg';
                  }}
                />
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center"
                  style={{ background: "rgba(24, 29, 56, 0.7)" }}
                >
                  <div className="container">
                    <div className="row">
                      <div className="col-lg-8 text-start">
                        <h5 className="text-primary text-uppercase mb-3">{slider.subtitle}</h5>
                        <h1 className="display-3 text-white">{slider.title}</h1>
                        <p className="fs-5 text-white mb-4 pb-2">
                          {slider.description}
                        </p>
                        <a href="#" className="btn btn-primary py-md-3 px-md-5 me-3">Read More</a>
                        <a href="#" className="btn btn-light py-md-3 px-md-5">Join Now</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Controls */}
          <button className="carousel-control-prev" type="button" onClick={goToPrevious}>
            <span className="carousel-control-prev-icon"></span>
          </button>
          <button className="carousel-control-next" type="button" onClick={goToNext}>
            <span className="carousel-control-next-icon"></span>
          </button>

          {/* Carousel Indicators */}
          <div className="carousel-indicators">
            {sliders.map((slider, index) => (
              <button
                key={slider._id}
                type="button"
                className={`carousel-indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: index === currentSlide ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                  margin: '0 4px',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Carousel End */}
    </div>
  );
}
