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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Project Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            My Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage your research, hackathon, and startup initiatives, and assemble high-performing teams with explainable AI.
          </p>
        </div>

        <button
          id="btn-create-project-main"
          onClick={onOpenCreateProject}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Create Project</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project name, description, or required skill (e.g. PyTorch)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Domains</option>
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:bg-white focus:outline-none"
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
              className={`bg-white rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                isActive
                  ? "border-indigo-500 ring-2 ring-indigo-500/10 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 shadow-2xs"
              }`}
            >
              <div className="space-y-3">
                {/* Project Type and Project Status Badges */}
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-indigo-100">
                    {project.projectType}
                  </span>
                  
                  {/* Project Status */}
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                      status === "Recruiting"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : status === "In Progress"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span>{status}</span>
                  </span>
                </div>

                {/* Project Title & Domain */}
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                    {project.title}
                  </h3>
                  <div className="mt-1 flex items-center space-x-1.5">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100/60">
                      {project.domain}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {project.duration}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Team Size info banner */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>
                      Team Size: <strong className="text-slate-900 font-bold">{project.requiredTeamSize} members</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    {memberCount} joined
                  </span>
                </div>

                {/* Required Skills Matrix */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Required Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {project.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-200/60"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Target Roles */}
                {project.requiredRoles && project.requiredRoles.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Target Roles
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {project.requiredRoles.map((r) => (
                        <span
                          key={r}
                          className="bg-blue-50 text-blue-700 text-[11px] font-medium px-2 py-0.5 rounded"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer with 'Find My Team' button */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{project.weeklyCommitment}h / wk commitment</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Exp: {project.experienceRequired}
                  </span>
                </div>

                <button
                  id={`btn-find-team-${project.id}`}
                  onClick={() => {
                    onSelectActiveProject(project.id);
                    onNavigateToMatching(project.id);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
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
