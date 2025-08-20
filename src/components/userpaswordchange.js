import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Confing from "../config/confing";
import Header from "./layout/header";
import Footer from "./layout/footer";

export default function ChangePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!password || !confirmPassword) {
        Swal.fire({ icon: "error", text: "Both fields are required!" });
        return;
      }

      if (password.length < 6) {
        Swal.fire({ icon: "error", text: "Password must be at least 6 characters!" });
        return;
      }

      if (password !== confirmPassword) {
        Swal.fire({ icon: "error", text: "Passwords do not match!" });
        return;
      }

      const apiUrl = `${Confing.API_Url}/user/password/change/${userId}`;
      const res = await axios.put(apiUrl, { password, confirmPassword });

      Swal.fire({ icon: "success", text: res.data.message || "Password updated successfully!" });
      setPassword("");
      setConfirmPassword("");
      navigate("/userprofile"); // or wherever you want to redirect

    } catch (err) {
      console.error("Password change error:", err);
      Swal.fire({
        icon: "error",
        text: err.response?.data?.message || "Something went wrong!",
      });
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto mt-28 p-6 bg-white rounded-xl shadow-lg border mb-3">
        <h2 className="text-2xl font-bold mb-6 text-center">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Update Password
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
