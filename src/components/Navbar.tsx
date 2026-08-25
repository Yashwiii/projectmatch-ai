import React from "react";
import {
  Users,
  Sparkles,
  PlusCircle,
  FolderKanban,
  UserCircle,
  LayoutDashboard,
  Home,
} from "lucide-react";
import { Project, TeamInvitation } from "../types";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { NotificationsPopover } from "./NotificationsPopover";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  projects: Project[];
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  onOpenCreateProject: () => void;
  userAvatar: string;
  invitations: TeamInvitation[];
  onAcceptInvitation: (invitationId: string) => void;
  onDeclineInvitation: (invitationId: string) => void;
  onMarkAllAsRead?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  projects,
  activeProjectId,
  setActiveProjectId,
  onOpenCreateProject,
  userAvatar,
  invitations,
  onAcceptInvitation,
  onDeclineInvitation,
  onMarkAllAsRead,
}) => {
  const activeProject = projects.find((p) => p.id === activeProjectId);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <button
              id="nav-brand-logo"
              onClick={() => setCurrentTab("landing")}
              className="flex items-center space-x-3 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
                    ProjectMatch<span className="text-indigo-600 dark:text-indigo-400 font-extrabold">.AI</span>
                  </span>
                  <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/80 uppercase tracking-wide">
                    Explainable AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  Build the right team for the right project
                </p>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200 dark:border-slate-800">
              <button
                id="nav-tab-home"
                onClick={() => setCurrentTab("landing")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  currentTab === "landing"
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>

              <button
                id="nav-tab-dashboard"
                onClick={() => setCurrentTab("dashboard")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  currentTab === "dashboard"
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                id="nav-tab-projects"
                onClick={() => setCurrentTab("projects")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  currentTab === "projects"
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                <span>Projects</span>
              </button>

              <button
                id="nav-tab-matching"
                onClick={() => setCurrentTab("matching")}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  currentTab === "matching"
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 font-semibold"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Find Teammates</span>
                {activeProject && activeProject.selectedTeamMemberIds.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    currentTab === "matching" ? "bg-white text-indigo-700" : "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                  }`}>
                    {activeProject.selectedTeamMemberIds.length}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-profile"
                onClick={() => setCurrentTab("profile")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  currentTab === "profile"
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <UserCircle className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Active Project Dropdown Pill */}
            {projects.length > 0 && (
              <div className="hidden lg:flex items-center text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 py-1.5">
                <span className="text-slate-400 dark:text-slate-500 mr-1.5 font-medium">Active:</span>
                <select
                  id="nav-active-project-selector"
                  value={activeProjectId}
                  onChange={(e) => setActiveProjectId(e.target.value)}
                  aria-label="Active Project"
                  className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[170px] truncate pr-1"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* In-app Notifications Popover */}
            <NotificationsPopover
              invitations={invitations}
              onAcceptInvitation={onAcceptInvitation}
              onDeclineInvitation={onDeclineInvitation}
              onMarkAllAsRead={onMarkAllAsRead}
            />

            {/* Theme Switcher Component */}
            <ThemeSwitcher />

            {/* Create Project Button */}
            <button
              id="nav-btn-create-project"
              onClick={onOpenCreateProject}
              className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Create Project</span>
              <span className="sm:hidden">Create</span>
            </button>

            {/* Profile Avatar Pill */}
            <button
              id="nav-btn-user-avatar"
              onClick={() => setCurrentTab("profile")}
              className="flex items-center space-x-2 pl-2 pr-1.5 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700/80"
              title="View my student profile"
            >
              <img
                src={userAvatar}
                alt="User avatar"
                className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
                Alex R.
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto space-x-1">
          <button
            onClick={() => setCurrentTab("landing")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${
              currentTab === "landing"
                ? "bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-bold"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentTab("dashboard")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${
              currentTab === "dashboard"
                ? "bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-bold"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab("projects")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${
              currentTab === "projects"
                ? "bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-bold"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setCurrentTab("matching")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
              currentTab === "matching" ? "bg-indigo-600 text-white" : "text-indigo-600 dark:text-indigo-400 font-bold"
            }`}
          >
            ✨ Find Team
          </button>
          <button
            onClick={() => setCurrentTab("profile")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${
              currentTab === "profile"
                ? "bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-bold"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Profile
          </button>
        </div>
      </div>
    </header>
  );
};

