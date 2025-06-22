import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Bell,
  CheckCircle,
  Circle,
  MoreHorizontal,
} from "lucide-react";
import axios from "@/utils/axiosConfig.js";

const Applications = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    location: "",
    jobLink: "",
    jobDescription: "",
    appliedAt: new Date().toISOString(),
    salary: "",
    currentStatus: "applied",
  });

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [currentReminder, setCurrentReminder] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: "",
    dueDate: "",
  });

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const statusOptions = [
    { value: "applied", label: "Applied" },
    { value: "under review", label: "Under Review" },
    { value: "interview scheduled", label: "Interview Scheduled" },
    { value: "offered", label: "Offered" },
    { value: "rejected", label: "Rejected" },
  ];

  const fetchApplications = async () => {
    try {
      const res = await axios.get("/user/applications/");
      setApplications(res.data.data);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    }
  };

  const createApplication = async () => {
    try {
      await axios.post("/user/applications", formData);
      setShowModal(false);
      await fetchApplications();
    } catch (err) {
      console.error("Failed to create application", err);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      await axios.put("/user/applications/", {
        applicationId,
        currentStatus: newStatus,
      });
      setActiveDropdown(null); // Close dropdown after update
      await fetchApplications();
    } catch (err) {
      console.error("Failed to update application status", err);
    }
  };

  const updateNotes = async () => {
    try {
      await axios.put("/user/applications/notes", {
        applicationId: selectedAppId,
        notes: noteText,
      });
      setShowNoteModal(false);
      fetchApplications();
    } catch (err) {
      console.error("Failed to update notes", err);
    }
  };

  const fetchApplicationReminder = async (appId: string) => {
    try {
      // Find the application and get its reminder
      const app = applications.find(a => a._id === appId);
      if (app && app.reminders && app.reminders.dueDate) {
        setCurrentReminder(app.reminders);
      } else {
        setCurrentReminder(null);
      }
    } catch (err) {
      console.error("Failed to fetch reminder", err);
    }
  };

  const createReminder = async () => {
    try {
      await axios.post("/user/applications/reminders", {
        applicationId: selectedAppId,
        ...newReminder,
      });
      
      // Clear the form
      setNewReminder({ title: "", dueDate: "" });
      
      // Refresh applications to get updated reminder
      await fetchApplications();
      
      // Update current reminder display immediately
      // Find the updated application and set current reminder
      const updatedRes = await axios.get("/user/applications/");
      const updatedApp = updatedRes.data.data.find(a => a._id === selectedAppId);
      if (updatedApp && updatedApp.reminders && updatedApp.reminders.dueDate) {
        setCurrentReminder(updatedApp.reminders);
      }
    } catch (err) {
      console.error("Failed to create reminder", err);
    }
  };

  const updateReminderStatus = async (appId: string, isCompleted: boolean) => {
    try {
      await axios.put("/user/applications/reminders/status-update", {
        applicationId: appId,
        isCompleted: isCompleted,
      });
      // Refresh applications to get updated reminder status
      await fetchApplications();
      // If modal is open, update current reminder display
      if (selectedAppId === appId) {
        await fetchApplicationReminder(appId);
      }
    } catch (err) {
      console.error("Failed to update reminder status", err);
    }
  };

  const formatDateTime = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-yellow-100 text-yellow-800";
      case "Under review":
        return "bg-blue-100 text-blue-800";
      case "Interview scheduled":
        return "bg-green-100 text-green-800";
      case "Offered":
        return "bg-purple-100 text-purple-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isReminderOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getReminderStatusIcon = (app) => {
    if (!app.reminders || !app.reminders.dueDate) return null;
    
    const isOverdue = isReminderOverdue(app.reminders.dueDate);
    const isCompleted = app.reminders.isCompleted;
    
    if (isCompleted) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (isOverdue) {
      return <Bell className="w-4 h-4 text-red-500" />;
    } else {
      return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  // Handle reminder modal opening
  const handleReminderModalOpen = (appId: string) => {
    setSelectedAppId(appId);
    fetchApplicationReminder(appId);
    setShowReminderModal(true);
  };

  // Handle reminder modal closing
  const handleReminderModalClose = () => {
    setShowReminderModal(false);
    setNewReminder({ title: "", dueDate: "" });
    setCurrentReminder(null);
    setSelectedAppId(null);
  };

  useEffect(() => {
    fetchApplications();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('.relative')) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Applications</h1>
            <p className="text-gray-600">Track and manage your job applications</p>
          </div>
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Application
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Application</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} placeholder="Job Title" />
                <Input name="company" value={formData.company} onChange={handleInputChange} placeholder="Company" />
                <Input name="location" value={formData.location} onChange={handleInputChange} placeholder="Location" />
                <Input name="jobLink" value={formData.jobLink} onChange={handleInputChange} placeholder="Job Link" />
                <Textarea name="jobDescription" value={formData.jobDescription} onChange={handleInputChange} placeholder="Job Description" />
                <Input
                  name="appliedAt"
                  type="datetime-local"
                  value={new Date(formData.appliedAt).toISOString().slice(0, 16)}
                  onChange={(e) => setFormData({ ...formData, appliedAt: new Date(e.target.value).toISOString() })}
                />
                <Input name="salary" type="number" value={formData.salary} onChange={handleInputChange} placeholder="Salary" />
                <select
                  name="currentStatus"
                  className="w-full border border-input rounded-md p-2 text-sm"
                  value={formData.currentStatus}
                  onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
                >
                  <option value="applied">Applied</option>
                  <option value="under review">Under Review</option>
                  <option value="interview scheduled">Interview Scheduled</option>
                  <option value="offered">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <DialogFooter>
                <Button onClick={createApplication}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Follow-up Date</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Reminder</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications
                      .filter((app) =>
                        app.jobTitle.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((app) => (
                        <TableRow key={app._id}>
                          <TableCell className="font-medium">{app.jobTitle}</TableCell>
                          <TableCell>{app.company}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(app.currentStatus.charAt(0).toUpperCase() + app.currentStatus.slice(1))}>
                              {app.currentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDateTime(app.appliedAt)}</TableCell>
                          <TableCell>{app.updatedAt ? formatDateTime(app.updatedAt) : "-"}</TableCell>
                          <TableCell>{app.salary || "-"}</TableCell>
                          <TableCell>
                            {app.reminders && app.reminders.dueDate ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateReminderStatus(app._id, !app.reminders.isCompleted)}
                                  className="flex items-center space-x-1 hover:bg-gray-100 p-1 rounded"
                                >
                                  {getReminderStatusIcon(app)}
                                  <span className={`text-xs ${app.reminders.isCompleted ? 'line-through text-gray-500' : ''}`}>
                                    {app.reminders.title || 'Reminder'}
                                  </span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">No reminder</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedAppId(app._id);
                                  setNoteText(app.notes || "");
                                  setShowNoteModal(true);
                                }}
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReminderModalOpen(app._id)}
                              >
                                <Bell className="w-4 h-4" />
                              </Button>
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setActiveDropdown(activeDropdown === app._id ? null : app._id)}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                                {activeDropdown === app._id && (
                                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[140px]">
                                    <div className="py-1">
                                      {statusOptions.map((status) => (
                                        <button
                                          key={status.value}
                                          onClick={() => updateApplicationStatus(app._id, status.value)}
                                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                                            app.currentStatus === status.value ? "bg-gray-50" : ""
                                          }`}
                                        >
                                          {status.label}
                                          {app.currentStatus === status.value && (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Notes Modal */}
      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Notes</DialogTitle>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Enter notes or communication history..."
          />
          <DialogFooter>
            <Button onClick={updateNotes}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminders Modal */}
      <Dialog open={showReminderModal} onOpenChange={handleReminderModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Reminder</DialogTitle>
          </DialogHeader>
          
          {/* Current Reminder Display */}
          {currentReminder ? (
            <div className="space-y-4">
              <div className="border p-4 rounded-md bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <button
                        onClick={() => updateReminderStatus(selectedAppId!, !currentReminder.isCompleted)}
                        className="flex items-center space-x-2 hover:bg-gray-200 p-1 rounded"
                      >
                        {currentReminder.isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={`font-medium ${currentReminder.isCompleted ? 'line-through text-gray-500' : ''}`}>
                          {currentReminder.title}
                        </span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Due: {formatDateTime(currentReminder.dueDate)}
                      {isReminderOverdue(currentReminder.dueDate) && !currentReminder.isCompleted && (
                        <span className="text-red-500 ml-2">(Overdue)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No reminder set for this application</p>
          )}

          {/* Add New Reminder Form (shown when no reminder exists) */}
          {!currentReminder && (
            <div className="pt-4 space-y-4 border-t">
              <h4 className="font-medium">Add New Reminder</h4>
              <Input
                placeholder="Reminder title"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
              />
              <Input
                type="datetime-local"
                value={newReminder.dueDate}
                onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
              />
              <Button onClick={createReminder} disabled={!newReminder.title || !newReminder.dueDate}>
                Add Reminder
              </Button>
            </div>
          )}

          {/* Replace Reminder Option (shown when reminder exists) */}
          {currentReminder && (
            <div className="pt-4 space-y-4 border-t">
              <h4 className="font-medium">Update Reminder</h4>
              <Input
                placeholder="New reminder title"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
              />
              <Input
                type="datetime-local"
                value={newReminder.dueDate}
                onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
              />
              <Button onClick={createReminder} disabled={!newReminder.title || !newReminder.dueDate}>
                Update Reminder
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Applications;