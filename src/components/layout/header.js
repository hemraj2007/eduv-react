// src/components/Header.js
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isStudentAuthenticated, getStudentData, clearStudentAuth } from "../../utils/auth";
import Swal from "sweetalert2";
import {
  FaUser,
  FaSignOutAlt,
  FaVideo,
  FaCreditCard,
  FaCaretDown
} from "react-icons/fa";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isStudentAuthenticated();
      setIsLoggedIn(authenticated);
      
      if (authenticated) {
        const data = getStudentData();
        setStudentData(data);
      }
    };

    checkAuth();
    
    // Listen for storage changes (when login/logout happens)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.student-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Function to check if a link is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Function to get active class for nav links
  const getActiveClass = (path) => {
    return isActive(path) ? "nav-item nav-link active" : "nav-item nav-link";
  };

  // Function to get active class for dropdown items
  const getDropdownActiveClass = (path) => {
    return isActive(path) ? "dropdown-item active" : "dropdown-item";
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        clearStudentAuth();
        setIsLoggedIn(false);
        setStudentData(null);
        setShowDropdown(false);
        
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        // Redirect to home page
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    });
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white navbar-light shadow sticky-top p-0 global-header">
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center px-4 px-lg-5"
        >
          <img 
            src="/images/logo1.png" 
            alt="Brand Logo" 
            className="brand-logo me-3"
            style={{
              height: '60px',
              width: 'auto',
              maxWidth: '250px'
            }}
          />
        </Link>
        <button
          type="button"
          className="navbar-toggler me-4"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
        >
          <span className="navbar-toggler-icon" />
        </button>
                <div className="collapse navbar-collapse" id="navbarCollapse">
          <div className="navbar-nav ms-auto p-4 p-lg-0">
            <Link to="/" className={getActiveClass("/")}>
              Home
            </Link>
            <Link to="/about" className={getActiveClass("/about")}>
              About
            </Link>
            <Link to="/courses" className={getActiveClass("/courses")}>
              Courses
            </Link>
            <Link to="/packages" className={getActiveClass("/packages")}>
              Packages
            </Link>
            <div className="nav-item dropdown">
              <a
                href="#"
                className={`nav-link dropdown-toggle ${isActive("/team") || isActive("/testimonial") ? "active" : ""}`}
                data-bs-toggle="dropdown"
              >
                Pages
              </a>
              <div className="dropdown-menu fade-down m-0">
                <Link to="/team" className={getDropdownActiveClass("/team")}>
                  Our Team
                </Link>
                <Link to="/testimonial" className={getDropdownActiveClass("/testimonial")}>
                  Testimonial
                </Link>
                {/* <Link to="/404" className={getDropdownActiveClass("/404")}>
                  404 Page
                </Link> */}
              </div>
            </div>
            <Link to="/contact" className={getActiveClass("/contact")}>
              Contact
            </Link>
            
            {/* Mobile Student Menu */}
            {isLoggedIn ? (
              <div className="nav-item dropdown d-lg-none">
                <a
                  href="#"
                  className="nav-link dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  <FaUser className="me-2" />
                  {studentData?.name || 'Student'}
                </a>
                <div className="dropdown-menu fade-down m-0">
                  <div className="dropdown-header px-3 py-2 text-muted small">
                    Welcome, {studentData?.name}
                  </div>
                  <div className="dropdown-divider"></div>
                  
                  <Link to="/student/profile" className="dropdown-item d-flex align-items-center py-2">
                    <FaUser className="me-2" />
                    Profile
                  </Link>
                  
                  <Link to="/student/subscription" className="dropdown-item d-flex align-items-center py-2">
                    <FaCreditCard className="me-2" />
                    Subscription
                  </Link>
                  
                  <Link to="/student/videos" className="dropdown-item d-flex align-items-center py-2">
                    <FaVideo className="me-2" />
                    Videos
                  </Link>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="dropdown-item d-flex align-items-center py-2 text-danger"
                  >
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/student/login" className="nav-link d-lg-none">
                <i className="fa fa-sign-in me-2"></i>
                Login
              </Link>
            )}
          </div>
        
        {/* Student Login/Profile Section */}
        {isLoggedIn ? (
          <div className="position-relative d-none d-lg-block student-dropdown">
            <button
              onClick={toggleDropdown}
              className="btn btn-outline-primary py-4 px-lg-5 d-flex align-items-center"
              style={{ minWidth: '150px' }}
            >
              <FaUser className="me-2" />
              <span className="text-truncate">
                {studentData?.name || 'Student'}
              </span>
              <FaCaretDown className="ms-2" />
            </button>
            
            {showDropdown && (
              <div className="dropdown-menu show position-absolute" style={{ 
                top: '100%', 
                right: 0, 
                minWidth: '200px',
                zIndex: 1000,
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <div className="dropdown-header px-3 py-2 text-muted small">
                  Welcome, {studentData?.name}
                </div>
                <div className="dropdown-divider"></div>
                
                <Link 
                  to="/student/profile" 
                  className="dropdown-item d-flex align-items-center py-2"
                  onClick={() => setShowDropdown(false)}
                >
                  <FaUser className="me-2" />
                  Profile
                </Link>
                
                <Link 
                  to="/student/subscription" 
                  className="dropdown-item d-flex align-items-center py-2"
                  onClick={() => setShowDropdown(false)}
                >
                  <FaCreditCard className="me-2" />
                  Subscription
                </Link>
                
                <Link 
                  to="/student/videos" 
                  className="dropdown-item d-flex align-items-center py-2"
                  onClick={() => setShowDropdown(false)}
                >
                  <FaVideo className="me-2" />
                  Videos
                </Link>
                
                <div className="dropdown-divider"></div>
                
                <button
                  onClick={handleLogout}
                  className="dropdown-item d-flex align-items-center py-2 text-danger"
                >
                  <FaSignOutAlt className="me-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/student/login" className="btn btn-primary py-4 px-lg-5 d-none d-lg-block">
            Login
            <i className="fa fa-arrow-right ms-3" />
          </Link>
        )}
        </div>
      </nav>
    </>
  );
}

export default Header;
