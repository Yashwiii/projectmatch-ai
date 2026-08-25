import { describe, it, expect } from "vitest";
import { matchesSkill, studentCoversSkill, calculateStudentMatch } from "../utils/matchingEngine";
import { StudentProfile, Project } from "../types";

describe("2. Skill Matching Engine & Synonym Recognition", () => {
  const project: Project = {
    id: "proj-skills",
    title: "Fullstack Web3 Marketplace",
    description: "Decentralized marketplace built with React, TypeScript, Solidity, and PostgreSQL.",
    projectType: "Startup",
    domain: "Web3 & Blockchain",
    requiredTeamSize: 3,
    duration: "6 weeks",
    weeklyCommitment: 10,
    requiredSkills: ["React", "Solidity", "PostgreSQL"],
    preferredSkills: ["TypeScript", "Docker"],
    requiredRoles: ["Full-Stack Developer"],
    experienceRequired: "Intermediate",
    createdAt: "2026-01-01",
    authorName: "Web3 Lab",
    authorDepartment: "Informatics",
    selectedTeamMemberIds: [],
  };

  it("recognizes exact, alias, and synonym skills correctly", () => {
    // Exact match
    expect(matchesSkill("React", "React")).toBe(true);
    expect(matchesSkill("react", "REACT")).toBe(true);

    // JS / TypeScript
    expect(matchesSkill("JavaScript", "TypeScript")).toBe(true);
    expect(matchesSkill("js", "ts")).toBe(true);

    // AI / ML / PyTorch
    expect(matchesSkill("PyTorch", "Machine Learning")).toBe(true);
    expect(matchesSkill("Deep Learning", "ML")).toBe(true);

    // UI / UX / Figma / Product Design
    expect(matchesSkill("Figma", "UI/UX Design")).toBe(true);
    expect(matchesSkill("Product Design", "Figma")).toBe(true);

    // SQL / PostgreSQL
    expect(matchesSkill("Postgres", "SQL")).toBe(true);
    expect(matchesSkill("PostgreSQL", "Postgres")).toBe(true);

    // Smart Contracts / Blockchain / Solidity
    expect(matchesSkill("Smart Contracts", "Solidity")).toBe(true);
    expect(matchesSkill("Blockchain Development", "Web3")).toBe(true);

    // Negative matches
    expect(matchesSkill("Figma", "Solidity")).toBe(false);
    expect(matchesSkill("Python", "CSS")).toBe(false);
  });

  it("verifies skill coverage from candidate profile skills as well as past project tech", () => {
    const candidate: StudentProfile = {
      id: "stud-portfolio",
      name: "Samira Chen",
      avatar: "https://example.com/avatar.jpg",
      department: "Software Engineering",
      year: "Junior",
      bio: "Smart contract builder.",
      skills: ["React"], // Only lists React in direct skills
      interests: ["Web3"],
      experienceLevel: "Intermediate",
      weeklyAvailability: 12,
      preferredRoles: ["Smart Contract Engineer"],
      previousProjects: [
        {
          title: "DeFi Exchange",
          description: "Smart contracts and backend DB",
          tech: ["Solidity", "Postgres"], // Covers Solidity & PostgreSQL through portfolio!
        },
      ],
      github: "https://github.com/samirac",
      linkedin: "https://linkedin.com/in/samirac",
    };

    expect(studentCoversSkill(candidate, "React")).toBe(true);
    expect(studentCoversSkill(candidate, "Solidity")).toBe(true);
    expect(studentCoversSkill(candidate, "PostgreSQL")).toBe(true);
    expect(studentCoversSkill(candidate, "Kubernetes")).toBe(false);
  });

  it("awards 100% skill score when all required and preferred skills are covered", () => {
    const candidate: StudentProfile = {
      id: "stud-all-skills",
      name: "Liam O'Connor",
      avatar: "https://example.com/avatar.jpg",
      department: "Computer Science",
      year: "Senior",
      bio: "Fullstack web3 engineer.",
      skills: ["React", "Solidity", "Postgres", "TypeScript", "Docker"],
      interests: ["Web3 & Blockchain"],
      experienceLevel: "Advanced",
      weeklyAvailability: 15,
      preferredRoles: ["Full-Stack Developer"],
      previousProjects: [],
      github: "https://github.com/liamo",
      linkedin: "https://linkedin.com/in/liamo",
    };

    const match = calculateStudentMatch(candidate, project);
    expect(match.breakdown.skillScore).toBe(100);
    expect(match.missingRequiredSkills.length).toBe(0);
    expect(match.matchingSkills).toEqual(
      expect.arrayContaining(["React", "Solidity", "PostgreSQL", "TypeScript", "Docker"])
    );
  });

  it("penalizes skill score proportionally when required skills are missing", () => {
    const candidateOnlyOneSkill: StudentProfile = {
      id: "stud-one-skill",
      name: "Taylor Swift",
      avatar: "https://example.com/avatar.jpg",
      department: "Art & Technology",
      year: "Freshman",
      bio: "Beginner designer.",
      skills: ["React"], // 1 of 3 required (33.3%), 0 of 2 preferred (0%) -> round((1/3*0.8 + 0)*100) = 27%
      interests: ["Web3"],
      experienceLevel: "Beginner",
      weeklyAvailability: 10,
      preferredRoles: ["Frontend Developer"],
      previousProjects: [],
      github: "https://github.com/taylor",
      linkedin: "https://linkedin.com/in/taylor",
    };

    const match = calculateStudentMatch(candidateOnlyOneSkill, project);
    expect(match.breakdown.skillScore).toBeLessThan(40);
    expect(match.missingRequiredSkills).toContain("Solidity");
    expect(match.missingRequiredSkills).toContain("PostgreSQL");
  });
});
