import React from 'react';

const Loader = ({ title = "Loading", subtitle = "Please wait..." }) => {
  return (
    <div className="full-page-loader-overlay">
      <div className="simple-loader">
        <div className="loader-spinner"></div>
        <h3 className="loader-title">{title}</h3>
        <p className="loader-text">{subtitle}</p>
      </div>
    </div>
  );
};

export default Loader;
