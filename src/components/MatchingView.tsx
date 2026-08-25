import React, { useState, useMemo } from "react";
import {
  StudentProfile,
  Project,
  CandidateMatch,
  TeamGapAnalysis,
} from "../types";
import {
  calculateStudentMatch,
  calculateTeamGapAnalysis,
} from "../utils/matchingEngine";
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Users,
  Plus,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  ArrowRight,
  ShieldAlert,
  Clock,
  Briefcase,
  SlidersHorizontal,
  Compass,
  Zap,
} from "lucide-react";

interface MatchingViewProps {
  project: Project;
  allStudents: StudentProfile[];
  allProjects: Project[];
  onSelectProject: (projectId: string) => void;
  onUpdateProjectTeam: (projectId: string, teamMemberIds: string[]) => void;
  onViewStudentDetail: (student: StudentProfile) => void;
  onCreateProjectClick: () => void;
}

export const MatchingView: React.FC<MatchingViewProps> = ({
  project,
  allStudents,
  allProjects,
  onSelectProject,
  onUpdateProjectTeam,
  onViewStudentDetail,
  onCreateProjectClick,
}) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [sortBy, setSortBy] = useState<"score" | "availability" | "experience">("score");

  // Expanded "Why this match?" cards state (store IDs of open cards)
  const [expandedWhyMatch, setExpandedWhyMatch] = useState<Record<string, boolean>>({
    // Keep first one expanded by default for discoverability
  });

  const toggleWhyMatch = (studentId: string) => {
    setExpandedWhyMatch((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // Selected students for the current project
  const selectedMembers = useMemo(() => {
    return allStudents.filter((s) =>
      project.selectedTeamMemberIds.includes(s.id)
    );
  }, [allStudents, project.selectedTeamMemberIds]);

  // Compute matches for all students against current project
  const candidateMatches: CandidateMatch[] = useMemo(() => {
    return allStudents
      .filter((s) => !s.isCurrentUser) // Exclude current logged in user from candidates
      .map((student) => ({
        student,
        match: calculateStudentMatch(student, project),
      }));
  }, [allStudents, project]);

  // Automatically expand first candidate's why match on load
  React.useEffect(() => {
    if (candidateMatches.length > 0) {
      setExpandedWhyMatch((prev) => {
        if (Object.keys(prev).length === 0) {
          return { [candidateMatches[0].student.id]: true };
        }
        return prev;
      });
    }
  }, [project.id]);

  // Calculate Team Gap Analysis
  const gapAnalysis: TeamGapAnalysis = useMemo(() => {
    return calculateTeamGapAnalysis(
      project,
      selectedMembers,
      allStudents.filter((s) => !s.isCurrentUser)
    );
  }, [project, selectedMembers, allStudents]);

  // Filter & Sort candidates
  const filteredCandidates = useMemo(() => {
    return candidateMatches
      .filter(({ student, match }) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = student.name.toLowerCase().includes(q);
          const matchesDept = student.department.toLowerCase().includes(q);
          const matchesSkill = student.skills.some((sk) =>
            sk.toLowerCase().includes(q)
          );
          if (!matchesName && !matchesDept && !matchesSkill) return false;
        }

        // Role filter
        if (selectedRoleFilter !== "ALL") {
          const hasRole = student.preferredRoles.some((r) =>
            r.toLowerCase().includes(selectedRoleFilter.toLowerCase())
          );
          if (!hasRole) return false;
        }

        // Department filter
        if (selectedDeptFilter !== "ALL") {
          if (!student.department.includes(selectedDeptFilter)) return false;
        }

        // Minimum match score
        if (match.overallScore < minMatchScore) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "score") {
          return b.match.overallScore - a.match.overallScore;
        } else if (sortBy === "availability") {
          return b.student.weeklyAvailability - a.student.weeklyAvailability;
        } else {
          const expOrder = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
          return expOrder[b.student.experienceLevel] - expOrder[a.student.experienceLevel];
        }
      });
  }, [candidateMatches, searchQuery, selectedRoleFilter, selectedDeptFilter, minMatchScore, sortBy]);

  // Handle Team Member toggle
  const toggleTeamMember = (studentId: string) => {
    const isCurrentlySelected = project.selectedTeamMemberIds.includes(studentId);
    let updated: string[];
    if (isCurrentlySelected) {
      updated = project.selectedTeamMemberIds.filter((id) => id !== studentId);
    } else {
      if (project.selectedTeamMemberIds.length >= (project.requiredTeamSize || 5)) {
        alert(`Target team size of ${project.requiredTeamSize} reached. You can still add candidates or remove existing ones.`);
      }
      updated = [...project.selectedTeamMemberIds, studentId];
    }
    onUpdateProjectTeam(project.id, updated);
  };

  // Get score color styling
  const getScoreBadgeClass = (score: number) => {
    if (score >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-500/20";
    if (score >= 75) return "bg-indigo-50 text-indigo-700 border-indigo-300 ring-1 ring-indigo-500/20";
    if (score >= 60) return "bg-blue-50 text-blue-700 border-blue-300";
    return "bg-amber-50 text-amber-700 border-amber-300";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Project Context Switcher & Overview Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                Explainable Matching Engine
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">
                {project.projectType}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
                Domain: {project.domain}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {project.title}
              </h1>

              {/* Project Selector dropdown */}
              {allProjects.length > 1 && (
                <select
                  value={project.id}
                  onChange={(e) => onSelectProject(e.target.value)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 font-semibold text-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none cursor-pointer"
                >
                  {allProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      Switch to: {p.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {project.description}
            </p>

            {/* Target Spec Badges */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-slate-600">
              <div>
                <strong className="text-slate-900 font-bold">Required Skills:</strong>{" "}
                {project.requiredSkills.join(", ")}
              </div>
              <div className="text-slate-300 hidden sm:inline">|</div>
              <div>
                <strong className="text-slate-900 font-bold">Target Roles:</strong>{" "}
                {project.requiredRoles.join(", ")}
              </div>
              <div className="text-slate-300 hidden sm:inline">|</div>
              <div>
                <strong className="text-slate-900 font-bold">Commitment:</strong>{" "}
                {project.weeklyCommitment} hrs/week ({project.duration})
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onCreateProjectClick}
              className="bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              + Create Another Project
            </button>
          </div>
        </div>
      </div>

      {/* Main Matching Grid: Candidates (8 cols) + Team Gap Analysis (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* LEFT COLUMN: Filter Bar + Ranked Candidate Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Filter & Controls Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search */}
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate name, skill (e.g. PyTorch), or role..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              {/* Role filter */}
              <div className="sm:col-span-3">
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:bg-white focus:outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ML">ML / AI Engineer</option>
                  <option value="Frontend">Frontend Dev</option>
                  <option value="Backend">Backend Engineer</option>
                  <option value="UI/UX">UI/UX Designer</option>
                  <option value="Data">Data Scientist</option>
                  <option value="Smart Contract">Smart Contract Dev</option>
                  <option value="Embedded">Embedded / Robotics</option>
                  <option value="Product">Product Manager</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="sm:col-span-3">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "score" | "availability" | "experience")
                  }
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:bg-white focus:outline-none"
                >
                  <option value="score">Sort: Match % (Highest)</option>
                  <option value="availability">Sort: Availability (Hours)</option>
                  <option value="experience">Sort: Experience Level</option>
                </select>
              </div>
            </div>

            {/* Quick Pills Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center space-x-2 text-slate-500">
                <span className="font-semibold text-slate-700">
                  Showing {filteredCandidates.length} candidate{filteredCandidates.length === 1 ? "" : "s"}
                </span>
                <span>•</span>
                <span className="text-[11px]">
                  Ranked by 40% Skills, 20% Domain, 15% Hours, 15% Exp, 10% Role
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-[11px]">Min Match:</span>
                {[0, 70, 85].map((score) => (
                  <button
                    key={score}
                    onClick={() => setMinMatchScore(score)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      minMatchScore === score
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {score === 0 ? "All" : `${score}%+`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Candidate Cards List */}
          <div className="space-y-4">
            {filteredCandidates.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No candidates match filters</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try clearing your search query or lowering the minimum match percentage.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedRoleFilter("ALL");
                    setMinMatchScore(0);
                  }}
                  className="mt-3 text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredCandidates.map(({ student, match }, index) => {
                const isSelected = project.selectedTeamMemberIds.includes(student.id);
                const isWhyExpanded = !!expandedWhyMatch[student.id];

                return (
                  <div
                    key={student.id}
                    id={`candidate-card-${student.id}`}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isSelected
                        ? "border-emerald-500 ring-2 ring-emerald-500/15 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    {/* Card Top Section */}
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Student Avatar & Identity */}
                        <div className="flex items-start space-x-3.5">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-13 h-13 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-xs shrink-0"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-extrabold text-slate-900 text-base hover:text-indigo-600 cursor-pointer"
                                onClick={() => onViewStudentDetail(student)}
                              >
                                {student.name}
                              </h3>
                              <span className="text-xs text-slate-500 font-medium">
                                ({student.year})
                              </span>
                              <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                                {student.department}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-indigo-700 mt-0.5">
                              Role Fit: {match.roleFit}
                            </p>

                            <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                              {student.bio}
                            </p>
                          </div>
                        </div>

                        {/* Match Percentage Pill & Primary Actions */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                          {/* Large Explainable Match Badge */}
                          <div
                            className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl border font-black text-sm ${getScoreBadgeClass(
                              match.overallScore
                            )}`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{match.overallScore}% Match</span>
                          </div>

                          {/* Add / Remove from Team Toggle Button */}
                          <button
                            id={`btn-toggle-candidate-${student.id}`}
                            onClick={() => toggleTeamMember(student.id)}
                            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer flex items-center space-x-1.5 ${
                              isSelected
                                ? "bg-emerald-600 hover:bg-rose-600 text-white group"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 group-hover:hidden" />
                                <Trash2 className="w-3.5 h-3.5 hidden group-hover:inline" />
                                <span className="group-hover:hidden">In Team Roster</span>
                                <span className="hidden group-hover:inline">Remove Member</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to Team</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Matching Skills & Shared Interests Tags */}
                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block mb-1">
                            Matching Skills
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {match.matchingSkills.length > 0 ? (
                              match.matchingSkills.map((sk) => (
                                <span
                                  key={sk}
                                  className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold px-2 py-0.5 rounded-md text-[11px]"
                                >
                                  ✓ {sk}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">No direct keyword overlap</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block mb-1">
                            Shared Domain & Availability
                          </span>
                          <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-700 font-medium">
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md">
                              🏷 {match.sharedInterests[0] || project.domain}
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              ⏱ {match.availabilityComparison} · {student.experienceLevel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expandable "Why this match?" Trigger */}
                      <div className="mt-3.5 pt-2 flex items-center justify-between">
                        <button
                          id={`btn-why-match-${student.id}`}
                          onClick={() => toggleWhyMatch(student.id)}
                          className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {isWhyExpanded ? "Hide Explainable Breakdown" : "Why this match? (Explainable AI)"}
                          </span>
                          {isWhyExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => onViewStudentDetail(student)}
                          className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Full Profile & Portfolio</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Requirement #7: EXPLAINABLE MATCHING DETAIL SECTION */}
                    {isWhyExpanded && (
                      <div className="bg-slate-50/90 border-t border-slate-200 p-5 space-y-4 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-600" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              Explainable AI Match Breakdown
                            </h4>
                          </div>
                          <span className="text-xs text-slate-500 font-semibold">
                            Total Compatibility: <strong className="text-slate-900 font-black">{match.overallScore}%</strong>
                          </span>
                        </div>

                        {/* Positive Reasons Checklist (✓) & Warning Points (⚠) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Positive Drivers */}
                          <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Key Match Drivers</span>
                            </span>
                            <ul className="space-y-1.5 text-xs text-slate-700">
                              {match.positiveReasons.map((reason, idx) => (
                                <li key={idx} className="flex items-start space-x-1.5 leading-snug">
                                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                  <span>{reason.replace(/^✓\s*/, "")}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Caution & Growth Points */}
                          <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-2xs space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Considerations & Skill Gaps</span>
                            </span>
                            <ul className="space-y-1.5 text-xs text-slate-700">
                              {match.warningReasons.length > 0 ? (
                                match.warningReasons.map((warn, idx) => (
                                  <li key={idx} className="flex items-start space-x-1.5 text-amber-900 leading-snug">
                                    <span className="text-amber-600 font-bold shrink-0">⚠</span>
                                    <span>{warn.replace(/^⚠\s*/, "")}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-slate-500 italic text-xs">
                                  No notable risks or critical gaps identified.
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* 5-Pillar Mathematical Weight Bars */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Mathematical Factor Scores (Weighted Total: 100%)
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                            {/* Skill: 40% */}
                            <div>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="font-semibold text-slate-600">Skills (40%)</span>
                                <span className="font-bold text-slate-900">{match.breakdown.skillScore}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${match.breakdown.skillScore}%` }}
                                />
                              </div>
                            </div>

                            {/* Interest: 20% */}
                            <div>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="font-semibold text-slate-600">Domain (20%)</span>
                                <span className="font-bold text-slate-900">{match.breakdown.interestScore}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{ width: `${match.breakdown.interestScore}%` }}
                                />
                              </div>
                            </div>

                            {/* Availability: 15% */}
                            <div>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="font-semibold text-slate-600">Hours (15%)</span>
                                <span className="font-bold text-slate-900">{match.breakdown.availabilityScore}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${match.breakdown.availabilityScore}%` }}
                                />
                              </div>
                            </div>

                            {/* Experience: 15% */}
                            <div>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="font-semibold text-slate-600">Exp (15%)</span>
                                <span className="font-bold text-slate-900">{match.breakdown.experienceScore}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-cyan-500 rounded-full"
                                  style={{ width: `${match.breakdown.experienceScore}%` }}
                                />
                              </div>
                            </div>

                            {/* Role: 10% */}
                            <div>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="font-semibold text-slate-600">Role (10%)</span>
                                <span className="font-bold text-slate-900">{match.breakdown.roleScore}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-purple-500 rounded-full"
                                  style={{ width: `${match.breakdown.roleScore}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: TEAM GAP ANALYSIS & ROSTER (Requirement #8) (4 cols) */}
        <div className="lg:col-span-4 sticky top-20 space-y-5">
          <div
            id="team-gap-analysis-panel"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5"
          >
            {/* Header with Team Size & Completeness Score */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Team Gap Analysis</span>
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  Roster: {selectedMembers.length} / {project.requiredTeamSize}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-2">
                <h3 className="font-bold text-slate-900 text-base">Squad Completeness</h3>
                <span className="text-2xl font-black text-indigo-600">
                  {gapAnalysis.completenessScore}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${gapAnalysis.completenessScore}%` }}
                />
              </div>
            </div>

            {/* Current Team Roster Badges */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Selected Team Members ({selectedMembers.length})
              </span>

              {selectedMembers.length === 0 ? (
                <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  Click <strong>"Add to Team"</strong> on any candidate card to begin building your roster.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5 truncate pr-2">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="truncate">
                          <span className="font-bold text-slate-900 block truncate">
                            {member.name}
                          </span>
                          <span className="text-[10px] text-indigo-600 font-medium">
                            {member.preferredRoles[0]}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleTeamMember(member.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Advisor Strategic Summary */}
            <div className="bg-indigo-50/70 rounded-xl p-3.5 border border-indigo-100 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 flex items-center space-x-1 mb-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>AI Team Advisor</span>
              </span>
              <p className="text-slate-700 leading-relaxed">
                {gapAnalysis.recommendationSummary}
              </p>
            </div>

            {/* Covered vs Missing Skills */}
            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              {/* Covered Skills */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1.5">
                  Covered Skills ({gapAnalysis.coveredSkills.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {gapAnalysis.coveredSkills.length > 0 ? (
                    gapAnalysis.coveredSkills.map((cs) => (
                      <span
                        key={cs.skill}
                        className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-semibold"
                        title={`Covered by: ${cs.coveredBy.join(", ")}`}
                      >
                        ✓ {cs.skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs italic">No skills covered yet</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block mb-1.5">
                  Missing Skills ({gapAnalysis.missingSkills.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {gapAnalysis.missingSkills.length > 0 ? (
                    gapAnalysis.missingSkills.map((ms) => (
                      <span
                        key={ms.skill}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          ms.isRequired
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ms.isRequired ? "✕ Required: " : "○ "}
                        {ms.skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-emerald-700 font-semibold text-xs flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>All target skills fully covered!</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Missing Roles */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1.5">
                  Missing Roles ({gapAnalysis.missingRoles.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {gapAnalysis.missingRoles.length > 0 ? (
                    gapAnalysis.missingRoles.map((role) => (
                      <span
                        key={role}
                        className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-semibold"
                      >
                        Needs: {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-emerald-700 font-semibold text-xs flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>All required roles filled!</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Recommended Next Teammate Spotlight */}
            {gapAnalysis.bestNextCandidates.length > 0 && selectedMembers.length < project.requiredTeamSize && (
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-4 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Recommended Next Recruit</span>
                  </span>
                  <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Fills Gaps
                  </span>
                </div>

                {(() => {
                  const topPick = gapAnalysis.bestNextCandidates[0];
                  return (
                    <div>
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={topPick.student.avatar}
                          alt={topPick.student.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-400"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-white">
                            {topPick.student.name}
                          </h4>
                          <p className="text-xs text-indigo-300">
                            {topPick.student.preferredRoles[0]} · {topPick.student.department}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-300 space-y-1 bg-slate-800/80 p-2 rounded-lg">
                        {topPick.fillsMissingSkills.length > 0 && (
                          <div className="text-emerald-400">
                            + Resolves missing skill: <strong>{topPick.fillsMissingSkills.join(", ")}</strong>
                          </div>
                        )}
                        {topPick.fillsMissingRoles.length > 0 && (
                          <div className="text-cyan-300">
                            + Fills open role: <strong>{topPick.fillsMissingRoles.join(", ")}</strong>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => toggleTeamMember(topPick.student.id)}
                        className="mt-3 w-full bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add {topPick.student.name.split(" ")[0]} to Roster</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
