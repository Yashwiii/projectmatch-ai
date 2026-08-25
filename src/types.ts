export type AcademicYear = "Freshman" | "Sophomore" | "Junior" | "Senior" | "Master's" | "PhD";

export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export type ProjectType = "Hackathon" | "Competition" | "Research" | "Startup" | "Course Project";

export interface StudentProject {
  title: string;
  description: string;
  tech: string[];
  link?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  department: string;
  year: AcademicYear;
  bio: string;
  skills: string[];
  interests: string[];
  experienceLevel: ExperienceLevel;
  weeklyAvailability: number; // hours per week
  availabilitySchedule?: string; // e.g. "Evenings & Weekends"
  preferredRoles: string[];
  previousProjects: StudentProject[];
  github: string;
  linkedin: string;
  isCurrentUser?: boolean;
  email?: string;
  collegeEmail?: string;
  rating?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  projectType: ProjectType;
  domain: string;
  requiredTeamSize: number;
  duration: string;
  weeklyCommitment: number; // hours per week
  availabilityRequirement?: string; // e.g. "6–8 hours/week"
  requiredSkills: string[];
  preferredSkills: string[];
  requiredRoles: string[];
  experienceRequired: ExperienceLevel | "Any";
  createdAt: string;
  authorName: string;
  authorDepartment: string;
  selectedTeamMemberIds: string[];
  isOwner?: boolean;
  aiExtracted?: boolean;
  status?: "Recruiting" | "In Progress" | "Full" | "Completed";
}

export type TeamRequestStatus = "Pending" | "Connected" | "Accepted" | "Declined";

export interface TeamInvitation {
  id: string;
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  recipientDepartment?: string;
  recipientYear?: string;
  proposedRole: string;
  matchScore: number;
  status: TeamRequestStatus;
  createdAt: string;
  respondedAt?: string;
  isRead?: boolean;
}

export interface MatchScoreBreakdown {
  skillScore: number; // 0-100 (weight: 40%)
  interestScore: number; // 0-100 (weight: 20%)
  availabilityScore: number; // 0-100 (weight: 15%)
  experienceScore: number; // 0-100 (weight: 15%)
  roleScore: number; // 0-100 (weight: 10%)
}

export interface MatchExplanation {
  overallScore: number; // 0-100
  breakdown: MatchScoreBreakdown;
  positiveReasons: string[];
  warningReasons: string[];
  matchingSkills: string[];
  missingRequiredSkills: string[];
  matchingPreferredSkills: string[];
  sharedInterests: string[];
  roleFit: string;
  availabilityComparison: string;
}

export interface CandidateMatch {
  student: StudentProfile;
  match: MatchExplanation;
}

export interface TeamGapAnalysis {
  teamSize: number;
  targetTeamSize: number;
  coveredSkills: { skill: string; coveredBy: string[]; isRequired: boolean }[];
  missingSkills: { skill: string; isRequired: boolean }[];
  coveredRoles: { role: string; coveredBy: string[] }[];
  missingRoles: string[];
  completenessScore: number; // 0-100
  recommendationSummary: string;
  bestNextCandidates: {
    student: StudentProfile;
    fillsMissingSkills: string[];
    fillsMissingRoles: string[];
    impactScore: number;
    matchScore: number;
  }[];
}

export interface TeamHealthBreakdown {
  skillCoverage: number; // 0-100 (35%)
  roleCoverage: number; // 0-100 (20%)
  availabilityCompatibility: number; // 0-100 (15%)
  experienceBalance: number; // 0-100 (15%)
  domainAlignment: number; // 0-100 (15%)
}

export interface TeamHealthScore {
  overallScore: number; // 0-100
  breakdown: TeamHealthBreakdown;
  aiInsight: string;
}

export interface AIAnalysisResult {
  domain: string;
  requiredSkills: string[];
  preferredSkills: string[];
  recommendedRoles: string[];
  experienceLevel: ExperienceLevel;
  availabilityRequirement: string;
  weeklyCommitment: number;
  suggestedTeamSize: number;
  suggestedDuration: string;
  aiSummary: string;
}
