export function HeroSection() {
  return (
    <section className="text-center py-16 text-white">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
        AI-Powered Resume Ranking
      </h1>
      <p className="text-lg md:text-xl opacity-90 max-w-4xl mx-auto leading-relaxed">
        Upload job descriptions and resumes to get intelligent candidate matching using advanced AI analysis. 
        Find the perfect candidates faster with our smart ranking system powered by TalentAI Neural Engine.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
        <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
          ⚡ Fast AI Analysis
        </div>
        <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
          🎯 Smart Matching
        </div>
        <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
          📊 Deep Analytics
        </div>
        <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
          🔒 Secure Processing
        </div>
      </div>
    </section>
  );
}