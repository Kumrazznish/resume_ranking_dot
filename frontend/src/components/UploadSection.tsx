import { useState } from 'react';
import { Sparkles, Sliders, Play, CheckCircle2, AlertTriangle, ShieldCheck, Cpu, ArrowRight, Layers } from 'lucide-react';
import { JobDescriptionInput } from './JobDescriptionInput';
import { FileUpload } from './FileUpload';
import { UploadedFile } from '../types';

interface UploadSectionProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function UploadSection({
  jobDescription,
  onJobDescriptionChange,
  files,
  onFilesChange,
  onAnalyze,
  isAnalyzing
}: UploadSectionProps) {
  const [techWeight, setTechWeight] = useState(40);
  const [expWeight, setExpWeight] = useState(30);
  const [eduWeight, setEduWeight] = useState(15);
  const [softWeight, setSoftWeight] = useState(15);
  const [showWeightsConfig, setShowWeightsConfig] = useState(false);

  const completedFiles = files.filter(f => f.status === 'completed');
  const processingFiles = files.filter(f => f.status === 'processing' || f.status === 'pending');
  const errorFiles = files.filter(f => f.status === 'error');
  
  const hasJobDescription = jobDescription.trim().length >= 30;
  const hasCompletedFiles = completedFiles.length > 0;
  const canAnalyze = hasJobDescription && hasCompletedFiles && !isAnalyzing && processingFiles.length === 0;

  return (
    <section id="upload-workspace" className="space-y-8 animate-fade-in">
      
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Screen Resumes & AI Ranker
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
              GEMINI 2.0 FLASH
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define your hiring criteria, upload applicant CVs, and generate multi-dimensional talent scores in seconds.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowWeightsConfig(!showWeightsConfig)}
            className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showWeightsConfig
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-indigo-500" />
            <span>AI Scoring Weights ({techWeight}% / {expWeight}% / {eduWeight}% / {softWeight}%)</span>
          </button>
        </div>
      </div>

      {/* AI Scoring Weights Drawer */}
      {showWeightsConfig && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Custom AI Match Formula
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Adjust criteria weightings based on this role's specific priorities.
              </p>
            </div>
            <button
              onClick={() => {
                setTechWeight(40);
                setExpWeight(30);
                setEduWeight(15);
                setSoftWeight(15);
              }}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Technical Skills</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{techWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                value={techWeight}
                onChange={(e) => setTechWeight(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Work Experience</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{expWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={expWeight}
                onChange={(e) => setExpWeight(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Education & Degrees</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{eduWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={eduWeight}
                onChange={(e) => setEduWeight(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Culture & Leadership</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{softWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={softWeight}
                onChange={(e) => setSoftWeight(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Form Split View: Job Spec + Candidate Pool */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Step 1: Job Description */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <JobDescriptionInput
            value={jobDescription}
            onChange={onJobDescriptionChange}
          />
        </div>

        {/* Step 2: Resume Uploads */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <FileUpload
            files={files}
            onFilesChange={onFilesChange}
          />
        </div>
      </div>

      {/* Evaluation Control Dock */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center space-x-2 justify-center md:justify-start">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Analysis Readiness:</span>
              {canAnalyze ? (
                <span className="inline-flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Ready ({completedFiles.length} candidate{completedFiles.length === 1 ? '' : 's'} queued)</span>
                </span>
              ) : (
                <span className="inline-flex items-center text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 space-x-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>
                    {!hasJobDescription
                      ? 'Add Job Description'
                      : !hasCompletedFiles
                      ? 'Upload Resumes or Load 5 Sample Resumes'
                      : 'Resolving parse items...'}
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates candidates using TalentAI semantic matching, experience scoring, and AI interview recommendations.
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-center">
            <button
              onClick={onAnalyze}
              disabled={!canAnalyze}
              id="execute-ai-analysis-btn"
              className={`w-full md:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-md ${
                canAnalyze
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300 dark:border-slate-700'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Candidates with TalentAI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {canAnalyze
                      ? `Rank ${completedFiles.length} Candidate${completedFiles.length === 1 ? '' : 's'} with AI`
                      : 'Complete Form to Analyze'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}