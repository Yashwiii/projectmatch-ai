import { describe, it, expect } from "vitest";
import { calculateStudentMatch } from "../utils/matchingEngine";
import { StudentProfile, Project } from "../types";

describe("1. Matching Score & 5-Factor Deterministic Algorithm", () => {
  const baseProject: Project = {
    id: "proj-test",
    title: "Autonomous Medical Vision AI",
    description: "Building an automated diagnostic imaging assistant using PyTorch and React.",
    projectType: "Hackathon",
    domain: "Healthcare AI",
    requiredTeamSize: 4,
    duration: "4 weeks",
    weeklyCommitment: 10,
    requiredSkills: ["Python", "PyTorch"],
    preferredSkills: ["React"],
    requiredRoles: ["ML Engineer"],
    experienceRequired: "Intermediate",
    createdAt: "2026-01-01",
    authorName: "Test Lead",
    authorDepartment: "Bioengineering",
    selectedTeamMemberIds: [],
  };

  it("calculates accurate 5-factor weighted breakdown matching 40/20/15/15/10 weights", () => {
    // Perfect match candidate across all 5 dimensions
    const perfectCandidate: StudentProfile = {
      id: "stud-perfect",
      name: "Alex Rivera",
      avatar: "https://example.com/avatar.jpg",
      department: "Computer Science & AI",
      year: "Senior",
      bio: "AI researcher focusing on medical computer vision.",
      skills: ["Python", "PyTorch", "React"],
      interests: ["Healthcare AI", "Healthcare"], // 2 shared domain interests -> 100%
      experienceLevel: "Advanced", // Exceeds Intermediate -> 100%
      weeklyAvailability: 15, // Exceeds 10 hrs -> 100%
      preferredRoles: ["ML Engineer"], // Exact match -> 100%
      previousProjects: [
        {
          title: "TumorSegNet",
          description: "Chest CT segmentation",
          tech: ["Python", "PyTorch"],
        },
      ],
      github: "https://github.com/alexr",
      linkedin: "https://linkedin.com/in/alexr",
    };

    const match = calculateStudentMatch(perfectCandidate, baseProject);

    // Verify sub-scores
    expect(match.breakdown.skillScore).toBe(100);
    expect(match.breakdown.interestScore).toBe(100);
    expect(match.breakdown.availabilityScore).toBe(100);
    expect(match.breakdown.experienceScore).toBe(100);
    expect(match.breakdown.roleScore).toBe(100);

    // Expected overall score:
    // 100 * 0.40 + 100 * 0.20 + 100 * 0.15 + 100 * 0.15 + 100 * 0.10 = 100
    expect(match.overallScore).toBe(100);
    expect(match.roleFit).toBe("ML Engineer");
    expect(match.matchingSkills).toContain("Python");
    expect(match.matchingSkills).toContain("PyTorch");
    expect(match.missingRequiredSkills.length).toBe(0);
  });

  it("applies strict mathematical formula when candidate has mixed sub-scores", () => {
    const mixedCandidate: StudentProfile = {
      id: "stud-mixed",
      name: "Jordan Lee",
      avatar: "https://example.com/avatar2.jpg",
      department: "Art History",
      year: "Junior",
      bio: "Designer with some Python skills.",
      skills: ["Python"], // 1 of 2 required skills (no preferred) -> (1/2 * 0.8 + 0) * 100 = 40%
      interests: ["Healthcare AI"], // 1 domain match -> 85%
      experienceLevel: "Beginner", // 1 level below Intermediate -> 70%
      weeklyAvailability: 5, // 5 / 10 hours -> 50%
      preferredRoles: ["UI/UX Designer"], // Unrelated to ML Engineer -> 30%
      previousProjects: [],
      github: "https://github.com/jordanl",
      linkedin: "https://linkedin.com/in/jordanl",
    };

    const match = calculateStudentMatch(mixedCandidate, baseProject);

    // Verify breakdown sub-scores
    expect(match.breakdown.skillScore).toBe(40);
    expect(match.breakdown.interestScore).toBe(85);
    expect(match.breakdown.availabilityScore).toBe(50);
    expect(match.breakdown.experienceScore).toBe(70);
    expect(match.breakdown.roleScore).toBe(30);

    // Mathematical verification:
    // 40 * 0.40 = 16
    // 85 * 0.20 = 17
    // 50 * 0.15 = 7.5
    // 70 * 0.15 = 10.5
    // 30 * 0.10 = 3
    // Raw sum = 16 + 17 + 7.5 + 10.5 + 3 = 54 -> Math.round = 54
    expect(match.overallScore).toBe(54);
    expect(match.missingRequiredSkills).toContain("PyTorch");
  });

  it("generates truthful explainable positive and warning reasons", () => {
    const candidate: StudentProfile = {
      id: "stud-reasons",
      name: "Morgan Taylor",
      avatar: "https://example.com/avatar3.jpg",
      department: "History",
      year: "Sophomore",
      bio: "Learning to code.",
      skills: ["Python"],
      interests: ["Creative Writing"],
      experienceLevel: "Beginner",
      weeklyAvailability: 4,
      preferredRoles: ["Frontend Developer"],
      previousProjects: [],
      github: "https://github.com/morgant",
      linkedin: "https://linkedin.com/in/morgant",
    };

    const match = calculateStudentMatch(candidate, baseProject);

    // Warning reasons should be generated for missing skills and hours gap
    expect(match.warningReasons.length).toBeGreaterThan(0);
    const hasMissingSkillWarning = match.warningReasons.some((w) =>
      w.includes("Missing required skill") && w.includes("PyTorch")
    );
    expect(hasMissingSkillWarning).toBe(true);

    const hasAvailabilityWarning = match.warningReasons.some((w) =>
      w.includes("shortfall") || w.includes("Available 4 hrs/wk")
    );
    expect(hasAvailabilityWarning).toBe(true);
  });
});
