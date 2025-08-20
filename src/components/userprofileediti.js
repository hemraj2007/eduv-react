import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Confing from "../config/confing";
import Header from "./layout/header";
import Footer from "./layout/footer";

export default function EdituserProfile() {
  const navigate = useNavigate();
  // Get user ID from localStorage
  const id = localStorage.getItem("user_id");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [img, setImg] = useState(null);

  // State for form validation and error messages
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Check if user is logged in
  useEffect(() => {
    if (!id) {
      navigate("/login");
    }
  }, [id, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${Confing.API_Url}/user/getone/${id}`);
        const { data } = response.data;
        setName(data.fullName || "");
        setEmail(data.email || "");
        setMobile(data.mobile || "");
        setAddress(data.address || "");
      } catch (error) {
        console.error("Error fetching user:", error);
        setMessage({
          text: `Error: ${error.message || "Failed to fetch user data"}`,
          type: "error",
        });
      }
    };

    if (id) fetchUser();
  }, [id, setName, setEmail, setMobile, setAddress, setMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset any previous error messages
    setMessage({ text: "", type: "" });

    // Validate inputs
    if (!name.trim()) {
      setMessage({ text: "Name is required", type: "error" });
      return;
    }

    if (!mobile.trim()) {
      setMessage({ text: "Mobile number is required", type: "error" });
      return;
    }

    if (!address.trim()) {
      setMessage({ text: "Address is required", type: "error" });
      return;
    }

    try {
      const apiUrl = `${Confing.API_Url}/user/profile/edit/${id}`;
      const formData = new FormData();

      formData.append("fullName", name);
      formData.append("mobile", mobile);
      formData.append("address", address);
      if (img) {
        formData.append("image", img);
      }

      const response = await axios.put(apiUrl, formData);
      
      if (response.status === 200) {
        setMessage({
          text: "Your information has been updated successfully",
          type: "success",
        });
        
        Swal.fire({
          icon: "success",
          text: "Your Info Updated Successfully",
        });

        // Navigate after a short delay to allow the user to see the success message
        setTimeout(() => {
          navigate("/userprofile");
        }, 1500);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred";
      setMessage({
        text: `Error: ${errorMessage}`,
        type: "error",
      });
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto mt-24 px-6 py-10 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-xl rounded-2xl border border-gray-200 mb-3">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Edit Your Info</h1>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-md text-white text-center font-medium ${
              message.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-label="Full name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                aria-label="Email (read-only)"
                aria-readonly="true"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed shadow-sm"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile</label>
              <input
                type="tel"
                pattern="[0-9]*"
                inputMode="numeric"
                value={mobile}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^[0-9]+$/.test(value)) {
                    setMobile(value);
                  }
                }}
                required
                aria-label="Mobile number"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={3}
                placeholder="Enter your full address"
                aria-label="Address"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm resize-none"
              />
            </div>

            {/* Profile Image */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.type.startsWith('image/')) {
                    setImg(file);
                  } else if (file) {
                    setMessage({
                      text: "Please select a valid image file",
                      type: "error"
                    });
                  }
                }}
                aria-label="Profile image"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-6">
            <Link to="/userprofile">
              <button
                type="button"
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}
