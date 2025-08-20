// add.jsx (Multiple Attendance Add Page)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { User, BookOpen, CalendarDays, CheckCircle, Save, ArrowLeft, AlertCircle } from 'lucide-react';

import AdminLayout from '../AdminLayout';
import { attendanceService, studentService, courseService } from '../../services';
import { formatDate, getCurrentDate, formatDateForDisplay } from '../../utils/dateUtils';
import '../../style/admin-style.css';

const AddAttendance = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseStudents, setCourseStudents] = useState([]); // Students enrolled in selected course
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [todayAttendances, setTodayAttendances] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [studentCourses, setStudentCourses] = useState({}); // Map of student ID to their courses
  const [attendanceList, setAttendanceList] = useState([{
    studentId: "",
    courseId: "",
    date: new Date().toLocaleDateString('en-CA'), // Use en-CA format (YYYY-MM-DD) for consistent date
    status: "Present",
    notes: ""
  }]);

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    setError
  } = useForm({
    defaultValues: {
      courseId: "",
      studentIds: [],
      date: new Date().toLocaleDateString('en-CA'), // Use en-CA format (YYYY-MM-DD) for consistent date
      status: "Present",
      notes: "",
    }
  });

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);
    fetchCourses();
    fetchTodayAttendances();
  }, []);

  // When course is selected, fetch students for that course
  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsByCourse(selectedCourse);
    } else {
      setCourseStudents([]);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const response = await courseService.getAllCourses();
      const allCourses = response.courses || response.data || [];
      // Filter active courses only
      const activeCourses = allCourses.filter(course => course.status === 'active' || course.status === 'Y');
      setCourses(activeCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchStudentsByCourse = async (courseId) => {
    try {
      setIsLoadingStudents(true);
      const response = await studentService.getStudentsByCourseId(courseId);
      const allStudents = response.students || response.data || [];
      // Filter active students only
      const activeStudents = allStudents.filter(student =>
        student.status === "Y" || student.status === "active" || student.status === true
      );
      setCourseStudents(activeStudents);
    } catch (error) {
      console.error("Error fetching students by course:", error);
      setCourseStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const fetchTodayAttendances = async () => {
    try {
      const today = getCurrentDate(); // Use imported helper function
      const response = await attendanceService.getAllAttendances();
      const attendances = response.attendances || response.data || [];

      // Filter today's attendances with timezone-safe date handling
      const todayAttendances = attendances.filter(att => {
        // Format the attendance date using our utility function
        const attendanceDate = formatDate(att.date);
        return attendanceDate === today;
      });

      setTodayAttendances(todayAttendances);
    } catch (error) {
      console.error("Error fetching today's attendances:", error);
    }
  };

  const fetchCoursesByStudent = async (studentId) => {
    try {
      // Get courses for this specific student
      const response = await studentService.getStudentCourses(studentId);
      const studentCourses = response.courses || [];

      if (studentCourses && studentCourses.length > 0) {
        // Filter for active courses only
        const activeCourses = studentCourses.filter(course => course.status === 'active' || course.status === 'Y');

        // Store courses for this student
        setStudentCourses(prev => ({
          ...prev,
          [studentId]: activeCourses
        }));

        return activeCourses;
      } else {
        // Fallback: If no specific courses found for student, get all active courses
        const allCoursesResponse = await courseService.getAllCourses();
        const allCourses = allCoursesResponse.courses || allCoursesResponse.data || [];
        const activeCourses = allCourses.filter(course => course.status === 'active' || course.status === 'Y');

        // Store courses for this student
        setStudentCourses(prev => ({
          ...prev,
          [studentId]: activeCourses
        }));

        return activeCourses;
      }
    } catch (error) {
      console.error("Error fetching courses for student:", error);
      // Fallback to all active courses on error
      const allCoursesResponse = await courseService.getAllCourses();
      const allCourses = allCoursesResponse.courses || allCoursesResponse.data || [];
      const activeCourses = allCourses.filter(course => course.status === 'active' || course.status === 'Y');

      // Store courses for this student
      setStudentCourses(prev => ({
        ...prev,
        [studentId]: activeCourses
      }));

      return activeCourses;
    }
  };

  // Get available students (active and not in today's attendance)
  const getAvailableStudents = () => {
    const todayStudentIds = todayAttendances.map(att => {
      // Handle both object and string formats for studentId
      if (typeof att.studentId === 'object' && att.studentId !== null) {
        return att.studentId._id || att.studentId.id;
      }
      return att.studentId;
    });

    return students.filter(student => !todayStudentIds.includes(student._id));
  };

  // Get courses for a specific student
  const getCoursesForStudent = (studentId) => {
    return studentCourses[studentId] || [];
  };

  const addAttendanceRow = () => {
    setAttendanceList([...attendanceList, {
      studentId: "",
      courseId: "",
      date: getCurrentDate(), // Use helper function for consistent date
      status: "Present",
      notes: ""
    }]);
  };

  const removeAttendanceRow = (index) => {
    if (attendanceList.length > 1) {
      const newList = attendanceList.filter((_, i) => i !== index);
      setAttendanceList(newList);
    }
  };

  const updateAttendanceRow = async (index, field, value) => {
    const newList = [...attendanceList];
    newList[index][field] = value;

    // If student is changed, fetch courses for that student and reset course selection
    if (field === 'studentId' && value) {
      const courses = await fetchCoursesByStudent(value);
      newList[index].courseId = ""; // Reset course selection
    }

    setAttendanceList(newList);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Validate that course and at least one student is selected
      if (!data.courseId) {
        setError("courseId", {
          type: "manual",
          message: "Please select a course"
        });
        setIsSubmitting(false);
        return;
      }

      if (!data.studentIds || data.studentIds.length === 0) {
        setError("studentIds", {
          type: "manual",
          message: "Please select at least one student"
        });
        setIsSubmitting(false);
        return;
      }

      // Create attendance records for each selected student
      const attendanceRecords = data.studentIds.map(studentId => ({
        studentId: studentId,
        courseId: data.courseId,
        date: data.date,
        status: data.status,
        notes: data.notes || ''
      }));

      // Submit all attendance records at once
      const result = await attendanceService.addAttendances(attendanceRecords);

      const currentDate = formatDateForDisplay(data.date);
      // Store success message in session storage and redirect to index page
      sessionStorage.setItem('attendanceSuccess', `${attendanceRecords.length} attendance record(s) added successfully for ${currentDate}.`);
      navigate("/admin/attendance");
    } catch (error) {
      console.error("Error adding attendances:", error);
      Swal.fire({
        title: '<div class="error-popup-header"><AlertCircle class="error-icon" /><span>Error!</span></div>',
        text: error.response?.data?.message || "Failed to add attendance records",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: 'animated-popup error-popup',
          title: 'error-popup-title',
          confirmButton: 'error-popup-btn'
        },
        showClass: {
          popup: 'animate__animated animate__shakeX animate__faster'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableStudents = getAvailableStudents();

  return (
    <AdminLayout>
      <style>{`
        /* Checkbox List Styles */
        .admin-dashboard-checkbox-list-wrapper {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          background-color: #fff;
        }
        
        .admin-dashboard-checkbox-list {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        
        .admin-dashboard-checkbox-list.error {
          border-color: #ef4444;
        }
        
        .admin-dashboard-checkbox-item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          transition: background-color 0.2s;
        }
        
        .admin-dashboard-checkbox-item:last-child {
          border-bottom: none;
        }
        
        .admin-dashboard-checkbox-item:hover {
          background-color: #f8fafc;
        }
        
        .admin-dashboard-checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          width: 100%;
        }
        
        .admin-dashboard-checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          margin-right: 12px;
          cursor: pointer;
        }
        
        .admin-dashboard-student-info {
          display: flex;
          flex-direction: column;
        }
        
        .admin-dashboard-student-name {
          font-weight: 500;
          color: #1e293b;
        }
        
        .admin-dashboard-student-email {
          font-size: 0.875rem;
          color: #64748b;
          margin-top: 0.25rem;
        }
        
        .admin-dashboard-empty-state,
        .admin-dashboard-loading-state {
          padding: 2rem;
          text-align: center;
          color: #64748b;
          font-size: 0.875rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .admin-dashboard-loading-state {
          flex-direction: row;
          gap: 0.5rem;
        }
      `}</style>
      <div className={`admin-dashboard-add-user-container ${isVisible ? 'visible' : ''}`}>
        <div className="admin-dashboard-form-card">
          <div className="admin-dashboard-form-header">
            <h2>Add Attendance Records</h2>
            <p>Create attendance records for multiple students at once</p>
          </div>

          <div className="admin-dashboard-form-body">
            <form onSubmit={hookFormSubmit(onSubmit)}>
              {/* Form Grid Layout - 2 columns */}
              <div className="admin-dashboard-form-row-grid">
                {/* Course Selection */}
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <BookOpen size={18} />
                    Course
                  </label>
                  <select
                    className={`admin-dashboard-form-input-styled ${errors.courseId ? 'error' : ''}`}
                    {...register("courseId", {
                      required: "Course is required"
                    })}
                    onChange={(e) => {
                      setValue("courseId", e.target.value);
                      setSelectedCourse(e.target.value);
                      // Reset student selection when course changes
                      setValue("studentIds", []);
                    }}
                  >
                    <option value="">Select Course</option>
                    {isLoadingCourses ? (
                      <option value="" disabled>Loading courses...</option>
                    ) : courses.length === 0 ? (
                      <option value="" disabled>No active courses available</option>
                    ) : (
                      courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.courseId && (
                    <div className="admin-dashboard-error-message">
                      <AlertCircle size={14} />
                      {errors.courseId.message}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <CalendarDays size={18} />
                    Date
                  </label>
                  <div className="admin-dashboard-input-wrapper">
                    <input
                      type="date"
                      className="admin-dashboard-form-input-styled bg-gray-100"
                      {...register("date", {
                        required: "Date is required"
                      })}
                      readOnly
                      disabled
                    />
                    <div className="admin-dashboard-input-badge">
                      <span>Today</span>
                    </div>
                  </div>
                  <p className="admin-dashboard-form-help-text">
                    Date is automatically set to today and cannot be changed
                  </p>
                </div>
              </div>

              {/* Student Selection (Multiple) with Checkboxes - Full Width */}
              <div className="admin-dashboard-form-group-animated">
                <label className="admin-dashboard-form-label-with-icon">
                  <User size={18} />
                  Students
                </label>
                <div className="admin-dashboard-checkbox-list-wrapper">
                  {!selectedCourse ? (
                    <div className="admin-dashboard-empty-state">Select a course first</div>
                  ) : isLoadingStudents ? (
                    <div className="admin-dashboard-loading-state">
                      <div className="admin-dashboard-spinner admin-dashboard-spinner-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <span>Loading students...</span>
                    </div>
                  ) : courseStudents.length === 0 ? (
                    <div className="admin-dashboard-empty-state">No students enrolled in this course</div>
                  ) : (
                    <div className={`admin-dashboard-checkbox-list ${errors.studentIds ? 'error' : ''}`}>
                      {courseStudents.map((student) => (
                        <div key={student._id} className="admin-dashboard-checkbox-item">
                          <label className="admin-dashboard-checkbox-label">
                            <input
                              type="checkbox"
                              value={student._id}
                              {...register("studentIds", {
                                required: "Please select at least one student"
                              })}
                            />
                            <div className="admin-dashboard-student-info">
                              <div className="admin-dashboard-student-name">
                                {student.name || `${student.firstName} ${student.lastName}`}
                              </div>
                              <div className="admin-dashboard-student-email">
                                {student.email || 'No email'}
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.studentIds && (
                  <div className="admin-dashboard-error-message">
                    <AlertCircle size={14} />
                    {errors.studentIds.message}
                  </div>
                )}
                <p className="admin-dashboard-form-help-text">
                  Check the boxes to select multiple students
                </p>
              </div>

              {/* Status and Notes - 2 columns */}
              <div className="admin-dashboard-form-row-grid">
                {/* Status */}
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    <CheckCircle size={18} />
                    Status
                  </label>
                  <select
                    className="admin-dashboard-form-input-styled"
                    {...register("status", {
                      required: "Status is required"
                    })}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="admin-dashboard-form-group-animated">
                  <label className="admin-dashboard-form-label-with-icon">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="admin-dashboard-form-input-styled"
                    rows="3"
                    placeholder="Enter any additional notes"
                    {...register("notes")}
                  ></textarea>
                </div>
              </div>

              <div className="admin-dashboard-form-actions-styled">



                <button
                  type="button"
                  className="admin-dashboard-btn-styled admin-dashboard-btn-styled-secondary"
                  style={{ backgroundColor: "#3498db", color: "#fff" }}
                  onClick={() => navigate("/admin/attendance")}
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
                      Submitting Attendance...
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddAttendance;
