import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import studentService from '../../services/studentService';
import subscriptionService from '../../services/subscriptionService';
import {
  FaGraduationCap,
  FaUserCheck,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaUsers,
  FaChartLine,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaClock,
  FaTrophy,
  FaSpinner
} from 'react-icons/fa';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
    pendingAmount: 0,
    studentStatus: {
      active: 0,
      inactive: 0
    },
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch students and subscriptions data
      const [studentsResponse, subscriptionsResponse] = await Promise.all([
        studentService.getAllStudents(),
        subscriptionService.getAllSubscriptions()
      ]);

      console.log("studentsResponse:", studentsResponse);
      console.log("subscriptionsResponse:", subscriptionsResponse);

      const students = studentsResponse.students || [];
      const subscriptions = subscriptionsResponse.subscriptions || [];

      // Calculate student metrics
      const totalStudents = students.length;
      const activeStudents = students.filter(student => student.status === 'Y').length;
      const inactiveStudents = students.filter(student => student.status === 'N').length;

      // Calculate revenue metrics
      const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.finalPrice || 0), 0);
      
      // Calculate this month's revenue (current month)
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const thisMonthRevenue = subscriptions
        .filter(sub => {
          const subDate = new Date(sub.createdAt);
          return subDate.getMonth() === currentMonth && subDate.getFullYear() === currentYear;
        })
        .reduce((sum, sub) => sum + (sub.finalPrice || 0), 0);

      // Calculate pending amount (subscriptions with endDate in the past)
      const pendingAmount = subscriptions
        .filter(sub => {
          const endDate = new Date(sub.endDate);
          return endDate < currentDate;
        })
        .reduce((sum, sub) => sum + (sub.finalPrice || 0), 0);

      // Generate recent activities from subscriptions
      const recentActivities = subscriptions
        .slice(0, 5)
        .map((sub, index) => ({
          id: index + 1,
          type: 'subscription',
          student: sub.student_id?.name || 'Unknown Student',
          package: sub.packageId?.name || 'Unknown Package',
          amount: sub.finalPrice || 0,
          time: new Date(sub.createdAt).toLocaleDateString(),
          status: 'success'
        }));

      setDashboardData({
        totalStudents,
        activeStudents,
        inactiveStudents,
        totalRevenue,
        thisMonthRevenue,
        pendingAmount,
        studentStatus: {
          active: activeStudents,
          inactive: inactiveStudents
        },
        recentActivities
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      setDashboardData({
        totalStudents: 0,
        activeStudents: 0,
        inactiveStudents: 0,
        totalRevenue: 0,
        thisMonthRevenue: 0,
        pendingAmount: 0,
        studentStatus: {
          active: 0,
          inactive: 0
        },
        recentActivities: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'subscription': return <FaMoneyBillWave className="text-blue-500" />;
      case 'enrollment': return <FaUserCheck className="text-green-500" />;
      case 'payment': return <FaMoneyBillWave className="text-blue-500" />;
      case 'attendance': return <FaClock className="text-yellow-500" />;
      case 'completion': return <FaTrophy className="text-purple-500" />;
      default: return <FaUsers className="text-gray-500" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'subscription': return `${activity.student} subscribed to ${activity.package} - ${formatCurrency(activity.amount)}`;
      case 'enrollment': return `${activity.student} enrolled in ${activity.course}`;
      case 'payment': return `${activity.student} made payment for ${activity.course}`;
      case 'attendance': return `${activity.student} marked absent in ${activity.course}`;
      case 'completion': return `${activity.student} completed ${activity.course}`;
      default: return 'Activity recorded';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-container">
          <div className="loading-container">
            <FaSpinner className="loading-spinner" />
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="dashboard-container">
          <div className="error-container">
            <FaExclamationTriangle className="error-icon" />
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="dashboard-container">
        {/* Enhanced Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="dashboard-title">Dashboard</h1>
              <p className="dashboard-subtitle">Welcome back! Here's what's happening with your educational institute.</p>
            </div>
            <div className="header-actions">
              <div className="date-display">
                <FaCalendarAlt className="date-icon" />
                <span>{new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="kpi-grid">
          {/* Total Students */}
          <div className="kpi-card kpi-card-primary">
            <div className="kpi-card-content">
              <div className="kpi-info">
                <p className="kpi-label">Total Students</p>
                <p className="kpi-value">{dashboardData.totalStudents.toLocaleString()}</p>
                <div className="kpi-trend">
                  <FaArrowUp className="trend-icon trend-up" />
                  <span className="trend-text">All registered students</span>
                </div>
              </div>
              <div className="kpi-icon-wrapper kpi-icon-primary">
                <FaGraduationCap className="kpi-icon" />
              </div>
            </div>
            <div className="kpi-card-footer">
              <span className="kpi-footer-text">Total registered students</span>
            </div>
          </div>

          {/* Active Students */}
          <div className="kpi-card kpi-card-success">
            <div className="kpi-card-content">
              <div className="kpi-info">
                <p className="kpi-label">Active Students</p>
                <p className="kpi-value">{dashboardData.activeStudents.toLocaleString()}</p>
                <div className="kpi-trend">
                  <FaArrowUp className="trend-icon trend-up" />
                  <span className="trend-text">{((dashboardData.activeStudents / dashboardData.totalStudents) * 100).toFixed(1)}% of total</span>
                </div>
              </div>
              <div className="kpi-icon-wrapper kpi-icon-success">
                <FaUserCheck className="kpi-icon" />
              </div>
            </div>
            <div className="kpi-card-footer">
              <span className="kpi-footer-text">Currently active students</span>
            </div>
          </div>

          {/* This Month Revenue */}
          <div className="kpi-card kpi-card-purple">
            <div className="kpi-card-content">
              <div className="kpi-info">
                <p className="kpi-label">This Month Revenue</p>
                <p className="kpi-value">{formatCurrency(dashboardData.thisMonthRevenue)}</p>
                <div className="kpi-trend">
                  <FaArrowUp className="trend-icon trend-up" />
                  <span className="trend-text">Current month earnings</span>
                </div>
              </div>
              <div className="kpi-icon-wrapper kpi-icon-purple">
                <FaMoneyBillWave className="kpi-icon" />
              </div>
            </div>
            <div className="kpi-card-footer">
              <span className="kpi-footer-text">Revenue this month</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="kpi-card kpi-card-info">
            <div className="kpi-card-content">
              <div className="kpi-info">
                <p className="kpi-label">Total Revenue</p>
                <p className="kpi-value">{formatCurrency(dashboardData.totalRevenue)}</p>
                <div className="kpi-trend">
                  <FaArrowUp className="trend-icon trend-up" />
                  <span className="trend-text">All time earnings</span>
                </div>
              </div>
              <div className="kpi-icon-wrapper kpi-icon-info">
                <FaChartLine className="kpi-icon" />
              </div>
            </div>
            <div className="kpi-card-footer">
              <span className="kpi-footer-text">Total collected revenue</span>
            </div>
          </div>
        </div>

        {/* Additional Metrics Row */}
        <div className="kpi-grid">
          {/* Inactive Students */}
          <div className="kpi-card kpi-card-warning">
            <div className="kpi-card-content">
              <div className="kpi-info">
                <p className="kpi-label">Inactive Students</p>
                <p className="kpi-value">{dashboardData.inactiveStudents.toLocaleString()}</p>
                <div className="kpi-trend">
                  <FaArrowDown className="trend-icon trend-down" />
                  <span className="trend-text">{((dashboardData.inactiveStudents / dashboardData.totalStudents) * 100).toFixed(1)}% of total</span>
                </div>
              </div>
              <div className="kpi-icon-wrapper kpi-icon-warning">
                <FaExclamationTriangle className="kpi-icon" />
              </div>
            </div>
            <div className="kpi-card-footer">
              <span className="kpi-footer-text">Students with inactive status</span>
            </div>
          </div>

          {/* Pending Amount */}
          <div className="kpi-card kpi-card-danger">
            <div className="kpi-card-content">
              <div className="kpi-info">
                <p className="kpi-label">Pending Amount</p>
                <p className="kpi-value">{formatCurrency(dashboardData.pendingAmount)}</p>
                <div className="kpi-trend">
                  <FaArrowDown className="trend-icon trend-down" />
                  <span className="trend-text">Expired subscriptions</span>
                </div>
              </div>
              <div className="kpi-icon-wrapper kpi-icon-danger">
                <FaClock className="kpi-icon" />
              </div>
            </div>
            <div className="kpi-card-footer">
              <span className="kpi-footer-text">Amount from expired subscriptions</span>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="charts-grid">
          {/* Student Status Pie Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title-section">
                <div className="chart-icon-wrapper chart-icon-green">
                  <FaChartPie className="chart-icon" />
                </div>
                <div className="chart-title-content">
                  <h3 className="chart-title">Student Status Distribution</h3>
                  <p className="chart-subtitle">Active vs Inactive students</p>
                </div>
              </div>
              <div className="chart-summary">
                <p className="chart-summary-value">
                  {dashboardData.totalStudents}
                </p>
                <p className="chart-summary-label">Total Students</p>
              </div>
            </div>
            <div className="chart-content">
              <SimplePieChart data={dashboardData.studentStatus} />
            </div>
          </div>

          {/* Revenue Overview */}
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title-section">
                <div className="chart-icon-wrapper chart-icon-blue">
                  <FaChartLine className="chart-icon" />
                </div>
                <div className="chart-title-content">
                  <h3 className="chart-title">Revenue Overview</h3>
                  <p className="chart-subtitle">Financial performance summary</p>
                </div>
              </div>
              <div className="chart-summary">
                <p className="chart-summary-value">
                  {formatCurrency(dashboardData.totalRevenue)}
                </p>
                <p className="chart-summary-label">Total Revenue</p>
              </div>
            </div>
            <div className="chart-content">
              <RevenueOverviewChart 
                totalRevenue={dashboardData.totalRevenue}
                thisMonthRevenue={dashboardData.thisMonthRevenue}
                pendingAmount={dashboardData.pendingAmount}
              />
            </div>
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="activities-section">
          <div className="activities-header">
            <h3 className="activities-title">Recent Subscriptions</h3>
            <button className="view-all-btn" onClick={fetchDashboardData}>
              Refresh
            </button>
          </div>
          <div className="activities-grid">
            {dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity) => (
              <div key={activity.id} className="activity-card">
                <div className="activity-icon">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-content">
                  <p className="activity-text">{getActivityText(activity)}</p>
                  <p className="activity-time">{activity.time}</p>
                </div>
                <div className={`activity-status activity-status-${activity.status}`}></div>
              </div>
              ))
            ) : (
              <div className="no-activities">
                <p>No recent subscriptions found</p>
              </div>
            )}
          </div>
        </div>

        {/* Custom CSS */}
        <style>{`
         .dashboard-container {
  min-height: 100vh;
            background: #4DD0E1;
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 50vh;
            color: white;
            font-size: 1.2rem;
          }

          .loading-spinner {
            animation: spin 1s linear infinite;
            font-size: 2rem;
            margin-bottom: 1rem;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 50vh;
            color: white;
            text-align: center;
          }

          .error-icon {
            font-size: 3rem;
            color: #ef4444;
            margin-bottom: 1rem;
          }

          .retry-btn {
            background: #ef4444;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
            transition: all 0.3s ease;
          }

          .retry-btn:hover {
            background: #dc2626;
            transform: translateY(-1px);
          }

          .dashboard-header {
            margin-bottom: 2rem;
          }

          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .dashboard-title {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
          }

          .dashboard-subtitle {
            color: #6b7280;
            font-size: 1.1rem;
            font-weight: 500;
          }

          .date-display {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }

          .date-icon {
            font-size: 1.1rem;
          }

          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .kpi-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .kpi-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--card-accent) 0%, var(--card-accent-light) 100%);
          }

          .kpi-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          }

          .kpi-card-primary {
            --card-accent: #3b82f6;
            --card-accent-light: #60a5fa;
          }

          .kpi-card-success {
            --card-accent: #10b981;
            --card-accent-light: #34d399;
          }

          .kpi-card-warning {
            --card-accent: #f59e0b;
            --card-accent-light: #fbbf24;
          }

          .kpi-card-purple {
            --card-accent: #8b5cf6;
            --card-accent-light: #a78bfa;
          }

          .kpi-card-info {
            --card-accent: #06b6d4;
            --card-accent-light: #22d3ee;
          }

          .kpi-card-danger {
            --card-accent: #ef4444;
            --card-accent-light: #f87171;
          }

          .kpi-card-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
          }

          .kpi-info {
            flex: 1;
          }

          .kpi-label {
            color: #6b7280;
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
          }

          .kpi-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: #1f2937;
            margin-bottom: 0.5rem;
            line-height: 1;
          }

          .kpi-trend {
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }

          .trend-icon {
            font-size: 0.75rem;
          }

          .trend-up {
            color: #10b981;
          }

          .trend-down {
            color: #ef4444;
          }

          .trend-text {
            font-size: 0.75rem;
            font-weight: 600;
            color: #6b7280;
          }

          .kpi-icon-wrapper {
            width: 60px;
            height: 60px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          }

          .kpi-icon-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
          }

          .kpi-icon-success {
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          }

          .kpi-icon-warning {
            background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
          }

          .kpi-icon-purple {
            background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
          }

          .kpi-icon-info {
            background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
          }

          .kpi-icon-danger {
            background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
          }

          .kpi-icon {
            font-size: 1.5rem;
            color: white;
          }

          .kpi-card-footer {
            padding-top: 1rem;
            border-top: 1px solid #f3f4f6;
          }

          .kpi-footer-text {
            font-size: 0.875rem;
            color: #6b7280;
            font-weight: 500;
          }

          .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .chart-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
          }

          .chart-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          }

          .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .chart-title-section {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .chart-icon-wrapper {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .chart-icon-blue {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
          }

          .chart-icon-green {
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          }

          .chart-icon {
            font-size: 1.25rem;
            color: white;
          }

          .chart-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.25rem;
          }

          .chart-subtitle {
            color: #6b7280;
            font-size: 0.875rem;
            font-weight: 500;
          }

          .chart-summary {
            text-align: right;
          }

          .chart-summary-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.25rem;
          }

          .chart-summary-label {
            color: #6b7280;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .chart-content {
            height: 320px;
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
            border-radius: 16px;
            padding: 1rem;
            border: 1px solid #f1f5f9;
          }

          .activities-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .activities-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .activities-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
          }

          .view-all-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .view-all-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
          }

          .activities-grid {
            display: grid;
            gap: 1rem;
          }

          .activity-card {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 12px;
            transition: all 0.3s ease;
            position: relative;
          }

          .activity-card:hover {
            background: #f1f5f9;
            transform: translateX(5px);
          }

          .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }

          .activity-content {
            flex: 1;
          }

          .activity-text {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.25rem;
          }

          .activity-time {
            font-size: 0.875rem;
            color: #6b7280;
          }

          .activity-status {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          .activity-status-success {
            background: #10b981;
          }

          .activity-status-warning {
            background: #f59e0b;
          }

          .no-activities {
            text-align: center;
            padding: 2rem;
            color: #6b7280;
            font-style: italic;
          }

          @media (max-width: 768px) {
            .dashboard-container {
              padding: 1rem;
            }

            .header-content {
              flex-direction: column;
              gap: 1rem;
              text-align: center;
            }

            .dashboard-title {
              font-size: 2rem;
            }

            .kpi-grid {
              grid-template-columns: 1fr;
            }

            .charts-grid {
              grid-template-columns: 1fr;
            }

            .kpi-value {
              font-size: 2rem;
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
};

// Enhanced Pie Chart Component
const SimplePieChart = ({ data }) => {
  const total = data.active + data.inactive;
  const centerX = 140;
  const centerY = 140;
  const radius = 90;
  const innerRadius = 45;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-lg">No Data</span>
          </div>
          <p className="text-gray-500 text-sm">No student data available</p>
        </div>
      </div>
    );
  }

  const segments = [
    { label: 'Active', value: data.active, color: '#10b981', lightColor: '#d1fae5' },
    { label: 'Inactive', value: data.inactive, color: '#ef4444', lightColor: '#fee2e2' }
  ].filter(segment => segment.value > 0);

  let currentAngle = -90;

  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
        <div className="relative">
          <svg width="280" height="280" viewBox="0 0 280 280">
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth="2"
            />

            {segments.map((segment, index) => {
              const percentage = segment.value / total;
              const angle = percentage * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;

              const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

              const x3 = centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180);
              const y3 = centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180);
              const x4 = centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180);
              const y4 = centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180);

              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = [
                `M ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                'Z'
              ].join(' ');

              currentAngle += angle;

              return (
                <g key={index}>
                  <path
                    d={pathData}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="3"
                    filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))"
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                </g>
              );
            })}

            <circle
              cx={centerX}
              cy={centerY}
              r={innerRadius - 5}
              fill="white"
              stroke="#e2e8f0"
              strokeWidth="2"
            />

            <text
              x={centerX}
              y={centerY - 8}
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              fill="#1f2937"
            >
              {total}
            </text>
            <text
              x={centerX}
              y={centerY + 12}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
            >
              Total Students
            </text>
          </svg>
        </div>

        <div className="space-y-4">
          {segments.map((segment, index) => {
            const percentage = Math.round((segment.value / total) * 100);
            return (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {segment.label}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold" style={{ color: segment.color }}>
                        {segment.value}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Revenue Overview Chart Component
const RevenueOverviewChart = ({ totalRevenue, thisMonthRevenue, pendingAmount }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const data = [
    { label: 'Total Revenue', value: totalRevenue, color: '#10b981' },
    { label: 'This Month', value: thisMonthRevenue, color: '#3b82f6' },
    { label: 'Pending', value: pendingAmount, color: '#ef4444' }
  ];
  const maxValue = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-md">
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm font-bold" style={{ color: item.color }}>
                    {formatCurrency(item.value)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
