import { describe, it, expect } from "vitest";
import { rankCandidates, calculateStudentMatch } from "../utils/matchingEngine";
import { StudentProfile, Project } from "../types";

describe("4. Candidate Ranking & Filtering Engine", () => {
  const project: Project = {
    id: "proj-ranking",
    title: "AI Security Vulnerability Scanner",
    description: "Automated cybersecurity assessment scanner using Python and LLMs.",
    projectType: "Hackathon",
    domain: "Cybersecurity & AI",
    requiredTeamSize: 3,
    duration: "3 weeks",
    weeklyCommitment: 10,
    requiredSkills: ["Cybersecurity", "Python", "Penetration Testing"],
    preferredSkills: ["FastAPI", "Docker"],
    requiredRoles: ["Security Analyst", "Backend Developer"],
    experienceRequired: "Intermediate",
    createdAt: "2026-01-01",
    authorName: "SecClub",
    authorDepartment: "Information Assurance",
    selectedTeamMemberIds: [],
  };

  const highMatchCandidate: StudentProfile = {
    id: "cand-high",
    name: "Aiden Cross",
    avatar: "https://example.com/aiden.jpg",
    department: "Cybersecurity Engineering",
    year: "Senior",
    bio: "Ethical hacker and security researcher.",
    skills: ["Cybersecurity", "Python", "Penetration Testing", "FastAPI"],
    interests: ["Cybersecurity & AI", "Threat Modeling"],
    experienceLevel: "Advanced",
    weeklyAvailability: 16,
    preferredRoles: ["Security Analyst"],
    previousProjects: [],
    github: "https://github.com/aiden",
    linkedin: "https://linkedin.com/in/aiden",
  };

  const mediumMatchCandidate: StudentProfile = {
    id: "cand-medium",
    name: "Chloe Bennett",
    avatar: "https://example.com/chloe.jpg",
    department: "Computer Science",
    year: "Junior",
    bio: "General software developer.",
    skills: ["Python", "Docker"],
    interests: ["Artificial Intelligence"],
    experienceLevel: "Intermediate",
    weeklyAvailability: 10,
    preferredRoles: ["Backend Developer"],
    previousProjects: [],
    github: "https://github.com/chloe",
    linkedin: "https://linkedin.com/in/chloe",
  };

  const lowMatchCandidate: StudentProfile = {
    id: "cand-low",
    name: "Noah Patel",
    avatar: "https://example.com/noah.jpg",
    department: "Graphic Design",
    year: "Freshman",
    bio: "UI enthusiast.",
    skills: ["Figma", "CSS"],
    interests: ["Design Systems"],
    experienceLevel: "Beginner",
    weeklyAvailability: 6,
    preferredRoles: ["UI/UX Designer"],
    previousProjects: [],
    github: "https://github.com/noah",
    linkedin: "https://linkedin.com/in/noah",
  };

  it("ensures a stronger overall match is ranked above a weaker match", () => {
    const candidates = [lowMatchCandidate, mediumMatchCandidate, highMatchCandidate];
    const ranked = rankCandidates(candidates, project, { sortBy: "score" });

    expect(ranked[0].student.id).toBe("cand-high");
    expect(ranked[1].student.id).toBe("cand-medium");
    expect(ranked[2].student.id).toBe("cand-low");

    expect(ranked[0].match.overallScore).toBeGreaterThan(ranked[1].match.overallScore);
    expect(ranked[1].match.overallScore).toBeGreaterThan(ranked[2].match.overallScore);
  });

  it("supports sorting by availability hours descending", () => {
    const candidates = [mediumMatchCandidate, lowMatchCandidate, highMatchCandidate];
    const ranked = rankCandidates(candidates, project, { sortBy: "availability" });

    // High: 16h, Medium: 10h, Low: 6h
    expect(ranked[0].student.weeklyAvailability).toBe(16);
    expect(ranked[1].student.weeklyAvailability).toBe(10);
    expect(ranked[2].student.weeklyAvailability).toBe(6);
  });

  it("supports sorting by experience level hierarchy (Expert/Advanced > Intermediate > Beginner)", () => {
    const candidates = [lowMatchCandidate, highMatchCandidate, mediumMatchCandidate];
    const ranked = rankCandidates(candidates, project, { sortBy: "experience" });

    // High: Advanced, Medium: Intermediate, Low: Beginner
    expect(ranked[0].student.experienceLevel).toBe("Advanced");
    expect(ranked[1].student.experienceLevel).toBe("Intermediate");
    expect(ranked[2].student.experienceLevel).toBe("Beginner");
  });

  it("filters candidates accurately by minimum match score threshold and role", () => {
    const candidates = [highMatchCandidate, mediumMatchCandidate, lowMatchCandidate];

    // Filter by min score 75
    const highOnly = rankCandidates(candidates, project, { minMatchScore: 75 });
    expect(highOnly.length).toBe(1);
    expect(highOnly[0].student.id).toBe("cand-high");

    // Filter by role "Backend Developer"
    const backendOnly = rankCandidates(candidates, project, { roleFilter: "Backend Developer" });
    expect(backendOnly.length).toBe(1);
    expect(backendOnly[0].student.id).toBe("cand-medium");
  });
});
