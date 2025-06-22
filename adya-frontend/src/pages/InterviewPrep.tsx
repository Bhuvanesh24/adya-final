import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Target, MessageSquare, Brain, Users, Play, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import axios from "@/utils/axiosConfig";

const InterviewPrep = () => {
  // Form state
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    experienceLevel: "1-2years"
  });

  // API state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interviewData, setInterviewData] = useState(null);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generate interview questions
  const handleGenerateQuestions = async () => {
    if (!formData.jobTitle.trim() || !formData.companyName.trim()) {
      setError("Please fill in both Job Title and Company Name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/ai/generate-interview-questions', {
        companyName: formData.companyName,
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription,
        experienceLevel: formData.experienceLevel
      });

      if (response.data.success) {
        setInterviewData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to generate interview questions');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to generate questions. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Parse technical questions from the generated content
  const parseTechnicalQuestions = () => {
    if (!interviewData?.interviewQuestions) return [];
    
    const content = interviewData.interviewQuestions;
    const technicalSection = content.match(/#### \*\*TECHNICAL QUESTIONS\*\*(.*?)(?=#### \*\*BEHAVIORAL QUESTIONS\*\*|---)/s);
    
    if (technicalSection) {
      const questions = technicalSection[1].match(/\d+\.\s\*\*"([^"]+)"\*\*/g) || [];
      return questions.map((q, index) => ({
        question: q.replace(/\d+\.\s\*\*"([^"]+)"\*\*/, '$1'),
        difficulty: ["Medium", "Hard", "Easy", "Medium", "Hard"][index % 5],
        category: interviewData.preparationFocus?.technicalAreas?.[index % (interviewData.preparationFocus?.technicalAreas?.length || 1)] || "General"
      }));
    }
    
    return [];
  };

  // Parse behavioral questions from the generated content
  const parseBehavioralQuestions = () => {
    if (!interviewData?.interviewQuestions) return [];
    
    const content = interviewData.interviewQuestions;
    const behavioralSection = content.match(/#### \*\*BEHAVIORAL QUESTIONS\*\*(.*?)(?=#### \*\*COMPANY\/ROLE FIT QUESTIONS\*\*|---)/s);
    
    if (behavioralSection) {
      const questions = behavioralSection[1].match(/\d+\.\s\*\*"([^"]+)"\*\*/g) || [];
      return questions.map(q => ({
        question: q.replace(/\d+\.\s\*\*"([^"]+)"\*\*/, '$1'),
        framework: "STAR Method"
      }));
    }
    
    return [];
  };

  // Parse HR/Company fit questions from the generated content
  const parseHRQuestions = () => {
    if (!interviewData?.interviewQuestions) return [];
    
    const content = interviewData.interviewQuestions;
    const hrSection = content.match(/#### \*\*COMPANY\/ROLE FIT QUESTIONS\*\*(.*?)$/s);
    
    if (hrSection) {
      const questions = hrSection[1].match(/\d+\.\s\*\*"([^"]+)"\*\*/g) || [];
      return questions.map((q, index) => ({
        question: q.replace(/\d+\.\s\*\*"([^"]+)"\*\*/, '$1'),
        category: ["Company Fit", "Career Growth", "Role Alignment", "Learning"][index % 4]
      }));
    }
    
    return [];
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const technicalQuestions = parseTechnicalQuestions();
  const behavioralQuestions = parseBehavioralQuestions();
  const hrQuestions = parseHRQuestions();

  return (
    <Layout>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Interview Preparation</h1>
        <p className="text-gray-600">AI-powered interview practice and preparation</p>
      </div>

      {/* Setup Section */}
      <Card>
        <CardHeader>
          <CardTitle>Customize Your Prep Session</CardTitle>
          <CardDescription>Tell us about the role you're preparing for</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              placeholder="Job Title (e.g., Senior Frontend Developer)" 
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            />
            <Input 
              placeholder="Company Name" 
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
            />
          </div>
          <Textarea 
            placeholder="Job Description (optional - helps generate more targeted questions)"
            value={formData.jobDescription}
            onChange={(e) => handleInputChange('jobDescription', e.target.value)}
            rows={3}
          />
          <Select 
            value={formData.experienceLevel} 
            onValueChange={(value) => handleInputChange('experienceLevel', value)}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Experience Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level (0-1 years)</SelectItem>
              <SelectItem value="1-2years">Junior (1-2 years)</SelectItem>
              <SelectItem value="3-5years">Mid-level (3-5 years)</SelectItem>
              <SelectItem value="5+years">Senior (5+ years)</SelectItem>
            </SelectContent>
          </Select>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {interviewData && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Interview questions generated successfully for {formData.jobTitle} at {formData.companyName}!
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleGenerateQuestions} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Target className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Generating...' : 'Generate Questions'}
          </Button>
        </CardContent>
      </Card>

      {/* Preparation Tips */}
      {interviewData && (
        <Card>
          <CardHeader>
            <CardTitle>Preparation Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Focus Areas:</h4>
                <div className="flex flex-wrap gap-2">
                  {interviewData.preparationFocus?.technicalAreas?.map((area, index) => (
                    <Badge key={index} variant="secondary">{area}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">General Tips:</h4>
                <ul className="text-sm space-y-1">
                  {interviewData.preparationTips?.slice(0, 3).map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Categories - Only show if we have generated questions */}
      {interviewData && (
        <Tabs defaultValue="technical" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="technical" className="flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              Technical ({technicalQuestions.length})
            </TabsTrigger>
            <TabsTrigger value="behavioral" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Behavioral ({behavioralQuestions.length})
            </TabsTrigger>
            <TabsTrigger value="hr" className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              HR Questions ({hrQuestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="technical" className="space-y-4">
            {technicalQuestions.length > 0 ? (
              <div className="grid gap-4">
                {technicalQuestions.map((q, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-lg">{q.question}</h3>
                        <div className="flex space-x-2 ml-4">
                          <Badge className={getDifficultyColor(q.difficulty)}>
                            {q.difficulty}
                          </Badge>
                          <Badge variant="outline">{q.category}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No technical questions generated. Try generating questions first.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="behavioral" className="space-y-4">
            {behavioralQuestions.length > 0 ? (
              <div className="grid gap-4">
                {behavioralQuestions.map((q, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-lg">{q.question}</h3>
                        <Badge variant="outline">{q.framework}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No behavioral questions generated. Try generating questions first.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="hr" className="space-y-4">
            {hrQuestions.length > 0 ? (
              <div className="grid gap-4">
                {hrQuestions.map((q, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-lg">{q.question}</h3>
                        <Badge variant="outline">{q.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No HR questions generated. Try generating questions first.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Show message when no questions are generated yet */}
      {!interviewData && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Start?</h3>
            <p className="text-gray-600">
              Fill in your job details above and click "Generate Questions" to get personalized interview questions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>

    </Layout>
  );
};

export default InterviewPrep;