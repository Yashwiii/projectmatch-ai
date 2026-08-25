import { describe, it, expect } from "vitest";
import { canSendInvitation, createTeamInvitation } from "../utils/invitationWorkflow";
import { StudentProfile, Project, TeamInvitation } from "../types";

describe("5. Connect Workflow & Invitation State Logic", () => {
  const project: Project = {
    id: "proj-connect-1",
    title: "AI Study Buddy",
    description: "Personalized study assistant with collaborative notes.",
    projectType: "Hackathon",
    domain: "EdTech & AI",
    requiredTeamSize: 3,
    duration: "2 weeks",
    weeklyCommitment: 8,
    requiredSkills: ["React", "Python"],
    preferredSkills: ["TailwindCSS"],
    requiredRoles: ["Frontend Developer"],
    experienceRequired: "Intermediate",
    createdAt: "2026-01-01",
    authorName: "Sarah Connor",
    authorDepartment: "CS",
    selectedTeamMemberIds: [],
  };

  const currentUser = {
    id: "user-owner",
    name: "Sarah Connor",
  };

  const candidate: StudentProfile = {
    id: "cand-bob",
    name: "Bob Builder",
    avatar: "https://example.com/bob.jpg",
    department: "Computer Science",
    year: "Junior",
    bio: "Passionate developer.",
    skills: ["React", "JavaScript"],
    interests: ["EdTech"],
    experienceLevel: "Intermediate",
    weeklyAvailability: 10,
    preferredRoles: ["Frontend Developer"],
    previousProjects: [],
    github: "https://github.com/bob",
    linkedin: "https://linkedin.com/in/bob",
  };

  it("permits initial connection request when no prior invitation or membership exists", () => {
    const existingInvitations: TeamInvitation[] = [];
    const teamMemberIds: string[] = [];

    const check = canSendInvitation(
      existingInvitations,
      project.id,
      candidate.id,
      teamMemberIds
    );

    expect(check.allowed).toBe(true);
  });

  it("creates a properly structured Pending invitation on Connect", () => {
    const invitation = createTeamInvitation(
      project,
      candidate,
      currentUser,
      "Frontend Developer",
      88
    );

    expect(invitation.projectId).toBe("proj-connect-1");
    expect(invitation.recipientId).toBe("cand-bob");
    expect(invitation.recipientName).toBe("Bob Builder");
    expect(invitation.senderId).toBe("user-owner");
    expect(invitation.proposedRole).toBe("Frontend Developer");
    expect(invitation.matchScore).toBe(88);
    expect(invitation.status).toBe("Pending");
    expect(invitation.isRead).toBe(false);
  });

  it("ensures pending candidates are not counted as confirmed team members", () => {
    const pendingInvitation = createTeamInvitation(
      project,
      candidate,
      currentUser,
      "Frontend Developer",
      88
    );

    // Invitation exists in pending state
    const invitations = [pendingInvitation];
    // Project roster remains unmutated until acceptance
    expect(project.selectedTeamMemberIds).not.toContain(candidate.id);
    expect(project.selectedTeamMemberIds.length).toBe(0);
  });

  it("prevents duplicate connection requests when an invitation is already pending", () => {
    const pendingInvitation = createTeamInvitation(
      project,
      candidate,
      currentUser,
      "Frontend Developer",
      88
    );
    const existingInvitations = [pendingInvitation];

    const check = canSendInvitation(
      existingInvitations,
      project.id,
      candidate.id,
      project.selectedTeamMemberIds
    );

    expect(check.allowed).toBe(false);
    expect(check.reason).toContain("already pending");
  });

  it("prevents connection requests if the candidate is already a confirmed team member", () => {
    const confirmedProject: Project = {
      ...project,
      selectedTeamMemberIds: [candidate.id],
    };

    const check = canSendInvitation(
      [],
      confirmedProject.id,
      candidate.id,
      confirmedProject.selectedTeamMemberIds
    );

    expect(check.allowed).toBe(false);
    expect(check.reason).toContain("confirmed team member");
  });
});
