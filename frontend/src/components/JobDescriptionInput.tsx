import { useState, useEffect } from 'react';
import { Sparkles, FileText, Clock, Layers, CheckCircle2, ChevronDown, Check, Wand2 } from 'lucide-react';
import { DatabaseService } from '../services/database';
import { JobDescription } from '../types';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onJobDescriptionSelect?: (jobDesc: JobDescription) => void;
}

interface EnterpriseTemplate {
  id: string;
  title: string;
  department: string;
  seniority: string;
  salary: string;
  skills: string[];
  description: string;
}

const ENTERPRISE_TEMPLATES: EnterpriseTemplate[] = [
  {
    id: 'fullstack-sr',
    title: 'Senior Full Stack Engineer',
    department: 'Core Product Engineering',
    seniority: 'Senior (5+ yrs)',
    salary: '$140,000 - $185,000',
    skills: ['TypeScript', 'React.js', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL'],
    description: `Position: Senior Full Stack Engineer
Department: Core Product Engineering
Employment Type: Full-Time
Experience Level: 5+ Years
Salary Range: $140,000 - $185,000 + Equity

ROLE OVERVIEW:
We are looking for a Senior Full Stack Engineer to lead architectural design and development of our mission-critical enterprise applications. You will collaborate directly with product, design, and infrastructure teams to deliver high-throughput, resilient cloud services.

KEY RESPONSIBILITIES:
• Architect, build, and deploy high-performance frontend micro-frontends and backend microservices.
• Develop scalable REST and GraphQL APIs backed by PostgreSQL and distributed caching layers (Redis).
• Enforce code quality, automated test coverage (>85%), and robust CI/CD deployment pipelines.
• Mentor junior and mid-level engineers through structured peer code reviews and architectural RFCs.
• Partner with Security and DevOps to ensure SOC2 Type II and GDPR compliance across services.

TECHNICAL REQUIREMENTS:
• 5+ years of production experience with TypeScript, React.js, and Node.js.
• Proven proficiency with relational databases (PostgreSQL, MySQL) and database query optimization.
• Solid background in cloud platforms (AWS, GCP, or Azure) and container orchestration (Docker, Kubernetes).
• Experience designing event-driven architectures with Kafka, RabbitMQ, or AWS SQS.
• Strong knowledge of automated testing frameworks (Jest, Vitest, Playwright, Cypress).

PREFERRED QUALIFICATIONS:
• B.S. or M.S. in Computer Science, Software Engineering, or equivalent practical experience.
• Experience with Next.js, TailwindCSS, and serverless compute paradigms.
• Contributions to prominent open-source ecosystems or published engineering tech blogs.`
  },
  {
    id: 'ai-ml-sr',
    title: 'Senior AI & LLM Systems Engineer',
    department: 'Applied AI Research & Engineering',
    seniority: 'Senior / Staff (4+ yrs)',
    salary: '$165,000 - $220,000',
    skills: ['Python', 'PyTorch', 'LangChain', 'OpenAI / Gemini APIs', 'Vector DBs (Pinecone, Qdrant)', 'FastAPI', 'RAG'],
    description: `Position: Senior AI & LLM Systems Engineer
Department: Applied AI Research & Engineering
Employment Type: Full-Time
Experience Level: 4+ Years (AI/ML Production Focus)
Salary Range: $165,000 - $220,000 + Equity

ROLE OVERVIEW:
Join our Applied AI team to design, evaluate, and scale generative AI pipelines, Retrieval-Augmented Generation (RAG) architectures, and fine-tuned LLM agents serving thousands of enterprise clients.

KEY RESPONSIBILITIES:
• Design and productionize resilient LLM workflows with advanced RAG, semantic search, and prompt engineering.
• Fine-tune and evaluate open-weight models (Llama 3, Mistral) and API models (Gemini Flash/Pro, Claude 3.5).
• Construct low-latency inference pipelines with vector embeddings (Pinecone, Qdrant, Weaviate).
• Implement robust evaluation benchmarks to detect hallucinations, toxicity, and accuracy drift.
• Build scalable Python backend microservices using FastAPI, Celery, and Redis.

TECHNICAL REQUIREMENTS:
• 4+ years of software engineering with at least 2+ years dedicated to production AI/ML systems.
• Deep mastery of Python, PyTorch, Hugging Face Transformers, and LangChain/LlamaIndex.
• Hands-on experience with vector databases, dense embedding models, and hybrid keyword-semantic retrieval.
• Strong foundation in distributed systems, asynchronous event queues, and Docker/Kubernetes.

PREFERRED QUALIFICATIONS:
• Track record of deploying LLM agents in production with automated guardrails.
• Familiarity with model quantization (vLLM, TensorRT-LLM, Ollama) and GPU inference optimization.`
  },
  {
    id: 'devops-lead',
    title: 'Lead DevOps & Cloud Platform Architect',
    department: 'Infrastructure & Site Reliability',
    seniority: 'Lead / Principal (6+ yrs)',
    salary: '$160,000 - $210,000',
    skills: ['Terraform', 'Kubernetes (EKS)', 'AWS / GCP', 'CI/CD (GitHub Actions)', 'Prometheus / Grafana', 'SOC2 / Zero Trust'],
    description: `Position: Lead DevOps & Cloud Platform Architect
Department: Infrastructure & Site Reliability (SRE)
Employment Type: Full-Time
Experience Level: 6+ Years
Salary Range: $160,000 - $210,000 + Equity

ROLE OVERVIEW:
Lead our cloud platform reliability and developer velocity initiative. You will own our multi-region Kubernetes clusters, Infrastructure-as-Code (Terraform), and Zero-Trust security posture.

KEY RESPONSIBILITIES:
• Architect immutable infrastructure across AWS multi-account landing zones using Terraform and Terragrunt.
• Maintain 99.99% availability across Kubernetes clusters running mission-critical enterprise workloads.
• Build automated, zero-downtime CI/CD deployment pipelines using GitHub Actions and ArgoCD.
• Implement enterprise observability stacks using Prometheus, Grafana, OpenTelemetry, and Datadog.
• Manage incident response protocols, disaster recovery runbooks, and chaos engineering drills.

TECHNICAL REQUIREMENTS:
• 6+ years managing large-scale cloud infrastructure with AWS or GCP.
• Deep expertise in Kubernetes (EKS/GKE), Helm, Service Mesh (Istio), and container security.
• Proven mastery of Terraform, Ansible, and GitOps workflows.
• Deep understanding of networking, VPC peering, TLS/SSL, IAM policies, and Zero-Trust architectures.`
  },
  {
    id: 'product-lead',
    title: 'Principal Technical Product Manager',
    department: 'Product & Growth',
    seniority: 'Principal (7+ yrs)',
    salary: '$150,000 - $195,000',
    skills: ['Product Strategy', 'Technical Specs', 'Agile / Scrum', 'Data Analytics (SQL, Mixpanel)', 'B2B SaaS', 'User Research'],
    description: `Position: Principal Technical Product Manager
Department: Product & Growth
Employment Type: Full-Time
Experience Level: 7+ Years
Salary Range: $150,000 - $195,000 + Equity

ROLE OVERVIEW:
Drive the product vision, roadmap, and delivery of our enterprise AI platform. You will bridge customer needs, commercial strategy, and complex AI engineering capabilities.

KEY RESPONSIBILITIES:
• Formulate quarterly product roadmaps and define measurable OKRs with executive leadership.
• Author high-clarity PRDs (Product Requirements Documents) with detailed user stories and acceptance criteria.
• Conduct qualitative customer interviews and quantitative analysis using Mixpanel, SQL, and Amplitude.
• Partner closely with engineering tech leads to scope features, prioritize sprints, and manage trade-offs.
• Lead go-to-market enablement with sales engineering, marketing, and customer success teams.

TECHNICAL REQUIREMENTS:
• 7+ years of Product Management experience in B2B SaaS or Developer Platforms.
• Strong technical fluency — ability to evaluate API contracts, database schemas, and AI model trade-offs.
• Exceptional data proficiency: proficient in SQL, cohort analysis, and funnel optimization metrics.`
  }
];

export function JobDescriptionInput({ 
  value, 
  onChange, 
  onJobDescriptionSelect 
}: JobDescriptionInputProps) {
  const [savedJobDescriptions, setSavedJobDescriptions] = useState<JobDescription[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  useEffect(() => {
    loadSavedJobDescriptions();
  }, []);

  const loadSavedJobDescriptions = async () => {
    try {
      setIsLoading(true);
      const jobDescs = await DatabaseService.getJobDescriptions();
      setSavedJobDescriptions(jobDescs.slice(0, 10));
    } catch (error) {
      console.error('Failed to load job descriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template: EnterpriseTemplate) => {
    setActiveTemplateId(template.id);
    onChange(template.description);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = value.length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  // Determine role quality badge
  const getQualityBadge = () => {
    if (wordCount === 0) return { label: 'Awaiting Job Spec', color: 'text-slate-400 bg-slate-100 dark:bg-slate-800' };
    if (wordCount < 60) return { label: 'Low Detail (Add Requirements)', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800' };
    if (wordCount < 180) return { label: 'Good Job Spec', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800' };
    return { label: 'Comprehensive Enterprise Spec', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800' };
  };

  const quality = getQualityBadge();

  return (
    <div className="space-y-5">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Target Job Specification</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${quality.color}`}>
                {quality.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Define the requirements, must-have skills, and seniority benchmark for AI ranking
            </p>
          </div>
        </div>

        {savedJobDescriptions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSaved(!showSaved)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>{showSaved ? 'Hide History' : `Recent Jobs (${savedJobDescriptions.length})`}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${showSaved ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Preset Role Templates (Ashby / Linear Style) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Enterprise Role Presets (One-Click Populate)</span>
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Click a role to load production spec</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {ENTERPRISE_TEMPLATES.map((tpl) => {
            const isSelected = activeTemplateId === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className={`p-3 rounded-xl text-left border transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate pr-1">{tpl.title}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mb-1.5">
                  {tpl.department}
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{tpl.seniority}</span>
                  <span className="text-slate-400 dark:text-slate-500">{tpl.salary.split('-')[0]}...</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Saved Job Descriptions Drawer */}
      {showSaved && (
        <div className="bg-slate-50 dark:bg-slate-900/90 rounded-xl p-4 border border-slate-200 dark:border-slate-800 max-h-56 overflow-y-auto space-y-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Recently Screened Job Roles</div>
          {isLoading ? (
            <div className="py-4 text-center text-xs text-slate-400">Loading saved roles...</div>
          ) : (
            <div className="space-y-2">
              {savedJobDescriptions.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => {
                    onChange(job.description);
                    onJobDescriptionSelect?.(job);
                    setShowSaved(false);
                  }}
                  className="w-full text-left p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 dark:text-white">{job.title}</span>
                    <span className="text-[10px] text-slate-400">{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{job.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Job Description Textarea */}
      <div className="relative">
        <textarea
          id="jobDescription"
          value={value}
          onChange={(e) => {
            setActiveTemplateId(null);
            onChange(e.target.value);
          }}
          placeholder="Paste or write your job description here (Role overview, required tech stack, responsibilities, years of experience, and nice-to-haves)..."
          rows={10}
          className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm font-mono leading-relaxed focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all resize-y"
        />

        {/* Counter Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-100/90 dark:bg-slate-850 rounded-b-xl border-x border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-3">
            <span><strong>{wordCount}</strong> words</span>
            <span>•</span>
            <span><strong>{charCount}</strong> chars</span>
            <span>•</span>
            <span>~{estimatedReadTime} min AI read</span>
          </div>

          <div className="flex items-center space-x-2">
            {wordCount >= 60 ? (
              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold space-x-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Ready for AI evaluation</span>
              </span>
            ) : (
              <span className="text-slate-400">Recommended: min 60 words for deep ranking</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}