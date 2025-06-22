import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  User,
  Settings,
  Calendar,
  FileText,
  CreditCard,
  BarChart3,
  Briefcase,
  Target,
  MessageSquare,
  TrendingUp,
  Menu,
  X,
  CheckCircle,
  Clock,
  Building,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "@/utils/axiosConfig.js";

interface LayoutProps {
  children: React.ReactNode;
}

interface Reminder {
  _id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  application: {
    _id: string;
    jobTitle: string;
    company: string;
  };
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Applications", href: "/applications", icon: Briefcase },
  { name: "Resume Optimizer", href: "/resume-optimizer", icon: FileText },
  { name: "Cover Letter", href: "/cover-letter", icon: MessageSquare },
  { name: "Interview Prep", href: "/interview-prep", icon: Target },
  { name: "Job Search", href: "/job-search", icon: Search },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
];

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showReminders, setShowReminders] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/user/applications/app/get-reminders");
      setReminders(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch reminders", err);
    } finally {
      setLoading(false);
    }
  };

  const updateReminderStatus = async (reminderId: string, isCompleted: boolean) => {
    try {
      await axios.put("/user/applications/reminders/status-update", {
        applicationId: reminderId,
        isCompleted: isCompleted,
      });
      await fetchReminders();
    } catch (err) {
      console.error("Failed to update reminder status", err);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleBellClick = () => {
    setShowReminders(!showReminders);
    if (!showReminders) {
      fetchReminders();
    }
  };

  const formatDateTime = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isReminderOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getReminderIcon = (reminder: Reminder) => {
    if (reminder.isCompleted) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (isReminderOverdue(reminder.dueDate)) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    } else {
      return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const activeReminders = reminders.filter(r => !r.isCompleted);
  const overdueReminders = activeReminders.filter(r => isReminderOverdue(r.dueDate));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showReminders &&
        !(event.target as Element).closest('.reminders-overlay') &&
        !(event.target as Element).closest('.bell-button')
      ) {
        setShowReminders(false);
      }
      if (
        showProfileDropdown &&
        !(event.target as Element).closest('.profile-dropdown') &&
        !(event.target as Element).closest('.profile-button')
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showReminders, showProfileDropdown]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className={cn("bg-white shadow-lg transition-all duration-300 flex flex-col", sidebarOpen ? "w-64" : "w-16")}>
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AJ</span>
            </div>
            {sidebarOpen && <span className="ml-3 font-semibold text-gray-900">AI Job Tracker</span>}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search applications, companies..." className="pl-10 w-80" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="ghost" size="sm" onClick={handleBellClick} className="bell-button relative">
                  <Bell className="w-5 h-5" />
                  {activeReminders.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeReminders.length}
                    </span>
                  )}
                </Button>

                {showReminders && (
                  <div className="reminders-overlay absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-96 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Reminders</h3>
                        <div className="flex items-center space-x-2">
                          {overdueReminders.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {overdueReminders.length} overdue
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => setShowReminders(false)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading reminders...</div>
                      ) : reminders.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No reminders found</div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {reminders.map((reminder) => (
                            <div key={reminder._id} className={cn("p-4 hover:bg-gray-50 transition-colors", reminder.isCompleted && "opacity-75")}>
                              <div className="flex items-start space-x-3">
                                <button onClick={() => updateReminderStatus(reminder._id, !reminder.isCompleted)} className="mt-1 hover:scale-110 transition-transform">
                                  {getReminderIcon(reminder)}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className={cn("font-medium text-sm", reminder.isCompleted ? "line-through text-gray-500" : "text-gray-900")}>
                                      {reminder.title}
                                    </h4>
                                    {isReminderOverdue(reminder.dueDate) && !reminder.isCompleted && (
                                      <Badge variant="destructive" className="text-xs">Overdue</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <Building className="w-3 h-3" />
                                    <span>{reminder.application.company}</span>
                                    <span>•</span>
                                    <span>{reminder.application.jobTitle}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>Due: {formatDateTime(reminder.dueDate)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {reminders.length > 0 && (
                      <div className="p-3 border-t bg-gray-50">
                        <Link to="/applications" onClick={() => setShowReminders(false)} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View all applications →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full profile-button"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>

                {showProfileDropdown && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-56 profile-dropdown">
                    <div className="py-1">
                      <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
