import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, FileText, Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "@/utils/axiosConfig";

const Profile = () => {
  // State for user data
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);
  
  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: ""
  });
  
  const [professionalInfo, setProfessionalInfo] = useState({
    jobTitle: "",
    yearsOfExperience: "",
    expectedSalary: "",
    workMode: ""
  });

  // Job preferences state
  const [jobPreferences, setJobPreferences] = useState({
    titles: [],
    locations: [],
    jobType: "",
    industries: [],
    expectedSalary: "",
    workMode: "",
    relocate: false
  });

  // Additional states for managing arrays
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [professionalSummary, setProfessionalSummary] = useState("");
  const [documents, setDocuments] = useState({ resumes: [], coverLetters: [] });

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/user/');
      const userData = response.data.user;
      
      setUser(userData);
      
      // Update personal info
      setPersonalInfo({
        name: userData.name || "",
        email: userData.email || ""
      });
      
      // Update professional info - get from experience array if available
      const latestExperience = userData.experience && userData.experience.length > 0 
        ? userData.experience[userData.experience.length - 1] 
        : {};
      
      setProfessionalInfo({
        jobTitle: latestExperience.jobTitle || "",
        yearsOfExperience: latestExperience.yearsOfExperience?.toString() || "",
        expectedSalary: userData.jobPreferences?.expectedSalary || "",
        workMode: userData.jobPreferences?.workMode || ""
      });

      // Update job preferences
      setJobPreferences({
        titles: userData.jobPreferences?.titles || [],
        locations: userData.jobPreferences?.locations || [],
        jobType: userData.jobPreferences?.jobType || "",
        industries: userData.jobPreferences?.industries || [],
        expectedSalary: userData.jobPreferences?.expectedSalary || "",
        workMode: userData.jobPreferences?.workMode || "",
        relocate: userData.jobPreferences?.relocate || false
      });
      
      // Update skills
      setSkills(userData.skills || []);
      
      // Update professional summary
      setProfessionalSummary(userData.professionalSummary || "");
      
      // Update documents
      setDocuments({
        resumes: userData.resumes || [],
        coverLetters: userData.coverLetters || []
      });
      
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user documents - if you have a separate endpoint
  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/user/documents');
      setDocuments({
        resumes: response.data.resumes || [],
        coverLetters: response.data.coverLetters || []
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Don't reset documents on error, keep what we have from user profile
    }
  };

  useEffect(() => {
    fetchUserProfile();
    // Only fetch documents if you have a separate endpoint
    // fetchDocuments();
  }, []);

  // Update personal information
  const updatePersonalInfo = async () => {
    try {
      setSaving(true);
      await axios.post('/user/personal-info', personalInfo);
      console.log('Personal info updated successfully');
    } catch (error) {
      console.error('Error updating personal info:', error);
    } finally {
      setSaving(false);
    }
  };

  // Update professional summary
  const updateProfessionalSummary = async () => {
    try {
      await axios.post('/user/professional-summary', { professionalSummary });
      console.log('Professional summary updated successfully');
    } catch (error) {
      console.error('Error updating professional summary:', error);
    }
  };

  // Update job preferences
  const updateJobPreferences = async () => {
    try {
      await axios.post('/user/job-preferences', { jobPreferences });
      console.log('Job preferences updated successfully');
    } catch (error) {
      console.error('Error updating job preferences:', error);
    }
  };

  // Update experience
  const updateExperience = async () => {
    try {
      const experienceData = {
        jobTitle: professionalInfo.jobTitle,
        yearsOfExperience: parseInt(professionalInfo.yearsOfExperience) || 0
      };
      
      await axios.post('/user/experience', experienceData);
      console.log('Experience updated successfully');
    } catch (error) {
      console.error('Error updating experience:', error);
    }
  };

  // Job preference management functions
  const addJobTitle = () => {
    if (newJobTitle.trim() && !jobPreferences.titles.includes(newJobTitle.trim())) {
      setJobPreferences({
        ...jobPreferences,
        titles: [...jobPreferences.titles, newJobTitle.trim()]
      });
      setNewJobTitle("");
    }
  };

  const removeJobTitle = (titleToRemove) => {
    setJobPreferences({
      ...jobPreferences,
      titles: jobPreferences.titles.filter(title => title !== titleToRemove)
    });
  };

  const addLocation = () => {
    if (newLocation.trim() && !jobPreferences.locations.includes(newLocation.trim())) {
      setJobPreferences({
        ...jobPreferences,
        locations: [...jobPreferences.locations, newLocation.trim()]
      });
      setNewLocation("");
    }
  };

  const removeLocation = (locationToRemove) => {
    setJobPreferences({
      ...jobPreferences,
      locations: jobPreferences.locations.filter(location => location !== locationToRemove)
    });
  };

  const addIndustry = () => {
    if (newIndustry.trim() && !jobPreferences.industries.includes(newIndustry.trim())) {
      setJobPreferences({
        ...jobPreferences,
        industries: [...jobPreferences.industries, newIndustry.trim()]
      });
      setNewIndustry("");
    }
  };

  const removeIndustry = (industryToRemove) => {
    setJobPreferences({
      ...jobPreferences,
      industries: jobPreferences.industries.filter(industry => industry !== industryToRemove)
    });
  };

  // Add skill
  const addSkill = async () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      try {
        const response = await axios.post('/user/skills/add', { skill: newSkill.trim() });
        setSkills(response.data.skills);
        setNewSkill("");
      } catch (error) {
        console.error('Error adding skill:', error);
      }
    }
  };

  // Remove skill
  const removeSkill = async (skillToRemove) => {
    try {
      const response = await axios.post('/user/skills/remove', { skill: skillToRemove });
      setSkills(response.data.skills);
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file, type) => {
    const formData = new FormData();
    formData.append(type === 'resume' ? 'resume' : 'coverLetter', file);
    
    try {
      if (type === 'resume') {
        setUploadingResume(true);
      } else {
        setUploadingCoverLetter(true);
      }
      
      await axios.post(`/user/upload/${type === 'resume' ? 'resume' : 'cover-letter'}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh user data to get updated documents
      fetchUserProfile();
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
    } finally {
      if (type === 'resume') {
        setUploadingResume(false);
      } else {
        setUploadingCoverLetter(false);
      }
    }
  };

  // Download file
  const downloadFile = async (filePath, fileName) => {
    try {
      const response = await axios.post('/user/download/', { filePath }, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // Delete file
  const deleteFile = async (filePath, type) => {
    try {
      await axios.delete(`/user/${type}`, {
        data: { filePath }
      });
      // Refresh user data to get updated documents
      fetchUserProfile();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  // Save all changes
  const saveAllChanges = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updatePersonalInfo(),
        updateProfessionalSummary(),
        updateJobPreferences(),
        updateExperience()
      ]);
      alert('All changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Your basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Your career details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Current Job Title</Label>
                <Input 
                  id="jobTitle" 
                  value={professionalInfo.jobTitle}
                  onChange={(e) => setProfessionalInfo({...professionalInfo, jobTitle: e.target.value})}
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Select 
                  value={professionalInfo.yearsOfExperience}
                  onValueChange={(value) => setProfessionalInfo({...professionalInfo, yearsOfExperience: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 years</SelectItem>
                    <SelectItem value="1">1 year</SelectItem>
                    <SelectItem value="2">2 years</SelectItem>
                    <SelectItem value="3">3 years</SelectItem>
                    <SelectItem value="4">4 years</SelectItem>
                    <SelectItem value="5">5 years</SelectItem>
                    <SelectItem value="6">6 years</SelectItem>
                    <SelectItem value="7">7 years</SelectItem>
                    <SelectItem value="8">8 years</SelectItem>
                    <SelectItem value="9">9 years</SelectItem>
                    <SelectItem value="10">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle>Job Preferences</CardTitle>
            <CardDescription>Define your job search preferences and requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preferred Job Titles */}
            <div className="space-y-3">
              <Label>Preferred Job Titles</Label>
              <div className="flex flex-wrap gap-2">
                {jobPreferences.titles.map((title) => (
                  <Badge key={title} variant="secondary" className="flex items-center gap-1">
                    {title}
                    <button onClick={() => removeJobTitle(title)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a job title"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addJobTitle)}
                />
                <Button onClick={addJobTitle}>Add</Button>
              </div>
            </div>

            {/* Preferred Locations */}
            <div className="space-y-3">
              <Label>Preferred Locations</Label>
              <div className="flex flex-wrap gap-2">
                {jobPreferences.locations.map((location) => (
                  <Badge key={location} variant="secondary" className="flex items-center gap-1">
                    {location}
                    <button onClick={() => removeLocation(location)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addLocation)}
                />
                <Button onClick={addLocation}>Add</Button>
              </div>
            </div>

            {/* Industries */}
            <div className="space-y-3">
              <Label>Preferred Industries</Label>
              <div className="flex flex-wrap gap-2">
                {jobPreferences.industries.map((industry) => (
                  <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                    {industry}
                    <button onClick={() => removeIndustry(industry)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an industry"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addIndustry)}
                />
                <Button onClick={addIndustry}>Add</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Job Type */}
              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type</Label>
                <Select 
                  value={jobPreferences.jobType}
                  onValueChange={(value) => setJobPreferences({...jobPreferences, jobType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Salary Range */}
              <div className="space-y-2">
                <Label htmlFor="salaryRange">Desired Salary Range</Label>
                <Select 
                  value={jobPreferences.expectedSalary}
                  onValueChange={(value) => setJobPreferences({...jobPreferences, expectedSalary: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select salary range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30-50k">$30k - $50k</SelectItem>
                    <SelectItem value="50-70k">$50k - $70k</SelectItem>
                    <SelectItem value="70-90k">$70k - $90k</SelectItem>
                    <SelectItem value="90-120k">$90k - $120k</SelectItem>
                    <SelectItem value="120-150k">$120k - $150k</SelectItem>
                    <SelectItem value="150k+">$150k+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Work Mode */}
              <div className="space-y-2">
                <Label htmlFor="workType">Work Mode Preference</Label>
                <Select 
                  value={jobPreferences.workMode}
                  onValueChange={(value) => setJobPreferences({...jobPreferences, workMode: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Relocation Willingness */}
            <div className="space-y-2">
              <Label>Relocation Willingness</Label>
              <Select 
                value={jobPreferences.relocate ? "yes" : "no"}
                onValueChange={(value) => setJobPreferences({...jobPreferences, relocate: value === "yes"})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relocation preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes, willing to relocate</SelectItem>
                  <SelectItem value="no">No, prefer current location</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Add your technical and professional skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addSkill)}
              />
              <Button onClick={addSkill}>Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Professional Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
            <CardDescription>Brief overview of your experience and goals</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write a brief professional summary..."
              value={professionalSummary}
              onChange={(e) => setProfessionalSummary(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Document Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumes</CardTitle>
              <CardDescription>Upload and manage your resume versions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    disabled={uploadingResume}
                    onClick={() => document.getElementById('resume-upload').click()}
                  >
                    {uploadingResume ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Resume'
                    )}
                  </Button>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleFileUpload(e.target.files[0], 'resume');
                      }
                    }}
                  />
                  <p className="mt-2 text-sm text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {documents.resumes.map((resume, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">
                          {typeof resume === 'string' ? resume.split('/').pop() : resume.fileName || 'Resume'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {resume.uploadedAt ? new Date(resume.uploadedAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => downloadFile(
                          typeof resume === 'string' ? resume : resume.filePath, 
                          typeof resume === 'string' ? resume.split('/').pop() : resume.fileName
                        )}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteFile(
                          typeof resume === 'string' ? resume : resume.filePath, 
                          'resume'
                        )}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover Letters</CardTitle>
              <CardDescription>Manage your cover letter templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Button 
                    variant="outline"
                    disabled={uploadingCoverLetter}
                    onClick={() => document.getElementById('cover-letter-upload').click()}
                  >
                    {uploadingCoverLetter ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Cover Letter'
                    )}
                  </Button>
                  <input
                    id="cover-letter-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleFileUpload(e.target.files[0], 'cover-letter');
                      }
                    }}
                  />
                  <p className="mt-2 text-sm text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {documents.coverLetters.map((coverLetter, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">
                          {typeof coverLetter === 'string' ? coverLetter.split('/').pop() : coverLetter.fileName || 'Cover Letter'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {coverLetter.uploadedAt ? new Date(coverLetter.uploadedAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => downloadFile(
                          typeof coverLetter === 'string' ? coverLetter : coverLetter.filePath, 
                          typeof coverLetter === 'string' ? coverLetter.split('/').pop() : coverLetter.fileName
                        )}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteFile(
                          typeof coverLetter === 'string' ? coverLetter : coverLetter.filePath, 
                          'cover-letter'
                        )}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg" onClick={saveAllChanges} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;