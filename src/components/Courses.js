import React, { useState, useEffect } from 'react'
import Header from './layout/header';
import Footer from './layout/footer';
import courseService from '../services/courseService';

export default function Courses() {
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
          const API_BASE_URL = process.env.REACT_APP_API_URL || `https://eduv-node-kxzd.onrender.com`;

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
        {/* Header Start */}
        <div className="container-fluid bg-primary py-5 mb-5 page-header">
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <h1 className="display-3 text-white animated slideInDown">Courses</h1>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb justify-content-center">
                    <li className="breadcrumb-item">
                      <a className="text-white" href="#">
                        Home
                      </a>
                    </li>
                    <li className="breadcrumb-item">
                      <a className="text-white" href="#">
                        Pages
                      </a>
                    </li>
                    <li
                      className="breadcrumb-item text-white active"
                      aria-current="page"
                    >
                      Courses
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
        {/* Header End */}
        {/* Categories Start */}
        {/* <div className="container-xxl py-5 category">
          <div className="container">
            <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
              <h6 className="section-title bg-white text-center text-primary px-3">
                Categories
              </h6>
              <h1 className="mb-5">Courses Categories</h1>
            </div>
            <div className="row g-3">
              <div className="col-lg-7 col-md-6">
                <div className="row g-3">
                  <div
                    className="col-lg-12 col-md-12 wow zoomIn"
                    data-wow-delay="0.1s"
                  >
                    <a className="position-relative d-block overflow-hidden" href="">
                      <img className="img-fluid" src="img/cat-1.jpg" alt="" />
                      <div
                        className="bg-white text-center position-absolute bottom-0 end-0 py-2 px-3"
                        style={{ margin: 1 }}
                      >
                        <h5 className="m-0">Web Design</h5>
                        <small className="text-primary">49 Courses</small>
                      </div>
                    </a>
                  </div>
                  <div
                    className="col-lg-6 col-md-12 wow zoomIn"
                    data-wow-delay="0.3s"
                  >
                    <a className="position-relative d-block overflow-hidden" href="">
                      <img className="img-fluid" src="img/cat-2.jpg" alt="" />
                      <div
                        className="bg-white text-center position-absolute bottom-0 end-0 py-2 px-3"
                        style={{ margin: 1 }}
                      >
                        <h5 className="m-0">Graphic Design</h5>
                        <small className="text-primary">49 Courses</small>
                      </div>
                    </a>
                  </div>
                  <div
                    className="col-lg-6 col-md-12 wow zoomIn"
                    data-wow-delay="0.5s"
                  >
                    <a className="position-relative d-block overflow-hidden" href="">
                      <img className="img-fluid" src="img/cat-3.jpg" alt="" />
                      <div
                        className="bg-white text-center position-absolute bottom-0 end-0 py-2 px-3"
                        style={{ margin: 1 }}
                      >
                        <h5 className="m-0">Video Editing</h5>
                        <small className="text-primary">49 Courses</small>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
              <div
                className="col-lg-5 col-md-6 wow zoomIn"
                data-wow-delay="0.7s"
                style={{ minHeight: 350 }}
              >
                <a
                  className="position-relative d-block h-100 overflow-hidden"
                  href=""
                >
                  <img
                    className="img-fluid position-absolute w-100 h-100"
                    src="img/cat-4.jpg"
                    alt=""
                    style={{ objectFit: "cover" }}
                  />
                  <div
                    className="bg-white text-center position-absolute bottom-0 end-0 py-2 px-3"
                    style={{ margin: 1 }}
                  >
                    <h5 className="m-0">Online Marketing</h5>
                    <small className="text-primary">49 Courses</small>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div> */}
        {/* Categories Start */}
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
                {courses.map((course, index) => (
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
        {/* Testimonial Start */}
        {/* <div className="container-xxl py-5 wow fadeInUp" data-wow-delay="0.1s">
          <div className="container">
            <div className="text-center">
              <h6 className="section-title bg-white text-center text-primary px-3">
                Testimonial
              </h6>
              <h1 className="mb-5">Our Students Say!</h1>
            </div>
            <div className="owl-carousel testimonial-carousel position-relative">
              <div className="testimonial-item text-center">
                <img
                  className="border rounded-circle p-2 mx-auto mb-3"
                  src="img/testimonial-1.jpg"
                  style={{ width: 80, height: 80 }}
                />
                <h5 className="mb-0">Client Name</h5>
                <p>Profession</p>
                <div className="testimonial-text bg-light text-center p-4">
                  <p className="mb-0">
                    Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam
                    amet diam et eos. Clita erat ipsum et lorem et sit.
                  </p>
                </div>
              </div>
              <div className="testimonial-item text-center">
                <img
                  className="border rounded-circle p-2 mx-auto mb-3"
                  src="img/testimonial-2.jpg"
                  style={{ width: 80, height: 80 }}
                />
                <h5 className="mb-0">Client Name</h5>
                <p>Profession</p>
                <div className="testimonial-text bg-light text-center p-4">
                  <p className="mb-0">
                    Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam
                    amet diam et eos. Clita erat ipsum et lorem et sit.
                  </p>
                </div>
              </div>
              <div className="testimonial-item text-center">
                <img
                  className="border rounded-circle p-2 mx-auto mb-3"
                  src="img/testimonial-3.jpg"
                  style={{ width: 80, height: 80 }}
                />
                <h5 className="mb-0">Client Name</h5>
                <p>Profession</p>
                <div className="testimonial-text bg-light text-center p-4">
                  <p className="mb-0">
                    Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam
                    amet diam et eos. Clita erat ipsum et lorem et sit.
                  </p>
                </div>
              </div>
              <div className="testimonial-item text-center">
                <img
                  className="border rounded-circle p-2 mx-auto mb-3"
                  src="img/testimonial-4.jpg"
                  style={{ width: 80, height: 80 }}
                />
                <h5 className="mb-0">Client Name</h5>
                <p>Profession</p>
                <div className="testimonial-text bg-light text-center p-4">
                  <p className="mb-0">
                    Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam
                    amet diam et eos. Clita erat ipsum et lorem et sit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div> */}
        {/* Testimonial End */}
      </>

      <Footer />
    </div>
  )
}
