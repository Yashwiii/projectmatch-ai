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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Student Dashboard
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">{currentUser.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Welcome back, {currentUser.name} 👋
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            You have <strong className="text-slate-900 font-semibold">{projects.length} active projects</strong> and high compatibility with several campus candidates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="dash-btn-find-team"
            onClick={() => onNavigateToMatching(activeProject?.id)}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Match Teammates</span>
          </button>

          <button
            id="dash-btn-create-project"
            onClick={onOpenCreateProject}
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-300 shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Profile Completion Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md">
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
              onClick={onNavigateToProfile}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition-colors whitespace-nowrap cursor-pointer"
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
              <FolderKanban className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Active Projects</h2>
            </div>
            <button
              onClick={onNavigateToProjects}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>View All ({projects.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
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
                  className={`bg-white rounded-xl p-5 border transition-all ${
                    isSelected
                      ? "border-indigo-500 ring-2 ring-indigo-500/10 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="bg-indigo-50 text-indigo-700 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-indigo-100">
                          {project.projectType}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {project.domain}
                        </span>
                        {isSelected && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            Active in Matcher
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {project.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-md font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                    <span className="text-[11px] text-slate-400 self-center">
                      +{project.preferredSkills.length} preferred
                    </span>
                  </div>

                  {/* Footer Stats & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-4 text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Roster: <strong className="text-slate-800 font-bold">{selectedCount}/{targetSize}</strong>
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{project.weeklyCommitment}h / wk</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          onSelectActiveProject(project.id);
                          onNavigateToMatching(project.id);
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
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
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Top Matches for{" "}
                <span className="text-indigo-600 font-bold truncate inline-block max-w-[140px] align-bottom">
                  {activeProject?.title}
                </span>
              </h2>
            </div>
            <button
              onClick={() => onNavigateToMatching(activeProject?.id)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              See All →
            </button>
          </div>

          <div className="space-y-3.5">
            {candidateRecommendations.map(({ student, match }) => {
              const isAdded = activeProject?.selectedTeamMemberIds.includes(student.id);

              return (
                <div
                  key={student.id}
                  id={`dashboard-candidate-${student.id}`}
                  className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/20"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-900 text-sm">
                            {student.name}
                          </h3>
                          <span className="text-[11px] text-slate-500">
                            {student.year}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-700 font-medium">
                          {match.roleFit}
                        </p>
                      </div>
                    </div>

                    {/* Match Badge */}
                    <div className="text-right">
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {match.overallScore}%
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Match</p>
                    </div>
                  </div>

                  {/* Why this match short highlight */}
                  <div className="mt-3 bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs space-y-1">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      Key AI Rationale
                    </div>
                    <div className="text-emerald-800 font-medium flex items-center space-x-1.5 text-[11px]">
                      <span>{match.positiveReasons[0] || "✓ High technical alignment"}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">
                      ⏱ {student.weeklyAvailability}h/wk availability
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewStudentDetail(student)}
                        className="text-slate-600 hover:text-slate-900 font-medium px-2 py-1 cursor-pointer"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => onNavigateToMatching(activeProject?.id)}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold px-2 py-1 cursor-pointer"
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
          <div className="bg-slate-100/70 rounded-xl p-4 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>Projects seeking your skills</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Other student leads are seeking Python, PyTorch & Deep Learning contributors.
            </p>
            <div className="space-y-2">
              {recommendedProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-800 block truncate">{p.title}</span>
                    <span className="text-[11px] text-slate-500">{p.domain} · {p.projectType}</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectActiveProject(p.id);
                      onNavigateToMatching(p.id);
                    }}
                    className="text-indigo-600 font-semibold hover:underline shrink-0 cursor-pointer"
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
