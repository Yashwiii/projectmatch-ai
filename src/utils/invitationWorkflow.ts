import { StudentProfile, Project, TeamInvitation } from "../types";

/**
 * Checks whether an invitation can be sent to a candidate for a given project.
 */
export function canSendInvitation(
  invitations: TeamInvitation[],
  projectId: string,
  candidateId: string,
  selectedTeamMemberIds: string[]
): { allowed: boolean; reason?: string } {
  if (selectedTeamMemberIds.includes(candidateId)) {
    return { allowed: false, reason: "Already a confirmed team member." };
  }

  const existing = invitations.find(
    (inv) => inv.projectId === projectId && inv.recipientId === candidateId
  );

  if (existing) {
    if (existing.status === "Pending") {
      return { allowed: false, reason: "Request already pending." };
    }
    if (existing.status === "Accepted") {
      return { allowed: false, reason: "Already a confirmed team member." };
    }
  }

  return { allowed: true };
}

/**
 * Creates a new pending team invitation object
 */
export function createTeamInvitation(
  project: Pick<Project, "id" | "title" | "description">,
  candidate: StudentProfile,
  sender: { id: string; name: string },
  proposedRole?: string,
  matchScore?: number
): TeamInvitation {
  return {
    id: `inv-${Date.now()}-${candidate.id}`,
    projectId: project.id,
    projectTitle: project.title,
    projectDescription: project.description,
    senderId: sender.id,
    senderName: sender.name,
    recipientId: candidate.id,
    recipientName: candidate.name,
    recipientAvatar: candidate.avatar,
    recipientDepartment: candidate.department,
    recipientYear: candidate.year,
    proposedRole: proposedRole || candidate.preferredRoles[0] || "Team Member",
    matchScore: matchScore ?? 85,
    status: "Pending",
    createdAt: new Date().toISOString(),
    isRead: false,
  };
}

/**
 * Pure reducer/state helper for accepting an invitation
 */
export function acceptInvitationState(
  invitationId: string,
  invitations: TeamInvitation[],
  projects: Project[]
): { updatedInvitations: TeamInvitation[]; updatedProjects: Project[] } {
  const inv = invitations.find((i) => i.id === invitationId);
  if (!inv) return { updatedInvitations: invitations, updatedProjects: projects };

  const updatedInvitations = invitations.map((i) =>
    i.id === invitationId
      ? { ...i, status: "Accepted" as const, respondedAt: new Date().toISOString(), isRead: true }
      : i
  );

  const updatedProjects = projects.map((p) => {
    if (p.id === inv.projectId) {
      if (!p.selectedTeamMemberIds.includes(inv.recipientId)) {
        return {
          ...p,
          selectedTeamMemberIds: [...p.selectedTeamMemberIds, inv.recipientId],
        };
      }
    }
    return p;
  });

  return { updatedInvitations, updatedProjects };
}

/**
 * Pure reducer/state helper for declining an invitation
 */
export function declineInvitationState(
  invitationId: string,
  invitations: TeamInvitation[],
  projects: Project[]
): { updatedInvitations: TeamInvitation[]; updatedProjects: Project[] } {
  const inv = invitations.find((i) => i.id === invitationId);
  if (!inv) return { updatedInvitations: invitations, updatedProjects: projects };

  const updatedInvitations = invitations.map((i) =>
    i.id === invitationId
      ? { ...i, status: "Declined" as const, respondedAt: new Date().toISOString(), isRead: true }
      : i
  );

  const updatedProjects = projects.map((p) => {
    if (p.id === inv.projectId) {
      return {
        ...p,
        selectedTeamMemberIds: p.selectedTeamMemberIds.filter((id) => id !== inv.recipientId),
      };
    }
    return p;
  });

  return { updatedInvitations, updatedProjects };
}
