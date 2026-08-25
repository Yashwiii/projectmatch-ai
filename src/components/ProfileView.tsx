import React, { useState } from "react";
import {
  StudentProfile,
  AcademicYear,
  ExperienceLevel,
  StudentProject,
} from "../types";
import {
  UserCircle,
  Edit3,
  Check,
  Plus,
  Trash2,
  Github,
  Linkedin,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  ExternalLink,
  GraduationCap,
  Heart,
  BookOpen,
} from "lucide-react";

interface ProfileViewProps {
  profile: StudentProfile;
  onSaveProfile: (updatedProfile: StudentProfile) => void;
  onNavigateToMatching: () => void;
}

const YEAR_OPTIONS: AcademicYear[] = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Master's",
  "PhD",
];

const EXPERIENCE_OPTIONS: ExperienceLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

const POPULAR_SKILLS = [
  "Python",
  "PyTorch",
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
  "Machine Learning",
  "Computer Vision",
  "Natural Language Processing",
  "C++",
  "Go",
  "Rust",
];

const POPULAR_INTERESTS = [
  "Healthcare AI",
  "ClimateTech & Clean Energy",
  "FinTech & Algorithmic Trading",
  "Web3 & Decentralized Systems",
  "EdTech & Learning Platforms",
  "Robotics & Hardware IoT",
  "Cybersecurity",
  "Autonomous Vehicles",
  "Open Source",
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onSaveProfile,
  onNavigateToMatching,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudentProfile>({ ...profile });

  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newRole, setNewRole] = useState("");

  // New Project entry state
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjTech, setNewProjTech] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsEditing(false);
  };

  const handleAddSkill = (skill: string) => {
    const s = skill.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData({ ...formData, skills: [...formData.skills, s] });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleAddInterest = (interest: string) => {
    const i = interest.trim();
    if (i && !formData.interests.includes(i)) {
      setFormData({ ...formData, interests: [...formData.interests, i] });
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    });
  };

  const handleAddRole = (role: string) => {
    const r = role.trim();
    if (r && !formData.preferredRoles.includes(r)) {
      setFormData({
        ...formData,
        preferredRoles: [...formData.preferredRoles, r],
      });
      setNewRole("");
    }
  };

  const handleRemoveRole = (role: string) => {
    setFormData({
      ...formData,
      preferredRoles: formData.preferredRoles.filter((r) => r !== role),
    });
  };

  const handleCreatePastProject = () => {
    if (!newProjTitle.trim()) return;
    const techArray = newProjTech
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newProject: StudentProject = {
      title: newProjTitle.trim(),
      description: newProjDesc.trim(),
      tech: techArray.length > 0 ? techArray : ["Software Engineering"],
    };

    setFormData({
      ...formData,
      previousProjects: [...formData.previousProjects, newProject],
    });

    setNewProjTitle("");
    setNewProjDesc("");
    setNewProjTech("");
    setShowAddProject(false);
  };

  const handleRemovePastProject = (index: number) => {
    const updated = formData.previousProjects.filter((_, i) => i !== index);
    setFormData({ ...formData, previousProjects: updated });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-5">
            <img
              src={formData.avatar}
              alt={formData.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-sm shrink-0"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {formData.name}
                </h1>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {formData.year}
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-100">
                  {formData.experienceLevel} Level
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-700 flex items-center space-x-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>{formData.department}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Availability: <strong className="text-slate-800 font-bold">{formData.weeklyAvailability} hrs/wk</strong>
                  </span>
                </span>
                {formData.github && (
                  <a
                    href={formData.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-slate-600 hover:text-indigo-600 font-medium"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {formData.linkedin && (
                  <a
                    href={formData.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-slate-600 hover:text-indigo-600 font-medium"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {!isEditing ? (
              <button
                id="btn-edit-profile-toggle"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                id="btn-save-profile-toggle"
                onClick={handleSave}
                className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form / View Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Bio, Skills, Interests, Past Projects */}
        <div className="lg:col-span-8 space-y-6">
          {/* About / Bio */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <UserCircle className="w-4 h-4 text-indigo-600" />
              <span>About & Focus</span>
            </h2>

            {isEditing ? (
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your technical passions, hackathon goals, and research interests..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none"
              />
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">
                {formData.bio || "No bio added yet."}
              </p>
            )}
          </div>

          {/* Skills Matrix (Tag Based) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Skills & Technical Proficiencies</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {formData.skills.length} skills listed
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-indigo-50 text-indigo-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 flex items-center space-x-1.5 shadow-2xs"
                >
                  <span>{skill}</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-indigo-400 hover:text-indigo-700 ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isEditing && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill(newSkill);
                      }
                    }}
                    placeholder="Type a skill and press Enter..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(newSkill)}
                    className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    + Add Skill
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-[11px] text-slate-400 mr-1">Quick Add:</span>
                  {POPULAR_SKILLS.slice(0, 8).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSkill(s)}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded cursor-pointer"
                    >
                      +{s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interests & Domains (Tag Based) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Interests & Project Domains</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {formData.interests.length} interests
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest) => (
                <span
                  key={interest}
                  className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center space-x-1.5"
                >
                  <span>{interest}</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="text-slate-400 hover:text-slate-700 ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isEditing && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddInterest(newInterest);
                      }
                    }}
                    placeholder="Type an interest or research area..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddInterest(newInterest)}
                    className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    + Add Interest
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-[11px] text-slate-400 mr-1">Quick Add:</span>
                  {POPULAR_INTERESTS.slice(0, 6).map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddInterest(i)}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded cursor-pointer"
                    >
                      +{i}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Previous Projects Showcase */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Previous Projects & Hackathons</span>
              </h2>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowAddProject(!showAddProject)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              )}
            </div>

            {/* Add Project Sub-form */}
            {showAddProject && (
              <div className="bg-slate-50 p-4 rounded-xl border border-indigo-200 space-y-3">
                <h3 className="font-bold text-xs text-slate-800">Add Past Project</h3>
                <input
                  type="text"
                  placeholder="Project Name (e.g. MedVision Diagnostic)"
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <textarea
                  rows={2}
                  placeholder="Brief description of your role and outcome..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Technologies used comma-separated (e.g. PyTorch, React, FastAPI)"
                  value={newProjTech}
                  onChange={(e) => setNewProjTech(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProject(false)}
                    className="text-xs px-3 py-1 text-slate-500 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreatePastProject}
                    className="text-xs px-3 py-1 bg-indigo-600 text-white font-semibold rounded-md cursor-pointer"
                  >
                    Save Project
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {formData.previousProjects.map((proj, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{proj.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {proj.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj.tech.map((t) => (
                          <span
                            key={t}
                            className="bg-white text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemovePastProject(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Roles, Availability, Links */}
        <div className="lg:col-span-4 space-y-6">
          {/* Preferred Roles */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Preferred Roles</span>
            </h2>

            <div className="flex flex-wrap gap-1.5">
              {formData.preferredRoles.map((role) => (
                <span
                  key={role}
                  className="bg-blue-50 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-200 flex items-center space-x-1"
                >
                  <span>{role}</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(role)}
                      className="text-blue-400 hover:text-blue-700 ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isEditing && (
              <div className="flex items-center space-x-1.5 pt-2">
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. ML Engineer"
                  className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddRole(newRole)}
                  className="bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer"
                >
                  + Add
                </button>
              </div>
            )}
          </div>

          {/* Availability & Commitment */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Availability & Schedule</span>
            </h2>

            {isEditing ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Hours per week ({formData.weeklyAvailability}h)
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={40}
                    value={formData.weeklyAvailability}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weeklyAvailability: Number(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Schedule Notes
                  </label>
                  <input
                    type="text"
                    value={formData.availabilitySchedule || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availabilitySchedule: e.target.value,
                      })
                    }
                    placeholder="e.g. Evenings after 5pm & Weekends"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Academic Year
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: e.target.value as AcademicYear,
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experienceLevel: e.target.value as ExperienceLevel,
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    {EXPERIENCE_OPTIONS.map((exp) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Weekly Capacity</span>
                  <span className="font-bold text-slate-900">{formData.weeklyAvailability} hrs/week</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Schedule</span>
                  <span className="font-semibold text-slate-800 text-right">{formData.availabilitySchedule || "Flexible"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Academic Standing</span>
                  <span className="font-semibold text-slate-800">{formData.year}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Experience Level</span>
                  <span className="font-semibold text-slate-800">{formData.experienceLevel}</span>
                </div>
              </div>
            )}
          </div>

          {/* Social & Contact Links */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Profiles & Links</h2>

            {isEditing ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">GitHub URL</label>
                  <input
                    type="text"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {formData.github && (
                  <a
                    href={formData.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors text-slate-800"
                  >
                    <div className="flex items-center space-x-2">
                      <Github className="w-4 h-4 text-slate-700" />
                      <span className="font-semibold">GitHub Profile</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
                {formData.linkedin && (
                  <a
                    href={formData.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors text-slate-800"
                  >
                    <div className="flex items-center space-x-2">
                      <Linkedin className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">LinkedIn Profile</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
