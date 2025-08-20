import React, { useState } from "react";
import swal from "sweetalert";
import Header from "./layout/header";
import Footer from "./layout/footer";
import userService from "../services/userService";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      swal("Error", "Password must be at least 6 characters long", "error");
      return;
    }

    try {
      const body = { fullName, email, password, mobile };
      const response = await userService.register(body);

      // Success popup
      swal("Success", "Registration Successful!", "success");

      // Clear form fields
      setFullName("");
      setEmail("");
      setPassword("");
      setMobile("");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Something went wrong";
      swal("Error", errMsg, "error");
      console.error("Error:", error.response?.data || error.message);
    }
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.banner}></div>

        <div style={styles.formContainer}>
          <div style={styles.formBox}>
            <h2 style={styles.heading}>Create an Account</h2>

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  style={styles.input}
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  style={styles.input}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  placeholder="Create a password"
                  style={styles.input}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Mobile */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Mobile</label>
                <input
                  type="text"
                  placeholder="Enter your mobile number"
                  style={styles.input}
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>

              {/* Register Button */}
              <button type="submit" style={styles.button}>Sign Up</button>

              {/* Login Redirect */}
              <p style={styles.loginRedirect}>
                Already have an account?{" "}
                <a href="#" style={styles.loginLink}>Login</a>
              </p>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// Styles
const styles = {
  container: {
  display: "flex",
  minHeight: "100vh",
  margin: 0,
  fontFamily: "Arial, sans-serif",
  paddingTop: "60px", // 👈 Add this line
marginTop: '40px'
},
  banner: {
    flex: 1,
    backgroundImage: "url('../images/login-page-img.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    top:"50px"
  },

  formContainer: {
    width: "50%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },
  formBox: {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    padding: "30px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "20px",
    fontWeight: "bold",
  },
  formGroup: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  label: {
    fontWeight: "bold",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    outline: "none",
  },
  button: {
    width: "100%",
    background: "#28a745",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
  },
  loginRedirect: {
    textAlign: "center",
    marginTop: "15px",
    fontSize: "14px",
  },
  loginLink: {
    color: "#007bff",
    textDecoration: "none",
  },
};
