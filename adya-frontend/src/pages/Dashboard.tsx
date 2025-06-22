import { useEffect, useState } from "react";
import axios from "@/utils/axiosConfig.js";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Plus,
  TrendingUp,
  Users,
  Target,
  CheckCircle,
} from "lucide-react";

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/me");
        if (res.status === 200 && res.data.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };
    const fetchApplications = async () => {
      try {
        const res = await axios.get("/user/applications");

        if (res.data.success) {
          setApplications(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };
    fetchUser();
    fetchApplications();
  }, []);

  // Map backend data to UI format

  const total = applications.length;
  const responded = applications.filter(
    (app) => app.currentStatus && app.currentStatus.toLowerCase() !== "applied"
  ).length;

  const responseRate =
    total > 0 ? `${Math.round((responded / total) * 100)}%` : "0%";

  const recentApplications = applications.slice(0, 3).map((app) => {
    const status = app.currentStatus || "Applied";
    const statusClassMap = {
      applied: "bg-yellow-100 text-yellow-800",
      "interview scheduled": "bg-blue-100 text-blue-800",
      "under review": "bg-purple-100 text-purple-800",
      "offered": "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    const statusColor =
      statusClassMap[status.toLowerCase()] || "bg-gray-100 text-gray-800";

    const appliedDate = new Date(app.appliedAt);
    const now = new Date();
    const daysAgo = Math.round(
      (now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const relativeDate =
      daysAgo === 0
        ? "Today"
        : daysAgo === 1
        ? "1 day ago"
        : `${daysAgo} days ago`;

    return {
      company: app.company,
      position: app.jobTitle,
      status: app.currentStatus,
      appliedDate: relativeDate,
      statusColor,
    };
  });

  const stats = [
    {
      title: "Applications Sent",
      value: applications.length.toString(),
      change: "+12%",
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Interviews Scheduled",
      value: applications
        .filter((app) => app.currentStatus?.toLowerCase().includes("interview"))
        .length.toString(),
      change: "+25%",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Response Rate",
      value: responseRate,
      change: "+8%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Offers Received",
      value: applications
        .filter((app) => app.currentStatus?.toLowerCase().includes("offer"))
        .length.toString(),
      change: "+200%",
      icon: CheckCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back{user?.name ? `, ${user.name}` : ""}!
              </h1>

              <p className="text-blue-100 text-lg">
                You have {stats[1].value} interviews scheduled this week. Keep
                up the great work! 🚀
              </p>
            </div>
            <div className="hidden md:block">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/applications")}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Application
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm font-medium text-green-600">
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your latest job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.map((app, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {app.position}
                      </h4>
                      <p className="text-sm text-gray-600">{app.company}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {app.appliedDate}
                      </p>
                    </div>
                    <Badge className={app.statusColor}>{app.status}</Badge>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate("/applications")}
              >
                View All Applications
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get things done faster</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="p-6 h-auto flex-col space-y-2"
                onClick={() => navigate("/resume-optimizer")}
              >
                <FileText className="w-8 h-8 text-blue-600" />
                <span>Optimize Resume</span>
              </Button>

              <Button
                variant="outline"
                className="p-6 h-auto flex-col space-y-2"
                onClick={() => navigate("/interview-prep")}
              >
                <Target className="w-8 h-8 text-green-600" />
                <span>Practice Interview</span>
              </Button>

              <Button
                variant="outline"
                className="p-6 h-auto flex-col space-y-2"
                onClick={() => navigate("/analytics")}
              >
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <span>View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
