import { describe, it, expect } from "vitest";
import {
  acceptInvitationState,
  declineInvitationState,
  createTeamInvitation,
} from "../utils/invitationWorkflow";
import { StudentProfile, Project, TeamInvitation } from "../types";

describe("6. Accept & Decline Invitation Lifecycle Workflow", () => {
  const initialProject: Project = {
    id: "proj-lifecycle-1",
    title: "Quantum Simulation Visualizer",
    description: "Interactive visualizer for multi-qubit quantum circuits in WebGL.",
    projectType: "Research",
    domain: "Quantum Computing & Web3",
    requiredTeamSize: 3,
    duration: "10 weeks",
    weeklyCommitment: 10,
    requiredSkills: ["WebGL", "Three.js", "Python"],
    preferredSkills: ["Rust"],
    requiredRoles: ["Graphics Developer", "Research Lead"],
    experienceRequired: "Advanced",
    createdAt: "2026-01-01",
    authorName: "Alice Quantum",
    authorDepartment: "Physics",
    selectedTeamMemberIds: [],
  };

  const candidate: StudentProfile = {
    id: "cand-alice",
    name: "Alice Vance",
    avatar: "https://example.com/alice.jpg",
    department: "Applied Physics & CS",
    year: "Senior",
    bio: "Graphics programmer.",
    skills: ["WebGL", "Three.js", "Python"],
    interests: ["Quantum Computing"],
    experienceLevel: "Advanced",
    weeklyAvailability: 12,
    preferredRoles: ["Graphics Developer"],
    previousProjects: [],
    github: "https://github.com/alicev",
    linkedin: "https://linkedin.com/in/alicev",
  };

  const sender = {
    id: "user-lead",
    name: "Research Lead",
  };

  it("accepts a pending request, updates status to Accepted, and adds the candidate to the team roster", () => {
    const invitation = createTeamInvitation(
      initialProject,
      candidate,
      sender,
      "Graphics Developer",
      94
    );

    const initialInvitations: TeamInvitation[] = [invitation];
    const initialProjects: Project[] = [initialProject];

    const { updatedInvitations, updatedProjects } = acceptInvitationState(
      invitation.id,
      initialInvitations,
      initialProjects
    );

    // 1. Check invitation status
    const acceptedInv = updatedInvitations.find((i) => i.id === invitation.id);
    expect(acceptedInv).toBeDefined();
    expect(acceptedInv?.status).toBe("Accepted");
    expect(acceptedInv?.respondedAt).toBeDefined();
    expect(acceptedInv?.isRead).toBe(true);

    // 2. Check project roster
    const updatedProject = updatedProjects.find((p) => p.id === initialProject.id);
    expect(updatedProject?.selectedTeamMemberIds).toContain(candidate.id);
    expect(updatedProject?.selectedTeamMemberIds.length).toBe(1);
  });

  it("avoids duplicate team member entries when an invitation is accepted idempotently", () => {
    const invitation = createTeamInvitation(
      initialProject,
      candidate,
      sender,
      "Graphics Developer",
      94
    );

    // Project already has candidate in roster
    const projectWithCandidate: Project = {
      ...initialProject,
      selectedTeamMemberIds: [candidate.id],
    };

    const { updatedProjects } = acceptInvitationState(
      invitation.id,
      [invitation],
      [projectWithCandidate]
    );

    const updatedProject = updatedProjects.find((p) => p.id === initialProject.id);
    // Should not have duplicated candidate ID
    expect(updatedProject?.selectedTeamMemberIds).toEqual([candidate.id]);
  });

  it("declines a pending request, updates status to Declined, and ensures candidate is NOT added to team", () => {
    const invitation = createTeamInvitation(
      initialProject,
      candidate,
      sender,
      "Graphics Developer",
      94
    );

    const initialInvitations: TeamInvitation[] = [invitation];
    const initialProjects: Project[] = [initialProject];

    const { updatedInvitations, updatedProjects } = declineInvitationState(
      invitation.id,
      initialInvitations,
      initialProjects
    );

    // 1. Check invitation status
    const declinedInv = updatedInvitations.find((i) => i.id === invitation.id);
    expect(declinedInv).toBeDefined();
    expect(declinedInv?.status).toBe("Declined");
    expect(declinedInv?.respondedAt).toBeDefined();

    // 2. Check candidate is NOT in team roster
    const updatedProject = updatedProjects.find((p) => p.id === initialProject.id);
    expect(updatedProject?.selectedTeamMemberIds).not.toContain(candidate.id);
    expect(updatedProject?.selectedTeamMemberIds.length).toBe(0);
  });
});
