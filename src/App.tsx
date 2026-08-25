import React, { useState } from "react";
import {
  StudentProfile,
  Project,
} from "./types";
import {
  INITIAL_CURRENT_USER,
  DEMO_STUDENTS,
  INITIAL_PROJECTS,
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
  const [currentUser, setCurrentUser] = useState<StudentProfile>(INITIAL_CURRENT_USER);
  const [students, setStudents] = useState<StudentProfile[]>([
    INITIAL_CURRENT_USER,
    ...DEMO_STUDENTS,
  ]);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_PROJECTS[0].id);

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

  // Save profile updates
  const handleSaveProfile = (updated: StudentProfile) => {
    setCurrentUser(updated);
    setStudents((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
    showToast("Student profile successfully saved!");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
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
      />

      {/* Main View Router */}
      <main className="flex-1">
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
            onSelectProject={(id) => setActiveProjectId(id)}
            onUpdateProjectTeam={handleUpdateProjectTeam}
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
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-800 tracking-tight">
              ProjectMatch<span className="text-indigo-600">.AI</span>
            </span>
            <span>— Explainable AI Team Matching Platform for Students</span>
          </div>
          <div className="flex items-center space-x-4">
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
        onAddToTeam={(studentId) => {
          if (activeProject) {
            const isMember = activeProject.selectedTeamMemberIds.includes(studentId);
            const updated = isMember
              ? activeProject.selectedTeamMemberIds.filter((id) => id !== studentId)
              : [...activeProject.selectedTeamMemberIds, studentId];
            handleUpdateProjectTeam(activeProject.id, updated);
          }
        }}
      />
    </div>
  );
}
