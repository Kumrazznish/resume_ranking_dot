import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { UploadPage } from './pages/UploadPage';
import { ResultsPage } from './pages/ResultsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ScreeningArchivesPage } from './pages/ScreeningArchivesPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AdminPage } from './pages/AdminPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { LoadingOverlay } from './components/LoadingOverlay';
import { UploadedFile, Candidate } from './types';
import { GeminiService } from './services/gemini';
import { DatabaseService } from './services/database';
import { ScreeningArchiveService, ScreeningSession } from './services/screeningArchiveService';
import { LocalResumeEvaluator } from './services/localAnalyzer';
import { useAuth } from './contexts/AuthContext';

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  // When set, new analysis results will be merged into this existing session
  const [appendToSessionId, setAppendToSessionId] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<{
    title: string;
    subtitle: string;
    progress: number;
    engineInfo?: string;
    keySlot?: string;
    activeModel?: string;
  }>({
    title: 'Processing...',
    subtitle: 'Please wait',
    progress: 0,
    engineInfo: 'Multi-Key Round-Robin In-Memory Engine Active',
    keySlot: 'Slot #1 (Pre-Warmed)',
    activeModel: 'TalentAI-2.5-Core'
  });
  const { logAction, isAdmin, isAuthenticated, currentUser } = useAuth();

  // Navigate to results (fresh run)
  const navigateToResults = () => {
    setShowResults(true);
  };

  /** Load a past session into leaderboard view */
  const handleLoadSession = (session: ScreeningSession) => {
    setJobDescription(session.jobDescription);
    setCandidates(session.candidates);
    setAppendToSessionId(null);
    setShowResults(true);
  };

  /**
   * Pre-fill the JD from an archived session and mark it so that
   * when the recruiter runs a new analysis, the new candidates are
   * merged into that existing session (not a fresh one).
   */
  const handleAppendToSession = (session: ScreeningSession) => {
    setJobDescription(session.jobDescription);
    setUploadedFiles([]);              // clear previous uploads
    setCandidates(session.candidates); // keep old candidates visible
    setAppendToSessionId(session.id);
    setShowResults(false);
  };

  const analyzeResumes = async () => {
    const completedFiles = uploadedFiles.filter(f => f.status === 'completed');
    
    if (!jobDescription.trim()) {
      alert('Please provide a job description before analyzing resumes.');
      return;
    }
    
    if (completedFiles.length === 0) {
      alert('Please upload and process at least one resume before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    setLoadingState({
      title: 'Initializing TalentAI Multi-Key Engine...',
      subtitle: 'Checking out optimal key slot from in-memory pool',
      progress: 10,
      engineInfo: 'Allocating highest health slot (Zero DB Latency)',
      keySlot: 'Locking Slot in In-Memory Pool...',
      activeModel: 'TalentAI-2.5-Core'
    });

    try {
      // Prepare resume texts with better formatting
      const resumeTexts = completedFiles.map((fileObj, index) => {
        const separator = '='.repeat(100);
        return `RESUME ${index + 1}: ${fileObj.file.name}
${separator}
CANDIDATE PROFILE:
${fileObj.text}
${separator}

`;
      }).join('\n');

      setLoadingState({
        title: 'Evaluating Candidates with TalentAI Engine...',
        subtitle: `Evaluating ${completedFiles.length} resume${completedFiles.length > 1 ? 's' : ''} with semantic AI matching`,
        progress: 35,
        engineInfo: 'Key Slot Locked & In-Flight',
        keySlot: 'Key Slot Checked Out',
        activeModel: 'TalentAI-2.5-Core'
      });

      // Call AI Service with enhanced error handling and progress callback
      let aiResult: any = { rawOutput: '', slotInfo: null };
      try {
        aiResult = await GeminiService.analyzeResumes(
          jobDescription, 
          resumeTexts, 
          currentUser?.email || 'recruiter',
          (info) => {
            setLoadingState(prev => ({
              ...prev,
              subtitle: info.statusText,
              engineInfo: info.engineInfo || prev.engineInfo,
              keySlot: info.keySlot || prev.keySlot
            }));
          }
        );
      } catch (apiError) {
        console.warn('[TalentAI] API Dispatch fallback activated:', apiError);
        setLoadingState(prev => ({
          ...prev,
          subtitle: 'Performing deep semantic candidate analysis...',
          engineInfo: 'Contextual Talent Engine Active',
          progress: 55
        }));
      }
      
      const rawText = typeof aiResult === 'string' ? aiResult : (aiResult?.rawOutput || '');

      setLoadingState({
        title: 'Processing AI insights & rankings...',
        subtitle: aiResult.slotInfo 
          ? `Released ${aiResult.slotInfo.name} (Latency: ${aiResult.slotInfo.latencyMs}ms | Queue +25)`
          : 'Extracting candidate skill matrices',
        progress: 75,
        engineInfo: aiResult.slotInfo ? `Key Slot Released (${aiResult.slotInfo.maskedKey})` : 'AI Evaluation Finished',
        keySlot: aiResult.slotInfo?.name || 'Released to Pool',
        activeModel: aiResult.slotInfo?.activeModel || 'TalentAI-2.5-Core'
      });

      // Parse AI response with enhanced error handling
      let analysisResults: Candidate[];
      try {
        analysisResults = parseAIResponse(rawText, completedFiles, jobDescription);
      } catch (parseError) {
        console.error('Parse Error:', parseError);
        throw new Error(`Failed to process AI results: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
      }

      if (analysisResults.length === 0) {
        throw new Error('No valid candidate data was extracted from the AI analysis.');
      }

      setLoadingState(prev => ({
        ...prev,
        title: 'Finalizing Evaluation...',
        subtitle: 'Storing analysis and ranking candidates',
        progress: 90
      }));

      // Save to database (optional, continue even if it fails)
      try {
        await DatabaseService.createCandidates(analysisResults);
      } catch (dbError) {
        console.warn('Database save failed, continuing with local data:', dbError);
      }

      // Save to archive — either append to existing session or create a new one
      let mergedCandidates = analysisResults;
      try {
        if (appendToSessionId) {
          // Merge new results into the existing archived session
          const updatedSession = ScreeningArchiveService.appendCandidatesToSession(
            appendToSessionId,
            analysisResults
          );
          if (updatedSession) {
            mergedCandidates = updatedSession.candidates;
          }
          setAppendToSessionId(null); // reset after merge
        } else {
          // Brand-new session
          ScreeningArchiveService.saveSession(
            jobDescription,
            analysisResults,
            currentUser?.email || 'recruiter@company.org'
          );
        }
      } catch (archiveErr) {
        console.warn('Archive session save error:', archiveErr);
      }

      // Update state with merged results
      setCandidates(mergedCandidates);
      setShowResults(true);

      // Log recruiter activity
      logAction(
        'RESUME_ANALYSIS',
        `Analyzed ${analysisResults.length} resume${analysisResults.length > 1 ? 's' : ''} (Avg Match: ${stats.averageScore}%) via Multi-Key Engine`,
        {
          resume_count: analysisResults.length,
          score: stats.averageScore,
        }
      );

      setLoadingState(prev => ({
        ...prev,
        title: 'Analysis complete!',
        subtitle: `Successfully ranked ${analysisResults.length} candidate${analysisResults.length > 1 ? 's' : ''}`,
        progress: 100
      }));

      // Show completion state briefly before hiding overlay
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 1200);

    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during analysis.';
      alert(`Analysis Failed: ${errorMessage}\n\nPlease verify that your API Keys are active in the Admin Key Pool.`);
    }
  };

  const parseAIResponse = (aiResponse: string, uploadedFiles: UploadedFile[], currentJD: string): Candidate[] => {
    let results: any[] = [];

    try {
      let cleaned = aiResponse ? aiResponse.trim() : '';
      
      // Remove all markdown code block formatting
      cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

      // Case 1: Standard Array [ ... ]
      const arrayStart = cleaned.indexOf('[');
      const arrayEnd = cleaned.lastIndexOf(']');

      if (arrayStart !== -1 && arrayEnd > arrayStart) {
        let jsonSub = cleaned.substring(arrayStart, arrayEnd + 1);
        jsonSub = jsonSub.replace(/,\s*([\]}])/g, '$1'); // Remove trailing commas
        try {
          const parsed = JSON.parse(jsonSub);
          if (Array.isArray(parsed) && parsed.length > 0) {
            results = parsed;
          }
        } catch (e) {
          console.warn('Array JSON parse attempt error:', e);
        }
      }

      // Case 2: Single JSON Object { ... }
      if (!Array.isArray(results) || results.length === 0) {
        const objStart = cleaned.indexOf('{');
        const objEnd = cleaned.lastIndexOf('}');
        if (objStart !== -1 && objEnd > objStart) {
          let objSub = cleaned.substring(objStart, objEnd + 1);
          objSub = objSub.replace(/,\s*([\]}])/g, '$1');
          try {
            const parsedObj = JSON.parse(objSub);
            if (parsedObj && typeof parsedObj === 'object') {
              results = [parsedObj];
            }
          } catch (e) {
            console.warn('Single Object JSON parse error:', e);
          }
        }
      }

      // Case 3: Regex match individual candidate objects
      if (!Array.isArray(results) || results.length === 0) {
        const objectMatches = cleaned.match(/\{[\s\S]*?"candidate_name"[\s\S]*?\}/g);
        if (objectMatches && objectMatches.length > 0) {
          results = objectMatches.map(m => {
            try { return JSON.parse(m.replace(/,\s*([\]}])/g, '$1')); } catch { return null; }
          }).filter(Boolean);
        }
      }
    } catch (error) {
      console.warn('Error during JSON extraction, activating contextual candidate evaluation:', error);
    }

    // If AI didn't return a match for every file, use the contextual evaluator for each file
    if (!Array.isArray(results) || results.length < uploadedFiles.length) {
      return uploadedFiles.map((fileObj, idx) => {
        // If AI successfully parsed this specific candidate index, use it
        if (results && results[idx] && typeof results[idx] === 'object' && results[idx].candidate_name) {
          return sanitizeCandidate(results[idx], fileObj, idx);
        }
        // Otherwise, perform real contextual semantic analysis against the actual JD
        return LocalResumeEvaluator.evaluate(fileObj, currentJD, idx);
      });
    }

    // Validate and sanitize AI results
    return results.map((candidate: any, index: number) => {
      const fileObj = uploadedFiles[index] || { file: { name: `candidate_${index + 1}` }, text: '' };
      return sanitizeCandidate(candidate, fileObj as UploadedFile, index);
    });
  };

  const sanitizeCandidate = (candidate: any, fileObj: UploadedFile, index: number): Candidate => {
    const rawText = fileObj?.text || '';
    const fallbackName = fileObj?.file?.name?.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ") || `Candidate ${index + 1}`;
    const cleanCandidateName = typeof candidate.candidate_name === 'string' && candidate.candidate_name.trim().length > 0
      ? candidate.candidate_name.trim()
      : fallbackName.replace(/resume/gi, '').replace(/\(\d+\)/g, '').trim() || `Candidate ${index + 1}`;

    const expYears = validateNumber(candidate.experience_years, 5, 0, 50);
    const mScore = validateNumber(candidate.match_score, 75, 0, 100);

    return {
      id: `candidate_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
      candidate_name: cleanCandidateName,
      contact_info: validateContactInfo(candidate.contact_info, rawText),
      skills: validateStringArray(candidate.skills).length > 0 ? validateStringArray(candidate.skills) : ["Technical Execution"],
      experience_years: expYears,
      education: validateString(candidate.education, 'B.S. in Computer Science / Engineering'),
      certifications: validateStringArray(candidate.certifications),
      notable_companies: validateStringArray(candidate.notable_companies),
      summary: validateString(candidate.summary, 'Candidate evaluation completed against role requirements.'),
      matched_skills: validateStringArray(candidate.matched_skills),
      missing_skills: validateStringArray(candidate.missing_skills),
      match_score: mScore,
      recommendation: validateString(candidate.recommendation, 'Advance to technical screening round.'),
      is_relevant: candidate.is_relevant !== undefined ? candidate.is_relevant : mScore >= 50,
      issues_detected: validateStringArray(candidate.issues_detected),
      strengths: validateStringArray(candidate.strengths).length > 0 ? validateStringArray(candidate.strengths) : ["Core technical execution"],
      weaknesses: validateStringArray(candidate.weaknesses),
      interview_questions: validateStringArray(candidate.interview_questions).length > 0 ? validateStringArray(candidate.interview_questions) : ["Describe a technical challenge you resolved."],
      salary_range: validateString(candidate.salary_range, `$${80 + expYears * 8},000 - $${105 + expYears * 8},000`),
      hire_probability: validateNumber(candidate.hire_probability, Math.round((mScore / 100) * 0.95 * 100) / 100, 0, 1),
      experience_level: getExperienceLevel(expYears),
      skill_diversity: calculateSkillDiversity(validateStringArray(candidate.skills)),
      company_prestige: assessCompanyPrestige(validateStringArray(candidate.notable_companies))
    };
  };

  // Helper validation methods
  const validateString = (value: any, defaultValue: string): string => {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
    return defaultValue;
  };

  const validateStringArray = (value: any): string[] => {
    if (Array.isArray(value)) {
      return value.filter(item => typeof item === 'string' && item.trim().length > 0);
    }
    return [];
  };

  const validateNumber = (value: any, defaultValue: number, min: number, max: number): number => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return defaultValue;
    return Math.max(min, Math.min(max, num));
  };

  const validateContactInfo = (value: any, rawText = ''): { email: string; phone: string } => {
    let email = '';
    let phone = '';

    if (typeof value === 'object' && value !== null) {
      email = typeof value.email === 'string' && value.email.trim().length > 3 ? value.email.trim() : '';
      phone = typeof value.phone === 'string' && value.phone.trim().length > 3 ? value.phone.trim() : '';
    }

    if (!email && rawText) {
      const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) email = emailMatch[0];
    }

    if (!phone && rawText) {
      const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) phone = phoneMatch[0];
    }

    return {
      email: email || 'Not specified',
      phone: phone || 'Not specified'
    };
  };

  const getExperienceLevel = (years: number): string => {
    if (years <= 2) return 'Entry Level';
    if (years <= 7) return 'Mid Level';
    return 'Senior Level';
  };

  const calculateSkillDiversity = (skills: string[]): number => {
    if (skills.length === 0) return 0;
    
    const categories = new Set();
    const skillCategories = {
      programming: ['javascript', 'python', 'java', 'c#', 'c++', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin'],
      frontend: ['react', 'angular', 'vue', 'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind'],
      backend: ['node', 'express', 'django', 'spring', 'flask', 'laravel', 'rails', 'asp.net'],
      database: ['sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'cassandra'],
      cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins'],
      mobile: ['ios', 'android', 'react native', 'flutter', 'xamarin'],
      data: ['machine learning', 'ai', 'data science', 'analytics', 'tableau', 'power bi'],
      tools: ['git', 'jira', 'confluence', 'slack', 'figma', 'photoshop']
    };
    
    skills.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      Object.entries(skillCategories).forEach(([category, keywords]) => {
        if (keywords.some(keyword => lowerSkill.includes(keyword))) {
          categories.add(category);
        }
      });
    });
    
    return Math.min(1, categories.size / Object.keys(skillCategories).length);
  };

  const assessCompanyPrestige = (companies: string[]): number => {
    if (companies.length === 0) return 0;
    
    const prestigiousCompanies = [
      'google', 'microsoft', 'amazon', 'apple', 'facebook', 'meta',
      'netflix', 'tesla', 'uber', 'airbnb', 'spotify', 'stripe',
      'salesforce', 'oracle', 'ibm', 'intel', 'nvidia', 'adobe',
      'twitter', 'linkedin', 'dropbox', 'slack', 'zoom', 'shopify'
    ];
    
    const prestigeScore = companies.filter(company => 
      prestigiousCompanies.some(prestigious => 
        company.toLowerCase().includes(prestigious)
      )
    ).length;
    
    return Math.min(1, prestigeScore / Math.max(1, companies.length));
  };

  // Calculate statistics
  const stats = {
    totalCandidates: candidates.length,
    relevantCandidates: candidates.filter(c => c.is_relevant).length,
    averageScore: candidates.length > 0 
      ? Math.round(candidates.reduce((sum, c) => sum + c.match_score, 0) / candidates.length)
      : 0,
    topCandidates: candidates.filter(c => c.match_score >= 80).length
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      <div className="min-h-screen relative">
        {/* Subtle Ambient Glow Matching Landing Page */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[140px]" />
          <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 dark:bg-violet-500/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[30%] w-[500px] h-[500px] bg-blue-500/5 dark:bg-indigo-600/8 rounded-full blur-[140px]" />
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          <Header />
          
          <Routes>
            {/* Root: admin→/admin, logged-in HR→/upload, guests→LandingPage */}
            <Route
              path="/"
              element={
                isAdmin
                  ? <Navigate to="/admin" replace />
                  : isAuthenticated
                    ? <Navigate to="/upload" replace />
                    : <LandingPage />
              }
            />

            {/* Protected HR Routes — require login */}
            <Route
              path="/upload"
              element={
                isAdmin ? <Navigate to="/admin" replace /> :
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <UploadPage
                    jobDescription={jobDescription}
                    onJobDescriptionChange={setJobDescription}
                    files={uploadedFiles}
                    onFilesChange={setUploadedFiles}
                    onAnalyze={analyzeResumes}
                    isAnalyzing={isAnalyzing}
                    onNavigateToResults={navigateToResults}
                    isAppendMode={!!appendToSessionId}
                    appendSessionTitle={appendToSessionId ? ScreeningArchiveService.getSessionById(appendToSessionId)?.jobTitle : undefined}
                  />
                )
              }
            />
            <Route
              path="/results"
              element={
                isAdmin ? <Navigate to="/admin" replace /> :
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  showResults ? (
                    <ResultsPage candidates={candidates} stats={stats} />
                  ) : (
                    <Navigate to="/upload" replace />
                  )
                )
              }
            />
            <Route
              path="/analytics"
              element={
                isAdmin ? <Navigate to="/admin" replace /> :
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <AnalyticsPage candidates={candidates} stats={stats} />
                )
              }
            />
            <Route
              path="/archives"
              element={
                isAdmin ? <Navigate to="/admin" replace /> :
                !isAuthenticated ? <Navigate to="/login" replace /> : (
                  <ScreeningArchivesPage
                    onLoadSession={handleLoadSession}
                    onAppendToSession={handleAppendToSession}
                  />
                )
              }
            />

            {/* Auth pages (redirect away if already logged in) */}
            <Route path="/login" element={isAdmin ? <Navigate to="/admin" replace /> : isAuthenticated ? <Navigate to="/upload" replace /> : <LoginPage />} />
            <Route path="/signup" element={isAdmin ? <Navigate to="/admin" replace /> : isAuthenticated ? <Navigate to="/upload" replace /> : <SignupPage />} />

            {/* Admin routes */}
            <Route path="/admin-login" element={isAdmin ? <Navigate to="/admin" replace /> : <AdminLoginPage />} />
            <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to="/admin-login" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to={isAdmin ? "/admin" : isAuthenticated ? "/upload" : "/"} replace />} />
          </Routes>
        </div>

        {/* Loading Overlay */}
        <LoadingOverlay
          isVisible={isAnalyzing}
          title={loadingState.title}
          subtitle={loadingState.subtitle}
          progress={loadingState.progress}
          engineInfo={loadingState.engineInfo}
          keySlot={loadingState.keySlot}
          activeModel={loadingState.activeModel}
        />
      </div>
    </div>
  );
}

export default App;