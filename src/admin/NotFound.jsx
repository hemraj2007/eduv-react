import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="not-found-page">
      <style>{`
        .not-found-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Poppins', sans-serif;
        }

        .not-found-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
          transition: all 0.3s ease;
        }

        .not-found-container {
          text-align: center;
          color: white;
          z-index: 10;
          position: relative;
          max-width: 600px;
          padding: 2rem;
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 0.8s ease forwards;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .error-code {
          font-size: 12rem;
          font-weight: 900;
          margin: 0;
          background: linear-gradient(45deg, #fff, #f0f0f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
          animation: float 3s ease-in-out infinite;
          line-height: 1;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .error-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 1rem 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          animation: slideInLeft 0.8s ease 0.2s both;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .error-message {
          font-size: 1.2rem;
          margin: 1.5rem 0;
          opacity: 0.9;
          line-height: 1.6;
          animation: slideInRight 0.8s ease 0.4s both;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .error-description {
          font-size: 1rem;
          margin: 1rem 0 2rem 0;
          opacity: 0.8;
          animation: fadeIn 0.8s ease 0.6s both;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeInUp 0.8s ease 0.8s both;
        }

        .btn {
          padding: 12px 30px;
          border: none;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn-primary {
          background: linear-gradient(45deg, #ff6b6b, #ee5a24);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.6);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-3px);
        }

        .floating-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .floating-element {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: floatElement 6s ease-in-out infinite;
        }

        .floating-element:nth-child(1) {
          width: 80px;
          height: 80px;
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .floating-element:nth-child(2) {
          width: 120px;
          height: 120px;
          top: 60%;
          right: 15%;
          animation-delay: 2s;
        }

        .floating-element:nth-child(3) {
          width: 60px;
          height: 60px;
          bottom: 20%;
          left: 20%;
          animation-delay: 4s;
        }

        @keyframes floatElement {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
            opacity: 0.7;
          }
        }

        .search-suggestion {
          margin-top: 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: fadeIn 0.8s ease 1s both;
        }

        .search-suggestion h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #fff;
        }

        .suggestion-links {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .suggestion-link {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          color: white;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .suggestion-link:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .error-code {
            font-size: 8rem;
          }
          
          .error-title {
            font-size: 2rem;
          }
          
          .error-message {
            font-size: 1rem;
          }
          
          .action-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .btn {
            width: 200px;
            justify-content: center;
          }
          
          .floating-elements {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .error-code {
            font-size: 6rem;
          }
          
          .error-title {
            font-size: 1.5rem;
          }
          
          .not-found-container {
            padding: 1rem;
          }
        }
      `}</style>

      <div className="floating-elements">
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
      </div>

      <div className="not-found-container">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          Oops! It looks like you've wandered into uncharted territory.
        </p>
        <p className="error-description">
          The page you're looking for might have been moved, deleted, or never existed.
        </p>
        
        <div className="action-buttons">
          <Link to="/" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9,22 9,12 15,12 15,22"></polyline>
            </svg>
            Go Home
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="btn btn-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            Go Back
          </button>
        </div>

        <div className="search-suggestion">
          <h3>Looking for something specific?</h3>
          <div className="suggestion-links">
            <Link to="/courses" className="suggestion-link">Courses</Link>
            <Link to="/about" className="suggestion-link">About Us</Link>
            <Link to="/contact" className="suggestion-link">Contact</Link>
            <Link to="/packages" className="suggestion-link">Packages</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
