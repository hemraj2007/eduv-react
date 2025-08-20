import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CourseDetail from "../admin/course/detail";
// import './index.css';  // Ensure Tailwind is applied


import Home from "../components/Home";
import About from "../components/About";
import Courses from "../components/Courses";
import Contact from "../components/Contact";
import Team from "../components/Team";
import Testimonial from "../components/Testimonial";
import Login from "../components/login";
import Admin from "../admin/admin";
import Register from "../components/register";

import Userprofile from "../components/UserProfile";
import UserprofileEdit from "../components/userprofileediti";
import Changeuserpassword from "../components/userpaswordchange"

// Student Routes
import StudentLogin from "../components/StudentLogin.js";
import StudentProfile from "../components/StudentProfile.js";
import StudentSubscription from "../components/StudentSubscription.js";
import StudentVideos from "../components/StudentVideos.js";
import Package from "../components/Package.js";



//admin routers
import AdminLayout from "../admin/AdminLayout";
import Dashboard from "../admin/dashboard";
import UserList from "../admin/user/index";
import AddUser from "../admin/user/add";
import EditUser from "../admin/user/edit";
import UserDetail from "../admin/user/detail";
import EnquiryList from "../admin/enquiry/index";

import StudentList from "../admin/students/index";
import AddStudent from "../admin/students/add";
import EditStudent from "../admin/students/edit";
import StudentDetail from "../admin/students/detail";

// Fee Management Routes
import FeeManagementList from "../admin/fee-management/index";
import AddFeeAssignment from "../admin/fee-management/add";
import FeeManagementDetail from "../admin/fee-management/detail";

// Package Manager Routes
import PackageManagerList from "../admin/package-manager/index";
import AddPackage from "../admin/package-manager/add";
import EditPackage from "../admin/package-manager/edit";

// Membership Plan Routes
import MembershipPlanList from "../admin/membership-plan/index";
import AddMembershipPlan from "../admin/membership-plan/add";
import EditMembershipPlan from "../admin/membership-plan/edit";

// Subscription Routes
import SubscriptionList from "../admin/subscription/index";
import AddSubscription from "../admin/subscription/add";

// Video Routes
import VideoList from "../admin/videos/index";
import AddVideo from "../admin/videos/add";
import EditVideo from "../admin/videos/edit";

// Course Routes
import CourseList from "../admin/course/index";
import AddCourse from "../admin/course/add";
import EditCourse from "../admin/course/edit";

// Attendance Routes
import AttendanceList from "../admin/attendance/index";
import AddAttendance from "../admin/attendance/add";

// Banner Routes
import BannerList from "../admin/banners/index";
import AddBanner from "../admin/banners/add";
import EditBanner from "../admin/banners/edit";

// FAQ Routes
import FaqList from "../admin/faq/index";
import AddFaq from "../admin/faq/add";
import EditFaq from "../admin/faq/edit";

// Newsletter Routes
import NewsletterList from "../admin/newsletter/index";

// Slider Routes
import SliderList from "../admin/sliders/index";
import AddSlider from "../admin/sliders/add";
import EditSlider from "../admin/sliders/edit";

// static-page Routes
import StaticPageIndex from "../admin/static-page/index";
import StaticPageAdd from "../admin/static-page/add";
import StaticPageEdit from "../admin/static-page/edit";


import NotFound from "../admin/NotFound";
import { Provider } from 'react-redux'
import store from '../redux/store'

export default function App() {
  return (

    <BrowserRouter>
      <Provider store={store}>

        <Routes>
          <Route path="/" element={<Home />}>
          </Route>
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/testimonial" element={<Testimonial />} />
          <Route path="/team" element={<Team />} />



          <Route path="/user/login" element={<Login />} />
          <Route path="/user/register" element={<Register />} />

          <Route path="/userprofile" element={<Userprofile />} />
          <Route path="/user/profile/edit/:id" element={<UserprofileEdit />} />
          <Route path="/user/password/change/:id" element={<Changeuserpassword />} />

          {/* Student Routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/subscription" element={<StudentSubscription />} />
          <Route path="/student/videos" element={<StudentVideos />} />
          <Route path="/packages" element={<Package />} />



          {/* Admin Routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/user" element={<UserList />} />
          <Route path="/admin/user/add" element={<AddUser />} />
          <Route path="/admin/user/edit/:id" element={<EditUser />} />
          <Route path="/admin/user/detail/:id" element={<UserDetail />} />
          <Route path="/admin/enquiry" element={<EnquiryList />} />
         

          {/* Student Routes */}
          <Route path="/admin/students" element={<StudentList />} />
          <Route path="/admin/students/add" element={<AddStudent />} />
          <Route path="/admin/students/edit/:id" element={<EditStudent />} />
          <Route path="/admin/students/detail/:id" element={<StudentDetail />} />


          {/* Fee Management Routes */}
          <Route path="/admin/fee-management" element={<FeeManagementList />} />
          <Route path="/admin/fee-management/add" element={<AddFeeAssignment />} />
          <Route path="/admin/fee-management/details/:id" element={<FeeManagementDetail />} />


          {/* Package Manager Routes */}
          <Route path="/admin/package-manager" element={<PackageManagerList />} />
          <Route path="/admin/package-manager/add" element={<AddPackage />} />
          <Route path="/admin/package-manager/edit/:id" element={<EditPackage />} />


          {/* Membership Plan Routes */}
          <Route path="/admin/membership-plan" element={<MembershipPlanList />} />
          <Route path="/admin/membership-plan/add" element={<AddMembershipPlan />} />
          <Route path="/admin/membership-plan/edit/:id" element={<EditMembershipPlan />} />


          {/* Subscription Routes */}
          <Route path="/admin/subscription" element={<SubscriptionList />} />
          <Route path="/admin/subscription/add" element={<AddSubscription />} />


          {/* Video Routes */}
          <Route path="/admin/videos" element={<VideoList />} />
          <Route path="/admin/videos/add" element={<AddVideo />} />
          <Route path="/admin/videos/edit/:id" element={<EditVideo />} />

          {/* Course Routes */}
          <Route path="/admin/course" element={<CourseList />} />
          <Route path="/admin/course/add" element={<AddCourse />} />
          <Route path="/admin/course/edit/:id" element={<EditCourse />} />
          <Route path="/admin/course/detail/:id" element={<CourseDetail />} />

          {/* Attendance Routes */}
          <Route path="/admin/attendance" element={<AttendanceList />} />
          <Route path="/admin/attendance/add" element={<AddAttendance />} />

          {/* Banner Routes */}
          <Route path="/admin/banners" element={<BannerList />} />
          <Route path="/admin/banners/add" element={<AddBanner />} />
          <Route path="/admin/banners/edit/:id" element={<EditBanner />} />

          {/* FAQ Routes */}
          <Route path="/admin/faq" element={<FaqList />} />
          <Route path="/admin/faq/add" element={<AddFaq />} />
          <Route path="/admin/faq/edit/:id" element={<EditFaq />} />

          {/* Newsletter Routes */}
          <Route path="/admin/newsletter" element={<NewsletterList />} />

          {/* Slider Routes */}
          <Route path="/admin/sliders" element={<SliderList />} />
          <Route path="/admin/sliders/add" element={<AddSlider />} />
          <Route path="/admin/sliders/edit/:id" element={<EditSlider />} />


          {/* satic-page Routes */}
          <Route path="/admin/static-page" element={<StaticPageIndex />} />
          <Route path="/admin/static-page/add" element={<StaticPageAdd />} />
          <Route path="/admin/static-page/edit/:id" element={<StaticPageEdit />} />


          <Route path="*" element={<NotFound />} />
        </Routes>

      </Provider>
    </BrowserRouter>
  );
}
