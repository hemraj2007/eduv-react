import React from 'react';
import Slider from 'react-slick';
import Header from './layout/header';
import Footer from './layout/footer';

// Import slick-carousel css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


function Testimonial() {
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

    return (
        <>
            <Header />

            {/* Header Start */}
            <div className="container-fluid bg-primary py-5 mb-5 page-header">
                <div className="container py-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-10 text-center">
                            <h1 className="display-3 text-white">
                                Testimonial
                            </h1>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center mb-0">
                                    <li className="breadcrumb-item">
                                        <a className="text-white" href="#">Home</a>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <a className="text-white" href="#">Pages</a>
                                    </li>
                                    <li className="breadcrumb-item text-white active" aria-current="page">
                                        Testimonial
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            {/* Header End */}

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

            <Footer />
        </>
    );
}

export default Testimonial;