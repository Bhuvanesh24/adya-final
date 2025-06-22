import React, { useState } from 'react';
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, RefreshCw, Loader2 } from 'lucide-react';

const CoverLetter = () => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    userName: '',
    userSkills: '',
    userExperience: '',
    tone: ''
  });
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCoverLetter = async () => {
    if (!formData.jobTitle || !formData.companyName || !formData.jobDescription) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const coverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${formData.jobTitle} position at ${formData.companyName}. ${formData.userName ? `As ${formData.userName}, I` : 'I'} am excited about the opportunity to contribute to your team and help drive your company's success.

${formData.userExperience ? `With my background in ${formData.userExperience}, I` : 'I'} believe I am well-positioned to excel in this role. The job description you've provided aligns perfectly with my career goals and expertise.

${formData.userSkills ? `My technical skills include ${formData.userSkills}, which I believe will be valuable assets to your team. ` : ''}I am particularly drawn to this opportunity because it allows me to leverage my experience while continuing to grow professionally.

I would welcome the opportunity to discuss how my background and enthusiasm can contribute to ${formData.companyName}'s continued success. Thank you for considering my application.

${formData.tone === 'enthusiastic' ? 'I look forward to hearing from you soon and am excited about the possibility of joining your team!' : formData.tone === 'formal' ? 'I look forward to your response and the opportunity to discuss this position further.' : 'Thank you for your time and consideration. I look forward to hearing from you.'}

Sincerely,
${formData.userName || '[Your Name]'}`;

      setGeneratedLetter(coverLetter);
      setIsLoading(false);
    }, 2000);
  };

  const regenerateLetter = () => {
    if (generatedLetter) {
      generateCoverLetter();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cover Letter Generator</h1>
          <p className="text-gray-600">Create personalized cover letters with AI assistance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Provide information about the position</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Your Name *</Label>
              <Input 
                id="userName" 
                placeholder="e.g., John Doe"
                value={formData.userName}
                onChange={(e) => handleInputChange('userName', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input 
                id="jobTitle" 
                placeholder="e.g., Senior Frontend Developer"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input 
                id="company" 
                placeholder="e.g., TechCorp Inc."
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description *</Label>
              <Textarea 
                id="jobDescription" 
                placeholder="Paste the job description here..."
                rows={4}
                value={formData.jobDescription}
                onChange={(e) => handleInputChange('jobDescription', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userSkills">Your Skills</Label>
              <Textarea 
                id="userSkills" 
                placeholder="e.g., React, Node.js, Python, Machine Learning..."
                rows={2}
                value={formData.userSkills}
                onChange={(e) => handleInputChange('userSkills', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userExperience">Your Experience</Label>
              <Textarea 
                id="userExperience" 
                placeholder="e.g., 5 years React experience, led team of 4 developers..."
                rows={3}
                value={formData.userExperience}
                onChange={(e) => handleInputChange('userExperience', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tone">Writing Tone</Label>
              <Select onValueChange={(value) => handleInputChange('tone', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full" 
              onClick={generateCoverLetter}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Cover Letter */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Generated Cover Letter</CardTitle>
              <CardDescription>AI-generated cover letter based on your inputs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                className="min-h-96 font-mono text-sm"
                value={generatedLetter || "Your generated cover letter will appear here..."}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                placeholder="Fill out the form and click 'Generate Cover Letter' to create your personalized cover letter."
              />
              {generatedLetter && (
                <div className="flex justify-start">
                  <Button 
                    variant="outline" 
                    onClick={regenerateLetter}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoverLetter;