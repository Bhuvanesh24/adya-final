import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, Target, Calendar, Award, RefreshCw } from "lucide-react";

import axios from "@/utils/axiosConfig";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('all');
  const [statsData, setStatsData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching analytics data...');
      
      const [statsResponse, dashboardResponse] = await Promise.all([
        axios.get(`/analytics/stats?period=${period}`, {
          withCredentials: true,
        }),
        axios.get('/analytics/dashboard', {
          withCredentials: true,
        }),
      ]);

      console.log('Stats response:', statsResponse.data);
      console.log('Dashboard response:', dashboardResponse.data);

      const stats = statsResponse.data;
      const dashboard = dashboardResponse.data;

      if (!stats.success) {
        throw new Error(stats.message || 'Stats API returned error');
      }

      if (!dashboard.success) {
        throw new Error(dashboard.message || 'Dashboard API returned error');
      }

      setStatsData(stats.data);
      setDashboardData(dashboard.data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      
      // Handle axios specific errors
      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.message || 
                           `API error (${err.response.status}): ${err.response.statusText}`;
        setError(errorMessage);
      } else if (err.request) {
        // Request made but no response received
        setError('Network error: Unable to reach server. Please check your connection.');
      } else {
        // Something else happened
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  // Prepare chart data from backend response
  const prepareTimelineData = (timeline) => {
    if (!timeline) return [];
    return timeline.map(item => ({
      month: item.month,
      applications: item.count,
    }));
  };

  const prepareStatusData = (statusBreakdown) => {
    if (!statusBreakdown) return [];
    const colors = {
      applied: "#3b82f6",
      "under review": "#10b981",
      "interview scheduled": "#f59e0b",
      offered: "#8b5cf6",
      rejected: "#ef4444",
    };

    return Object.entries(statusBreakdown).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: Number(count) || 0,
      color: colors[status] || "#6b7280",
    }));
  };

  const calculateSuccessRate = () => {
    if (!statsData) return 0;
    const { statusBreakdown, totalApplications } = statsData;
    if (totalApplications === 0) return 0;
    
    const successfulApplications = (statusBreakdown['interview scheduled'] || 0) + 
                                 (statusBreakdown.offered || 0);
    return Math.round((successfulApplications / totalApplications) * 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading analytics...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Analytics Loading Error
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            
            <div className="text-left bg-white p-4 rounded border text-sm text-gray-700 mb-4">
              <p><strong>Troubleshooting:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Check if your backend server is running</li>
                <li>Verify the API routes are correctly set up</li>
                <li>Ensure authentication cookies are set properly</li>
                <li>Check browser console for more details</li>
                <li>Try logging out and logging back in</li>
              </ul>
            </div>
            
            <div className="space-x-3">
              <button
                onClick={fetchAnalytics}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  // Clear any stored data and redirect to login
                  window.location.href = '/login';
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Re-login
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const timelineData = prepareTimelineData(statsData?.timeline);
  const statusData = prepareStatusData(statsData?.statusBreakdown);
  const successRate = calculateSuccessRate();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics & Success Probability
            </h1>
            <p className="text-gray-600">
              Track your job search performance and get insights
            </p>
          </div>
          
          {/* Period Filter */}
          <div className="flex space-x-2">
            {['all', 'week', 'month', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded capitalize ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Success Probability */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Target className="w-6 h-6 mr-2 text-green-600" />
              Success Probability
            </CardTitle>
            <CardDescription>
              Based on your application activity and interview rate
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg
                className="w-32 h-32 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray={`${successRate}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-green-600">
                  {successRate}%
                </span>
              </div>
            </div>
            <p className="text-lg font-medium">
              {successRate > 70 ? 'High' : successRate > 40 ? 'Moderate' : 'Building'} Success Probability
            </p>
            <p className="text-sm text-gray-600">
              Interview Rate: {statsData?.interviewRate || 0}% | Offer Rate: {statsData?.offerRate || 0}%
            </p>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Applications
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsData?.totalApplications || 0}
                  </p>
                  <p className="text-sm text-blue-600">
                    Period: {period}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Interviews Scheduled
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsData?.statusBreakdown?.['interview scheduled'] || 0}
                  </p>
                  <p className="text-sm text-green-600">
                    {statsData?.interviewRate || 0}% rate
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Offers Received
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsData?.statusBreakdown?.offered || 0}
                  </p>
                  <p className="text-sm text-green-600">
                    {statsData?.offerRate || 0}% rate
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Applications
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardData?.activeApplications || 0}
                  </p>
                  <p className="text-sm text-blue-600">
                    In progress
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-full">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
              <CardDescription>
                Applications submitted over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="applications"
                    fill="#3b82f6"
                    name="Applications"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>
                Current distribution of application statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-4">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Companies */}
        {statsData?.topCompanies?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Companies Applied To</CardTitle>
              <CardDescription>
                Companies you've applied to most frequently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statsData.topCompanies.slice(0, 6).map((company, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{company.company}</span>
                    <Badge variant="secondary">{company.count} applications</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Goals Progress */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Weekly Goals & Progress</CardTitle>
            <CardDescription>
              Track your weekly goals based on current activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Weekly Application Goal
                </p>
                <Progress 
                  value={dashboardData?.weeklyGoal?.progress || 0} 
                  className="h-3" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  {dashboardData?.weeklyGoal?.current || 0} of {dashboardData?.weeklyGoal?.target || 0} completed
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Upcoming Reminders
                </p>
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData?.upcomingReminders || 0}
                </div>
                <p className="text-xs text-gray-500">
                  Next 7 days
                </p>
              </div>
            </div>

            {/* Reminder Summary */}
            {dashboardData?.upcomingRemindersList?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Upcoming Tasks</h4>
                <div className="space-y-2">
                  {dashboardData.upcomingRemindersList.map((reminder, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <span className="font-medium">{reminder.jobTitle}</span>
                        <span className="text-gray-600"> at {reminder.company}</span>
                      </div>
                      <Badge variant="outline">{reminder.type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Insights & Suggestions</CardTitle>
            <CardDescription>
              Data-driven insights to improve your job search
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  Strong Performance
                </h4>
                <p className="text-sm text-green-700">
                  Your interview rate of {statsData?.interviewRate || 0}% is 
                  {(statsData?.interviewRate || 0) > 25 ? ' above' : ' building towards'} industry average.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">
                  Activity Summary
                </h4>
                <p className="text-sm text-blue-700">
                  {dashboardData?.recentApplications || 0} applications submitted this week.
                  {dashboardData?.overdueReminders > 0 
                    ? ` You have ${dashboardData.overdueReminders} overdue tasks.`
                    : ' Great job staying on track!'
                  }
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Next Steps</h4>
                <p className="text-sm text-purple-700">
                  {dashboardData?.interviewsScheduled > 0 
                    ? `You have ${dashboardData.interviewsScheduled} interviews scheduled. Prepare well!`
                    : 'Focus on applying to more positions to increase interview opportunities.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;