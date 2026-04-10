import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  Search, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Moon, 
  Sun, 
  X,
  FileUp,
  Download,
  Filter,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Candidate {
  name: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
  highlightedKeywords: string[];
}

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [jobRequirements, setJobRequirements] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0 || !jobRequirements.trim()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("jobRequirements", jobRequirements);
    files.forEach(file => formData.append("resumes", file));

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.candidates) {
        setResults(data.candidates);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.matchedSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-[#F5F5F5] font-sans transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Sparkles size={22} />
            </div>
            <h1 className="font-bold text-2xl tracking-tight hidden sm:block">ResuMatch <span className="text-primary">AI</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsDark(!isDark)}
              className="rounded-full"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            <Button variant="outline" className="hidden md:flex gap-2">
              <Users size={18} /> Recruitment Portal
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="px-4 py-1.5 mb-6 border-primary/20 bg-primary/5 text-primary text-sm font-medium">
              Next-Gen Recruitment
            </Badge>
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              AI Resume Screening System
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Upload multiple resumes and let our AI rank the best candidates for your specific job requirements in seconds.
            </p>
          </motion.div>
        </section>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="border-none shadow-2xl shadow-black/5 dark:shadow-white/5 bg-white dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
              <div className="h-1.5 bg-primary w-full" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="text-primary" size={20} /> Job Requirements
                </CardTitle>
                <CardDescription>Define the skills and experience you are looking for.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="requirements">Requirements & Keywords</Label>
                  <Textarea 
                    id="requirements"
                    placeholder="e.g., Senior React Developer with 5+ years experience, proficient in TypeScript, Node.js, and AWS..."
                    className="min-h-[180px] resize-none focus-visible:ring-primary bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700"
                    value={jobRequirements}
                    onChange={(e) => setJobRequirements(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Upload Resumes (PDF, DOCX, TXT)</Label>
                  <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center gap-4 cursor-pointer",
                      isDragging ? "border-primary bg-primary/5" : "border-zinc-200 dark:border-zinc-700 hover:border-primary/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    )}
                    onClick={() => document.getElementById("fileInput")?.click()}
                  >
                    <input 
                      type="file" 
                      id="fileInput" 
                      multiple 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files) {
                          setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                        }
                      }}
                    />
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <FileUp size={24} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">Click or drag to upload</p>
                      <p className="text-sm text-muted-foreground mt-1">Support for multiple files</p>
                    </div>
                  </div>
                </div>

                {files.length > 0 && (
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-2">
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-700 group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText size={18} className="text-primary shrink-0" />
                            <span className="text-sm font-medium truncate">{file.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(i);
                            }}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full h-12 text-lg font-bold gap-2 shadow-lg shadow-primary/20"
                  disabled={loading || files.length === 0 || !jobRequirements.trim()}
                  onClick={handleAnalyze}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  {loading ? "Analyzing Resumes..." : "Analyze Resumes"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="text-primary" size={24} /> 
                {results.length > 0 ? "Top Candidates" : "Analysis Results"}
              </h3>
              {results.length > 0 && (
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    placeholder="Search candidates..." 
                    className="pl-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-32 space-y-6 text-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                    <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold">Scanning Resumes</h4>
                    <p className="text-muted-foreground">Gemini AI is matching profiles with your requirements...</p>
                  </div>
                </motion.div>
              ) : results.length > 0 ? (
                <div className="grid gap-6">
                  {filteredResults.map((candidate, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 group bg-white dark:bg-zinc-900/50 overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="p-6 flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className="space-y-1">
                                <CardTitle className="text-2xl group-hover:text-primary transition-colors">{candidate.name}</CardTitle>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {candidate.highlightedKeywords.map((kw, i) => (
                                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] uppercase tracking-wider">
                                      {kw}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-black text-primary">{candidate.matchPercentage}%</div>
                                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Match Score</div>
                              </div>
                            </div>
                            
                            <Progress value={candidate.matchPercentage} className="h-2 mb-6" />

                            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                              <div className="space-y-3">
                                <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                  <CheckCircle2 size={14} className="text-green-500" /> Matched Skills
                                </h5>
                                <div className="flex flex-wrap gap-1.5">
                                  {candidate.matchedSkills.map((skill, i) => (
                                    <Badge key={i} variant="outline" className="text-[11px] border-zinc-200 dark:border-zinc-700">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-3">
                                <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                  <AlertCircle size={14} className="text-orange-500" /> Missing Skills
                                </h5>
                                <div className="flex flex-wrap gap-1.5">
                                  {candidate.missingSkills.map((skill, i) => (
                                    <Badge key={i} variant="outline" className="text-[11px] opacity-50 border-zinc-200 dark:border-zinc-700">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <Separator className="mb-6 opacity-50" />

                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-700">
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                                "{candidate.summary}"
                              </p>
                            </div>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800/30 p-6 md:w-48 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-700">
                            <Button className="w-full gap-2" variant="outline">
                              <FileText size={16} /> Preview
                            </Button>
                            <Button className="w-full gap-2" variant="secondary">
                              <Download size={16} /> Resume
                            </Button>
                            <Button className="w-full gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                              Contact <ArrowRight size={16} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-32 space-y-6 text-center border-2 border-dashed rounded-3xl border-zinc-200 dark:border-zinc-800"
                >
                  <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400">
                    <Search size={32} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold">No Results Yet</h4>
                    <p className="text-muted-foreground max-w-xs mx-auto">Upload resumes and enter job requirements to see the best matches.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-lg">ResuMatch AI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 ResuMatch AI. All rights reserved.</p>
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

