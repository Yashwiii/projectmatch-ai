import React from "react";
import {
  StudentProfile,
  Project,
} from "../types";
import {
  PlusCircle,
  Sparkles,
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Compass,
  Briefcase,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  PieChart,
} from "lucide-react";
import { calculateStudentMatch } from "../utils/matchingEngine";

interface DashboardViewProps {
  currentUser: StudentProfile;
  projects: Project[];
  students: StudentProfile[];
  activeProjectId: string;
  onSelectActiveProject: (projectId: string) => void;
  onOpenCreateProject: () => void;
  onNavigateToMatching: (projectId?: string) => void;
  onNavigateToProfile: () => void;
  onNavigateToProjects: () => void;
  onViewStudentDetail: (student: StudentProfile) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  projects,
  students,
  activeProjectId,
  onSelectActiveProject,
  onOpenCreateProject,
  onNavigateToMatching,
  onNavigateToProfile,
  onNavigateToProjects,
  onViewStudentDetail,
}) => {
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Calculate profile completion percentage
  let profileScore = 0;
  if (currentUser.name) profileScore += 10;
  if (currentUser.department) profileScore += 10;
  if (currentUser.bio) profileScore += 10;
  if (currentUser.skills.length >= 3) profileScore += 20;
  if (currentUser.interests.length >= 2) profileScore += 15;
  if (currentUser.preferredRoles.length >= 1) profileScore += 10;
  if (currentUser.previousProjects.length >= 1) profileScore += 15;
  if (currentUser.github || currentUser.linkedin) profileScore += 10;

  // Calculate top recommended teammates for the active project
  const candidateRecommendations = students
    .filter((s) => !s.isCurrentUser)
    .map((student) => {
      const match = calculateStudentMatch(student, activeProject);
      return {
        student,
        match,
      };
    })
    .sort((a, b) => b.match.overallScore - a.match.overallScore)
    .slice(0, 3);

  // Recommended projects for the current user based on user's skills
  const recommendedProjects = projects.filter((p) => p.id !== activeProject?.id).slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-150">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900">
              Student Dashboard
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{currentUser.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Welcome back, {currentUser.name} 👋
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            You have <strong className="text-slate-900 dark:text-white font-semibold">{projects.length} active projects</strong> and high compatibility with several campus candidates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            id="dash-btn-find-team"
            onClick={() => onNavigateToMatching(activeProject?.id)}
            aria-label="Match teammates for active project"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Match Teammates</span>
          </button>

          <button
            type="button"
            id="dash-btn-create-project"
            onClick={onOpenCreateProject}
            aria-label="Create a new project"
            className="inline-flex items-center space-x-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Profile Completion Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Profile Readiness
              </span>
              <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-400/30">
                {profileScore}% Completed
              </span>
            </div>
            <h2 className="text-lg font-bold">
              {profileScore >= 90
                ? "Your student profile is primed for optimal AI matchmaking!"
                : "Complete your profile to unlock higher ranking precision"}
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Matching models factor in your hard skills, weekly availability ({currentUser.weeklyAvailability} hrs/wk), preferred roles, and past project portfolio.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Progress Bar Container */}
            <div className="w-44 hidden sm:block">
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                <span>Completion</span>
                <span>{profileScore}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${profileScore}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToProfile}
              aria-label="Edit student profile"
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition-colors whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden"
            >
              Edit Profile →
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Active Projects & Recommended Teammates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Active Projects (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FolderKanban className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Projects</h2>
            </div>
            <button
              type="button"
              onClick={onNavigateToProjects}
              aria-label={`View all ${projects.length} projects`}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center space-x-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden rounded"
            >
              <span>View All ({projects.length})</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-4">
            {projects.map((project) => {
              const isSelected = project.id === activeProject?.id;
              const selectedCount = project.selectedTeamMemberIds.length;
              const targetSize = project.requiredTeamSize;

              return (
                <div
                  key={project.id}
                  id={`dashboard-project-card-${project.id}`}
                  className={`bg-white dark:bg-slate-900 rounded-xl p-5 border transition-all ${
                    isSelected
                      ? "border-indigo-500 ring-2 ring-indigo-500/10 dark:ring-indigo-500/20 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900">
                          {project.projectType}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {project.domain}
                        </span>
                        {isSelected && (
                          <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/80">
                            Active in Matcher
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {project.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] px-2 py-0.5 rounded-md font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 self-center">
                      +{project.preferredSkills.length} preferred
                    </span>
                  </div>

                  {/* Footer Stats & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-4 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                        <span>
                          Roster: <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedCount}/{targetSize}</strong>
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                        <span>{project.weeklyCommitment}h / wk</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectActiveProject(project.id);
                          onNavigateToMatching(project.id);
                        }}
                        aria-label={`Match candidates for ${project.title}`}
                        className="bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
                      >
                        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Match Candidates</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Top Recommended Teammates (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Top Matches for{" "}
                <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate inline-block max-w-[140px] align-bottom">
                  {activeProject?.title}
                </span>
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToMatching(activeProject?.id)}
              aria-label="See all matches in Explainable Matcher"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden rounded"
            >
              See All →
            </button>
          </div>

          <div className="space-y-3.5">
            {candidateRecommendations.map(({ student, match }) => {
              return (
                <div
                  key={student.id}
                  id={`dashboard-candidate-${student.id}`}
                  className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={student.avatar}
                        alt={`${student.name}'s profile avatar`}
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/20"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            {student.name}
                          </h3>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {student.year}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">
                          {match.roleFit}
                        </p>
                      </div>
                    </div>

                    {/* Match Badge */}
                    <div className="text-right">
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                        {match.overallScore}%
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Match</p>
                    </div>
                  </div>

                  {/* Why this match short highlight */}
                  <div className="mt-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2.5 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      Key AI Rationale
                    </div>
                    <div className="text-emerald-800 dark:text-emerald-300 font-medium flex items-center space-x-1.5 text-[11px]">
                      <span>{match.positiveReasons[0] || "✓ High technical alignment"}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      ⏱ {student.weeklyAvailability}h/wk availability
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => onViewStudentDetail(student)}
                        aria-label={`View full profile of ${student.name}`}
                        className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium px-2 py-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden rounded"
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigateToMatching(activeProject?.id)}
                        aria-label={`Explain match score for ${student.name}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold px-2 py-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden rounded"
                      >
                        Explain Score →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommended Projects Box */}
          <div className="bg-slate-100/70 dark:bg-slate-900/80 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <span>Projects seeking your skills</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Other student leads are seeking Python, PyTorch & Deep Learning contributors.
            </p>
            <div className="space-y-2">
              {recommendedProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{p.title}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{p.domain} · {p.projectType}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectActiveProject(p.id);
                      onNavigateToMatching(p.id);
                    }}
                    aria-label={`View project details for ${p.title}`}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden rounded"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
