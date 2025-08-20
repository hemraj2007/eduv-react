import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import userService from "../services/userService";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await userService.login({
        email,
        password,
        isAdmin: true
      });

      const { success, token, data, message } = response;

      if (success && token) {
        // Save token and admin info to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("role", data.roleId); // Should be 2
        localStorage.setItem("adminEmail", data.email);

        toast.success("Login successful!");
        navigate("/admin/dashboard");
      } else {
        setError(message || "Invalid credentials");
        toast.error(message || "Login failed");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <img src="images/logo1.png" alt="logo" className="img-fluid" />
      <h2>Admin Sign In</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
          disabled={isLoading}
        />
        <button 
          type="submit" 
          style={{
            ...styles.button,
            ...(isLoading && styles.buttonDisabled)
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <div style={styles.loaderContainer}>
              <div style={styles.spinner}></div>
              <span style={styles.loaderText}>Logging in...</span>
            </div>
          ) : (
            "Login"
          )}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

// Inline styles
const styles = {
  container: {
    width: "500px",
    margin: "100px auto",
    padding: "100px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    marginBottom: "10px",
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "40px",
  },
  buttonDisabled: {
    backgroundColor: "#6c757d",
    cursor: "not-allowed",
    opacity: 0.7,
  },
  loaderContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid #ffffff",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loaderText: {
    fontSize: "14px",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
};

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
