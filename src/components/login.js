import React, { useState } from "react";
import Swal from "sweetalert2";
import Header from "./layout/header";
import Footer from "./layout/footer";
import { useNavigate } from "react-router-dom";
import userService from "../services/userService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await userService.login({ email, password });

      if (response) {
        if (!response.token) {
          throw new Error("No token received from server");
        }

        localStorage.setItem("token", response.token);
        localStorage.setItem("userEmail", response.userdata.email);
        localStorage.setItem("user_id", response.userdata._id);
        Swal.fire({
          title: "Login Successful!",
          text: "Redirecting...",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        navigate("/");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="login-page-wrapper">
        <div className="container login-container">
          <div className="row login-card shadow rounded overflow-hidden">
            {/* Banner Image */}
            <div className="col-md-6 login-banner d-none d-md-block"></div>

            {/* Login Form */}
            <div className="col-md-6 d-flex align-items-center p-4 bg-white">
              <div className="w-100">
                <div className="text-center mb-4">
                  <img src="../images/logo1.png" alt="Logo" width="100" />
                </div>

                <h3 className="text-center mb-3">Login to Your Account</h3>

                {error && (
                  <div className="alert alert-danger text-center py-2">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </button>

                  <div className="text-end mt-2">
                    <a href="/user/forgot-password" className="text-primary">
                      Forgot Password?
                    </a>
                  </div>
                </form>

                <div className="text-center mt-3">
                  Don't have an account?{" "}
                  <a href="/user/register" className="text-primary">
                    Sign up
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
