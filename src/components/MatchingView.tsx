import React, { useState, useMemo } from "react";
import {
  StudentProfile,
  Project,
  CandidateMatch,
  TeamGapAnalysis,
  TeamHealthScore,
  TeamInvitation,
} from "../types";
import {
  calculateStudentMatch,
  calculateTeamGapAnalysis,
  calculateTeamHealthScore,
  getRoleRequirementReason,
  studentCoversRole,
  studentCoversSkill,
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
  Activity,
  HeartPulse,
  Send,
  Check,
  XCircle,
} from "lucide-react";

interface MatchingViewProps {
  project: Project;
  allStudents: StudentProfile[];
  allProjects: Project[];
  invitations: TeamInvitation[];
  onSelectProject: (projectId: string) => void;
  onUpdateProjectTeam: (projectId: string, teamMemberIds: string[]) => void;
  onSendTeamRequest: (projectId: string, candidate: StudentProfile, proposedRole: string, matchScore: number) => void;
  onRemoveTeamMember: (projectId: string, studentId: string) => void;
  onViewStudentDetail: (student: StudentProfile) => void;
  onCreateProjectClick: () => void;
}

interface MatchScoreRingProps {
  score: number;
  size?: number;
}

export const MatchScoreRing: React.FC<MatchScoreRingProps> = ({ score, size = 52 }) => {
  const getTier = (s: number) => {
    if (s >= 90) return { label: "Excellent Match", stroke: "#10b981", badge: "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" };
    if (s >= 75) return { label: "Strong Match", stroke: "#6366f1", badge: "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" };
    if (s >= 60) return { label: "Good Match", stroke: "#3b82f6", badge: "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" };
    return { label: "Low Match", stroke: "#f59e0b", badge: "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" };
  };

  const tier = getTier(score);
  const strokeWidth = 4.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center space-x-2.5 shrink-0">
      <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-700"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={tier.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-black text-slate-900 dark:text-white leading-none">
            {score}%
          </span>
        </div>
      </div>
      <div className="text-left shrink-0">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border inline-block ${tier.badge}`}>
          {tier.label}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">
          Match Score
        </span>
      </div>
    </div>
  );
};

export const MatchingView: React.FC<MatchingViewProps> = ({
  project,
  allStudents,
  allProjects,
  invitations,
  onSelectProject,
  onUpdateProjectTeam,
  onSendTeamRequest,
  onRemoveTeamMember,
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

  // Calculate Team Health Score
  const teamHealth: TeamHealthScore = useMemo(() => {
    return calculateTeamHealthScore(project, selectedMembers, gapAnalysis);
  }, [project, selectedMembers, gapAnalysis]);

  // Calculate Next Best Teammate
  const nextBestTeammateData = useMemo(() => {
    const unselectedCandidates = allStudents
      .filter((s) => !s.isCurrentUser && !project.selectedTeamMemberIds.includes(s.id))
      .map((st) => ({
        student: st,
        match: calculateStudentMatch(st, project),
      }));

    if (unselectedCandidates.length === 0) {
      return null;
    }

    // 1. Check for Missing Roles
    if (gapAnalysis.missingRoles.length > 0) {
      const missingRole = gapAnalysis.missingRoles[0];
      const whyNeeded = getRoleRequirementReason(missingRole, project);

      // Candidates who cover this missing role
      const candidatesForRole = unselectedCandidates.filter(({ student }) =>
        studentCoversRole(student, missingRole)
      );

      // Pick top candidate by match score
      const sorted = (candidatesForRole.length > 0 ? candidatesForRole : unselectedCandidates).sort(
        (a, b) => b.match.overallScore - a.match.overallScore
      );

      const top = sorted[0];
      if (!top) return null;

      // Extract 2-3 short reasons
      const reasons: string[] = [];
      reasons.push(`Fulfills open ${missingRole} requirement`);
      if (top.match.positiveReasons.length > 0) {
        reasons.push(top.match.positiveReasons[0].replace(/^✓\s*/, ""));
      }
      if (top.match.positiveReasons.length > 1) {
        reasons.push(top.match.positiveReasons[1].replace(/^✓\s*/, ""));
      } else {
        reasons.push(`${top.student.weeklyAvailability} hrs/wk availability (${top.match.availabilityComparison || "Meets target commitment"})`);
      }

      return {
        type: "missing_role" as const,
        missingRole,
        whyNeeded,
        candidate: top.student,
        matchScore: top.match.overallScore,
        reasons: reasons.slice(0, 3),
      };
    }

    // 2. Check for Missing Required Skills
    const missingReqSkills = gapAnalysis.missingSkills.filter((s) => s.isRequired);
    if (missingReqSkills.length > 0) {
      const missingSkill = missingReqSkills[0].skill;
      const whyNeeded = `Needed to cover critical technical requirements in ${missingSkill} for ${project.title}.`;

      const candidatesForSkill = unselectedCandidates.filter(({ student }) =>
        studentCoversSkill(student, missingSkill)
      );

      const sorted = (candidatesForSkill.length > 0 ? candidatesForSkill : unselectedCandidates).sort(
        (a, b) => b.match.overallScore - a.match.overallScore
      );

      const top = sorted[0];
      if (!top) return null;

      const reasons: string[] = [];
      reasons.push(`Covers open required skill: ${missingSkill}`);
      if (top.match.positiveReasons.length > 0) {
        reasons.push(top.match.positiveReasons[0].replace(/^✓\s*/, ""));
      }
      reasons.push(`${top.student.weeklyAvailability} hrs/wk availability (${top.match.availabilityComparison || "Meets target commitment"})`);

      return {
        type: "missing_skill" as const,
        missingRole: `Skill Gap: ${missingSkill}`,
        whyNeeded,
        candidate: top.student,
        matchScore: top.match.overallScore,
        reasons: reasons.slice(0, 3),
      };
    }

    // 3. All required skills and roles are covered (100% coverage)
    const hasCapacity = selectedMembers.length < project.requiredTeamSize;

    if (hasCapacity && unselectedCandidates.length > 0) {
      // Find candidate with complementary skill that current team does not strongly have
      const teamSkillSet = new Set<string>(
        selectedMembers.flatMap((m) => m.skills.map((s) => s.toLowerCase().trim()))
      );

      const complementaryCandidates = unselectedCandidates
        .map(({ student, match }) => {
          // Check if candidate has preferred skills not in team
          const missingPrefSkill = project.preferredSkills.find(
            (ps) =>
              studentCoversSkill(student, ps) &&
              !Array.from(teamSkillSet).some(
                (ts: string) =>
                  ts.includes(ps.toLowerCase().trim()) ||
                  ps.toLowerCase().trim().includes(ts)
              )
          );

          // Find candidate's top skill not in team
          const uniqueSkill = student.skills.find(
            (sk) =>
              !Array.from(teamSkillSet).some(
                (ts: string) =>
                  ts.includes(sk.toLowerCase().trim()) ||
                  sk.toLowerCase().trim().includes(ts)
              )
          );

          const complementarySkill =
            missingPrefSkill || uniqueSkill || student.skills[0] || "Cross-Functional Support";

          return {
            student,
            match,
            complementarySkill,
          };
        })
        .sort((a, b) => b.match.overallScore - a.match.overallScore);

      const topComp = complementaryCandidates[0];

      if (topComp && topComp.student) {
        let reason = `Brings specialized ${topComp.complementarySkill} expertise to enhance ${project.title} and accelerate development.`;
        if (topComp.match.positiveReasons.length > 0) {
          reason = `Brings ${topComp.complementarySkill} capabilities and ${topComp.match.positiveReasons[0].replace(/^✓\s*/, "")}.`;
        }

        return {
          type: "complementary" as const,
          candidate: topComp.student,
          matchScore: topComp.match.overallScore,
          complementarySkill: topComp.complementarySkill,
          reason,
        };
      }
    }

    // 4. Team capacity full or no meaningful candidate
    return {
      type: "complete" as const,
    };
  }, [allStudents, project, gapAnalysis, selectedMembers]);

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

  // Get score tier info and styling (Requirement #1)
  const getScoreTierInfo = (score: number) => {
    if (score >= 90) {
      return {
        label: "Excellent Match",
        strokeColor: "#10b981", // emerald-500
        textColor: "text-emerald-700",
        bgBadge: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20",
      };
    }
    if (score >= 75) {
      return {
        label: "Strong Match",
        strokeColor: "#6366f1", // indigo-500
        textColor: "text-indigo-700",
        bgBadge: "bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/20",
      };
    }
    if (score >= 60) {
      return {
        label: "Good Match",
        strokeColor: "#3b82f6", // blue-500
        textColor: "text-blue-700",
        bgBadge: "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20",
      };
    }
    return {
      label: "Low Match",
      strokeColor: "#f59e0b", // amber-500
      textColor: "text-amber-700",
      bgBadge: "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20",
    };
  };

  // Get score color styling
  const getScoreBadgeClass = (score: number) => {
    if (score >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-500/20";
    if (score >= 75) return "bg-indigo-50 text-indigo-700 border-indigo-300 ring-1 ring-indigo-500/20";
    if (score >= 60) return "bg-blue-50 text-blue-700 border-blue-300";
    return "bg-amber-50 text-amber-700 border-amber-300";
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-7">
      {/* Project Context Switcher & Overview Header */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900">
                Explainable Matching Engine
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {project.projectType}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                Domain: {project.domain}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {project.title}
              </h1>

              {/* Project Selector dropdown */}
              {allProjects.length > 1 && (
                <select
                  value={project.id}
                  onChange={(e) => onSelectProject(e.target.value)}
                  className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none cursor-pointer"
                >
                  {allProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      Switch to: {p.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {project.description}
            </p>

            {/* Target Spec Badges */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
              <div>
                <strong className="text-slate-900 dark:text-slate-200 font-bold">Required Skills:</strong>{" "}
                {project.requiredSkills.join(", ")}
              </div>
              <div className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</div>
              <div>
                <strong className="text-slate-900 dark:text-slate-200 font-bold">Target Roles:</strong>{" "}
                {project.requiredRoles.join(", ")}
              </div>
              <div className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</div>
              <div>
                <strong className="text-slate-900 dark:text-slate-200 font-bold">Commitment:</strong>{" "}
                {project.weeklyCommitment} hrs/week ({project.duration})
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onCreateProjectClick}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              + Create Another Project
            </button>
          </div>
        </div>
      </div>

      {/* Main Matching Grid: Candidates (Left) + Team Gap Analysis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-start w-full">
        {/* LEFT COLUMN: Filter Bar + Ranked Candidate Cards */}
        <div className="lg:col-span-7 xl:col-span-8 min-w-0 w-full space-y-5">
          {/* Filter & Controls Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search */}
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate name, skill (e.g. PyTorch), or role..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              {/* Role filter */}
              <div className="sm:col-span-3">
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
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
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                >
                  <option value="score">Sort: Match % (Highest)</option>
                  <option value="availability">Sort: Availability (Hours)</option>
                  <option value="experience">Sort: Experience Level</option>
                </select>
              </div>
            </div>

            {/* Quick Pills Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Showing {filteredCandidates.length} candidate{filteredCandidates.length === 1 ? "" : "s"}
                </span>
                <span>•</span>
                <span className="text-[11px]">
                  Ranked by 40% Skills, 20% Domain, 15% Hours, 15% Exp, 10% Role
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-400 dark:text-slate-500 text-[11px]">Min Match:</span>
                {[0, 70, 85].map((score) => (
                  <button
                    key={score}
                    onClick={() => setMinMatchScore(score)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      minMatchScore === score
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
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
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
                <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No candidates match filters</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Try clearing your search query or lowering the minimum match percentage.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedRoleFilter("ALL");
                    setMinMatchScore(0);
                  }}
                  className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredCandidates.map(({ student, match }, index) => {
                const isSelected = project.selectedTeamMemberIds.includes(student.id);
                const isWhyExpanded = !!expandedWhyMatch[student.id];

                // Check invitation status for this project & candidate
                const invitation = invitations.find(
                  (inv) => inv.projectId === project.id && inv.recipientId === student.id
                );
                const isPending = invitation?.status === "Pending" && !isSelected;
                const isAccepted = isSelected || invitation?.status === "Accepted";
                const isDeclined = invitation?.status === "Declined" && !isSelected;

                return (
                  <div
                    key={student.id}
                    id={`candidate-card-${student.id}`}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden w-full ${
                      isAccepted
                        ? "border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/15 shadow-sm"
                        : isPending
                        ? "border-amber-400/80 dark:border-amber-500/80 ring-1 ring-amber-500/20 shadow-2xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                    }`}
                  >
                    {/* Card Top Section */}
                    <div className="p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Student Avatar & Identity */}
                        <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-xs shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3
                                className="font-extrabold text-slate-900 dark:text-white text-base hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate"
                                onClick={() => onViewStudentDetail(student)}
                              >
                                {student.name}
                              </h3>
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
                                ({student.year})
                              </span>
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0">
                                {student.department}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 mt-0.5">
                              Role Fit: {match.roleFit}
                            </p>

                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                              {student.bio}
                            </p>
                          </div>
                        </div>

                        {/* Match Score Ring & Action Button */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0">
                          {/* Circular Match Score Ring */}
                          <MatchScoreRing score={match.overallScore} size={52} />

                          {/* Connect Action Button */}
                          {isAccepted ? (
                            <button
                              id={`btn-toggle-candidate-${student.id}`}
                              type="button"
                              onClick={() => onRemoveTeamMember(project.id, student.id)}
                              className="text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer flex items-center space-x-1.5 bg-emerald-600 hover:bg-rose-600 text-white group shadow-2xs shrink-0"
                              title="Click to remove member from team roster"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 group-hover:hidden" />
                              <Trash2 className="w-3.5 h-3.5 hidden group-hover:inline" />
                              <span className="group-hover:hidden">Connected ✓</span>
                              <span className="hidden group-hover:inline">Remove Member</span>
                            </button>
                          ) : isPending ? (
                            <div
                              id={`btn-toggle-candidate-${student.id}`}
                              className="text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 select-none shadow-2xs shrink-0"
                              title="Connection invitation sent. Waiting for candidate response."
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
                              <span>Connection Sent ✓ (Pending)</span>
                            </div>
                          ) : isDeclined ? (
                            <div className="flex items-center space-x-2 shrink-0">
                              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-1 shrink-0">
                                <XCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>Declined</span>
                              </span>
                              <button
                                id={`btn-toggle-candidate-${student.id}`}
                                type="button"
                                onClick={() =>
                                  onSendTeamRequest(project.id, student, match.roleFit, match.overallScore)
                                }
                                className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs shrink-0"
                              >
                                <Send className="w-3 h-3" />
                                <span>Connect</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`btn-toggle-candidate-${student.id}`}
                              type="button"
                              onClick={() =>
                                onSendTeamRequest(project.id, student, match.roleFit, match.overallScore)
                              }
                              className="text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs hover:shadow-sm shrink-0"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Connect</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Feature 1: Compact 5-Factor Score Breakdown */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs w-full">
                        {/* Skills */}
                        <div className="bg-slate-50/80 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60 min-w-0">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-semibold text-slate-600 dark:text-slate-400 truncate" title="Skills Match (40%)">
                              Skills (40%)
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-1">
                              {match.breakdown.skillScore}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${match.breakdown.skillScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Interest/Domain */}
                        <div className="bg-slate-50/80 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60 min-w-0">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-semibold text-slate-600 dark:text-slate-400 truncate" title="Interest & Domain Alignment (20%)">
                              Domain (20%)
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-1">
                              {match.breakdown.interestScore}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                              style={{ width: `${match.breakdown.interestScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Availability */}
                        <div className="bg-slate-50/80 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60 min-w-0">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-semibold text-slate-600 dark:text-slate-400 truncate" title="Weekly Availability (15%)">
                              Hours (15%)
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-1">
                              {match.breakdown.availabilityScore}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${match.breakdown.availabilityScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Experience */}
                        <div className="bg-slate-50/80 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60 min-w-0">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-semibold text-slate-600 dark:text-slate-400 truncate" title="Experience Level (15%)">
                              Exp (15%)
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-1">
                              {match.breakdown.experienceScore}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                              style={{ width: `${match.breakdown.experienceScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Role Complementarity */}
                        <div className="bg-slate-50/80 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60 col-span-2 sm:col-span-1 min-w-0">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-semibold text-slate-600 dark:text-slate-400 truncate" title="Role Complementarity (10%)">
                              Role Fit (10%)
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-1">
                              {match.breakdown.roleScore}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full transition-all duration-300"
                              style={{ width: `${match.breakdown.roleScore}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Matching Skills & Shared Interests Tags */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 font-semibold text-[10px] uppercase tracking-wider block mb-1">
                            Matching Skills
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {match.matchingSkills.length > 0 ? (
                              match.matchingSkills.map((sk) => (
                                <span
                                  key={sk}
                                  className="bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold px-2 py-0.5 rounded-md text-[11px]"
                                >
                                  ✓ {sk}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 text-[11px] italic">No direct keyword overlap</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 dark:text-slate-500 font-semibold text-[10px] uppercase tracking-wider block mb-1">
                            Shared Domain & Availability
                          </span>
                          <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                            <span className="bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 px-2 py-0.5 rounded-md">
                              🏷 {match.sharedInterests[0] || project.domain}
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
                              ⏱ {match.availabilityComparison} · {student.experienceLevel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Feature 2: AI MATCH INSIGHT CARD */}
                      <div
                        id={`ai-match-insight-${student.id}`}
                        className="bg-gradient-to-br from-indigo-50/70 via-slate-50/90 to-purple-50/50 dark:from-indigo-950/40 dark:via-slate-800/50 dark:to-purple-950/40 rounded-xl p-3.5 border border-indigo-100/90 dark:border-indigo-900/60 space-y-2.5 text-xs shadow-2xs"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-base leading-none">🧠</span>
                            <span className="font-bold text-xs uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                              AI Match Insight
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800">
                            {match.overallScore >= 90
                              ? "Excellent Match"
                              : match.overallScore >= 75
                              ? "Strong Match"
                              : match.overallScore >= 60
                              ? "Good Match"
                              : "Low Match"}{" "}
                            ({match.overallScore}%)
                          </span>
                        </div>

                        {/* Why this candidate? */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block">
                            Why this candidate?
                          </span>
                          <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                            {match.positiveReasons.slice(0, 3).map((reason, idx) => (
                              <li key={idx} className="flex items-start space-x-1.5 leading-snug">
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                                <span>{reason.replace(/^✓\s*/, "")}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Optional Potential Gap */}
                        {match.warningReasons.length > 0 ? (
                          <div className="pt-2 border-t border-indigo-100/70 dark:border-indigo-900/60 flex items-start space-x-1.5 text-amber-900 dark:text-amber-200 bg-amber-50/90 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200/70 dark:border-amber-900/60 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                              <span className="font-bold text-amber-950 dark:text-amber-300">Potential Gap:</span>{" "}
                              <span>{match.warningReasons[0].replace(/^⚠\s*/, "")}</span>
                            </div>
                          </div>
                        ) : match.missingRequiredSkills.length > 0 ? (
                          <div className="pt-2 border-t border-indigo-100/70 dark:border-indigo-900/60 flex items-start space-x-1.5 text-amber-900 dark:text-amber-200 bg-amber-50/90 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200/70 dark:border-amber-900/60 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                              <span className="font-bold text-amber-950 dark:text-amber-300">Potential Gap:</span>{" "}
                              <span>Missing required skill ({match.missingRequiredSkills.join(", ")}) for {project.title}.</span>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Full Profile Link & Detailed Factor Breakdown Toggle */}
                      <div className="pt-1 flex items-center justify-between">
                        <button
                          id={`btn-why-match-${student.id}`}
                          onClick={() => toggleWhyMatch(student.id)}
                          className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {isWhyExpanded ? "Hide Full Factor Log" : "View Detailed Match Factors"}
                          </span>
                          {isWhyExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => onViewStudentDetail(student)}
                          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Full Profile & Portfolio</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Detailed Math Log Section (when expanded) */}
                    {isWhyExpanded && (
                      <div className="bg-slate-50/90 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                              Full Explainable AI Match Factor Log
                            </h4>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                            Total Compatibility: <strong className="text-slate-900 dark:text-white font-black">{match.overallScore}%</strong>
                          </span>
                        </div>

                        {/* Positive Reasons Checklist (✓) & Warning Points (⚠) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Positive Drivers */}
                          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/60 shadow-2xs space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Key Match Drivers</span>
                            </span>
                            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                              {match.positiveReasons.map((reason, idx) => (
                                <li key={idx} className="flex items-start space-x-1.5 leading-snug">
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                                  <span>{reason.replace(/^✓\s*/, "")}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Caution & Growth Points */}
                          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/60 shadow-2xs space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center space-x-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>Considerations & Skill Gaps</span>
                            </span>
                            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                              {match.warningReasons.length > 0 ? (
                                match.warningReasons.map((warn, idx) => (
                                  <li key={idx} className="flex items-start space-x-1.5 text-amber-900 dark:text-amber-200 leading-snug">
                                    <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">⚠</span>
                                    <span>{warn.replace(/^⚠\s*/, "")}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-slate-500 dark:text-slate-400 italic text-xs">
                                  No notable risks or critical gaps identified.
                                </li>
                              )}
                            </ul>
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

        {/* RIGHT COLUMN: TEAM ANALYSIS & GAP ANALYSIS */}
        <div className="lg:col-span-5 xl:col-span-4 min-w-0 w-full lg:sticky lg:top-20 space-y-4">
          {/* ========================================================================= */}
          {/* SECTION 1: COMPACT TEAM SUMMARY AREA */}
          {/* Contains: Team Health Score, Requirements Covered %, Team Size / Max Size */}
          {/* ========================================================================= */}
          <div
            id="team-analysis-summary-card"
            className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Team Analysis</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                Live Synergy
              </span>
            </div>

            {/* 3 Key Metrics Compact Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 w-full">
              {/* Metric 1: Team Health Score */}
              <div className="bg-slate-50/90 dark:bg-slate-800/60 rounded-xl p-2 sm:p-2.5 border border-slate-200/70 dark:border-slate-700/60 text-center flex flex-col justify-between min-w-0">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                  Health Score
                </span>
                <div className="my-1">
                  <span
                    className={`text-xl sm:text-2xl font-black ${
                      selectedMembers.length === 0
                        ? "text-slate-400 dark:text-slate-500"
                        : teamHealth.overallScore >= 85
                        ? "text-emerald-600 dark:text-emerald-400"
                        : teamHealth.overallScore >= 70
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {teamHealth.overallScore}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">/100</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block truncate">
                  {selectedMembers.length === 0
                    ? "No members"
                    : teamHealth.overallScore >= 85
                    ? "Strong Synergy"
                    : teamHealth.overallScore >= 70
                    ? "Good Balance"
                    : "Needs Fit"}
                </span>
              </div>

              {/* Metric 2: Requirements Covered % (Squad Completeness) */}
              <div className="bg-slate-50/90 dark:bg-slate-800/60 rounded-xl p-2 sm:p-2.5 border border-slate-200/70 dark:border-slate-700/60 text-center flex flex-col justify-between min-w-0">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                  Reqs Covered
                </span>
                <div className="my-1">
                  <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {gapAnalysis.completenessScore}%
                  </span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block truncate">
                  {gapAnalysis.missingSkills.length === 0 && gapAnalysis.missingRoles.length === 0
                    ? "Fully Covered"
                    : `${gapAnalysis.missingSkills.length + gapAnalysis.missingRoles.length} Gaps Left`}
                </span>
              </div>

              {/* Metric 3: Current Team Size / Max Size */}
              <div className="bg-slate-50/90 dark:bg-slate-800/60 rounded-xl p-2 sm:p-2.5 border border-slate-200/70 dark:border-slate-700/60 text-center flex flex-col justify-between min-w-0">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                  Team Size
                </span>
                <div className="my-1">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {selectedMembers.length}
                  </span>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                    /{project.requiredTeamSize}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block truncate">
                  {selectedMembers.length >= project.requiredTeamSize
                    ? "Capacity Met"
                    : `${project.requiredTeamSize - selectedMembers.length} Slots Open`}
                </span>
              </div>
            </div>

            {/* Quick Completeness Progress Line */}
            <div className="pt-1">
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${gapAnalysis.completenessScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: NEXT BEST TEAMMATE / OPTIONAL COMPLEMENTARY TEAMMATE */}
          {/* Immediately below the summary: Name, Role, Match %, Short Reason, Button */}
          {/* ========================================================================= */}
          <div id="recommended-teammate-section">
            {nextBestTeammateData && nextBestTeammateData.type === "complete" ? (
              <div
                id="team-complete-card"
                className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-4 text-center space-y-1.5 shadow-sm"
              >
                <div className="inline-flex p-1.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-100 uppercase tracking-wide">
                  Your required team is complete.
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-snug">
                  All required roles, technical skills, and target team capacity for <strong>{project.title}</strong> are satisfied.
                </p>
              </div>
            ) : nextBestTeammateData && nextBestTeammateData.type === "complementary" ? (
              <div
                id="complementary-teammate-card"
                className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 space-y-3 shadow-sm border border-slate-800 dark:border-slate-700"
              >
                {/* Status & Match Header */}
                <div className="space-y-1 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>All Required Roles Covered ✓</span>
                    </span>
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {nextBestTeammateData.matchScore}% Match
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 pt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Optional: Strengthen Your Team
                    </span>
                  </div>
                </div>

                {/* Candidate Summary (Name, Role, Dept) */}
                <div className="flex items-center space-x-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <img
                    src={nextBestTeammateData.candidate.avatar}
                    alt={nextBestTeammateData.candidate.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-400 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-sm text-white truncate">
                      {nextBestTeammateData.candidate.name}
                    </h5>
                    <p className="text-xs text-indigo-300 truncate">
                      {nextBestTeammateData.candidate.preferredRoles[0]} · {nextBestTeammateData.candidate.department}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {nextBestTeammateData.candidate.year} · {nextBestTeammateData.candidate.experienceLevel}
                    </span>
                  </div>
                </div>

                {/* Strongest Complementary Skill & Short Reason */}
                <div className="bg-slate-800/80 rounded-lg p-2.5 border border-slate-700/80 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400">Complementary Skill:</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-700/60">
                      {nextBestTeammateData.complementarySkill}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-snug">
                    {nextBestTeammateData.reason}
                  </p>
                </div>

                {/* Team Request Action Button */}
                {(() => {
                  const candId = nextBestTeammateData.candidate.id;
                  const isSelected = project.selectedTeamMemberIds.includes(candId);
                  const inv = invitations.find(
                    (i) => i.projectId === project.id && i.recipientId === candId
                  );
                  const isPending = inv?.status === "Pending" && !isSelected;
                  const isAccepted = isSelected || inv?.status === "Accepted";

                  if (isAccepted) {
                    return (
                      <button
                        type="button"
                        onClick={() => onRemoveTeamMember(project.id, candId)}
                        className="w-full bg-emerald-600 hover:bg-rose-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm group"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 group-hover:hidden" />
                        <Trash2 className="w-3.5 h-3.5 hidden group-hover:inline" />
                        <span className="group-hover:hidden">Request Accepted ✓</span>
                        <span className="hidden group-hover:inline">Remove Member</span>
                      </button>
                    );
                  }
                  if (isPending) {
                    return (
                      <div className="w-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 select-none">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        <span>Request Sent ✓ (Pending)</span>
                      </div>
                    );
                  }
                  return (
                    <button
                      type="button"
                      onClick={() =>
                        onSendTeamRequest(
                          project.id,
                          nextBestTeammateData.candidate,
                          nextBestTeammateData.candidate.preferredRoles[0] || "Team Member",
                          nextBestTeammateData.matchScore || 85
                        )
                      }
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Request</span>
                    </button>
                  );
                })()}
              </div>
            ) : nextBestTeammateData && nextBestTeammateData.candidate ? (
              <div
                id="next-best-teammate-card"
                className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 space-y-3 shadow-sm border border-slate-800 dark:border-slate-700"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Next Best Teammate
                    </span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {nextBestTeammateData.matchScore}% Match
                  </span>
                </div>

                {/* Top Recommended Candidate Summary */}
                <div className="flex items-center space-x-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <img
                    src={nextBestTeammateData.candidate.avatar}
                    alt={nextBestTeammateData.candidate.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-400 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-sm text-white truncate">
                      {nextBestTeammateData.candidate.name}
                    </h5>
                    <p className="text-xs text-indigo-300 truncate">
                      {nextBestTeammateData.candidate.preferredRoles[0]} · {nextBestTeammateData.candidate.department}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {nextBestTeammateData.candidate.year} · {nextBestTeammateData.candidate.experienceLevel}
                    </span>
                  </div>
                </div>

                {/* Short Reason & Target Gap */}
                <div className="bg-slate-800/80 rounded-lg p-2.5 border border-slate-700/80 space-y-1 text-xs">
                  {nextBestTeammateData.missingRole && (
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/90 px-1.5 py-0.5 rounded border border-amber-700/60">
                        Fills: {nextBestTeammateData.missingRole}
                      </span>
                    </div>
                  )}
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {nextBestTeammateData.reasons.slice(0, 2).map((r, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5 leading-snug">
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Connect Action Button */}
                {(() => {
                  const candId = nextBestTeammateData.candidate.id;
                  const isSelected = project.selectedTeamMemberIds.includes(candId);
                  const inv = invitations.find(
                    (i) => i.projectId === project.id && i.recipientId === candId
                  );
                  const isPending = inv?.status === "Pending" && !isSelected;
                  const isAccepted = isSelected || inv?.status === "Accepted";

                  if (isAccepted) {
                    return (
                      <button
                        type="button"
                        onClick={() => onRemoveTeamMember(project.id, candId)}
                        className="w-full bg-emerald-600 hover:bg-rose-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm group"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 group-hover:hidden" />
                        <Trash2 className="w-3.5 h-3.5 hidden group-hover:inline" />
                        <span className="group-hover:hidden">Connected ✓</span>
                        <span className="hidden group-hover:inline">Remove Member</span>
                      </button>
                    );
                  }
                  if (isPending) {
                    return (
                      <div className="w-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 select-none">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        <span>Connection Sent ✓ (Pending)</span>
                      </div>
                    );
                  }
                  return (
                    <button
                      type="button"
                      onClick={() =>
                        onSendTeamRequest(
                          project.id,
                          nextBestTeammateData.candidate,
                          nextBestTeammateData.candidate.preferredRoles[0] || "Team Member",
                          nextBestTeammateData.matchScore || 85
                        )
                      }
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </button>
                  );
                })()}
              </div>
            ) : null}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: DETAILED TEAM HEALTH BREAKDOWN */}
          {/* Shows: Skill Coverage, Role Coverage, Availability, Experience, Domain */}
          {/* ========================================================================= */}
          <div
            id="team-health-score-card"
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Team Health Breakdown</span>
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  5-Pillar squad balance & synergy distribution
                </p>
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                {teamHealth.overallScore}/100
              </span>
            </div>

            {/* 5-Pillar Health Score Progress Bars */}
            <div className="space-y-2.5 text-xs">
              {/* Skill Coverage (35%) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Skill Coverage (35%)</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {teamHealth.breakdown.skillCoverage}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${teamHealth.breakdown.skillCoverage}%` }}
                  />
                </div>
              </div>

              {/* Role Coverage (20%) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Role Coverage (20%)</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {teamHealth.breakdown.roleCoverage}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${teamHealth.breakdown.roleCoverage}%` }}
                  />
                </div>
              </div>

              {/* Availability (15%) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Availability (15%)</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {teamHealth.breakdown.availabilityCompatibility}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${teamHealth.breakdown.availabilityCompatibility}%` }}
                  />
                </div>
              </div>

              {/* Experience Balance (15%) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Experience Balance (15%)</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {teamHealth.breakdown.experienceBalance}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                    style={{ width: `${teamHealth.breakdown.experienceBalance}%` }}
                  />
                </div>
              </div>

              {/* Domain Alignment (15%) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Domain Alignment (15%)</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {teamHealth.breakdown.domainAlignment}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${teamHealth.breakdown.domainAlignment}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI-Generated Insight */}
            <div className="bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl p-3 border border-indigo-100 dark:border-indigo-900 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center space-x-1 mb-1">
                <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>AI Health Insight</span>
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-[11px]">
                "{teamHealth.aiInsight}"
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: DETAILED TEAM GAP ANALYSIS & AI TEAM ADVISOR */}
          {/* Contains: Roster list, AI Team Advisor, Covered vs Missing Skills & Roles */}
          {/* ========================================================================= */}
          <div
            id="team-gap-analysis-panel"
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Team Gap Analysis</span>
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  Roster: {selectedMembers.length} / {project.requiredTeamSize}
                </span>
              </div>
            </div>

            {/* Current Team Roster Badges */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                Selected Team Members ({selectedMembers.length})
              </span>

              {selectedMembers.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                  Click <strong>"Connect"</strong> on any candidate card to invite them to your team.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2 truncate pr-2">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="truncate">
                          <span className="font-bold text-slate-900 dark:text-white block truncate">
                            {member.name}
                          </span>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                            {member.preferredRoles[0]}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleTeamMember(member.id)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer"
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
            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl p-3 border border-indigo-100 dark:border-indigo-900 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center space-x-1 mb-1">
                <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>AI Team Advisor</span>
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                {gapAnalysis.recommendationSummary}
              </p>
            </div>

            {/* Covered vs Missing Skills & Missing Roles */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {/* Covered Skills */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1.5">
                  Covered Skills ({gapAnalysis.coveredSkills.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {gapAnalysis.coveredSkills.length > 0 ? (
                    gapAnalysis.coveredSkills.map((cs) => (
                      <span
                        key={cs.skill}
                        className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md text-[11px] font-semibold"
                        title={`Covered by: ${cs.coveredBy.join(", ")}`}
                      >
                        ✓ {cs.skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-xs italic">No skills covered yet</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 block mb-1.5">
                  Missing Skills ({gapAnalysis.missingSkills.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {gapAnalysis.missingSkills.length > 0 ? (
                    gapAnalysis.missingSkills.map((ms) => (
                      <span
                        key={ms.skill}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          ms.isRequired
                            ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                        }`}
                      >
                        {ms.isRequired ? "✕ Required: " : "○ "}
                        {ms.skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>All target skills fully covered!</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Missing Roles */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1.5">
                  Missing Roles ({gapAnalysis.missingRoles.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {gapAnalysis.missingRoles.length > 0 ? (
                    gapAnalysis.missingRoles.map((role) => (
                      <span
                        key={role}
                        className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md text-[11px] font-semibold"
                      >
                        Needs: {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>All required roles filled!</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
