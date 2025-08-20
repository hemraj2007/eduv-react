import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Confing from "../config/confing";

import {
  Package,
  Gift as GiftCard,
  Lock,
  LogOut,
  CircleUserRound,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import Header from "./layout/header";
import Footer from "./layout/footer";

function Userprofile() {
  const id = localStorage.getItem("user_id");
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("addresses");

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(Confing.API_Url + `/user/getone/${id}`);
      setUserData(response.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 bg-white rounded-lg shadow-sm h-fit">
          <nav className="p-4">
            <div className="space-y-2">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <img
                  src={
                    userData && userData.image
                      ? `${Confing.API_Url}/${userData.image}`
                      : "./images/download (1).jpg"
                  }
                  width={60}
                  className="rounded-full"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {userData?.fullName || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userData?.email || "user@example.com"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`flex items-center w-full p-3 rounded-lg ${
                  activeTab === "addresses"
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <CircleUserRound className="w-5 h-5 text-gray-500" />
                <span className="ml-3 text-sm font-medium text-gray-900">
                  Profile
                </span>
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center w-full p-3 rounded-lg ${
                  activeTab === "orders" ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <Package className="w-5 h-5 text-gray-500" />
                <span className="ml-3 text-sm font-medium text-gray-900">
                  My Orders
                </span>
              </button>

              <button
                onClick={() => setActiveTab("giftcards")}
                className={`flex items-center w-full p-3 rounded-lg ${
                  activeTab === "giftcards"
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <GiftCard className="w-5 h-5 text-gray-500" />
                <span className="ml-3 text-sm font-medium text-gray-900">
                  E-Gift Cards
                </span>
              </button>

              <button
                onClick={() => setActiveTab("privacy")}
                className={`flex items-center w-full p-3 rounded-lg ${
                  activeTab === "privacy" ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <Lock className="w-5 h-5 text-gray-500" />
                <span className="ml-3 text-sm font-medium text-gray-900">
                  Account Privacy
                </span>
              </button>

              <button className="flex items-center w-full p-3 rounded-lg hover:bg-gray-50 text-red-600">
                <LogOut className="w-5 h-5" />
                <span className="ml-3 text-sm font-medium">Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Profile Content */}
        {!userData ? (
          <div className="flex-1 text-center pt-20 text-gray-500 text-lg">
            Loading profile...
          </div>
        ) : (
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 py-6 px-6 rounded-xl shadow">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden ">
              {/* Profile Header */}
              <div className="relative h-48">
                <img
                  src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=2000&q=80"
                  alt="Profile Background"
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-12 left-8">
                  <img
                    src={
                      userData && userData.image
                        ? `${Confing.API_Url}/${userData.image}`
                        : "./images/download (1).jpg"
                    }
                    width={80}
                    className="rounded-full border-4 border-white shadow"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-16 pb-8 px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userData.fullName}
                  </h1>
                  <div className="flex gap-3 mt-3 sm:mt-0">
                    <Link to={`/user/profile/edit/${userData._id}`}>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition-all duration-200">
                        Edit Profile
                      </button>
                    </Link>
                    <Link to={`/user/password/change/${userData._id}`}>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 transition-all duration-200">
                        Change Password
                      </button>
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Personal Information
                    </h2>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-10 text-gray-700">
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 mr-2 text-gray-400" />
                          {userData.email}
                        </div>
                        <div className="flex items-center mt-2 sm:mt-0">
                          <Phone className="h-5 w-5 mr-2 text-gray-400" />
                          {userData.mobile || "N/A"}
                        </div>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                        {userData.address || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Userprofile;
