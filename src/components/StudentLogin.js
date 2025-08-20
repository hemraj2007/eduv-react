import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import studentService from '../services/studentService';
import { setStudentAuth, isStudentAuthenticated } from '../utils/auth';

import Header from "./layout/header";
import Footer from "./layout/footer";
import '../styles/student-styles.css';
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGraduationCap,
  FaArrowRight
} from 'react-icons/fa';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already logged in and redirect to profile
  useEffect(() => {
    if (isStudentAuthenticated()) {
      navigate('/student/profile');
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const response = await studentService.loginStudent(data);

      // Store student data and token using auth utility
      setStudentAuth(response.token, response.student);

      // Show success message
      Swal.fire({
        title: 'Welcome!',
        text: `Hello ${response.student.name}! Login successful.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      // Redirect to student profile
      setTimeout(() => {
        navigate('/student/profile');
      }, 2000);

    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';

      Swal.fire({
        title: 'Login Failed',
        text: message,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (

    <>
      <Header />
      <div className="student-login-container">
        <div className="student-login-card">
          {/* Header */}
          <div className="student-login-header">
            <div className="student-login-icon">
              <FaGraduationCap />
            </div>
            <h2 className="student-login-title">
              Student Login
            </h2>
            <p className="student-login-subtitle">
              Sign in to access your student portal
            </p>
          </div>

          {/* Login Form */}
          <div className="student-login-form">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field */}
              <div className="student-form-group">
                <label htmlFor="email" className="student-form-label">
                  Email Address
                </label>
                <div className="student-form-input">
                  <FaUser className="student-form-input-icon" />
                  <input
                    id="email"
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="student-form-error">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="student-form-group">
                <label htmlFor="password" className="student-form-label">
                  Password
                </label>
                <div className="student-form-input">
                  <FaLock className="student-form-input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="student-form-input-toggle"
                  >
                    {showPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="student-form-error">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="student-login-btn"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Sign In
                      <FaArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="student-login-footer">
            <p>
              © 2024 Student Portal. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>

  );
};

export default StudentLogin;
