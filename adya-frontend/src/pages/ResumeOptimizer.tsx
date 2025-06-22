import { useState } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  FileText, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Target,
  Lightbulb,
  X,
  Loader2
} from "lucide-react";
import axios from "@/utils/axiosConfig.js";

const ResumeOptimizer = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setError("Please upload a PDF file only.");
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB.");
        return;
      }
      
      setResumeFile(file);
      setError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      setError("");
    } else {
      setError("Please drop a PDF file only.");
    }
  };

  const analyzeResume = async () => {
    if (!resumeFile) {
      setError("Please upload a resume file first.");
      return;
    }
    
    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jobDescription);

      const response = await axios.post('/ai/analyze-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for AI analysis
      });

      setAnalysisResult(response.data.data);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const removeFile = () => {
    setResumeFile(null);
    setError("");
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setResumeFile(null);
    setJobDescription("");
    setError("");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resume Optimizer</h1>
            <p className="text-gray-600">
              AI-powered resume optimization for better job matches
            </p>
          </div>
          {analysisResult && (
            <Button variant="outline" onClick={resetAnalysis}>
              <X className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {!analysisResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Resume */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Upload Resume
                </CardTitle>
                <CardDescription>
                  Upload your current resume (PDF only, max 5MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('resume-upload').click()}
                >
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {resumeFile ? (
                    <div className="space-y-2">
                      <FileText className="mx-auto h-12 w-12 text-green-500" />
                      <p className="font-medium text-green-700">{resumeFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Button variant="outline">Upload PDF</Button>
                        <p className="mt-2 text-sm text-gray-500">or drag and drop</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Job Description
                </CardTitle>
                <CardDescription>
                  Paste the job description you're targeting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste the job description here..."
                  rows={12}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="resize-none"
                />
                <Button 
                  className="w-full" 
                  onClick={analyzeResume}
                  disabled={isAnalyzing || !resumeFile || !jobDescription.trim()}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Analyze & Optimize
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg ${getScoreBgColor(analysisResult.summary.overallScore)}`}>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(analysisResult.summary.overallScore)}`}>
                        {analysisResult.summary.overallScore}
                      </div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisResult.summary.matchLevel}
                      </div>
                      <div className="text-sm text-gray-600">Match Level</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisResult.summary.skillMatchPercentage}%
                      </div>
                      <div className="text-sm text-gray-600">Skill Match</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analysisResult.skillAnalysis.totalKeywordsFound}
                      </div>
                      <div className="text-sm text-gray-600">Keywords Found</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 font-medium">{analysisResult.summary.keyMessage}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skills Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Skills Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisResult.skillAnalysis.matchedKeywords.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">Matched Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.skillAnalysis.matchedKeywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {analysisResult.skillAnalysis.missingKeywords.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.skillAnalysis.missingKeywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisResult.recommendations.map((rec, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-medium text-gray-800 flex items-center">
                        {rec.category}
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          rec.priority === 'High' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {rec.priority}
                        </span>
                      </h4>
                      {rec.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="p-2 bg-gray-50 rounded text-sm">
                          • {item}
                        </div>
                      ))}
                    </div>
                  ))}
                  
                  {analysisResult.improvementAreas.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-orange-700">Improvement Areas</h4>
                      {analysisResult.improvementAreas.map((area, index) => (
                        <div key={index} className="p-2 bg-orange-50 rounded text-sm text-orange-700">
                          • {area}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            {analysisResult.rawAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-auto">
                      {analysisResult.rawAnalysis}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ResumeOptimizer;