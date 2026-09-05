import { Link } from 'react-router-dom';
import { Upload, BarChart3, Target, Zap, Shield, Clock, Mail } from 'lucide-react';

export function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <section className="text-center py-20 text-gray-800 dark:text-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 animate-slide-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient dark:text-gradient-dark leading-tight">
              AI-Powered Resume Ranking
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              Transform your hiring process with intelligent candidate matching using advanced AI analysis.
              Find the perfect candidates faster with our smart ranking system powered by TalentAI Neural Core.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 stagger-children">
            <div className="glass-card interactive-hover px-6 py-6 group dark:bg-gray-800/60 dark:border-gray-700">
              <Zap className="h-10 w-10 mx-auto mb-3 text-yellow-500 dark:text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-sm font-semibold text-gray-800 dark:text-white">Fast AI Analysis</div>
            </div>
            <div className="glass-card interactive-hover px-6 py-6 group dark:bg-gray-800/60 dark:border-gray-700">
              <Target className="h-10 w-10 mx-auto mb-3 text-green-500 dark:text-green-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-sm font-semibold text-gray-800 dark:text-white">Smart Matching</div>
            </div>
            <div className="glass-card interactive-hover px-6 py-6 group dark:bg-gray-800/60 dark:border-gray-700">
              <BarChart3 className="h-10 w-10 mx-auto mb-3 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-sm font-semibold text-gray-800 dark:text-white">Deep Analytics</div>
            </div>
            <div className="glass-card interactive-hover px-6 py-6 group dark:bg-gray-800/60 dark:border-gray-700">
              <Mail className="h-10 w-10 mx-auto mb-3 text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-sm font-semibold text-gray-800 dark:text-white">AI Email System</div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="animate-bounce-in">
            <Link
              to="/upload"
              className="inline-flex items-center space-x-4 px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 dark:hover:from-emerald-700 dark:hover:via-teal-700 dark:hover:to-cyan-700 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 pulse-glow group"
            >
              <Upload className="h-7 w-7 group-hover:rotate-12 transition-transform duration-300" />
              <span>Start Analyzing Resumes</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-in-up">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Why Choose ResumeRanker Pro?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our advanced AI system provides comprehensive candidate analysis with unmatched accuracy and speed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {/* Feature 1 */}
            <div className="glass-card interactive-card p-8 group dark:bg-gray-800/60 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-emerald-500 dark:to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Lightning Fast Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Process hundreds of resumes in minutes with our optimized AI engine. Get detailed candidate insights
                without the wait, powered by high-throughput neural inference technology.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card interactive-card p-8 group dark:bg-gray-800/60 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 dark:from-teal-500 dark:to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Intelligent Matching</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Advanced algorithms analyze skills, experience, and cultural fit to provide accurate match scores.
                Find candidates who truly align with your job requirements and company values.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card interactive-card p-8 group dark:bg-gray-800/60 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 dark:from-cyan-500 dark:to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">AI-Powered Email System</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Automatically generate personalized interview emails for top candidates using advanced AI.
                Send professional, tailored invitations that reflect each candidate's unique qualifications and match score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-in-up">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Simple 3-step process to transform your hiring workflow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-emerald-500 dark:to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-2xl group-hover:scale-110 transition-all duration-300 pulse-glow">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Upload & Describe</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Upload your job description and candidate resumes. Our system supports PDF, DOC, and TXT formats
                with advanced text extraction capabilities.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 dark:from-teal-500 dark:to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-2xl group-hover:scale-110 transition-all duration-300 pulse-glow">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Our AI analyzes each resume against your job requirements, evaluating skills, experience,
                education, and cultural fit with advanced natural language processing.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 dark:from-cyan-500 dark:to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-2xl group-hover:scale-110 transition-all duration-300 pulse-glow">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Get Results</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Receive ranked candidates with detailed match scores, skill analysis, and hiring recommendations.
                Export results and make informed hiring decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card-strong p-12 animate-scale-in dark:bg-gray-800/60 dark:border-gray-700">
            <div className="text-center mb-12 animate-slide-in-up">
              <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                Trusted by HR Professionals
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Join thousands of companies using AI-powered recruitment
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 stagger-children">
              <div className="text-center group">
                <div className="metric-value mb-2 group-hover:scale-110 transition-transform duration-300">10,000+</div>
                <div className="metric-label">Resumes Analyzed</div>
              </div>
              <div className="text-center group">
                <div className="metric-value mb-2 group-hover:scale-110 transition-transform duration-300">95%</div>
                <div className="metric-label">Accuracy Rate</div>
              </div>
              <div className="text-center group">
                <div className="metric-value mb-2 group-hover:scale-110 transition-transform duration-300">60%</div>
                <div className="metric-label">Time Saved</div>
              </div>
              <div className="text-center group">
                <div className="metric-value mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
                <div className="metric-label">Companies</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card-strong p-12 animate-bounce-in dark:bg-gray-800/60 dark:border-gray-700">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
              Ready to Transform Your Hiring?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Start using AI-powered resume analysis today and discover the perfect candidates for your team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/upload"
                className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 dark:hover:from-emerald-700 dark:hover:via-teal-700 dark:hover:to-cyan-700 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
              >
                <Upload className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                <span>Get Started Now</span>
              </Link>
              <Link
                to="/analytics"
                className="btn-secondary font-bold text-lg group"
              >
                <BarChart3 className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                <span>View Demo</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}