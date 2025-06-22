import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MapPin,
  DollarSign,
  Clock,
  Bookmark,
  Loader2,
  RefreshCw,
} from "lucide-react";

import axios from "@/utils/axiosConfig";

const JobSearch = () => {
  // State for jobs
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for manual job form
  const [manualJob, setManualJob] = useState({
    title: "",
    company: { name: "", location: "" },
    salary: { min: "", max: "" },
    url: "",
    description: "",
    jobType: "Full-time",
    workMode: "On-site",
  });

  // State for search preferences - use 'any' instead of empty string
  const [searchPreferences, setSearchPreferences] = useState({
    query: "",
    location: "",
    jobType: "any",
    workMode: "any",
    minSalary: "",
    maxSalary: "",
  });

  // State for pagination and sources
  const [pagination, setPagination] = useState({ current: 1, hasMore: false });
  const [sources, setSources] = useState({ manual: 0, api: 0, total: 0 });

  // Load initial jobs based on user preferences
  useEffect(() => {
    loadJobsByUserPreferences();
  }, []);

  const loadJobsByUserPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/jobs/");

      if (response.data.success) {
        setJobs(response.data.data);
        setPagination(
          response.data.pagination || { current: 1, hasMore: false }
        );
        setSources(response.data.sources || { manual: 0, api: 0, total: 0 });
      }
    } catch (err) {
      setError("Failed to load jobs based on your preferences");
      console.error("Error loading jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search jobs with new criteria
  const searchJobs = async () => {
    try {
      setSearchLoading(true);
      setError(null);

      // Build query parameters - convert 'any' back to empty string for API
      const params = new URLSearchParams();
      if (searchPreferences.query)
        params.append("query", searchPreferences.query);
      if (searchPreferences.location)
        params.append("location", searchPreferences.location);
      if (searchPreferences.jobType && searchPreferences.jobType !== "any")
        params.append("jobType", searchPreferences.jobType);
      if (searchPreferences.workMode && searchPreferences.workMode !== "any")
        params.append("workMode", searchPreferences.workMode);
      if (searchPreferences.minSalary)
        params.append("minSalary", searchPreferences.minSalary);
      if (searchPreferences.maxSalary)
        params.append("maxSalary", searchPreferences.maxSalary);
      params.append("includeManual", "true");

      const response = await axios.get(`/jobs/search?${params.toString()}`);

      if (response.data.success) {
        setJobs(response.data.data);
        setSources(response.data.sources || { manual: 0, api: 0, total: 0 });
      }
    } catch (err) {
      setError("Failed to search jobs");
      console.error("Error searching jobs:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Save search preferences to user profile
  const saveSearchPreferences = async () => {
    try {
      const preferencesToSave = {
        skills: searchPreferences.query
          ? searchPreferences.query.split(",").map((s) => s.trim())
          : [],
        locations: searchPreferences.location
          ? [searchPreferences.location]
          : [],
        jobType:
          searchPreferences.jobType !== "any"
            ? searchPreferences.jobType
            : null,
        workMode:
          searchPreferences.workMode !== "any"
            ? searchPreferences.workMode
            : null,
        salaryRange: {
          min: searchPreferences.minSalary
            ? parseInt(searchPreferences.minSalary)
            : null,
          max: searchPreferences.maxSalary
            ? parseInt(searchPreferences.maxSalary)
            : null,
        },
      };

      await axios.put("/users/preferences", {
        jobPreferences: preferencesToSave,
      });

      // Reload jobs with new preferences
      await loadJobsByUserPreferences();

      alert("Search preferences saved successfully!");
    } catch (err) {
      setError("Failed to save preferences");
      console.error("Error saving preferences:", err);
    }
  };

  // Create manual job with error handling
  const createManualJob = async () => {
    try {
      // Validate required fields
      if (!manualJob.title.trim()) {
        setError("Job title is required");
        return;
      }
      if (!manualJob.company.name.trim()) {
        setError("Company name is required");
        return;
      }

      const jobData = {
        ...manualJob,
        salary: {
          min: manualJob.salary.min ? parseInt(manualJob.salary.min) : null,
          max: manualJob.salary.max ? parseInt(manualJob.salary.max) : null,
          currency: "Rupees",
        },
        source: "Manual",
        status: true,
        postedDate: new Date(),
      };

      const response = await axios.post("/jobs", jobData);

      if (response.data.success) {
        alert("Job added successfully!");
        setManualJob({
          title: "",
          company: { name: "", location: "" },
          salary: { min: "", max: "" },
          url: "",
          description: "",
          jobType: "Full-time",
          workMode: "On-site",
        });

        // Refresh job list
        await loadJobsByUserPreferences();
      }
    } catch (err) {
      setError("Failed to create job");
      console.error("Error creating job:", err);
    }
  };

  // Handle bookmark job with error handling
  const bookmarkJob = async (jobId) => {
    try {
      if (!jobId) {
        console.warn("No job ID provided for bookmarking");
        return;
      }
      // This would call your bookmark API
      console.log("Bookmarking job:", jobId);
      alert("Job bookmarked!");
    } catch (err) {
      console.error("Error bookmarking job:", err);
      setError("Failed to bookmark job");
    }
  };

  // Format salary display with error handling
  // Fixed formatSalary function
  const formatSalary = (job) => {
    try {
      // Check if salary object exists and has min/max properties
      if (job?.salary && typeof job.salary === "object") {
        const { min, max } = job.salary;

        if (min && max) {
          return `₹${min}k - ₹${max}k`;
        } else if (min) {
          return `₹${min}k+`;
        } else if (max) {
          return `Up to ₹${max}k`;
        }
      }

      // If salary is a string, return it directly
      if (typeof job?.salary === "string") {
        return job.salary;
      }

      // Default fallback
      return "Not specified";
    } catch (err) {
      console.error("Error formatting salary:", err);
      return "Not specified";
    }
  };

  // Format posted date with error handling
  const formatPostedDate = (date) => {
    try {
      if (!date) return "Recently";
      const now = new Date();
      const posted = new Date(date);

      if (isNaN(posted.getTime())) return "Recently";

      const diffTime = Math.abs(now.getTime() - posted.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return `${Math.ceil(diffDays / 30)} months ago`;
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Recently";
    }
  };

  // Safe URL opening with error handling
  const openJobUrl = (job) => {
    try {
      if (job?.url) {
        window.open(job.url, "_blank");
      } else {
        alert("No URL available for this job");
      }
    } catch (err) {
      console.error("Error opening job URL:", err);
      alert("Failed to open job URL");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Search</h1>
          <p className="text-gray-600">Find and track new opportunities</p>
          {sources.total > 0 && (
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>
                Sources: {sources.manual} manual, {sources.api} from APIs
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadJobsByUserPreferences}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 text-red-600 hover:text-red-800"
              onClick={() => setError(null)}
            >
              ×
            </Button>
          </div>
        )}

        {/* Search Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search Jobs</CardTitle>
            <CardDescription>
              Search for new opportunities or update your preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Keywords / Skills</Label>
                <Input
                  placeholder="React, Frontend, JavaScript"
                  value={searchPreferences.query}
                  onChange={(e) =>
                    setSearchPreferences((prev) => ({
                      ...prev,
                      query: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="San Francisco, Remote"
                  value={searchPreferences.location}
                  onChange={(e) =>
                    setSearchPreferences((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={searchPreferences.jobType}
                  onValueChange={(value) =>
                    setSearchPreferences((prev) => ({
                      ...prev,
                      jobType: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Mode</Label>
                <Select
                  value={searchPreferences.workMode}
                  onValueChange={(value) =>
                    setSearchPreferences((prev) => ({
                      ...prev,
                      workMode: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="On-site">On-site</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Min Salary (₹k)</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={searchPreferences.minSalary}
                  onChange={(e) =>
                    setSearchPreferences((prev) => ({
                      ...prev,
                      minSalary: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Salary (₹k)</Label>
                <Input
                  type="number"
                  placeholder="150"
                  value={searchPreferences.maxSalary}
                  onChange={(e) =>
                    setSearchPreferences((prev) => ({
                      ...prev,
                      maxSalary: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button onClick={searchJobs} disabled={searchLoading}>
                {searchLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Search Jobs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Job Results</CardTitle>
                <CardDescription>
                  {sources.total > 0
                    ? `${sources.total} jobs found`
                    : "Jobs based on your profile and preferences"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading jobs...
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No jobs found. Try adjusting your search criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <Card key={job._id || index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {job?.title || "Untitled Job"}
                          </h3>
                          {job?.workMode === "Remote" && (
                            <Badge variant="secondary">Remote</Badge>
                          )}
                          <Badge variant="outline">
                            {job?.jobType || "Unknown"}
                          </Badge>
                          {job?.source && (
                            <Badge variant="secondary" className="text-xs">
                              {job.source}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 font-medium">
                          {job?.company?.name ||
                            job?.company ||
                            "Unknown Company"}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job?.company?.location ||
                              job?.location ||
                              "Not specified"}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {formatSalary(job)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatPostedDate(
                              job?.postedDate || job?.createdAt
                            )}
                          </div>
                        </div>
                        {job?.tags &&
                          Array.isArray(job.tags) &&
                          job.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {job.tags.slice(0, 3).map((tag, tagIndex) => (
                                <Badge
                                  key={tagIndex}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => bookmarkJob(job._id)}
                        >
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={() => openJobUrl(job)}>
                          {job?.url ? "Apply" : "View"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Job Manually</CardTitle>
            <CardDescription>
              Manually add job opportunities you want to track
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Senior Frontend Developer"
                  value={manualJob.title}
                  onChange={(e) =>
                    setManualJob((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  placeholder="e.g., TechCorp Inc."
                  value={manualJob.company.name}
                  onChange={(e) =>
                    setManualJob((prev) => ({
                      ...prev,
                      company: { ...prev.company, name: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={manualJob.company.location}
                  onChange={(e) =>
                    setManualJob((prev) => ({
                      ...prev,
                      company: { ...prev.company, location: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryRange">Salary Range (₹k)</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={manualJob.salary.min}
                    onChange={(e) =>
                      setManualJob((prev) => ({
                        ...prev,
                        salary: { ...prev.salary, min: e.target.value },
                      }))
                    }
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={manualJob.salary.max}
                    onChange={(e) =>
                      setManualJob((prev) => ({
                        ...prev,
                        salary: { ...prev.salary, max: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={manualJob.jobType}
                  onValueChange={(value) =>
                    setManualJob((prev) => ({ ...prev, jobType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Mode</Label>
                <Select
                  value={manualJob.workMode}
                  onValueChange={(value) =>
                    setManualJob((prev) => ({ ...prev, workMode: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On-site">On-site</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobUrl">Job Posting URL</Label>
              <Input
                id="jobUrl"
                placeholder="https://..."
                value={manualJob.url}
                onChange={(e) =>
                  setManualJob((prev) => ({ ...prev, url: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Description / Notes</Label>
              <Textarea
                id="notes"
                placeholder="Job description or additional notes..."
                rows={3}
                value={manualJob.description}
                onChange={(e) =>
                  setManualJob((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <Button onClick={createManualJob}>
              <Plus className="w-4 h-4 mr-2" />
              Add Job
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default JobSearch;
