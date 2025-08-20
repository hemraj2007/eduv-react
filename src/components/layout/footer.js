import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import newsletterService from '../../services/newsletterService';

function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      Swal.fire({
        title: 'Error!',
        text: 'Please enter your email address',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        title: 'Invalid Email!',
        text: 'Please enter a valid email address',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await newsletterService.subscribe(email);
      
      Swal.fire({
        title: 'Success!',
        text: 'Thank you for subscribing to our newsletter!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981'
      });
      
      setEmail(''); // Clear the input after successful subscription
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      
      let errorMessage = 'Failed to subscribe to newsletter';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = 'This email is already subscribed to our newsletter';
      } else if (error.response?.status === 400) {
        errorMessage = 'Please enter a valid email address';
      }
      
      Swal.fire({
        title: 'Subscription Failed!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="container-fluid bg-dark text-light footer pt-5 mt-5 wow fadeIn"
      data-wow-delay="0.1s"
    >
      <div className="container py-5">
        <div className="row g-5">
          {/* Quick Links */}
          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-3">Quick Link</h4>
            <Link className="btn btn-link" to="/about">About Us</Link>
            <Link className="btn btn-link" to="/contact">Contact Us</Link>
            <Link className="btn btn-link" to="/courses">Courses</Link>
            <Link className="btn btn-link" to="/testimonial">Testimonial</Link>
            {/* <Link className="btn btn-link" to="/privacy-policy">Privacy Policy</Link>
            <Link className="btn btn-link" to="/terms">Terms &amp; Condition</Link>
            <Link className="btn btn-link" to="/faq">FAQs &amp; Help</Link> */}
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-3">Contact</h4>
            <p className="mb-2">
              <i className="fa fa-map-marker-alt me-3"></i>
              123 Street, New York, USA
            </p>
            <p className="mb-2">
              <i className="fa fa-phone-alt me-3"></i>
              +012 345 67890
            </p>
            <p className="mb-2">
              <i className="fa fa-envelope me-3"></i>
              info@example.com
            </p>
            <div className="d-flex pt-2">
              <a className="btn btn-outline-light btn-social" href="https://www.facebook.com/"><i className="fab fa-twitter"></i></a>
              <a className="btn btn-outline-light btn-social" href="https://www.facebook.com/"><i className="fab fa-facebook-f"></i></a>
              <a className="btn btn-outline-light btn-social" href="https://www.facebook.com/"><i className="fab fa-youtube"></i></a>
              <a className="btn btn-outline-light btn-social" href="https://www.facebook.com/"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>

          {/* Gallery */}
          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-3">Gallery</h4>
            <div className="row g-2 pt-2">
              {["course-1", "course-2", "course-3", "course-2", "course-3", "course-1"].map((img, i) => (
                <div className="col-4" key={i}>
                  <img className="img-fluid bg-light p-1" src={`../img/${img}.jpg`} alt={`Course ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-3">Newsletter</h4>
            <p>Stay updated with our latest news and updates!</p>
            <form onSubmit={handleNewsletterSubmit} className="position-relative mx-auto" style={{ maxWidth: 400 }}>
              <input
                className="form-control border-0 w-100 py-3 ps-4 pe-5"
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="submit"
                className="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Subscribing...' : 'SignUp'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="container">
        <div className="copyright">
          <div className="row">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              ©{" "}
              <Link className="border-bottom" to="/">Edu-v</Link>
              , Copyright © 2024 Doomshell.com : All Rights Reserved.
              <br />
              {/* Designed By{" "}
              <a className="border-bottom" href="https://www.daac.in" target="_blank" rel="noopener noreferrer">
                DAAC
              </a> */}
              <br />
              {/* Distributed By{" "}
              <a className="border-bottom" href="https://themewagon.com" target="_blank" rel="noopener noreferrer">
                ThemeWagon
              </a> */}
            </div>
            <div className="col-md-6 text-center text-md-end">
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
