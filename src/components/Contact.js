import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import Header from './layout/header';
import Footer from './layout/footer';
import enquiryService from '../services/enquiryService';
import courseService from '../services/courseService';

export default function Contact() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm();

  // Fetch active courses on component mount
  useEffect(() => {
    fetchActiveCourses();
  }, []);

  const fetchActiveCourses = async () => {
    try {
      const response = await courseService.getAllCourses();
      // Filter only active courses (status === 'Y')
      const activeCourses = response.data.filter(course => course.status === 'Y');
      setCourses(activeCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load courses. Please refresh the page.',
      });
    }
  };

  // Phone number input restriction
  const handlePhoneInput = (e) => {
    const value = e.target.value;
    // Only allow digits and limit to 10 characters
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    e.target.value = numericValue;
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await enquiryService.addEnquiry(data);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Enquiry submitted successfully! We will contact you soon.',
        confirmButtonColor: '#3085d6',
      });
      
      // Reset form
      reset();
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit enquiry. Please try again.',
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <>
        {/* Header Start */}
        <div className="container-fluid bg-primary py-5 mb-5 page-header">
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <h1 className="display-3 text-white animated slideInDown">Contact</h1>
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
                      Contact
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
        {/* Header End */}
        {/* Contact Start */}
        <div className="container-xxl py-5">
          <div className="container">
            <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
              <h6 className="section-title bg-white text-center text-primary px-3">
                Contact Us
              </h6>
              <h1 className="mb-5">Contact For Any Query</h1>
            </div>
            <div className="row g-4">
              <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                <h5>Get In Touch</h5>
                <p className="mb-4">
                  Have questions about our courses? Fill out the enquiry form and we'll get back to you as soon as possible. Our team is here to help you find the perfect course for your learning journey.
                </p>
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0 bg-primary"
                    style={{ width: 50, height: 50 }}
                  >
                    <i className="fa fa-map-marker-alt text-white" />
                  </div>
                  <div className="ms-3">
                    <h5 className="text-primary">Office</h5>
                    <p className="mb-0">123 Street, New York, USA</p>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0 bg-primary"
                    style={{ width: 50, height: 50 }}
                  >
                    <i className="fa fa-phone-alt text-white" />
                  </div>
                  <div className="ms-3">
                    <h5 className="text-primary">Mobile</h5>
                    <p className="mb-0">+012 345 67890</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0 bg-primary"
                    style={{ width: 50, height: 50 }}
                  >
                    <i className="fa fa-envelope-open text-white" />
                  </div>
                  <div className="ms-3">
                    <h5 className="text-primary">Email</h5>
                    <p className="mb-0">info@example.com</p>
                  </div>
                </div>
              </div>
              {/* <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
                <iframe
                  className="position-relative rounded w-100 h-100"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3001156.4288297426!2d-78.01371936852176!3d42.72876761954724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4ccc4bf0f123a5a9%3A0xddcfc6c1de189567!2sNew%20York%2C%20USA!5e0!3m2!1sen!2sbd!4v1603794290143!5m2!1sen!2sbd"
                  frameBorder={0}
                  style={{ minHeight: 300, border: 0 }}
                  allowFullScreen=""
                  aria-hidden="false"
                  tabIndex={0}
                />
              </div> */}
              <div className="col-lg-4 col-md-12 wow fadeInUp" data-wow-delay="0.5s">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="form-floating">
                        <input
                          type="text"
                          className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                          id="full_name"
                          placeholder="Your Full Name"
                          {...register('full_name', {
                            required: 'Full name is required',
                            minLength: {
                              value: 2,
                              message: 'Full name must be at least 2 characters'
                            },
                            pattern: {
                              value: /^[a-zA-Z\s]+$/,
                              message: 'Full name can only contain letters and spaces'
                            }
                          })}
                        />
                        <label htmlFor="full_name">Full Name *</label>
                        {errors.full_name && (
                          <div className="invalid-feedback">
                            {errors.full_name.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <input
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          id="email"
                          placeholder="Your Email Address"
                          {...register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Please enter a valid email address'
                            }
                          })}
                        />
                        <label htmlFor="email">Email Address *</label>
                        {errors.email && (
                          <div className="invalid-feedback">
                            {errors.email.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <input
                          type="tel"
                          className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                          id="phone_number"
                          placeholder="Your Phone Number"
                          onInput={handlePhoneInput}
                          {...register('phone_number', {
                            required: 'Phone number is required',
                            pattern: {
                              value: /^\d{10}$/,
                              message: 'Phone number must be exactly 10 digits'
                            }
                          })}
                        />
                        <label htmlFor="phone_number">Phone Number *</label>
                        {errors.phone_number && (
                          <div className="invalid-feedback">
                            {errors.phone_number.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <select
                          className={`form-control ${errors.course_id ? 'is-invalid' : ''}`}
                          id="course_id"
                          {...register('course_id', {
                            required: 'Please select a course'
                          })}
                        >
                          <option value="">Select a course</option>
                          {courses.map((course) => (
                            <option key={course._id} value={course._id}>
                              {course.name}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="course_id">Interested Course *</label>
                        {errors.course_id && (
                          <div className="invalid-feedback">
                            {errors.course_id.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <textarea
                          className="form-control"
                          placeholder="Additional Message"
                          id="additional_message"
                          style={{ height: 150 }}
                          {...register('additional_message', {
                            maxLength: {
                              value: 500,
                              message: 'Message cannot exceed 500 characters'
                            }
                          })}
                        />
                        <label htmlFor="additional_message">Additional Message</label>
                        {errors.additional_message && (
                          <div className="invalid-feedback">
                            {errors.additional_message.message}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <button 
                        className="btn btn-primary w-100 py-3" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Submitting...' : 'Send Enquiry'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* Contact End */}
      </>

      <Footer />
    </div>
  );
}
