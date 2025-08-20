import React, { useState, useEffect } from 'react'

import Header from './layout/header';
import Footer from './layout/footer';
import HomeSlider from './HomeSlider';
import Slider from 'react-slick';
// Import slick-carousel css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


import courseService from '../services/courseService';

export default function Home() {
  // Settings for the slider
  const settings = {
    dots: true,         // Show dots at the bottom
    infinite: true,     // Loop the slider
    speed: 500,         // Animation speed
    slidesToShow: 3,    // Show 3 slides at a time
    slidesToScroll: 1,  // Scroll 1 slide at a time
    centerMode: true,   // Enable center mode to highlight the middle slide
    centerPadding: '0px', // No padding around the center slide
    autoplay: true,       // Enable auto-sliding
    autoplaySpeed: 3000,  // Slide every 3 seconds
    responsive: [
      {
        breakpoint: 992, // For tablets
        settings: {
          slidesToShow: 1,
        }
      },
      {
        breakpoint: 768, // For mobile
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  // Testimonial data
  const testimonials = [
    { id: 1, name: 'Client Name 1', profession: 'Profession 1', text: 'Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit.' },
    { id: 2, name: 'Client Name 2', profession: 'Profession 2', text: 'Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit.' },
    { id: 3, name: 'Client Name 3', profession: 'Profession 3', text: 'Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit.' },
    { id: 4, name: 'Client Name 4', profession: 'Profession 4', text: 'Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit.' }
  ];


  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseService.getAllCourses();
        console.log('Course API Response:', response);
        if (response?.data) {
          // Get API base URL from environment or use default
          const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1100';

          // Filter only active courses and add image URL
          const activeCourses = response.data
            .filter(course => course.status === 'Y')
            .map(course => ({
              ...course,
              // Construct image URL using courseImage field: API_BASE_URL/courseImage
              imageUrl: `${API_BASE_URL}/${course.courseImage}`
            }));
          console.log('Processed courses:', activeCourses);
          setCourses(activeCourses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);




  return (
    <div>


      <Header />

      <>
        <HomeSlider />

        {/* Service Start */}
        <div className="container-xxl py-5">
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.1s">
                <div className="service-item text-center pt-3">
                  <div className="p-4">
                    <i className="fa fa-3x fa-graduation-cap text-primary mb-4" />
                    <h5 className="mb-3">Skilled Instructors</h5>
                    <p>
                      Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita
                      amet diam
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.3s">
                <div className="service-item text-center pt-3">
                  <div className="p-4">
                    <i className="fa fa-3x fa-globe text-primary mb-4" />
                    <h5 className="mb-3">Online Classes</h5>
                    <p>
                      Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita
                      amet diam
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.5s">
                <div className="service-item text-center pt-3">
                  <div className="p-4">
                    <i className="fa fa-3x fa-home text-primary mb-4" />
                    <h5 className="mb-3">Home Projects</h5>
                    <p>
                      Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita
                      amet diam
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.7s">
                <div className="service-item text-center pt-3">
                  <div className="p-4">
                    <i className="fa fa-3x fa-book-open text-primary mb-4" />
                    <h5 className="mb-3">Book Library</h5>
                    <p>
                      Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita
                      amet diam
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Service End */}
        {/* About Start */}
        <div className="container-xxl py-5">
          <div className="container">
            <div className="row g-5">
              <div
                className="col-lg-6 wow fadeInUp"
                data-wow-delay="0.1s"
                style={{ minHeight: 400 }}
              >
                <div className="position-relative h-100">
                  <img
                    className="img-fluid position-absolute w-100 h-100"
                    src="img/about.jpg"
                    alt=""
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
              <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
                <h6 className="section-title bg-white text-start text-primary pe-3">
                  About Us
                </h6>
                <h1 className="mb-4">Welcome to eLEARNING</h1>
                <p className="mb-4">
                  Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu
                  diam amet diam et eos. Clita erat ipsum et lorem et sit.
                </p>
                <p className="mb-4">
                  Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu
                  diam amet diam et eos. Clita erat ipsum et lorem et sit, sed stet
                  lorem sit clita duo justo magna dolore erat amet
                </p>
                <div className="row gy-2 gx-4 mb-4">
                  <div className="col-sm-6">
                    <p className="mb-0">
                      <i className="fa fa-arrow-right text-primary me-2" />
                      Skilled Instructors
                    </p>
                  </div>
                  <div className="col-sm-6">
                    <p className="mb-0">
                      <i className="fa fa-arrow-right text-primary me-2" />
                      Online Classes
                    </p>
                  </div>
                  <div className="col-sm-6">
                    <p className="mb-0">
                      <i className="fa fa-arrow-right text-primary me-2" />
                      International Certificate
                    </p>
                  </div>
                  <div className="col-sm-6">
                    <p className="mb-0">
                      <i className="fa fa-arrow-right text-primary me-2" />
                      Skilled Instructors
                    </p>
                  </div>
                  <div className="col-sm-6">
                    <p className="mb-0">
                      <i className="fa fa-arrow-right text-primary me-2" />
                      Online Classes
                    </p>
                  </div>
                  <div className="col-sm-6">
                    <p className="mb-0">
                      <i className="fa fa-arrow-right text-primary me-2" />
                      International Certificate
                    </p>
                  </div>
                </div>
                <a className="btn btn-primary py-3 px-5 mt-2" href="">
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* About End */}

        {/* Courses Start */}
        <div className="container-xxl py-5">
          <div className="container">
            <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
              <h6 className="section-title bg-white text-center text-primary px-3">
                Courses
              </h6>
              <h1 className="mb-5">Popular Courses</h1>
            </div>

            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center">
                <p className="text-muted">No courses available at the moment.</p>
              </div>
            ) : (
              <div className="row g-4 justify-content-center">
                {courses.slice(0, 6).map((course, index) => (
                  <div key={course._id} className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay={`${0.1 + index * 0.2}s`}>
                    <div className="course-item bg-light">
                      <div className="position-relative overflow-hidden">
                        <img
                          className="img-fluid"
                          src={course.imageUrl}
                          alt={course.name}
                          onError={(e) => {
                            console.error('Course image failed to load:', course.imageUrl);
                            e.target.src = 'img/course-1.jpg'; // Fallback image
                          }}
                        />
                        <div className="w-100 d-flex justify-content-center position-absolute bottom-0 start-0 mb-4">
                          <a
                            href="#"
                            className="flex-shrink-0 btn btn-sm btn-primary px-3 border-end"
                            style={{ borderRadius: "30px 0 0 30px" }}
                          >
                            Read More
                          </a>
                          <a
                            href="#"
                            className="flex-shrink-0 btn btn-sm btn-primary px-3"
                            style={{ borderRadius: "0 30px 30px 0" }}
                          >
                            Join Now
                          </a>
                        </div>
                      </div>
                      <div className="text-center p-4 pb-0">
                        <h3 className="mb-0">₹{course.finalFees}</h3>
                        {course.actualFees > course.finalFees && (
                          <small className="text-muted text-decoration-line-through">₹{course.actualFees}</small>
                        )}
                        <div className="mb-3">
                          <small className="fa fa-star text-primary" />
                          <small className="fa fa-star text-primary" />
                          <small className="fa fa-star text-primary" />
                          <small className="fa fa-star text-primary" />
                          <small className="fa fa-star text-primary" />
                          <small>(123)</small>
                        </div>
                        <h5 className="mb-4">
                          {course.name}
                        </h5>
                      </div>
                      <div className="d-flex border-top">
                        <small className="flex-fill text-center border-end py-2">
                          <i className="fa fa-user-tie text-primary me-2" />
                          Instructor
                        </small>
                        <small className="flex-fill text-center border-end py-2">
                          <i className="fa fa-clock text-primary me-2" />
                          {course.duration}
                        </small>
                        <small className="flex-fill text-center py-2">
                          <i className="fa fa-user text-primary me-2" />
                          {course.studentCount} Students
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Courses End */}
        {/* Team Start */}
        <div className="container-xxl py-5">
          <div className="container">
            <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
              <h6 className="section-title bg-white text-center text-primary px-3">
                Instructors
              </h6>
              <h1 className="mb-5">Expert Instructors</h1>
            </div>
            <div className="row g-4">
              <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                <div className="team-item bg-light">
                  <div className="overflow-hidden">
                    <img className="img-fluid" src="img/team-1.jpg" alt="" />
                  </div>
                  <div
                    className="position-relative d-flex justify-content-center"
                    style={{ marginTop: "-23px" }}
                  >
                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                      <a className="btn btn-sm-square btn-primary mx-1" href="">
                        <i className="fab fa-facebook-f" />
                      </a>
                      <a className="btn btn-sm-square btn-primary mx-1" href="">
                        <i className="fab fa-twitter" />
                      </a>
                      <a className="btn btn-sm-square btn-primary mx-1" href="">
                        <i className="fab fa-instagram" />
                      </a>
                    </div>
                  </div>
                  <div className="text-center p-4">
                    <h5 className="mb-0">Instructor Name</h5>
                    <small>Designation</small>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
                <div className="team-item bg-light">
                  <div className="overflow-hidden">
                    <img className="img-fluid" src="img/team-2.jpg" alt="" />
                  </div>
                  <div
                    className="position-relative d-flex justify-content-center"
                    style={{ marginTop: "-23px" }}
                  >
                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                      <a className="btn btn-sm-square btn-primary mx-1" href="">
                        <i className="fab fa-facebook-f" />
                      </a>
                      <a className="btn btn-sm-square btn-primary mx-1" href="">
                        <i className="fab fa-twitter" />
                      </a>
                      <a className="btn btn-sm-square btn-primary mx-1" href="">
                        <i className="fab fa-instagram" />
                      </a>
                    </div>
                  </div>
                  <div className="text-center p-4">
                    <h5 className="mb-0">Instructor Name</h5>
                    <small>Designation</small>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.5s">
                <div className="team-item bg-light">
                  <div className="overflow-hidden">
                    <img className="img-fluid" src="img/team-3.jpg" alt="" />
                  </div>
                  <div
                    className="position-relative d-flex justify-content-center"
                    style={{ marginTop: "-23px" }}
                  >
                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                      <a className="btn btn-sm-square btn-primary mx-1" href="">
                        <i className="fab fa-facebook-f" />
                      </a>
                      <a className="btn btn-sm-square btn-primary mx-1" href="">
                        <i className="fab fa-twitter" />
                      </a>
                      <a className="btn btn-sm-square btn-primary mx-1" href="">
                        <i className="fab fa-instagram" />
                      </a>
                    </div>
                  </div>
                  <div className="text-center p-4">
                    <h5 className="mb-0">Instructor Name</h5>
                    <small>Designation</small>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.7s">
                <div className="team-item bg-light">
                  <div className="overflow-hidden">
                    <img className="img-fluid" src="img/team-4.jpg" alt="" />
                  </div>
                  <div
                    className="position-relative d-flex justify-content-center"
                    style={{ marginTop: "-23px" }}
                  >
                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                      <a className="btn btn-sm-square btn-primary mx-1" href="">
                        <i className="fab fa-facebook-f" />
                      </a>
                      <a className="btn btn-sm-square btn-primary mx-1" href="">
                        <i className="fab fa-twitter" />
                      </a>
                      <a className="btn btn-sm-square btn-primary mx-1" href="">
                        <i className="fab fa-instagram" />
                      </a>
                    </div>
                  </div>
                  <div className="text-center p-4">
                    <h5 className="mb-0">Instructor Name</h5>
                    <small>Designation</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Team End */}
        {/* Testimonial Start */}
        <div className="container-xxl py-5">
          <div className="container">
            <div className="text-center">
              <h6 className="section-title bg-white text-center text-primary px-3">
                Testimonial
              </h6>
              <h1 className="mb-5">Our Students Say!</h1>
            </div>

            {/* Slick Slider */}
            <Slider {...settings}>
              {testimonials.map((item) => (
                <div key={item.id}>
                  <div className="testimonial-item text-center">
                    <img
                      src={`/img/testimonial-${item.id}.jpg`}
                      alt={item.name}
                      className="border rounded-circle p-2 mx-auto mb-3"
                      style={{ width: 80, height: 80 }}
                    />
                    <h5 className="mb-0">{item.name}</h5>
                    <p>{item.profession}</p>
                    <div className="testimonial-text bg-light text-center p-4 mt-2">
                      <p className="mb-0">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
        {/* Testimonial End */}

      </>

      <Footer />
    </div>
  );
}


