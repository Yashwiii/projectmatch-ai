import React, { useState, useEffect } from "react";
import {
  StudentProfile,
  Project,
  TeamInvitation,
} from "./types";
import {
  INITIAL_CURRENT_USER,
  DEMO_STUDENTS,
  INITIAL_PROJECTS,
  INITIAL_INVITATIONS,
} from "./data/demoData";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import { DashboardView } from "./components/DashboardView";
import { ProjectsView } from "./components/ProjectsView";
import { MatchingView } from "./components/MatchingView";
import { ProfileView } from "./components/ProfileView";
import { CreateProjectModal } from "./components/CreateProjectModal";
import { StudentDetailModal } from "./components/StudentDetailModal";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function App() {
  // Main Navigation state: 'landing' | 'dashboard' | 'projects' | 'matching' | 'profile'
  const [currentTab, setCurrentTab] = useState<string>("landing");

  // App Data State
  const [currentUser, setCurrentUser] = useState<StudentProfile>(() => {
    try {
      const savedUser = localStorage.getItem("projectmatch_current_user");
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn("Failed to load user profile from localStorage", e);
    }
    return INITIAL_CURRENT_USER;
  });

  const [students, setStudents] = useState<StudentProfile[]>(() => {
    try {
      const savedUser = localStorage.getItem("projectmatch_current_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return [parsed, ...DEMO_STUDENTS.filter((s) => s.id !== parsed.id)];
      }
    } catch (e) {
      console.warn("Failed to load students from localStorage", e);
    }
    return [INITIAL_CURRENT_USER, ...DEMO_STUDENTS];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const savedProjects = localStorage.getItem("projectmatch_projects");
      if (savedProjects) {
        return JSON.parse(savedProjects);
      }
    } catch (e) {
      console.warn("Failed to load projects from localStorage", e);
    }
    return INITIAL_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_PROJECTS[0].id);

  // Invitations / Requests State with LocalStorage persistence
  const [invitations, setInvitations] = useState<TeamInvitation[]>(() => {
    try {
      const savedInv = localStorage.getItem("projectmatch_invitations");
      if (savedInv) {
        return JSON.parse(savedInv);
      }
    } catch (e) {
      console.warn("Failed to load invitations from localStorage", e);
    }
    return INITIAL_INVITATIONS;
  });

  // Sync invitations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("projectmatch_invitations", JSON.stringify(invitations));
    } catch (e) {
      console.error("Failed to save invitations to localStorage", e);
    }
  }, [invitations]);

  // Sync projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("projectmatch_projects", JSON.stringify(projects));
    } catch (e) {
      console.error("Failed to save projects to localStorage", e);
    }
  }, [projects]);

  // Modals state
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentProfile | null>(null);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Save new project & navigate to My Projects page
  const handleSaveProject = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setActiveProjectId(newProject.id);
    setCurrentTab("projects");
    showToast(`Project "${newProject.title}" created and saved to My Projects!`);
  };

  // Update team members for a project
  const handleUpdateProjectTeam = (projectId: string, teamMemberIds: string[]) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return { ...p, selectedTeamMemberIds: teamMemberIds };
        }
        return p;
      })
    );
    showToast("Team roster & Gap Analysis updated.");
  };

  // Send Team Request / Invitation workflow
  const handleSendTeamRequest = (
    projectId: string,
    candidate: StudentProfile,
    proposedRole: string,
    matchScore: number
  ) => {
    const targetProject = projects.find((p) => p.id === projectId) || activeProject;

    // Check if invitation already exists for this project and candidate
    const existing = invitations.find(
      (inv) => inv.projectId === projectId && inv.recipientId === candidate.id
    );

    if (existing && existing.status === "Pending") {
      showToast(`Request already pending for ${candidate.name}.`);
      return;
    }

    if (existing && existing.status === "Accepted") {
      showToast(`${candidate.name} is already a confirmed team member.`);
      return;
    }

    const newInvitation: TeamInvitation = {
      id: `inv-${Date.now()}-${candidate.id}`,
      projectId: targetProject.id,
      projectTitle: targetProject.title,
      projectDescription: targetProject.description,
      senderId: currentUser.id,
      senderName: currentUser.name,
      recipientId: candidate.id,
      recipientName: candidate.name,
      recipientAvatar: candidate.avatar,
      recipientDepartment: candidate.department,
      recipientYear: candidate.year,
      proposedRole: proposedRole || candidate.preferredRoles[0] || "Team Member",
      matchScore: matchScore || 85,
      status: "Pending",
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setInvitations((prev) => [
      newInvitation,
      ...prev.filter(
        (inv) => !(inv.projectId === projectId && inv.recipientId === candidate.id)
      ),
    ]);

    showToast(`Team invitation sent to ${candidate.name} ✓`);
  };

  // Accept Team Invitation
  const handleAcceptInvitation = (invitationId: string) => {
    const inv = invitations.find((i) => i.id === invitationId);
    if (!inv) return;

    // Update invitation status to Accepted
    setInvitations((prev) =>
      prev.map((i) =>
        i.id === invitationId
          ? { ...i, status: "Accepted", respondedAt: new Date().toISOString(), isRead: true }
          : i
      )
    );

    // Add candidate to the project's selected team members
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === inv.projectId) {
          if (!p.selectedTeamMemberIds.includes(inv.recipientId)) {
            return {
              ...p,
              selectedTeamMemberIds: [...p.selectedTeamMemberIds, inv.recipientId],
            };
          }
        }
        return p;
      })
    );

    showToast(`Request accepted! You joined ${inv.projectTitle} ✓`);
  };

  // Decline Team Invitation
  const handleDeclineInvitation = (invitationId: string) => {
    const inv = invitations.find((i) => i.id === invitationId);
    if (!inv) return;

    // Update invitation status to Declined
    setInvitations((prev) =>
      prev.map((i) =>
        i.id === invitationId
          ? { ...i, status: "Declined", respondedAt: new Date().toISOString(), isRead: true }
          : i
      )
    );

    // Ensure candidate is NOT in team roster
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === inv.projectId) {
          return {
            ...p,
            selectedTeamMemberIds: p.selectedTeamMemberIds.filter((id) => id !== inv.recipientId),
          };
        }
        return p;
      })
    );

    showToast(`Request declined.`);
  };

  // Remove confirmed team member from project
  const handleRemoveTeamMember = (projectId: string, studentId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            selectedTeamMemberIds: p.selectedTeamMemberIds.filter((id) => id !== studentId),
          };
        }
        return p;
      })
    );

    // Also update invitation status if exists
    setInvitations((prev) =>
      prev.filter(
        (inv) => !(inv.projectId === projectId && inv.recipientId === studentId)
      )
    );

    showToast("Removed member from team roster.");
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    setInvitations((prev) => prev.map((inv) => ({ ...inv, isRead: true })));
  };

  // Save profile updates
  const handleSaveProfile = (updated: StudentProfile) => {
    setCurrentUser(updated);
    try {
      localStorage.setItem("projectmatch_current_user", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save user profile to localStorage", e);
    }
    setStudents((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
    showToast("Student profile successfully saved!");
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-150">
      {/* Toast Notification banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700 dark:border-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        projects={projects}
        activeProjectId={activeProjectId}
        setActiveProjectId={(id) => {
          setActiveProjectId(id);
          if (currentTab !== "matching") {
            setCurrentTab("matching");
          }
        }}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
        userAvatar={currentUser.avatar}
        invitations={invitations}
        onAcceptInvitation={handleAcceptInvitation}
        onDeclineInvitation={handleDeclineInvitation}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full min-w-0">
        {currentTab === "landing" && (
          <LandingPage
            onFindTeam={() => setCurrentTab("matching")}
            onCreateProject={() => setIsCreateProjectOpen(true)}
            onExploreDashboard={() => setCurrentTab("dashboard")}
          />
        )}

        {currentTab === "dashboard" && (
          <DashboardView
            currentUser={currentUser}
            projects={projects}
            students={students}
            activeProjectId={activeProjectId}
            onSelectActiveProject={(id) => setActiveProjectId(id)}
            onOpenCreateProject={() => setIsCreateProjectOpen(true)}
            onNavigateToMatching={(id) => {
              if (id) setActiveProjectId(id);
              setCurrentTab("matching");
            }}
            onNavigateToProfile={() => setCurrentTab("profile")}
            onNavigateToProjects={() => setCurrentTab("projects")}
            onViewStudentDetail={(student) => setSelectedStudentForModal(student)}
          />
        )}

        {currentTab === "projects" && (
          <ProjectsView
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectActiveProject={(id) => setActiveProjectId(id)}
            onNavigateToMatching={(id) => {
              setActiveProjectId(id);
              setCurrentTab("matching");
            }}
            onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          />
        )}

        {currentTab === "matching" && (
          <MatchingView
            project={activeProject}
            allStudents={students}
            allProjects={projects}
            invitations={invitations}
            onSelectProject={(id) => setActiveProjectId(id)}
            onUpdateProjectTeam={handleUpdateProjectTeam}
            onSendTeamRequest={handleSendTeamRequest}
            onRemoveTeamMember={handleRemoveTeamMember}
            onViewStudentDetail={(student) => setSelectedStudentForModal(student)}
            onCreateProjectClick={() => setIsCreateProjectOpen(true)}
          />
        )}

        {currentTab === "profile" && (
          <ProfileView
            profile={currentUser}
            onSaveProfile={handleSaveProfile}
            onNavigateToMatching={() => setCurrentTab("matching")}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-12 transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              ProjectMatch<span className="text-indigo-600 dark:text-indigo-400">.AI</span>
            </span>
            <span>— Explainable AI Team Matching Platform for Students</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-500 dark:text-slate-400">
            <span>Skill 40% · Domain 20% · Hours 15% · Exp 15% · Role 10%</span>
          </div>
        </div>
      </footer>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSaveProject={handleSaveProject}
        onFindTeamForProject={(newProj) => {
          handleSaveProject(newProj);
          setActiveProjectId(newProj.id);
          setCurrentTab("matching");
        }}
        authorName={currentUser.name}
        authorDepartment={currentUser.department}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudentForModal}
        onClose={() => setSelectedStudentForModal(null)}
        isInTeam={
          selectedStudentForModal
            ? activeProject?.selectedTeamMemberIds.includes(selectedStudentForModal.id)
            : false
        }
        invitationStatus={
          selectedStudentForModal
            ? (invitations.find(
                (i) =>
                  i.projectId === activeProject?.id &&
                  i.recipientId === selectedStudentForModal.id
              )?.status || "None")
            : "None"
        }
        onSendTeamRequest={(student) => {
          if (activeProject) {
            handleSendTeamRequest(
              activeProject.id,
              student,
              student.preferredRoles[0] || "Team Member",
              88
            );
          }
        }}
        onRemoveFromTeam={(studentId) => {
          if (activeProject) {
            handleRemoveTeamMember(activeProject.id, studentId);
          }
        }}
      />
    </div>
  );
}

