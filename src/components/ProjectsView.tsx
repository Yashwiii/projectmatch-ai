import React, { useState } from "react";
import { Project, StudentProfile } from "../types";
import {
  FolderKanban,
  Search,
  Sparkles,
  PlusCircle,
  Users,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
} from "lucide-react";

interface ProjectsViewProps {
  projects: Project[];
  activeProjectId: string;
  onSelectActiveProject: (projectId: string) => void;
  onNavigateToMatching: (projectId: string) => void;
  onOpenCreateProject: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProjectId,
  onSelectActiveProject,
  onNavigateToMatching,
  onOpenCreateProject,
}) => {
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");

  const filteredProjects = projects.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchSkill = p.requiredSkills.some((s) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSkill) return false;
    }
    if (selectedDomain !== "ALL" && p.domain !== selectedDomain) return false;
    if (selectedType !== "ALL" && p.projectType !== selectedType) return false;
    return true;
  });

  const domains = Array.from(new Set(projects.map((p) => p.domain)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-150">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900">
              Project Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            My Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Manage your research, hackathon, and startup initiatives, and assemble high-performing teams with explainable AI.
          </p>
        </div>

        <button
          type="button"
          id="btn-create-project-main"
          onClick={onOpenCreateProject}
          aria-label="Create a new project"
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
        >
          <PlusCircle className="w-4 h-4" aria-hidden="true" />
          <span>+ Create Project</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project name, description, or required skill (e.g. PyTorch)..."
              aria-label="Search projects by name, description, or skill"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              aria-label="Filter projects by domain"
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="ALL">All Domains</option>
              {domains.map((d) => (
                <option key={d} value={d} className="bg-white dark:bg-slate-800">
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter projects by project type"
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="ALL">All Project Types</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Competition">Competition</option>
              <option value="Research">Research</option>
              <option value="Startup">Startup</option>
              <option value="Course Project">Course Project</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const isActive = project.id === activeProjectId;
          const memberCount = project.selectedTeamMemberIds.length;
          const status = project.status || (memberCount >= project.requiredTeamSize ? "Full" : "Recruiting");

          return (
            <div
              key={project.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                isActive
                  ? "border-indigo-500 ring-2 ring-indigo-500/10 dark:ring-indigo-500/20 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
              }`}
            >
              <div className="space-y-3">
                {/* Project Type and Project Status Badges */}
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900">
                    {project.projectType}
                  </span>
                  
                  {/* Project Status */}
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                      status === "Recruiting"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80"
                        : status === "In Progress"
                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" aria-hidden="true" />
                    <span>{status}</span>
                  </span>
                </div>

                {/* Project Title & Domain */}
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                    {project.title}
                  </h3>
                  <div className="mt-1 flex items-center space-x-1.5">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-100/60 dark:border-indigo-900/60">
                      {project.domain}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {project.duration}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Team Size info banner */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                    <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    <span>
                      Team Size: <strong className="text-slate-900 dark:text-white font-bold">{project.requiredTeamSize} members</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {memberCount} joined
                  </span>
                </div>

                {/* Required Skills Matrix */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Required Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {project.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Target Roles */}
                {project.requiredRoles && project.requiredRoles.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Target Roles
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {project.requiredRoles.map((r) => (
                        <span
                          key={r}
                          className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-medium px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/60"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer with 'Find My Team' button */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{project.weeklyCommitment}h / wk commitment</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Exp: {project.experienceRequired}
                  </span>
                </div>

                <button
                  type="button"
                  id={`btn-find-team-${project.id}`}
                  onClick={() => {
                    onSelectActiveProject(project.id);
                    onNavigateToMatching(project.id);
                  }}
                  aria-label={`Find team matches for ${project.title}`}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Find My Team</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
