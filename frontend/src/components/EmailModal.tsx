import { useState } from 'react';
import { X, Mail, Copy, Send, Eye, CheckCircle, AlertCircle, Check } from 'lucide-react';
import { Candidate } from '../types';
import { EmailService, EmailTemplate } from '../services/emailService';

import { useAuth } from '../contexts/AuthContext';

interface EmailModalProps {
  candidate: Candidate;
  isOpen: boolean;
  onClose: () => void;
  jobTitle?: string;
}

export function EmailModal({ candidate, isOpen, onClose, jobTitle }: EmailModalProps) {
  const { logAction } = useAuth();
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  if (!isOpen) return null;

  const generateEmail = () => {
    setIsLoading(true);
    setTimeout(() => {
      const template = EmailService.generateEmailPreview(candidate, jobTitle);
      setEmailTemplate(template);
      setIsLoading(false);
    }, 1000);
  };

  const handleSendEmail = async () => {
    if (!candidate.contact_info.email) {
      alert('No email address available for this candidate.');
      return;
    }

    const success = await EmailService.sendInterviewEmail(candidate, jobTitle);
    if (success) {
      logAction(
        'EMAIL_SENT',
        `Dispatched interview invitation email to ${candidate.candidate_name} (Score: ${candidate.match_score}%)`,
        {
          candidate_name: candidate.candidate_name,
          recipient_email: candidate.contact_info.email,
          score: candidate.match_score,
          job_title: jobTitle,
        }
      );
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        onClose();
      }, 2000);
    }
  };

  const handleCopyEmail = async () => {
    const success = await EmailService.copyEmailToClipboard(candidate, jobTitle);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const isValidEmail = EmailService.validateEmailAddress(candidate.contact_info.email || '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-sm">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                AI Interview Email Generator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generate personalized interview invitation for {candidate.candidate_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Candidate Info */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {candidate.candidate_name}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Match Score: {candidate.match_score}%</span>
                <span>•</span>
                <span>{candidate.experience_years} years experience</span>
                <span>•</span>
                <span>{candidate.experience_level}</span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs font-semibold ${isValidEmail ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {candidate.contact_info.email ? (
                  <div className="flex items-center space-x-1.5">
                    {isValidEmail ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <AlertCircle className="h-3.5 w-3.5 text-rose-500" />}
                    <span>{EmailService.formatEmailForDisplay(candidate.contact_info.email)}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-rose-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>No email listed</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email Generation */}
          {!emailTemplate ? (
            <div className="text-center py-10 space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 border-3 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mx-auto" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Generating AI-Powered Email...
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Analyzing candidate profile and crafting personalized interview invitation
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 shadow-sm">
                    <Mail className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                      Ready to Generate Interview Email
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                      Our AI will analyze {candidate.candidate_name}'s profile and create a personalized, 
                      professional interview invitation based on their {candidate.match_score}% match score 
                      and {candidate.experience_years} years of experience.
                    </p>
                  </div>
                  <button
                    onClick={generateEmail}
                    disabled={!isValidEmail}
                    className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-sm ${
                      isValidEmail
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-[0.98]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <span>🤖 Generate AI Email</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Email Subject */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Subject:</div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{emailTemplate.subject}</div>
              </div>

              {/* Email Body */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Body Preview</span>
                  <button
                    onClick={handleCopyEmail}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    {copySuccess ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  value={emailTemplate.body}
                  readOnly
                  rows={9}
                  className="w-full bg-transparent border-0 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setEmailTemplate(null);
                    setShowPreview(false);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Regenerate
                </button>

                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={handleCopyEmail}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                  >
                    {copySuccess ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copySuccess ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSendEmail}
                    disabled={!isValidEmail || sendSuccess}
                    className={`inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      sendSuccess
                        ? 'bg-emerald-600 text-white'
                        : isValidEmail
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {sendSuccess ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Email Sent!</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Send Interview Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}