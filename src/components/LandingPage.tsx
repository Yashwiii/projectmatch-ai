import React from "react";
import {
  Sparkles,
  Users,
  BrainCircuit,
  PieChart,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Layers,
  Search,
  Check,
  ShieldCheck,
  Target,
  Clock,
  Compass,
} from "lucide-react";

interface LandingPageProps {
  onFindTeam: () => void;
  onCreateProject: () => void;
  onExploreDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onFindTeam,
  onCreateProject,
  onExploreDashboard,
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white via-indigo-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-900/80 rounded-full px-4 py-1.5 mb-6 text-xs font-semibold text-indigo-800 dark:text-indigo-300 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Collegiate Team Intelligence & Gap Analysis</span>
          </div>

          {/* Title & Tagline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-4">
            Build the right team <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 dark:from-indigo-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              for the right project.
            </span>
          </h1>

          {/* Short Problem / Solution Explanation */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
            College projects, hackathons, and student startups fail when teams lack complementary skillsets, balanced weekly availability, or clear role distributions. 
            <strong className="text-slate-800 dark:text-slate-100 font-semibold"> ProjectMatch AI</strong> uses explainable AI matching algorithms to evaluate hard skills, domain affinity, and schedule alignment — showing exactly <em>why</em> candidates fit.
          </p>

          {/* Primary Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
            <button
              id="landing-cta-find-team"
              type="button"
              onClick={onFindTeam}
              aria-label="Find Your Team and explore matches"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-150 active:scale-98 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>Find Your Team</span>
              <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </button>

            <button
              id="landing-cta-create-project"
              type="button"
              onClick={onCreateProject}
              aria-label="Create a new project"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-base font-semibold px-7 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
            >
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <span>Create Project</span>
            </button>

            <button
              id="landing-cta-dashboard"
              type="button"
              onClick={onExploreDashboard}
              aria-label="Explore Student Hub Dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-3 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden rounded-xl"
            >
              <span>Explore Student Hub →</span>
            </button>
          </div>

          {/* Live Interactive Teaser Card */}
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden text-left p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Live Matchmaker Preview
                </span>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900">
                Target: NeuroScan AI (Research)
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Candidate Info */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=faces"
                    alt="Elena"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/20"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Elena Rostova</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Senior · Data Science & Medical Imaging</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs px-2 py-0.5 rounded-md font-medium border border-emerald-200 dark:border-emerald-800/70">
                    PyTorch (Matches Req)
                  </span>
                  <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs px-2 py-0.5 rounded-md font-medium border border-emerald-200 dark:border-emerald-800/70">
                    Computer Vision
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-md font-medium">
                    20 hrs/wk Available
                  </span>
                </div>
              </div>

              {/* Explainable Score Drilldown */}
              <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Explainable Match</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">94%</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>PyTorch matches required skill</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Healthcare interest matches domain</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Limited UI/UX frontend experience</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Feature Cards Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Designed for Explainable Team Craftsmanship
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-base">
            Never wonder why a candidate was recommended. Every match delivers transparent, mathematical breakdowns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Smart Matching */}
          <div
            id="feature-card-smart-matching"
            className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Smart Matching</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
              Multi-dimensional compatibility algorithm evaluating 5 key pillars: hard skills (40%), domain interest (20%), availability (15%), experience (15%), and role complementarity (10%).
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-indigo-500" />
                <span>Deterministic, objective weighting</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-indigo-500" />
                <span>Synchronized schedule & weekly hour checks</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Explainable Recommendations */}
          <div
            id="feature-card-explainable-recommendations"
            className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Explainable Recommendations
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
              Every score comes with human-readable "Why this match?" justifications: positive drivers, past project precedents, and explicit caution flags where skills or availability diverge.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Transparent scoring checklist</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Zero black-box hallucinations</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Team Gap Analysis */}
          <div
            id="feature-card-team-gap-analysis"
            className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Team Gap Analysis</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
              Live roster analysis shows covered versus missing skills, highlights missing roles (e.g. "needs UI/UX designer"), and dynamically suggests the optimal next teammate to complete the squad.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Real-time Team Completeness Index</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Next-Candidate Gap Resolver spotlight</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3-Step "How It Works" Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Simple 3-Step Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              How ProjectMatch AI Works
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
              From raw project idea to a complete, balanced team roster in under 2 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 relative">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Post or Analyze Project
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Describe your project, hackathon target, or research goal. Click <strong>"Analyze with AI"</strong> to automatically extract domain, skill matrix, required roles, and weekly hour targets.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 relative">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Review Ranked Candidates
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Explore student candidates ranked by mathematical compatibility. Open <strong>"Why this match?"</strong> to verify matching skills, shared domain passions, and availability notes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 relative">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Resolve Gaps & Finalize
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Add candidates to your live roster. The <strong>Team Gap Analysis</strong> monitors missing technical capabilities in real time and pinpoints the single best next candidate.
              </p>
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div className="mt-14 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-8 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border border-slate-800">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Ready to find your hackathon or research team?
              </h3>
              <p className="text-slate-300 text-sm mt-1">
                Start matching across 8+ specialized student engineering and design profiles.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onFindTeam}
                aria-label="Launch Team Matcher"
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
              >
                Launch Team Matcher
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
