import { describe, it, expect } from "vitest";
import {
  calculateTeamGapAnalysis,
  calculateTeamHealthScore,
  matchesRole,
  studentCoversRole,
} from "../utils/matchingEngine";
import { StudentProfile, Project } from "../types";

describe("3. Team Gap Analysis & Team Health Score", () => {
  const project: Project = {
    id: "proj-gap-test",
    title: "Autonomous Drone Delivery",
    description: "Developing path planning, obstacle avoidance, and telemetry dashboard.",
    projectType: "Competition",
    domain: "Robotics & AI",
    requiredTeamSize: 4,
    duration: "8 weeks",
    weeklyCommitment: 12,
    requiredSkills: ["ROS", "Computer Vision", "Python", "React"],
    preferredSkills: ["C++", "Docker"],
    requiredRoles: ["Robotics Engineer", "ML Engineer", "Frontend Developer", "UI/UX Designer"],
    experienceRequired: "Intermediate",
    createdAt: "2026-01-01",
    authorName: "RoboClub",
    authorDepartment: "Electrical Engineering",
    selectedTeamMemberIds: [],
  };

  const member1_Robotics: StudentProfile = {
    id: "m1",
    name: "Marcus Vance",
    avatar: "https://example.com/m1.jpg",
    department: "Robotics",
    year: "Senior",
    bio: "ROS and embedded developer.",
    skills: ["ROS", "C++", "Python"],
    interests: ["Robotics & AI"],
    experienceLevel: "Advanced",
    weeklyAvailability: 15,
    preferredRoles: ["Robotics Engineer"],
    previousProjects: [],
    github: "https://github.com/marcus",
    linkedin: "https://linkedin.com/in/marcus",
  };

  const member2_Frontend: StudentProfile = {
    id: "m2",
    name: "Elena Rostova",
    avatar: "https://example.com/m2.jpg",
    department: "Computer Science",
    year: "Junior",
    bio: "Frontend engineer and React enthusiast.",
    skills: ["React", "TypeScript"],
    interests: ["Robotics & AI"],
    experienceLevel: "Intermediate",
    weeklyAvailability: 12,
    preferredRoles: ["Frontend Developer"],
    previousProjects: [],
    github: "https://github.com/elena",
    linkedin: "https://linkedin.com/in/elena",
  };

  const candidate_ML: StudentProfile = {
    id: "c_ml",
    name: "Priya Sharma",
    avatar: "https://example.com/c1.jpg",
    department: "AI & Data Science",
    year: "Senior",
    bio: "Computer vision and PyTorch specialist.",
    skills: ["Computer Vision", "Python", "PyTorch"],
    interests: ["Robotics & AI", "Computer Vision"],
    experienceLevel: "Advanced",
    weeklyAvailability: 14,
    preferredRoles: ["ML Engineer"],
    previousProjects: [],
    github: "https://github.com/priya",
    linkedin: "https://linkedin.com/in/priya",
  };

  const candidate_Designer: StudentProfile = {
    id: "c_design",
    name: "Devon Brooks",
    avatar: "https://example.com/c2.jpg",
    department: "Human-Computer Interaction",
    year: "Junior",
    bio: "Product designer and design systems.",
    skills: ["Figma", "UI/UX Design", "Docker"],
    interests: ["Robotics & AI"],
    experienceLevel: "Intermediate",
    weeklyAvailability: 12,
    preferredRoles: ["UI/UX Designer"],
    previousProjects: [],
    github: "https://github.com/devon",
    linkedin: "https://linkedin.com/in/devon",
  };

  it("accurately identifies covered skills and unfulfilled missing gaps", () => {
    // Current team only has member1 (Robotics) and member2 (Frontend)
    const selectedTeam = [member1_Robotics, member2_Frontend];
    const availablePool = [member1_Robotics, member2_Frontend, candidate_ML, candidate_Designer];

    const gap = calculateTeamGapAnalysis(project, selectedTeam, availablePool);

    // Covered Skills: ROS (m1), Python (m1), React (m2), C++ (m1 - preferred)
    const coveredReqSkillNames = gap.coveredSkills.filter((s) => s.isRequired).map((s) => s.skill);
    expect(coveredReqSkillNames).toContain("ROS");
    expect(coveredReqSkillNames).toContain("Python");
    expect(coveredReqSkillNames).toContain("React");

    // Missing required skill: "Computer Vision"
    const missingReqSkillNames = gap.missingSkills.filter((s) => s.isRequired).map((s) => s.skill);
    expect(missingReqSkillNames).toContain("Computer Vision");
    expect(missingReqSkillNames).not.toContain("ROS");
    expect(missingReqSkillNames).not.toContain("React");

    // Covered Roles: Robotics Engineer (m1), Frontend Developer (m2)
    const coveredRoleNames = gap.coveredRoles.map((r) => r.role);
    expect(coveredRoleNames).toContain("Robotics Engineer");
    expect(coveredRoleNames).toContain("Frontend Developer");

    // Missing Roles: ML Engineer, UI/UX Designer
    expect(gap.missingRoles).toContain("ML Engineer");
    expect(gap.missingRoles).toContain("UI/UX Designer");
    expect(gap.missingRoles).not.toContain("Robotics Engineer");
    expect(gap.missingRoles).not.toContain("Frontend Developer");
  });

  it("recommends candidates that specifically resolve the active team gaps", () => {
    const selectedTeam = [member1_Robotics, member2_Frontend];
    const availablePool = [member1_Robotics, member2_Frontend, candidate_ML, candidate_Designer];

    const gap = calculateTeamGapAnalysis(project, selectedTeam, availablePool);

    expect(gap.bestNextCandidates.length).toBeGreaterThan(0);
    const topRecommendation = gap.bestNextCandidates[0];

    // Candidate Priya Sharma covers missing "Computer Vision" skill and missing "ML Engineer" role
    expect(topRecommendation.student.id).toBe("c_ml");
    expect(topRecommendation.fillsMissingSkills).toContain("Computer Vision");
    expect(topRecommendation.fillsMissingRoles).toContain("ML Engineer");
  });

  it("computes 100% completeness and removes all missing gaps when all roles & skills are filled", () => {
    const fullTeam = [member1_Robotics, member2_Frontend, candidate_ML, candidate_Designer];
    const gap = calculateTeamGapAnalysis(project, fullTeam, fullTeam);

    const missingReqSkills = gap.missingSkills.filter((s) => s.isRequired);
    expect(missingReqSkills.length).toBe(0);
    expect(gap.missingRoles.length).toBe(0);
    expect(gap.teamSize).toBe(4);
    expect(gap.completenessScore).toBe(100);

    // AI Team Advisor summary should state ready for kickoff
    expect(gap.recommendationSummary).toContain("fully covered");
  });

  it("calculates Team Health Score across 5 weighted pillars", () => {
    const fullTeam = [member1_Robotics, member2_Frontend, candidate_ML, candidate_Designer];
    const gap = calculateTeamGapAnalysis(project, fullTeam, fullTeam);
    const health = calculateTeamHealthScore(project, fullTeam, gap);

    expect(health.overallScore).toBeGreaterThanOrEqual(90);
    expect(health.breakdown.skillCoverage).toBe(100);
    expect(health.breakdown.roleCoverage).toBe(100);
    expect(health.breakdown.availabilityCompatibility).toBeGreaterThanOrEqual(95);
    expect(health.breakdown.experienceBalance).toBeGreaterThanOrEqual(90);
    expect(health.breakdown.domainAlignment).toBeGreaterThanOrEqual(80);
    expect(health.aiInsight.length).toBeGreaterThan(0);
  });
});
