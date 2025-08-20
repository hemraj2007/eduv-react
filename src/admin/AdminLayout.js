import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, LogOut, LayoutDashboard, Users, User, BookOpen, ClipboardCheck, DollarSign, MessageCircle, Package, CreditCard, Calendar, Video, Image, Presentation, ChevronDown, ChevronRight, Settings
} from "lucide-react";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [packageManagerOpen, setPackageManagerOpen] = useState(location.pathname.startsWith('/admin/package-manager') || 
                                                                location.pathname.startsWith('/admin/membership-plan') || 
                                                                location.pathname.startsWith('/admin/subscription') || 
                                                                location.pathname.startsWith('/admin/videos'));
  const [settingsOpen, setSettingsOpen] = useState(location.pathname.startsWith('/admin/sliders') || 
                                                  location.pathname.startsWith('/admin/banners') || 
                                                  location.pathname.startsWith('/admin/faq') || 
                                                  location.pathname.startsWith('/admin/newsletter') || 
                                                  location.pathname.startsWith('/admin/static-page'));

  const isActive = (path) => {
    // For all admin panel sections, check if path starts with the given path
    // This will match index, add, and edit pages
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "2") {
      // Not logged in as admin, redirect to login
      navigate("/admin-login");
    }
  }, [navigate]);

  // Update dropdown states when location changes
  useEffect(() => {
    // Update package manager dropdown state
    setPackageManagerOpen(
      location.pathname.startsWith('/admin/package-manager') || 
      location.pathname.startsWith('/admin/membership-plan') || 
      location.pathname.startsWith('/admin/subscription') || 
      location.pathname.startsWith('/admin/videos')
    );
    
    // Update settings dropdown state
    setSettingsOpen(
      location.pathname.startsWith('/admin/sliders') || 
      location.pathname.startsWith('/admin/banners') || 
      location.pathname.startsWith('/admin/faq') || 
      location.pathname.startsWith('/admin/newsletter') || 
      location.pathname.startsWith('/admin/static-page')
    );
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      // const token = localStorage.getItem("token");

      // const response = await fetch("http://localhost:1100/admin/logout-admin", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`, // Include token if API needs it
      //   },
      // });

      // const data = await response.json();

      // if (response.ok && data.success) {
      // Clear localStorage on successful logout
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("adminEmail");
      navigate("/admin");
      // } else {
      //   alert(data.message || "Failed to logout. Please try again.");
      // }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Server error during logout. Please try again.");
    }
  };

  return (
    <div className="admin-container">
      <style>{`
        .admin-container {
          display: flex;
          height: 100vh;
        }
        .admin-sidebar {
          width: 240px;
          background: #1e1e2f;
          color: white;
          transition: width 0.3s ease;
          overflow: auto;
        }
        .admin-sidebar.collapsed {
          width: 70px;
        }
        .admin-logo {
          text-align: center;
          padding: 1rem;
        }
        .admin-menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .admin-menu li {
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .admin-menu li.active {
          background-color: #33334d;
          border-left: 4px solid #00b4d8;
        }
        .admin-menu li a {
          text-decoration: none;
          color: white;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }
        .admin-menu li.dropdown-header {
          cursor: pointer;
          justify-content: space-between;
        }
        .admin-menu li.dropdown-header:hover {
          background-color: #33334d;
        }
        .admin-menu li.dropdown-item {
          padding-left: 40px;
          background-color: #2a2a3f;
        }
        .admin-menu li.dropdown-item:hover {
          background-color: #33334d;
        }
        .admin-menu li.dropdown-item.active {
          background-color: #33334d;
          border-left: 4px solid #00b4d8;
        }
        .admin-mainContent {
          flex-grow: 1;
          background: #f7f7f7;
          display: flex;
          flex-direction: column;
        }
        .admin-header {
          background: white;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #ddd;
        }
        .admin-menuButton {
          background: none;
          border: none;
          cursor: pointer;
        }
        .admin-profileSection {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .admin-logoutButton {
          background: #ef4444;
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .admin-pageContent {
          padding: 2rem;
          overflow-y: auto;
          height: 100%;
        }
        .dropdown-icon {
          transition: transform 0.3s ease;
        }
        .dropdown-icon.open {
          transform: rotate(90deg);
        }
      `}</style>

      {/* Sidebar */}
      <div className={`admin-sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
        <div className="admin-logo">
          <img src="../../../images/logo1.png" alt="Admin Logo" width={150} height={40} />
        </div>

        <ul className="admin-menu">
          <li className={isActive("/admin/dashboard") ? "active" : ""}>
            <Link to="/admin/dashboard">
              <LayoutDashboard size={20} /> <span>Dashboard</span>
            </Link>
          </li>

          <li className={isActive("/admin/enquiry") ? "active" : ""}>
            <Link to="/admin/enquiry">
              <MessageCircle size={20} /> <span>Enquiry</span>
            </Link>
          </li>

          <li className={isActive("/admin/students") ? "active" : ""}>
            <Link to="/admin/students">
              <User size={20} /> <span>Students</span>
            </Link>
          </li>

          <li className={isActive("/admin/user") ? "active" : ""}>
            <Link to="/admin/user">
              <Users size={20} /> <span>Users</span>
            </Link>
          </li>

          <li className={isActive("/admin/course") ? "active" : ""}>
            <Link to="/admin/course">
              <BookOpen size={20} /> <span>Course</span>
            </Link>
          </li>

          <li className={isActive("/admin/fee-management") ? "active" : ""}>
            <Link to="/admin/fee-management">
              <DollarSign size={20} /> <span>Fee </span>
            </Link>
          </li>

          <li className={isActive("/admin/attendance") ? "active" : ""}>
            <Link to="/admin/attendance">
              <ClipboardCheck size={20} /> <span>Attendance</span>
            </Link>
          </li>

          {/* Package Manager Dropdown */}
          <li 
            className={`dropdown-header ${location.pathname.includes('/admin/package-manager') || 
                                         location.pathname.includes('/admin/membership-plan') || 
                                         location.pathname.includes('/admin/subscription') || 
                                         location.pathname.includes('/admin/videos') ? 'active' : ''}`}
            onClick={() => setPackageManagerOpen(!packageManagerOpen)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={20} />
              <span>Package Manager</span>
            </div>
            <ChevronDown 
              size={16} 
              className={`dropdown-icon ${packageManagerOpen ? 'open' : ''}`}
            />
          </li>
          
          {packageManagerOpen && (
            <>
              <li className={`dropdown-item ${location.pathname === "/admin/package-manager" || location.pathname.startsWith("/admin/package-manager/") ? "active" : ""}`}>
                <Link to="/admin/package-manager">
                  <span>Packages</span>
                </Link>
              </li>
              <li className={`dropdown-item ${location.pathname === "/admin/membership-plan" || location.pathname.startsWith("/admin/membership-plan/") ? "active" : ""}`}>
                <Link to="/admin/membership-plan">
                  <span>Membership Plans</span>
                </Link>
              </li>
              <li className={`dropdown-item ${location.pathname === "/admin/subscription" || location.pathname.startsWith("/admin/subscription/") ? "active" : ""}`}>
                <Link to="/admin/subscription">
                  <span>Subscriptions</span>
                </Link>
              </li>
              <li className={`dropdown-item ${location.pathname === "/admin/videos" || location.pathname.startsWith("/admin/videos/") ? "active" : ""}`}>
                <Link to="/admin/videos">
                  <span>Videos</span>
                </Link>
              </li>
            </>
          )}

          {/* Settings Dropdown */}
          <li 
            className={`dropdown-header ${location.pathname.includes('/admin/sliders') || 
                                         location.pathname.includes('/admin/banners') || 
                                         location.pathname.includes('/admin/faq') || 
                                         location.pathname.includes('/admin/newsletter') ||
                                         location.pathname.includes('/admin/static-page') ? 'active' : ''}`}
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings size={20} />
              <span>Settings</span>
            </div>
            <ChevronDown 
              size={16} 
              className={`dropdown-icon ${settingsOpen ? 'open' : ''}`}
            />
          </li>
          
          {settingsOpen && (
            <>
              <li className={`dropdown-item ${location.pathname === "/admin/sliders" || location.pathname.startsWith("/admin/sliders/") ? "active" : ""}`}>
                <Link to="/admin/sliders">
                  <span>Slider</span>
                </Link>
              </li>
              <li className={`dropdown-item ${location.pathname === "/admin/banners" || location.pathname.startsWith("/admin/banners/") ? "active" : ""}`}>
                <Link to="/admin/banners">
                  <span>Banner</span>
                </Link>
              </li>
              <li className={`dropdown-item ${location.pathname === "/admin/faq" || location.pathname.startsWith("/admin/faq/") ? "active" : ""}`}>
                <Link to="/admin/faq">
                  <span>FAQ</span>
                </Link>
              </li>
              <li className={`dropdown-item ${location.pathname === "/admin/newsletter" || location.pathname.startsWith("/admin/newsletter/") ? "active" : ""}`}>
                <Link to="/admin/newsletter">
                  <span>Newsletter</span>
                </Link>
              </li>

              <li className={`dropdown-item ${location.pathname === "/admin/static-page" || location.pathname.startsWith("/admin/static-page/") ? "active" : ""}`}>
                <Link to="/admin/static-page">
                  <span>Static-page</span>
                </Link>
              </li>
             

            </>
          )}
        </ul>

      </div>

      {/* Main Content */}
      <div className="admin-mainContent">
        <header className="admin-header">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="admin-menuButton">
            <Menu size={24} color="#333" />
          </button>
          <div className="admin-profileSection">
            <span>Welcome, Admin</span>
            <button onClick={handleLogout} className="admin-logoutButton">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        <main className="admin-pageContent">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
