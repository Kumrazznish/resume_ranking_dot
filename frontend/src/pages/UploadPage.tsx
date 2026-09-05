import { FilePlus2, Info, X } from 'lucide-react';
import { UploadSection } from '../components/UploadSection';
import { UploadedFile } from '../types';

interface UploadPageProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onNavigateToResults: () => void;
  /** If set, this page is in "append mode" — new resumes will be merged into an existing archived session */
  isAppendMode?: boolean;
  appendSessionTitle?: string;
}

export function UploadPage({
  jobDescription,
  onJobDescriptionChange,
  files,
  onFilesChange,
  onAnalyze,
  isAnalyzing,
  isAppendMode,
  appendSessionTitle,
}: UploadPageProps) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors space-y-4">

      {/* Append Mode Banner */}
      {isAppendMode && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <FilePlus2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
              Adding More Resumes to Existing Session
            </div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
              The Job Description is pre-filled from:{' '}
              <strong className="font-bold">{appendSessionTitle || 'archived session'}</strong>.
              Upload the new resumes below and click <strong>Rank Candidates with AI</strong>.
              New candidates will be <strong>merged</strong> with your previous results — the full combined leaderboard will be shown.
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-lg flex-shrink-0">
            <Info className="w-3.5 h-3.5" />
            Merge Mode
          </div>
        </div>
      )}

      <UploadSection
        jobDescription={jobDescription}
        onJobDescriptionChange={onJobDescriptionChange}
        files={files}
        onFilesChange={onFilesChange}
        onAnalyze={onAnalyze}
        isAnalyzing={isAnalyzing}
      />
    </main>
  );
}