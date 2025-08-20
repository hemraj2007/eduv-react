import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import {
  feeManagementService,
  studentService,
  courseService,
} from "../../services";
import {
  User,
  BookOpen,
  DollarSign,
  ArrowLeft,
  Search,
  CreditCard,
  Plus,
  AlertCircle,
  Save
} from "lucide-react";
import '../../style/admin-style.css';
import 'animate.css';
import './fee-management-add.css';

const AddFeeAssignment = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentId, setAssignmentId] = useState(null);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [existingAssignments, setExistingAssignments] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      student_id: "",
      course_id: "",
      actualFee: 0,
      additionalDiscount: 0,
      totalFee: 0,
      addAmount: 0,
      pendingAmount: 0,
      paymentMethod: "cash",
      paymentReference: "",
      status: "pending",
    },
  });

  // Function to generate random 10-digit number
  const generateRandomNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const selectedStudentId = watch("student_id");
  const selectedCourseId = watch("course_id");
  const actualFee = Number(watch("actualFee"));
  const additionalDiscount = Number(watch("additionalDiscount"));
  const addAmount = Number(watch("addAmount"));

  // --- FEE CALCULATION useEffect (Correct Logic) ---
  useEffect(() => {
    const total = Math.max(0, actualFee - additionalDiscount);
    const pending = Math.max(0, total - totalPaidAmount);
    setValue("totalFee", total);
    setValue("pendingAmount", pending);
    setValue("status", total === 0 ? "pending" : pending <= 0 ? "paid" : "pending");
  }, [actualFee, additionalDiscount, totalPaidAmount, setValue]);
  //--------------------------------------------------

  useEffect(() => {
    fetchAllStudents();
    // Animate the form visibility after loading
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  useEffect(() => {
    if (selectedStudentId && selectedCourseId) {
      fetchAssignment(selectedStudentId, selectedCourseId);
    } else {
      setAssignmentId(null);
      setValue("actualFee", 0);
      setValue("additionalDiscount", 0);
      setValue("totalFee", 0);
      setValue("addAmount", 0);
      setValue("pendingAmount", 0);
      setValue("status", "pending");
    }
    // eslint-disable-next-line
  }, [selectedStudentId, selectedCourseId, assignedCourses]);

  useEffect(() => {
    if (selectedStudentId) fetchCoursesForStudent(selectedStudentId);
    else {
      setAssignedCourses([]);
      setValue("course_id", "");
      setValue("actualFee", 0);
      setValue("additionalDiscount", 0);
      setValue("totalFee", 0);
      setValue("addAmount", 0);
      setValue("pendingAmount", 0);
      setValue("status", "pending");
      setAssignmentId(null);
    }
    // eslint-disable-next-line
  }, [selectedStudentId]);

  // Fetches
  const fetchAllStudents = async () => {
    setIsLoading(true);
    try {
      // Get all assignments first to identify students with assigned courses
      const assignmentsRes = await feeManagementService.getAllAssignments(1, 1000);
      console.log("Assignments response:", assignmentsRes);

      // Extract unique student IDs from assignments
      let studentsWithCourses = new Set();
      let assignmentsList = [];

      // Handle different response structures for assignments
      if (assignmentsRes?.assignments) {
        assignmentsList = assignmentsRes.assignments;
      } else if (assignmentsRes?.data?.assignments) {
        assignmentsList = assignmentsRes.data.assignments;
      } else if (assignmentsRes?.data) {
        assignmentsList = assignmentsRes.data;
      } else if (Array.isArray(assignmentsRes)) {
        assignmentsList = assignmentsRes;
      }

      // Extract student IDs from assignments
      assignmentsList.forEach(assignment => {
        if (assignment.studentId) {
          studentsWithCourses.add(assignment.studentId);
        } else if (assignment.student && assignment.student._id) {
          studentsWithCourses.add(assignment.student._id);
        }
      });

      console.log("Students with courses IDs:", [...studentsWithCourses]);

      // Now get all students
      const res = await studentService.getAllStudents(1, 1000);
      console.log("Students response:", res);

      // Handle different response structures for students
      let studentsList = [];

      if (res?.students) {
        studentsList = res.students;
      } else if (res?.data?.students) {
        studentsList = res.data.students;
      } else if (res?.data) {
        studentsList = res.data;
      } else if (Array.isArray(res)) {
        studentsList = res;
      }

      // If studentsList is still empty but res is an object, try to extract students
      if (studentsList.length === 0 && typeof res === 'object' && res !== null) {
        // Look for any array property that might contain students
        for (const key in res) {
          if (Array.isArray(res[key]) && res[key].length > 0) {
            // Check if objects in array have typical student properties
            if (res[key][0].name || res[key][0].email || res[key][0].mobile) {
              studentsList = res[key];
              console.log("Found students in property:", key);
              break;
            }
          }
        }
      }

      // Filter students who have assigned courses and are active
      const filteredStudents = studentsList.filter(student => {
        const isActive = student.status === "Y" || student.status === true ||
          student.status === "Active" || student.status === "active";

        const hasAssignedCourse = studentsWithCourses.has(student._id);

        return isActive && hasAssignedCourse;
      });

      console.log("Active students with courses:", filteredStudents);

      // If no filtered students found, use active students as fallback
      if (filteredStudents.length === 0) {
        const activeStudents = studentsList.filter(s => {
          return s.status === "Y" || s.status === true || s.status === "Active" || s.status === "active";
        });

        console.log("No students with courses found, using active students as fallback");
        setStudents(activeStudents);
      } else {
        setStudents(filteredStudents);
      }
    } catch (err) {
      console.error("Fetch students error:", err);
      Swal.fire("Error", "Failed to fetch students", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoursesForStudent = async (studentId) => {
    setIsLoading(true);
    try {
      // First try to get student details
      const res = await studentService.getStudentById(studentId);
      console.log("Student response:", res); // Debug log

      // Handle different response structures
      let student = null;
      if (res?.student) {
        student = res.student;
      } else if (res?.data?.student) {
        student = res.data.student;
      } else if (res?.data) {
        student = res.data;
      } else if (typeof res === 'object' && res !== null) {
        student = res;
      }

      console.log("Student data:", student); // Debug log

      let courseList = [];
      let hasCourseIds = false;

      // Check if student has course_id field with valid content
      if (student && student.course_id) {
        if (Array.isArray(student.course_id) && student.course_id.length > 0) {
          hasCourseIds = true;
          if (typeof student.course_id[0] === "object") {
            // Course objects are already embedded in student data
            courseList = student.course_id.filter((c) => {
              return c.status === "Y" || c.status === true || c.status === "Active" || c.status === "active";
            });
          } else {
            // Course IDs need to be fetched individually
            const details = await Promise.all(
              student.course_id.map(async (id) => {
                try {
                  const courseRes = await courseService.getCourseById(id);
                  console.log("Course response for ID", id, ":", courseRes); // Debug log

                  // Handle different course response structures
                  let course = null;
                  if (courseRes?.course) {
                    course = courseRes.course;
                  } else if (courseRes?.data?.course) {
                    course = courseRes.data.course;
                  } else if (courseRes?.data) {
                    course = courseRes.data;
                  } else if (typeof courseRes === 'object' && courseRes !== null) {
                    course = courseRes;
                  }

                  return (course?.status === "Y" || course?.status === true ||
                    course?.status === "Active" || course?.status === "active") ? course : null;
                } catch (courseErr) {
                  console.error("Error fetching course ID", id, ":", courseErr);
                  return null;
                }
              })
            );
            courseList = details.filter(Boolean);
          }
        } else if (typeof student.course_id === 'string' && student.course_id.trim() !== '') {
          // Single course ID as string
          hasCourseIds = true;
          try {
            const courseRes = await courseService.getCourseById(student.course_id);
            console.log("Course response for single ID", student.course_id, ":", courseRes);

            let course = null;
            if (courseRes?.course) {
              course = courseRes.course;
            } else if (courseRes?.data?.course) {
              course = courseRes.data.course;
            } else if (courseRes?.data) {
              course = courseRes.data;
            } else if (typeof courseRes === 'object' && courseRes !== null) {
              course = courseRes;
            }

            if (course && (course.status === "Y" || course.status === true ||
              course.status === "Active" || course.status === "active")) {
              courseList = [course];
            }
          } catch (courseErr) {
            console.error("Error fetching single course ID", student.course_id, ":", courseErr);
          }
        }
      }

      // If no courses found or student doesn't have course_id, fetch all courses as fallback
      if (courseList.length === 0) {
        try {
          console.log("Fetching all courses as fallback");
          const allCoursesRes = await courseService.getAllCourses(1, 100);
          console.log("All courses response:", allCoursesRes);

          // Handle different response structures
          let allCourses = [];
          if (allCoursesRes?.courses) {
            allCourses = allCoursesRes.courses;
          } else if (allCoursesRes?.data?.courses) {
            allCourses = allCoursesRes.data.courses;
          } else if (allCoursesRes?.data) {
            allCourses = allCoursesRes.data;
          } else if (Array.isArray(allCoursesRes)) {
            allCourses = allCoursesRes;
          }

          // If allCourses is still empty but allCoursesRes is an object, try to extract courses
          if (allCourses.length === 0 && typeof allCoursesRes === 'object' && allCoursesRes !== null) {
            // Look for any array property that might contain courses
            for (const key in allCoursesRes) {
              if (Array.isArray(allCoursesRes[key]) && allCoursesRes[key].length > 0) {
                // Check if objects in array have typical course properties
                if (allCoursesRes[key][0].name || allCoursesRes[key][0].duration || allCoursesRes[key][0].actualFees) {
                  allCourses = allCoursesRes[key];
                  console.log("Found courses in property:", key);
                  break;
                }
              }
            }
          }

          courseList = allCourses.filter(c => {
            return c.status === "Y" || c.status === true || c.status === "Active" || c.status === "active";
          });

          // If no active courses found, use all courses
          if (courseList.length === 0 && allCourses.length > 0) {
            console.log("No active courses found, using all courses");
            courseList = allCourses;
          }
        } catch (allCoursesErr) {
          console.error("Error fetching all courses:", allCoursesErr);
        }
      }

      console.log("Final course list:", courseList); // Debug log
      setAssignedCourses(courseList);
      setValue("course_id", "");
      setValue("actualFee", 0);
      setValue("additionalDiscount", 0);
      setValue("totalFee", 0);
      setValue("addAmount", 0);
      setValue("pendingAmount", 0);
      setValue("status", "pending");
      setAssignmentId(null);
    } catch (err) {
      console.error("Fetch courses error:", err);
      Swal.fire("Error", "Failed to fetch student courses", "error");
      setAssignedCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Fetch assignment and fill form fields with correct fee logic ---
  const fetchAssignment = async (studentId, courseId) => {
    setIsLoading(true);
    try {
      const res = await feeManagementService.getAssignmentByStudentAndCourse(studentId, courseId);

      // Reset values
      setTotalPaidAmount(0);
      setExistingAssignments([]);
      setAssignmentId(null);

      if (res && res.assignments && res.assignments.length > 0) {
        // Calculate total paid amount from all assignments
        const totalPaid = res.assignments.reduce((sum, assignment) => {
          return sum + (Number(assignment.paidAmount) || 0);
        }, 0);

        setTotalPaidAmount(totalPaid);
        setExistingAssignments(res.assignments);

        // Get the latest assignment for reference
        const latestAssignment = res.assignments[res.assignments.length - 1];
        setAssignmentId(latestAssignment._id);

        // Get complete course data from API to ensure we have finalFees
        let courseInfo = null;
        try {
          const courseRes = await courseService.getCourseById(courseId);
          courseInfo = courseRes?.course;
        } catch (courseErr) {
          console.error("Error fetching course details:", courseErr);
          // Fallback to assignment data if course fetch fails
          courseInfo = Array.isArray(latestAssignment.course_id) && latestAssignment.course_id.length > 0
            ? latestAssignment.course_id[0]
            : assignedCourses.find((c) => c._id === courseId);
        }

        // Always prioritize finalFees from course API
        const feeFromCourse = courseInfo?.finalFees || courseInfo?.actualFees || 0;

        // Use latest assignment's additionalDiscount
        const discount = Number(latestAssignment.additionalDiscount) || 0;
        let actual = 0;

        // If latest assignment has actualFee, use it, else use course fee
        if (typeof latestAssignment.actualFee !== "undefined" && latestAssignment.actualFee > 0) {
          actual = Number(latestAssignment.actualFee);
        } else {
          // Use course fee as the actual fee
          actual = feeFromCourse;
        }

        // Calculate total fee and pending amount
        const total = Math.max(0, actual - discount);
        const pending = Math.max(0, total - totalPaid);

        setValue("actualFee", actual);
        setValue("additionalDiscount", discount);
        setValue("totalFee", total);
        setValue("addAmount", 0);
        setValue("pendingAmount", pending);
        setValue("paymentMethod", latestAssignment.paymentMethod || "cash");
        setValue("status", pending <= 0 ? "paid" : "pending");
      } else {
        // If no existing assignments, get course fee from API
        try {
          const courseRes = await courseService.getCourseById(courseId);
          const courseData = courseRes?.course;

          if (courseData) {
            setAssignmentId(null);
            // Always use finalFees from course API, fallback to actualFees
            const courseFee = courseData.finalFees || courseData.actualFees || 0;
            setValue("actualFee", courseFee);
            setValue("additionalDiscount", 0);
            setValue("totalFee", courseFee);
            setValue("addAmount", 0);
            setValue("pendingAmount", courseFee);
            setValue("status", "pending");
          } else {
            // Fallback to assignedCourses if API fails
            const selectedCourse = assignedCourses.find((c) => c._id === courseId);
            if (selectedCourse) {
              setAssignmentId(null);
              const courseFee = selectedCourse.finalFees || selectedCourse.actualFees || 0;
              setValue("actualFee", courseFee);
              setValue("additionalDiscount", 0);
              setValue("totalFee", courseFee);
              setValue("addAmount", 0);
              setValue("pendingAmount", courseFee);
              setValue("status", "pending");
            }
          }
        } catch (courseErr) {
          console.error("Error fetching course details:", courseErr);
          // Fallback to assignedCourses
          const selectedCourse = assignedCourses.find((c) => c._id === courseId);
          if (selectedCourse) {
            setAssignmentId(null);
            const courseFee = selectedCourse.finalFees || selectedCourse.actualFees || 0;
            setValue("actualFee", courseFee);
            setValue("additionalDiscount", 0);
            setValue("totalFee", courseFee);
            setValue("addAmount", 0);
            setValue("pendingAmount", courseFee);
            setValue("status", "pending");
          }
        }
      }
    } catch (err) {
      console.error("Fetch assignment error:", err);
      Swal.fire("Error", "Failed to fetch course assignment", "error");
    } finally {
      setIsLoading(false);
    }
  };
  // --- END FetchAssignment ---

  // --- On Submit: Respect the fee logic and fields ---
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (!assignedCourses.some((c) => c._id === data.course_id)) {
        throw new Error("Selected course not assigned to student");
      }

      // Ensure all numeric values are properly calculated
      const actualFee = Number(data.actualFee) || 0;
      const additionalDiscount = Number(data.additionalDiscount) || 0;
      const addAmount = Number(data.addAmount) || 0;

      // Calculate total fee: actualFee - discount
      const totalFee = Math.max(0, actualFee - additionalDiscount);

      // Calculate new total paid amount: existing paid + new amount
      const newTotalPaid = totalPaidAmount + addAmount;

      // Calculate new pending amount: totalFee - newTotalPaid
      const newPendingAmount = Math.max(0, totalFee - newTotalPaid);

      if (addAmount <= 0) {
        Swal.fire("Error", "Please enter an amount to add", "error");
        return;
      }

      // Validate that add amount doesn't exceed pending amount
      const currentPending = totalFee - totalPaidAmount;
      if (addAmount > currentPending) {
        Swal.fire("Error", `Amount cannot exceed pending amount of ₹${currentPending.toLocaleString()}`, "error");
        return;
      }

      // Generate random 10-digit payment reference
      const randomPaymentReference = generateRandomNumber();

      const basePayload = {
        additionalDiscount: additionalDiscount,
        totalFee: totalFee,
        paidAmount: addAmount, // This is the new amount being added
        pendingAmount: newPendingAmount, // Updated pending amount
        paymentMethod: data.paymentMethod || "cash",
        paymentReference: randomPaymentReference,
        status: newPendingAmount <= 0 ? "paid" : "pending",
        actualFee: actualFee, // Include actualFee if backend expects it
      };

      const payload = {
        ...basePayload,
        student_id: data.student_id,
        course_id: [data.course_id],
      };

      // Log the payload for debugging
      console.log("Sending payload:", payload);
      console.log("Total paid so far:", totalPaidAmount);
      console.log("New amount being added:", addAmount);
      console.log("New total paid:", newTotalPaid);
      console.log("New pending amount:", newPendingAmount);

      const res = await feeManagementService.assignCourse(payload);

      let isSuccess = false;
      let successMessage = "Payment recorded successfully";

      if (res?.success === true) {
        isSuccess = true;
      } else if (res?.data?.success === true) {
        isSuccess = true;
      } else if (res?.message && (res.message.includes("success") || res.message.includes("assigned") || res.message.includes("updated"))) {
        isSuccess = true;
        successMessage = res.message;
      } else if (res?.data?.message && (res.data.message.includes("success") || res.data.message.includes("assigned") || res.data.message.includes("updated"))) {
        isSuccess = true;
        successMessage = res.data.message;
      } else if (res && typeof res === 'object' && Object.keys(res).length > 0) {
        isSuccess = true;
      }

      if (isSuccess) {
        navigate("/admin/fee-management");
        setTimeout(() => {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: successMessage,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK"
          });
        }, 100);
      } else {
        throw new Error(res?.message || res?.data?.message || "Failed to record payment");
      }
    } catch (err) {
      console.error("Submit error:", err);
      console.error("Error response:", err.response?.data);

      const errorMessage = err.message || err.response?.data?.message || "";
      if (errorMessage.includes("success") || errorMessage.includes("assigned") || errorMessage.includes("updated")) {
        navigate("/admin/fee-management");
        setTimeout(() => {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Payment recorded successfully",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK"
          });
        }, 100);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage || "Failed to record payment",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate("/admin/fee-management");
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.mobile?.includes(term)
    );
  });

  return (
    <AdminLayout>
      <div className={`admin-dashboard-add-user-container ${isVisible ? 'visible' : ''}`}>
        <div className="admin-dashboard-form-card">
          <div className="admin-dashboard-form-header">
            <h2>Add Fee </h2>
           
          </div>
          {isLoading ? (
            <div className="text-center py-5">
              <div className="admin-dashboard-spinner" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading data...</p>
            </div>
          ) : (
            <div className="admin-dashboard-form-body">
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <div className="d-flex flex-column gap-4">

                  {/* First Row: Student and Course Selection */}
                  <div className="admin-dashboard-form-row-grid">
                    {/* Student Selection */}
                    <div className="admin-dashboard-form-group-animated">
                      <label className="admin-dashboard-form-label-with-icon" htmlFor="student_id">
                        <User size={18} />
                        Student
                      </label>
                      <select
                        id="student_id"
                        {...register("student_id", { required: "Student is required" })}
                        className={`admin-dashboard-form-select ${errors.student_id ? "error" : ""}`}
                      >
                        <option value="">Select Student</option>
                        {filteredStudents.map((student) => (
                          <option key={student._id} value={student._id}>
                            {student.name} ({student.email}) - {student.mobile}
                          </option>
                        ))}
                      </select>
                      {errors.student_id && (
                        <div className="admin-dashboard-error-message">
                          <AlertCircle size={14} />
                          {errors.student_id.message}
                        </div>
                      )}
                    </div>

                    {/* Course Selection */}
                    <div className="admin-dashboard-form-group-animated">
                      <label className="admin-dashboard-form-label-with-icon" htmlFor="course_id">
                        <BookOpen size={18} />
                        Course
                      </label>
                      <select
                        id="course_id"
                        {...register("course_id", { required: "Course is required" })}
                        className={`admin-dashboard-form-select ${errors.course_id ? "error" : ""} ${!selectedStudentId || assignedCourses.length === 0 ? "bg-gray-100 cursor-not-allowed" : ""
                          }`}
                        disabled={!selectedStudentId || assignedCourses.length === 0}
                      >
                        <option value="">Select Course</option>
                        {assignedCourses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name} - {course.duration} - ₹
                            {course.finalFees ?? course.actualFees}
                          </option>
                        ))}
                      </select>
                      {errors.course_id && (
                        <div className="admin-dashboard-error-message">
                          <AlertCircle size={14} />
                          {errors.course_id.message}
                        </div>
                      )}
                      {selectedStudentId && assignedCourses.length === 0 && (
                        <div className="admin-dashboard-error-message">
                          No courses assigned to this student
                        </div>
                      )}
                      {!selectedStudentId && (
                        <div className="text-muted text-sm mt-1">
                          Please select a student first
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Second Row: Fee Details - Actual Fee, Additional Discount, Total Fee in a single line */}
                  <div className="admin-dashboard-form-row-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {/* Actual Fee */}
                    <div className="admin-dashboard-form-group-animated">
                      <label className="admin-dashboard-form-label-with-icon" htmlFor="actualFee">
                        <DollarSign size={18} />
                        Actual Fee <span className="admin-dashboard-required">*</span>
                      </label>
                      <input
                        type="number"
                        id="actualFee"
                        {...register("actualFee", {
                          required: "Actual fee is required",
                          min: { value: 0, message: "Fee cannot be negative" },
                        })}
                        className={`admin-dashboard-form-input-styled ${errors.actualFee ? "error" : ""}`}
                        readOnly
                      />
                      {errors.actualFee && (
                        <div className="admin-dashboard-error-message">
                          <AlertCircle size={14} />
                          {errors.actualFee.message}
                        </div>
                      )}
                    </div>

                    {/* Additional Discount */}
                    <div className="admin-dashboard-form-group-animated">
                      <label className="admin-dashboard-form-label-with-icon" htmlFor="additionalDiscount">
                        <DollarSign size={18} />
                        Additional Discount (₹)
                        {existingAssignments.length > 0 && (
                          <span className="text-xs text-muted ml-2">(Locked after first entry)</span>
                        )}
                      </label>
                      <input
                        type="number"
                        id="additionalDiscount"
                        {...register("additionalDiscount", {
                          min: { value: 0, message: "Discount cannot be less than 0" },
                          max: {
                            value: Number(watch("actualFee")) || 0,
                            message: "Discount cannot exceed Total Fee"
                          },
                          validate: (value) => {
                            const fee = Number(watch("actualFee"));
                            const discount = Number(value);
                            if (discount < 0) return "Discount cannot be less than 0";
                            if (discount > fee) return "Discount cannot exceed Total Fee";
                            return true;
                          },
                        })}
                        className={`admin-dashboard-form-input-styled ${errors.additionalDiscount ? "error" : ""} ${existingAssignments.length > 0 ? "bg-gray-100 cursor-not-allowed" : ""
                          }`}
                        placeholder="0"
                        readOnly={existingAssignments.length > 0}
                        disabled={existingAssignments.length > 0}
                      />
                      {errors.additionalDiscount && (
                        <div className="admin-dashboard-error-message">
                          <AlertCircle size={14} />
                          {errors.additionalDiscount.message}
                        </div>
                      )}
                      {existingAssignments.length > 0 && (
                        <div className="text-muted text-xs mt-1">
                          Additional discount can only be set on the first payment entry
                        </div>
                      )}
                    </div>

                    {/* Total Fee */}
                    <div className="admin-dashboard-form-group-animated">
                      <label className="admin-dashboard-form-label-with-icon" htmlFor="totalFee">
                        <DollarSign size={18} />
                        Total Fee <span className="admin-dashboard-required">*</span>
                      </label>
                      <input
                        type="number"
                        id="totalFee"
                        {...register("totalFee", {
                          required: "Total fee is required",
                          min: { value: 0, message: "Fee cannot be negative" },
                        })}
                        className={`admin-dashboard-form-input-styled ${errors.totalFee ? "error" : ""}`}
                        readOnly
                      />
                      {errors.totalFee && (
                        <div className="admin-dashboard-error-message">
                          <AlertCircle size={14} />
                          {errors.totalFee.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment History Section - Show when there are existing payments */}
                  {existingAssignments.length > 0 && (
                    <div className="w-100">
                      <div className="form-group">
                        <label className="form-label">
                          Payment History
                        </label>
                        <div className="bg-light p-4 rounded">
                          <div className="d-flex gap-4 mb-4">
                            <div className="text-center flex-1">
                              <p className="text-muted text-sm mb-1">Total Paid Amount</p>
                              <p className="text-success font-bold text-xl">
                                ₹{totalPaidAmount.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center flex-1">
                              <p className="text-muted text-sm mb-1">Total Fee</p>
                              <p className="text-primary font-bold text-xl">
                                ₹{watch("totalFee")?.toLocaleString() || "0"}
                              </p>
                            </div>
                            <div className="text-center flex-1">
                              <p className="text-muted text-sm mb-1">Pending Amount</p>
                              <p className={`font-bold text-xl ${watch("pendingAmount") > 0 ? "text-danger" : "text-success"}`}>
                                ₹{watch("pendingAmount")?.toLocaleString() || "0"}
                              </p>
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="table table-sm">
                              <thead className="table-header">
                                <tr>
                                  <th className="table-custom-header">Date</th>
                                  <th className="table-custom-header">Paid Amount</th>
                                  <th className="table-custom-header">Payment Method</th>
                                  <th className="table-custom-header">Reference</th>
                                </tr>
                              </thead>
                              <tbody>
                                {existingAssignments.map((assignment, index) => (
                                  <tr key={assignment._id} className="text-center">
                                    <td>
                                      {new Date(assignment.createdAt).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="text-success font-semibold">
                                      ₹{Number(assignment.paidAmount).toLocaleString()}
                                    </td>
                                    <td className="text-capitalize">
                                      {assignment.paymentMethod}
                                    </td>
                                    <td className="text-muted">
                                      {assignment.paymentReference}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Third Row: Payment Details - Add Amount, Remaining Payment, Payment Method in a single line */}
                  <div className="admin-dashboard-form-row-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {/* Add Amount */}
                    <div className="admin-dashboard-form-group-animated">
                      <label className="admin-dashboard-form-label-with-icon" htmlFor="addAmount">
                        <Plus size={18} />
                        Add Amount <span className="admin-dashboard-required">*</span>
                      </label>
                      <input
                        type="number"
                        id="addAmount"
                        {...register("addAmount", {
                          min: { value: 0, message: "Amount cannot be negative" },
                          validate: (value) => {
                            const pending = Number(watch("pendingAmount")) || 0;
                            const amt = Number(value || 0);
                            return amt <= pending || "Amount cannot exceed pending amount";
                          },
                        })}
                        className={`admin-dashboard-form-input-styled ${errors.addAmount ? "error" : ""}`}
                        placeholder="0"
                        disabled={watch("pendingAmount") <= 0}
                      />
                      {errors.addAmount && (
                        <div className="admin-dashboard-error-message">
                          <AlertCircle size={14} />
                          {errors.addAmount.message}
                        </div>
                      )}
                      {watch("pendingAmount") <= 0 ? (
                        <div className="text-success text-xs mt-1 font-semibold">

                        </div>
                      ) : (
                        <div className="text-muted text-xs mt-1">
                          Maximum amount: ₹{watch("pendingAmount")?.toLocaleString() || "0"}
                        </div>
                      )}
                    </div>

                    {/* Remaining Payment */}
                    <div className="admin-dashboard-form-group-animated">
                      <label className="admin-dashboard-form-label-with-icon" htmlFor="pendingAmount">
                        <DollarSign size={18} />
                        Remaining Payment
                      </label>
                      <input
                        type="number"
                        id="pendingAmount"
                        {...register("pendingAmount")}
                        className="admin-dashboard-form-input-styled bg-gray-100"
                        readOnly
                      />
                      {/* Live Preview inside the input box */}
                      {watch("addAmount") > 0 && (
                        <div className="position-absolute right-3 top-50 transform translate-y-n50">
                          <span className="text-xs text-primary font-medium bg-primary-light px-2 py-1 rounded">
                            After: ₹{Math.max(0, (watch("pendingAmount") || 0) - (watch("addAmount") || 0)).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="admin-dashboard-form-group-animated">
                      <label className="admin-dashboard-form-label-with-icon" htmlFor="paymentMethod">
                        <CreditCard size={18} />
                        Payment Method <span className="admin-dashboard-required">*</span>
                      </label>
                      <select
                        id="paymentMethod"
                        {...register("paymentMethod", {
                          required: "Payment method is required",
                        })}
                        className={`admin-dashboard-form-select ${errors.paymentMethod ? "error" : ""}`}
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="bank transfer">Bank Transfer</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.paymentMethod && (
                        <div className="admin-dashboard-error-message">
                          <AlertCircle size={14} />
                          {errors.paymentMethod.message}
                        </div>
                      )}
                    </div>
                  </div>




                </div>
                <div className="admin-dashboard-form-actions-styled">


                  <button
                    type="button"
                    className="admin-dashboard-btn-styled admin-dashboard-btn-styled-secondary"
                    style={{ backgroundColor: "#3498db", color: "#fff" }}
                    onClick={handleCancel}
                  >
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    type="submit"
                    className="admin-dashboard-btn-styled admin-dashboard-btn-styled-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="admin-dashboard-spinner admin-dashboard-spinner-sm" role="status"></div>{" "}
                        Submitting Fee...
                      </>
                    ) : (
                      <>
                        <Save size={18} /> Submit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddFeeAssignment;
