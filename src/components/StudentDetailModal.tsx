import React from "react";
import { StudentProfile, TeamRequestStatus } from "../types";
import {
  X,
  Github,
  Linkedin,
  Clock,
  Briefcase,
  GraduationCap,
  Sparkles,
  BookOpen,
  Heart,
  Layers,
  Star,
  CheckCircle2,
  Send,
  Trash2,
} from "lucide-react";

interface StudentDetailModalProps {
  student: StudentProfile | null;
  onClose: () => void;
  onAddToTeam?: (studentId: string) => void;
  isInTeam?: boolean;
  invitationStatus?: TeamRequestStatus | "None";
  onSendTeamRequest?: (student: StudentProfile) => void;
  onRemoveFromTeam?: (studentId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onAddToTeam,
  isInTeam,
  invitationStatus,
  onSendTeamRequest,
  onRemoveFromTeam,
}) => {
  if (!student) return null;

  const isAccepted = isInTeam || invitationStatus === "Accepted";
  const isPending = invitationStatus === "Pending" && !isAccepted;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center space-x-4">
            <img
              src={student.avatar}
              alt={`${student.name}'s profile avatar`}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-xs"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="student-modal-title" className="font-extrabold text-slate-900 dark:text-white text-lg sm:text-xl">
                  {student.name}
                </h2>
                <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900">
                  {student.year}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <span>{student.department}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close student profile details"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Bio */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              About & Background
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              {student.bio}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Experience</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{student.experienceLevel}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Weekly Availability</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{student.weeklyAvailability} hrs/wk</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Primary Role</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs truncate block">
                {student.preferredRoles[0] || "Engineer"}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Peer Rating</span>
              <span className="font-bold text-amber-700 dark:text-amber-400 text-xs flex items-center space-x-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span>{student.rating || 4.9} / 5.0</span>
              </span>
            </div>
          </div>

          {/* Skills Tag Cloud */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <span>Skills & Technologies</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {student.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-200 font-semibold text-xs px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" aria-hidden="true" />
              <span>Domain Interests</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {student.interests.map((interest) => (
                <span
                  key={interest}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Previous Projects */}
          <div className="space-y-2 pt-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <span>Past Shipped Projects ({student.previousProjects.length})</span>
            </h3>
            <div className="space-y-2.5">
              {student.previousProjects.map((proj, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5"
                >
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">{proj.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {proj.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.tech.map((t) => (
                      <span
                        key={t}
                        className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Social Links */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Contact & Links
            </h3>
            
            {student.collegeEmail && (
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block">
                      College Email
                    </span>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {student.collegeEmail}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded">
                  {isAccepted ? "Connected Contact" : "College Verified"}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-1">
              {student.github && (
                <a
                  href={student.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${student.name}'s GitHub profile (opens in new tab)`}
                  className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
                >
                  <Github className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>GitHub</span>
                </a>
              )}
              {student.linkedin && (
                <a
                  href={student.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${student.name}'s LinkedIn profile (opens in new tab)`}
                  className="flex items-center space-x-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
                >
                  <Linkedin className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <span className="text-slate-600 dark:text-slate-400 text-xs">
            Schedule: {student.availabilitySchedule || "Flexible Hours"}
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
            >
              Close
            </button>

            {isAccepted && onRemoveFromTeam ? (
              <button
                type="button"
                onClick={() => {
                  onRemoveFromTeam(student.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/60 cursor-pointer flex items-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Remove from Team</span>
              </button>
            ) : isPending ? (
              <div className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 select-none flex items-center space-x-1.5 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" aria-hidden="true" />
                <span>Connection Sent ✓ (Pending)</span>
              </div>
            ) : onSendTeamRequest ? (
              <button
                type="button"
                onClick={() => {
                  onSendTeamRequest(student);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer flex items-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Connect</span>
              </button>
            ) : onAddToTeam ? (
              <button
                type="button"
                onClick={() => {
                  onAddToTeam(student.id);
                  onClose();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden ${
                  isInTeam
                    ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/60"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                }`}
              >
                {isInTeam ? "Remove from Team" : "Connect"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
