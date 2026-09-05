import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle2, Clock, Loader2, Sparkles, Trash2, Eye, FileCheck } from 'lucide-react';
import { UploadedFile } from '../types';
import { FileProcessor } from '../services/fileProcessor';

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}

const SAMPLE_RESUMES = [
  {
    name: 'Alex_Chen_Senior_FullStack.pdf',
    type: 'application/pdf',
    size: 245000,
    text: `ALEX CHEN
San Francisco, CA | alex.chen.dev@gmail.com | (415) 555-0192 | github.com/alexchen | linkedin.com/in/alexchen-dev

SUMMARY:
Results-driven Senior Full Stack Engineer with 6+ years of experience designing scalable microservices, real-time distributed platforms, and responsive web applications. Proven track record improving API latency by 45% and leading cross-functional teams of 8 engineers.

TECHNICAL SKILLS:
• Languages: TypeScript, JavaScript (ES6+), Python, Go, SQL, HTML5/CSS3
• Frontend: React.js, Next.js, Redux Toolkit, TailwindCSS, WebSockets
• Backend: Node.js, Express.js, FastAPI, GraphQL, REST APIs, gRPC
• Databases & Cache: PostgreSQL, MongoDB, Redis, Pinecone Vector DB
• Cloud & DevOps: AWS (ECS, Lambda, S3, CloudFront), Docker, Kubernetes, Terraform, GitHub Actions CI/CD
• Testing & Quality: Jest, Vitest, Cypress, Playwright, SonarQube

PROFESSIONAL EXPERIENCE:

Senior Full Stack Engineer | CloudScale Systems, SF (2022 - Present)
• Architected enterprise multi-tenant analytics dashboard in React/Next.js handling 4.5M monthly events.
• Built high-throughput Node.js microservices with PostgreSQL connection pooling, reducing p99 latency to 38ms.
• Designed vector search ingestion pipeline with Pinecone and Gemini embeddings for semantic knowledge base.
• Mentored 4 junior engineers and instituted trunk-based development with 92% automated test coverage.

Full Stack Software Engineer | Horizon Fintech, SF (2019 - 2022)
• Developed PCI-compliant payment orchestration gateway integrating Stripe and Plaid with Node.js & React.
• Automated AWS infrastructure provisioning using Terraform, saving $40k annually in idle cloud capacity.
• Migrated legacy monolithic Rails backend into decoupled TypeScript microservices with zero downtime.

EDUCATION:
• B.S. in Computer Science, University of California, Berkeley (2015 - 2019)
• Magna Cum Laude, Dean's Honors List`
  },
  {
    name: 'Sarah_Miller_AI_Engineer.pdf',
    type: 'application/pdf',
    size: 280000,
    text: `SARAH MILLER, M.S.
Seattle, WA | sarah.miller.ai@outlook.com | (206) 555-4821 | github.com/sarahm-ai

PROFESSIONAL SUMMARY:
Applied AI & Machine Learning Engineer with 5+ years building production RAG pipelines, fine-tuning LLMs, and deploying vector search architectures. Authored 3 published papers in applied NLP and deep learning.

CORE COMPETENCIES:
• AI / ML: PyTorch, TensorFlow, Hugging Face Transformers, LangChain, LlamaIndex, LoRA Fine-Tuning
• LLM APIs: OpenAI GPT-4o, Google Gemini 2.0 Flash/Pro, Anthropic Claude 3.5, Ollama, vLLM
• Vector Databases: Pinecone, Qdrant, Weaviate, Milvus, ChromaDB, PGVector
• Software Engineering: Python, FastAPI, Docker, Kubernetes, Ray Distributed, Celery, Redis, PostgreSQL
• Cloud: AWS SageMaker, GCP Vertex AI, Azure ML, Weights & Biases (W&B)

WORK EXPERIENCE:

Lead AI Engineer | SynthAI Labs, Seattle (2023 - Present)
• Built low-latency RAG system with Gemini Flash and hybrid vector-BM25 retrieval, serving 250k enterprise queries daily.
• Fine-tuned 8B parameter open LLMs using QLoRA for domain-specific medical summaries with 94.2% factual precision.
• Engineered automated guardrail and hallucination scoring benchmark using LLM-as-a-Judge and TruLens.

Machine Learning Engineer | DataCore AI, Seattle (2020 - 2023)
• Developed NLP classification and entity extraction models processing 12M raw text documents per month.
• Containerized and scaled real-time PyTorch model inference on AWS EKS with Triton Inference Server.
• Reduced GPU inference operational cost by 55% using TensorRT-LLM and dynamic batching.

EDUCATION:
• M.S. in Artificial Intelligence & Machine Learning, University of Washington (2018 - 2020)
• B.S. in Mathematics & Data Science, University of Washington (2014 - 2018)`
  },
  {
    name: 'David_Kim_DevOps_Architect.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 195000,
    text: `DAVID KIM
Austin, TX | david.kim.cloud@gmail.com | (512) 555-8392 | linkedin.com/in/davidkim-devops

PROFILE:
Lead DevOps & Cloud Platform Architect with 7+ years orchestrating AWS multi-region infrastructure, Kubernetes clusters, and Zero-Trust CI/CD pipelines for high-growth SaaS unicorns.

TECHNICAL EXPERTISE:
• Cloud Platforms: Amazon Web Services (AWS), Google Cloud Platform (GCP)
• Container Orchestration: Kubernetes (EKS/GKE), Helm, Istio Service Mesh, Docker
• Infrastructure-as-Code: Terraform, Terragrunt, Ansible, CloudFormation
• CI/CD & GitOps: GitHub Actions, GitLab CI, ArgoCD, Flux, Jenkins
• Observability & Security: Prometheus, Grafana, Datadog, ELK Stack, HashiCorp Vault, SOC2 Compliance

WORK HISTORY:

Principal Platform Architect | Nexus SaaS, Austin (2021 - Present)
• Managed 18 production Kubernetes clusters across 3 AWS regions with 99.995% uptime SLA.
• Built automated self-service developer deployment portal reducing engineer onboarding from 2 weeks to 2 hours.
• Enforced SOC2 Type II, HIPAA, and ISO 27001 compliance standards with HashiCorp Vault and IAM policies.

Senior DevOps Engineer | Austin CloudWorks (2018 - 2021)
• Standardized 40+ microservices on AWS EKS and created modular Terraform libraries for 6 engineering squads.
• Migrated manual Jenkins builds to GitOps with ArgoCD, decreasing release failure rate by 80%.

CERTIFICATIONS & EDUCATION:
• AWS Certified Solutions Architect - Professional (SAP-C02)
• Certified Kubernetes Administrator (CKA)
• B.S. in Computer Engineering, University of Texas at Austin (2014 - 2018)`
  },
  {
    name: 'Emily_Rodriguez_Product_Manager.pdf',
    type: 'application/pdf',
    size: 210000,
    text: `EMILY RODRIGUEZ
New York, NY | emily.rodriguez.pm@gmail.com | (212) 555-9120 | linkedin.com/in/emilyrodriguez-pm

EXECUTIVE SUMMARY:
Strategic Principal Technical Product Manager with 7+ years scaling enterprise SaaS platforms from $5M to $40M ARR. Expert in AI product discovery, developer APIs, and data-driven growth funnels.

SKILLS & METHODS:
• Product Lifecycle: PRDs, User Story Mapping, OKR Alignment, Customer Journey Mapping, Agile / Scrum
• Technical Fluency: REST & GraphQL API Design, SQL, Postgres, Mixpanel, Amplitude, Segment, Jira
• Leadership: Cross-functional team leadership (Engineering, UX, Sales, Legal), Executive Stakeholder Management

EXPERIENCE:

Principal Product Manager | Streamline Enterprise SaaS, NYC (2022 - Present)
• Owned core Enterprise Workflow automation product line generating $24M in new annual ARR.
• Shipped AI copilot feature powered by Gemini API, accelerating customer workflow completion by 35%.
• Led continuous discovery sprints with Fortune 500 tech leaders to define multi-year API platform strategy.

Senior Technical Product Manager | Databloom, NYC (2019 - 2022)
• Managed 12-person agile engineering team building real-time data integration connectors.
• Increased user activation rate from 42% to 68% through redesigned onboarding flow and self-serve workspace setup.

EDUCATION:
• MBA, NYU Stern School of Business (2017 - 2019)
• B.A. in Economics & Computer Science, Columbia University (2013 - 2017)`
  },
  {
    name: 'Vikram_Patel_Frontend_Lead.pdf',
    type: 'application/pdf',
    size: 230000,
    text: `VIKRAM PATEL
Chicago, IL | vikram.patel.fe@gmail.com | (312) 555-7341 | github.com/vpatel-ui

SUMMARY:
Lead Frontend & Design Systems Engineer with 6+ years creating pixel-perfect web interfaces, accessible component libraries (WCAG 2.1 AAA), and micro-frontend architectures with React and TypeScript.

SKILLS:
• Core: TypeScript, JavaScript, CSS3/SCSS, HTML5, Web Performance Optimization, Core Web Vitals
• Frameworks: React, Next.js, Vue.js, TailwindCSS, Radix UI, Storybook, Redux, Zustand
• Tooling: Vite, Webpack, Vitest, Jest, Cypress, Figma, GitHub Actions

EXPERIENCE:

Lead Frontend Engineer | Apex Commerce, Chicago (2021 - Present)
• Created open-source design system used across 14 internal applications, increasing UI dev velocity by 50%.
• Optimized Core Web Vitals (LCP < 1.2s, FID < 50ms, CLS = 0), boosting conversion rates by 18%.
• Directed a team of 6 frontend developers through major React 18 / Next.js 14 server component migration.

Frontend Engineer | BlueWave Tech (2018 - 2021)
• Built high-frequency trading dashboard with real-time WebSockets rendering 60fps stock tick charts.
• Implemented robust automated visual regression testing with Playwright and Storybook test-runner.

EDUCATION:
• B.S. in Software Engineering, University of Illinois Urbana-Champaign (2014 - 2018)`
  }
];

export function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
    e.target.value = '';
  };

  const processFiles = async (newFiles: File[]) => {
    const updatedFiles = [...files];
    
    for (const file of newFiles) {
      try {
        const validation = FileProcessor.validateFile(file);
        
        if (!validation.valid) {
          const errorFileObj: UploadedFile = {
            id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            file,
            status: 'error',
            text: null,
            error: validation.error || 'Invalid file format',
            uploadTime: new Date()
          };
          updatedFiles.push(errorFileObj);
          onFilesChange([...updatedFiles]);
          continue;
        }

        const isDuplicate = files.some(f => 
          f.file.name === file.name && 
          f.file.size === file.size && 
          f.status !== 'error'
        );
        
        if (isDuplicate) {
          const duplicateFileObj: UploadedFile = {
            id: `duplicate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            file,
            status: 'error',
            text: null,
            error: 'File already present in batch',
            uploadTime: new Date()
          };
          updatedFiles.push(duplicateFileObj);
          onFilesChange([...updatedFiles]);
          continue;
        }

        const fileObj: UploadedFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file,
          status: 'pending',
          text: null,
          error: null,
          uploadTime: new Date()
        };

        updatedFiles.push(fileObj);
        onFilesChange([...updatedFiles]);

        try {
          await FileProcessor.processFile(fileObj);
          const fileIndex = updatedFiles.findIndex(f => f.id === fileObj.id);
          if (fileIndex !== -1) {
            updatedFiles[fileIndex] = fileObj;
            onFilesChange([...updatedFiles]);
          }
        } catch (error) {
          console.error('File processing error:', error);
          const fileIndex = updatedFiles.findIndex(f => f.id === fileObj.id);
          if (fileIndex !== -1) {
            updatedFiles[fileIndex] = fileObj;
            onFilesChange([...updatedFiles]);
          }
        }
      } catch (error) {
        console.error('Unexpected error processing file:', error);
      }
    }
  };

  // Instant Sample Resumes Loader
  const handleLoadSampleResumes = () => {
    const sampleUploadedFiles: UploadedFile[] = SAMPLE_RESUMES.map((sr, idx) => {
      const mockFile = new File([sr.text], sr.name, { type: sr.type });
      return {
        id: `sample_${Date.now()}_${idx}`,
        file: mockFile,
        status: 'completed',
        text: sr.text,
        error: null,
        uploadTime: new Date()
      };
    });

    onFilesChange([...files, ...sampleUploadedFiles]);
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);
    if (previewFile?.id === fileId) setPreviewFile(null);
  };

  const clearAllFiles = () => {
    onFilesChange([]);
    setPreviewFile(null);
  };

  const completedFiles = files.filter(f => f.status === 'completed');
  const processingFiles = files.filter(f => f.status === 'processing' || f.status === 'pending');
  const errorFiles = files.filter(f => f.status === 'error');

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <Upload className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Candidate Resume Pool</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {files.length} {files.length === 1 ? 'file' : 'files'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload candidate CVs in PDF, DOCX, or TXT for automated AI ranking
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleLoadSampleResumes}
            id="load-sample-resumes-btn"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Load 5 Candidate Resumes</span>
          </button>

          {files.length > 0 && (
            <button
              type="button"
              onClick={clearAllFiles}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors"
              title="Clear all uploaded resumes"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        id="resume-dropzone"
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-850'
        }`}
      >
        <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Upload className="h-6 w-6" />
        </div>
        
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          {isDragOver ? 'Release to upload resumes' : 'Drop resumes here, or browse files'}
        </h4>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
          Drag multiple resume files at once. Text extraction and structural parsing happen automatically.
        </p>

        <div className="inline-flex items-center space-x-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          <span>Supported formats: PDF, DOCX, TXT</span>
          <span>•</span>
          <span>Max 10MB per file</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Batch Metrics Bar */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ready for AI</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{completedFiles.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Processing</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{processingFiles.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Parse Issues</span>
            <span className={`text-sm font-bold ${errorFiles.length > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{errorFiles.length}</span>
          </div>
        </div>
      )}

      {/* Uploaded Files Table / List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Candidate Files in Queue ({files.length})</span>
            <span className="text-slate-400 font-normal">Click eye icon to preview parsed text</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {files.map((fileObj) => {
              const isCompleted = fileObj.status === 'completed';
              const isError = fileObj.status === 'error';
              const isProcessing = fileObj.status === 'processing' || fileObj.status === 'pending';

              return (
                <div
                  key={fileObj.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {fileObj.file.name}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{FileProcessor.formatFileSize(fileObj.file.size)}</span>
                        <span>•</span>
                        {isCompleted && fileObj.text && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {fileObj.text.length} chars parsed
                          </span>
                        )}
                        {isError && (
                          <span className="text-rose-600 dark:text-rose-400 font-medium truncate max-w-[200px]">
                            {fileObj.error}
                          </span>
                        )}
                        {isProcessing && (
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center space-x-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Parsing...</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {isCompleted && fileObj.text && (
                      <button
                        type="button"
                        onClick={() => setPreviewFile(previewFile?.id === fileObj.id ? null : fileObj)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                        title="Preview extracted resume text"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}

                    <div className="flex items-center">
                      {isCompleted && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span>READY</span>
                        </span>
                      )}
                      {isError && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          <AlertCircle className="h-3 w-3 text-rose-500" />
                          <span>ERROR</span>
                        </span>
                      )}
                      {isProcessing && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          <Clock className="h-3 w-3 text-indigo-500" />
                          <span>PARSING</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(fileObj.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extracted Text Preview Modal / Drawer */}
      {previewFile && previewFile.text && (
        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <FileCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-bold text-white">{previewFile.file.name}</span>
            </div>
            <button
              onClick={() => setPreviewFile(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto whitespace-pre-wrap text-slate-300 leading-relaxed">
            {previewFile.text}
          </div>
        </div>
      )}
    </div>
  );
}