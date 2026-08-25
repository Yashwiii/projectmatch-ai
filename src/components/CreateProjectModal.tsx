import React, { useState } from "react";
import {
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  HelpCircle,
  Layers,
  Clock,
  Users,
  Briefcase,
  Sliders,
} from "lucide-react";
import {
  Project,
  ProjectType,
  ExperienceLevel,
  AIAnalysisResult,
} from "../types";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProject: (project: Project) => void;
  onFindTeamForProject?: (project: Project) => void;
  authorName: string;
  authorDepartment: string;
}

const DOMAIN_OPTIONS = [
  "Healthcare AI",
  "ClimateTech & Clean Energy",
  "FinTech & Algorithmic Trading",
  "Web3 & Decentralized Systems",
  "EdTech & Learning Platforms",
  "Robotics & Hardware IoT",
  "Cybersecurity & Privacy",
  "Consumer Mobile & Social",
  "Artificial Intelligence & ML",
  "Bioinformatics & Genomics",
];

const PROJECT_TYPE_OPTIONS: ProjectType[] = [
  "Hackathon",
  "Competition",
  "Research",
  "Startup",
  "Course Project",
];

const COMMON_SKILLS_SUGGESTIONS = [
  "Python",
  "PyTorch",
  "Computer Vision",
  "FastAPI",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "PostgreSQL",
  "Docker",
  "Solidity",
  "UI/UX Design",
  "Figma",
  "Rust",
  "C++",
  "ROS2",
  "Natural Language Processing",
  "Machine Learning",
  "Data Analysis",
];

const COMMON_ROLES_SUGGESTIONS = [
  "ML / AI Engineer",
  "Full-Stack Developer",
  "Frontend Developer",
  "Backend Engineer",
  "UI/UX Designer",
  "Product Manager",
  "Data Scientist",
  "Smart Contract Developer",
  "Embedded Systems Engineer",
  "Research Lead",
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSaveProject,
  onFindTeamForProject,
  authorName,
  authorDepartment,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("Hackathon");
  const [domain, setDomain] = useState("Healthcare AI");
  const [requiredTeamSize, setRequiredTeamSize] = useState(4);
  const [duration, setDuration] = useState("36 Hours");
  const [weeklyCommitment, setWeeklyCommitment] = useState(15);
  const [experienceRequired, setExperienceRequired] = useState<ExperienceLevel | "Any">("Intermediate");

  // Skills and Roles states
  const [requiredSkills, setRequiredSkills] = useState<string[]>(["Python", "PyTorch"]);
  const [newReqSkill, setNewReqSkill] = useState("");

  const [preferredSkills, setPreferredSkills] = useState<string[]>(["React", "UI/UX Design"]);
  const [newPrefSkill, setNewPrefSkill] = useState("");

  const [requiredRoles, setRequiredRoles] = useState<string[]>([
    "ML / AI Engineer",
    "Frontend Developer",
  ]);
  const [newReqRole, setNewReqRole] = useState("");

  // AI Extraction state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [aiConfirmed, setAiConfirmed] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  if (!isOpen) return null;

  // AI Analysis Trigger
  const handleAnalyzeWithAI = async () => {
    if (!description.trim() || description.length < 15) {
      setAnalysisError("Please provide a project description (at least 15 characters) so AI can analyze requirements.");
      return;
    }

    setAnalysisError(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "New Project",
          description,
          projectType,
        }),
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        const extracted: AIAnalysisResult = resData.data;
        setAiAnalysisResult(extracted);
        setAiConfirmed(false);

        // Pre-fill form fields with extracted values
        if (extracted.domain) setDomain(extracted.domain);
        if (extracted.requiredSkills?.length) setRequiredSkills(extracted.requiredSkills);
        if (extracted.preferredSkills?.length) setPreferredSkills(extracted.preferredSkills);
        if (extracted.recommendedRoles?.length) setRequiredRoles(extracted.recommendedRoles);
        if (extracted.weeklyCommitment) setWeeklyCommitment(extracted.weeklyCommitment);
        if (extracted.suggestedTeamSize) setRequiredTeamSize(extracted.suggestedTeamSize);
        if (extracted.suggestedDuration) setDuration(extracted.suggestedDuration);
        if (extracted.experienceLevel) {
          setExperienceRequired(
            (extracted.experienceLevel as ExperienceLevel) || "Intermediate"
          );
        }
      } else {
        setAnalysisError("Could not extract requirements automatically. You can fill the fields manually.");
      }
    } catch (err: any) {
      console.error("AI Analysis error:", err);
      setAnalysisError("Network or analysis error. Please fill requirements manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddSkill = (
    type: "required" | "preferred",
    skillName: string
  ) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (type === "required") {
      if (!requiredSkills.includes(trimmed)) {
        setRequiredSkills([...requiredSkills, trimmed]);
      }
      setNewReqSkill("");
    } else {
      if (!preferredSkills.includes(trimmed)) {
        setPreferredSkills([...preferredSkills, trimmed]);
      }
      setNewPrefSkill("");
    }
  };

  const handleRemoveSkill = (type: "required" | "preferred", skill: string) => {
    if (type === "required") {
      setRequiredSkills(requiredSkills.filter((s) => s !== skill));
    } else {
      setPreferredSkills(preferredSkills.filter((s) => s !== skill));
    }
  };

  const handleAddRole = (roleName: string) => {
    const trimmed = roleName.trim();
    if (!trimmed) return;
    if (!requiredRoles.includes(trimmed)) {
      setRequiredRoles([...requiredRoles, trimmed]);
    }
    setNewReqRole("");
  };

  const handleRemoveRole = (role: string) => {
    setRequiredRoles(requiredRoles.filter((r) => r !== role));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      projectType,
      domain,
      requiredTeamSize: Number(requiredTeamSize) || 4,
      duration: duration.trim() || "1 Semester",
      weeklyCommitment: Number(weeklyCommitment) || 15,
      availabilityRequirement:
        aiAnalysisResult &&
        aiAnalysisResult.weeklyCommitment === Number(weeklyCommitment) &&
        aiAnalysisResult.availabilityRequirement
          ? aiAnalysisResult.availabilityRequirement
          : `${weeklyCommitment} hours/week`,
      requiredSkills: requiredSkills.length > 0 ? requiredSkills : ["Python", "General Engineering"],
      preferredSkills: preferredSkills,
      requiredRoles: requiredRoles.length > 0 ? requiredRoles : ["Lead Developer", "Contributor"],
      experienceRequired,
      createdAt: new Date().toISOString().split("T")[0],
      authorName,
      authorDepartment,
      selectedTeamMemberIds: [],
      isOwner: true,
      aiExtracted: !!aiAnalysisResult,
      status: "Recruiting",
    };

    onSaveProject(newProject);
    onClose();
  };

  // Quick Preset Sample Prompts for Instant Demo testing
  const loadPreset = (presetType: "crop" | "health" | "climate" | "fintech") => {
    if (presetType === "crop") {
      setTitle("AgriVision: Crop Leaf Disease Detector");
      setDescription("Build an AI system that detects diseases in crop leaves using images.");
      setProjectType("Hackathon");
    } else if (presetType === "health") {
      setTitle("CardioLens: AI Heart Arrhythmia Monitor");
      setDescription("Building a real-time ECG telemetry analysis web app using CNN-LSTM neural networks to flag cardiac anomalies from wearable pulse monitors. We need to deploy a FastAPI backend and an intuitive doctor dashboard in React.");
      setProjectType("Hackathon");
    } else if (presetType === "climate") {
      setTitle("GridEco: Smart Microgrid Optimizer");
      setDescription("An IoT and full-stack platform for campus solar microgrids to forecast battery storage demand and minimize peak grid power tariffs using reinforcement learning and real-time sensor streams.");
      setProjectType("Startup");
    } else {
      setTitle("ZeroKnowledge Ledger: Private Payroll Protocol");
      setDescription("Developing a zk-SNARK smart contract privacy layer on Ethereum for anonymous student payroll disbursements and university grant allocations without revealing wallet identities.");
      setProjectType("Research");
    }
  };

  const handleFindTeamDirectly = () => {
    if (!title.trim() || !description.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      projectType,
      domain,
      requiredTeamSize: Number(requiredTeamSize) || 4,
      duration: duration.trim() || "1 Semester",
      weeklyCommitment: Number(weeklyCommitment) || 15,
      availabilityRequirement:
        aiAnalysisResult &&
        aiAnalysisResult.weeklyCommitment === Number(weeklyCommitment) &&
        aiAnalysisResult.availabilityRequirement
          ? aiAnalysisResult.availabilityRequirement
          : `${weeklyCommitment} hours/week`,
      requiredSkills: requiredSkills.length > 0 ? requiredSkills : ["Python", "General Engineering"],
      preferredSkills: preferredSkills,
      requiredRoles: requiredRoles.length > 0 ? requiredRoles : ["Lead Developer", "Contributor"],
      experienceRequired,
      createdAt: new Date().toISOString().split("T")[0],
      authorName,
      authorDepartment,
      selectedTeamMemberIds: [],
      isOwner: true,
      aiExtracted: !!aiAnalysisResult,
      status: "Recruiting",
    };

    if (onFindTeamForProject) {
      onFindTeamForProject(newProject);
    } else {
      onSaveProject(newProject);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-project-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white" aria-hidden="true">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 id="create-project-modal-title" className="font-bold text-slate-900 dark:text-white text-lg">
                Create New Project
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define your vision and let Explainable AI match complementary teammates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close create project dialog"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Preset Prompts Helper */}
          <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <span>Quick Demo Idea Presets:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                id="btn-preset-crop-disease"
                onClick={() => loadPreset("crop")}
                aria-label="Load Crop Disease AI preset"
                className="text-xs bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-700 font-semibold px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/60 shadow-2xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
              >
                🌱 Crop Disease AI
              </button>
              <button
                type="button"
                onClick={() => loadPreset("health")}
                aria-label="Load Healthcare AI preset"
                className="text-xs bg-white dark:bg-slate-800 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700 font-medium px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/60 shadow-2xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
              >
                🏥 Healthcare AI
              </button>
              <button
                type="button"
                onClick={() => loadPreset("climate")}
                aria-label="Load Clean Energy preset"
                className="text-xs bg-white dark:bg-slate-800 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700 font-medium px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/60 shadow-2xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
              >
                ⚡ Clean Energy
              </button>
              <button
                type="button"
                onClick={() => loadPreset("fintech")}
                aria-label="Load Web3 & Privacy preset"
                className="text-xs bg-white dark:bg-slate-800 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700 font-medium px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/60 shadow-2xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
              >
                🔒 Web3 & Privacy
              </button>
            </div>
          </div>

          {/* Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label htmlFor="create-project-input-title" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="create-project-input-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., NeuroScan AI: Early Alzheimer's Detection"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm font-medium focus-visible:outline-hidden"
              />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="create-project-select-type" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Project Type <span className="text-rose-500">*</span>
              </label>
              <select
                id="create-project-select-type"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 text-sm font-medium focus-visible:outline-hidden"
              >
                {PROJECT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description & Analyze with AI Section */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="create-project-input-description" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Project Description <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Explain the problem, tech stack, and goals
              </span>
            </div>
            <textarea
              id="create-project-input-description"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your technical architecture, objectives, and what kind of collaborators you are looking for..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm focus-visible:outline-hidden"
            />

            {/* Prominent Analyze with AI Button */}
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                id="btn-analyze-with-ai"
                onClick={handleAnalyzeWithAI}
                disabled={isAnalyzing}
                aria-label="Analyze project description with AI"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>AI Analyzing Project Requirements...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    <span>Analyze with AI</span>
                  </>
                )}
              </button>

              <span className="text-xs text-slate-600 dark:text-slate-400">
                ⚡ Auto-extracts domain, required skills, roles, and weekly hours
              </span>
            </div>

            {analysisError && (
              <div role="alert" className="mt-2 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
                <span>{analysisError}</span>
              </div>
            )}
          </div>

          {/* AI Project Analysis Card (Core Feature 1) */}
          {aiAnalysisResult && (
            <div
              id="ai-project-analysis-card"
              role="region"
              aria-label="AI Project Analysis Results"
              className="bg-slate-900 text-white rounded-2xl p-5 border border-indigo-500/50 shadow-xl space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300" aria-hidden="true">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-indigo-200">
                      AI Project Analysis
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Inferred technical criteria & complementary team blueprint
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  <span>AI Inferred</span>
                </span>
              </div>

              {/* Rationale / Summary */}
              <p className="text-xs text-slate-300 italic bg-slate-800/90 p-3 rounded-xl border border-slate-700/80 leading-relaxed">
                "{aiAnalysisResult.aiSummary}"
              </p>

              {/* Domain, Experience, Availability Key Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Domain</span>
                  <span className="font-bold text-indigo-300 text-xs block mt-0.5">{aiAnalysisResult.domain}</span>
                </div>
                <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Experience</span>
                  <span className="font-bold text-emerald-300 text-xs block mt-0.5">{aiAnalysisResult.experienceLevel}</span>
                </div>
                <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Availability</span>
                  <span className="font-bold text-amber-300 text-xs block mt-0.5">
                    {aiAnalysisResult.availabilityRequirement || `${aiAnalysisResult.weeklyCommitment} hours/week`}
                  </span>
                </div>
              </div>

              {/* Detailed Skills & Roles Breakdown */}
              <div className="space-y-2.5 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 text-xs">
                {/* Required Skills */}
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                    Required Skills (40% Match Weight)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiAnalysisResult.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills */}
                {aiAnalysisResult.preferredSkills && aiAnalysisResult.preferredSkills.length > 0 && (
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                      Preferred Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiAnalysisResult.preferredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="bg-slate-700 text-slate-300 border border-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-md"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Roles */}
                {aiAnalysisResult.recommendedRoles && aiAnalysisResult.recommendedRoles.length > 0 && (
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                      Recommended Team Roles
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiAnalysisResult.recommendedRoles.map((role) => (
                        <span
                          key={role}
                          className="bg-blue-500/20 text-blue-200 border border-blue-500/40 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons for AI Card: "Edit Requirements" and "Find My Team" */}
              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-slate-400 text-[11px]">
                  Review the AI-generated requirements above before matching.
                </span>
                <div className="flex items-center space-x-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    id="btn-edit-requirements"
                    onClick={() => {
                      const manualSection = document.getElementById("manual-project-fields");
                      if (manualSection) {
                        manualSection.scrollIntoView({ behavior: "smooth" });
                      }
                      setAiConfirmed(true);
                    }}
                    aria-label="Edit project requirements manually"
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer text-center focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
                  >
                    Edit Requirements
                  </button>
                  <button
                    type="button"
                    id="btn-find-my-team-from-ai"
                    onClick={handleFindTeamDirectly}
                    aria-label="Find my team from AI requirements"
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
                  >
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Find My Team</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div id="manual-project-fields" className="space-y-6 pt-2">

          {/* Domain & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label htmlFor="create-project-select-domain" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Domain / Industry <span className="text-rose-500">*</span>
              </label>
              <select
                id="create-project-select-domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 text-sm font-medium focus-visible:outline-hidden"
              >
                {DOMAIN_OPTIONS.map((d) => (
                  <option key={d} value={d} className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="create-project-input-team-size" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Required Team Size
              </label>
              <input
                id="create-project-input-team-size"
                type="number"
                min={2}
                max={8}
                value={requiredTeamSize}
                onChange={(e) => setRequiredTeamSize(Number(e.target.value))}
                aria-label="Required team size"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm font-medium focus-visible:outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="create-project-input-duration" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Duration
              </label>
              <input
                id="create-project-input-duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 36 Hours"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm font-medium focus-visible:outline-hidden"
              />
            </div>
          </div>

          {/* Commitment & Experience Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="create-project-input-commitment" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Weekly Commitment (Hours / Week)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  id="create-project-input-commitment"
                  type="range"
                  min={5}
                  max={35}
                  step={1}
                  value={weeklyCommitment}
                  onChange={(e) => setWeeklyCommitment(Number(e.target.value))}
                  aria-label="Weekly commitment in hours per week"
                  aria-valuemin={5}
                  aria-valuemax={35}
                  aria-valuenow={weeklyCommitment}
                  className="flex-1 accent-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs w-20 text-center">
                  {weeklyCommitment} hrs/wk
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="create-project-select-experience" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Experience Level Required
              </label>
              <select
                id="create-project-select-experience"
                value={experienceRequired}
                onChange={(e) =>
                  setExperienceRequired(e.target.value as ExperienceLevel | "Any")
                }
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm font-medium focus-visible:outline-hidden"
              >
                <option value="Any" className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100">Any Level</option>
                <option value="Beginner" className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100">Beginner Friendly</option>
                <option value="Intermediate" className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100">Intermediate</option>
                <option value="Advanced" className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100">Advanced / Senior</option>
                <option value="Expert" className="bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100">Expert / Specialized</option>
              </select>
            </div>
          </div>

          {/* Required Skills Matrix */}
          <div>
            <label htmlFor="input-new-req-skill" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Required Skills (Hard Criteria - 40% Match Weight)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {requiredSkills.map((sk) => (
                <span
                  key={sk}
                  className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center space-x-1"
                >
                  <span>{sk}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill("required", sk)}
                    aria-label={`Remove required skill ${sk}`}
                    className="text-indigo-500 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100 cursor-pointer ml-1 font-bold focus-visible:ring-1 focus-visible:ring-indigo-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="input-new-req-skill"
                type="text"
                value={newReqSkill}
                onChange={(e) => setNewReqSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill("required", newReqSkill);
                  }
                }}
                placeholder="Type skill & press Enter (e.g. PyTorch)"
                aria-label="Add new required skill"
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddSkill("required", newReqSkill)}
                aria-label="Add required skill to list"
                className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
              >
                + Add
              </button>
            </div>

            {/* Quick skill pills */}
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">Suggestions:</span>
              {COMMON_SKILLS_SUGGESTIONS.slice(0, 7).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddSkill("required", s)}
                  aria-label={`Add suggestion skill ${s}`}
                  className="text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-500"
                >
                  +{s}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Skills */}
          <div>
            <label htmlFor="input-new-pref-skill" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Preferred / Nice-to-Have Skills
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {preferredSkills.map((sk) => (
                <span
                  key={sk}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center space-x-1"
                >
                  <span>{sk}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill("preferred", sk)}
                    aria-label={`Remove preferred skill ${sk}`}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 cursor-pointer ml-1 font-bold focus-visible:ring-1 focus-visible:ring-indigo-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="input-new-pref-skill"
                type="text"
                value={newPrefSkill}
                onChange={(e) => setNewPrefSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill("preferred", newPrefSkill);
                  }
                }}
                placeholder="Add preferred skill (e.g. Docker, UI/UX Design)"
                aria-label="Add new preferred skill"
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddSkill("preferred", newPrefSkill)}
                aria-label="Add preferred skill to list"
                className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Required Roles Matrix */}
          <div>
            <label htmlFor="input-new-req-role" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Required Roles on the Team
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {requiredRoles.map((role) => (
                <span
                  key={role}
                  className="bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center space-x-1"
                >
                  <span>{role}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(role)}
                    aria-label={`Remove required role ${role}`}
                    className="text-blue-500 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 cursor-pointer ml-1 font-bold focus-visible:ring-1 focus-visible:ring-indigo-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="input-new-req-role"
                type="text"
                value={newReqRole}
                onChange={(e) => setNewReqRole(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRole(newReqRole);
                  }
                }}
                placeholder="Type role & press Enter (e.g. UI/UX Designer, ML Engineer)"
                aria-label="Add new required role"
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddRole(newReqRole)}
                aria-label="Add role to requirements"
                className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
              >
                + Add Role
              </button>
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">Suggestions:</span>
              {COMMON_ROLES_SUGGESTIONS.slice(0, 6).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleAddRole(r)}
                  aria-label={`Add suggestion role ${r}`}
                  className="text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-500"
                >
                  +{r}
                </button>
              ))}
            </div>
          </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-project-submit"
              aria-label="Save new project"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all duration-150 active:scale-98 cursor-pointer flex items-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Save Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
