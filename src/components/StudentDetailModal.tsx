import React from "react";
import { StudentProfile } from "../types";
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
} from "lucide-react";

interface StudentDetailModalProps {
  student: StudentProfile | null;
  onClose: () => void;
  onAddToTeam?: (studentId: string) => void;
  isInTeam?: boolean;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onAddToTeam,
  isInTeam,
}) => {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
          <div className="flex items-center space-x-4">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-xs"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                  {student.name}
                </h2>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                  {student.year}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 flex items-center space-x-1 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>{student.department}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Bio */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
              About & Background
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              {student.bio}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block">Experience</span>
              <span className="font-bold text-slate-800 text-xs">{student.experienceLevel}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block">Weekly Availability</span>
              <span className="font-bold text-slate-800 text-xs">{student.weeklyAvailability} hrs/wk</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block">Primary Role</span>
              <span className="font-bold text-indigo-600 text-xs truncate block">
                {student.preferredRoles[0] || "Engineer"}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block">Peer Rating</span>
              <span className="font-bold text-amber-600 text-xs flex items-center space-x-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{student.rating || 4.9} / 5.0</span>
              </span>
            </div>
          </div>

          {/* Skills Tag Cloud */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Skills & Technologies</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {student.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-indigo-50 text-indigo-800 font-semibold text-xs px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Domain Interests</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {student.interests.map((interest) => (
                <span
                  key={interest}
                  className="bg-slate-100 text-slate-700 font-medium text-xs px-2.5 py-1 rounded-lg border border-slate-200"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Previous Projects */}
          <div className="space-y-2 pt-1">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Past Shipped Projects ({student.previousProjects.length})</span>
            </h3>
            <div className="space-y-2.5">
              {student.previousProjects.map((proj, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5"
                >
                  <h4 className="font-bold text-slate-900 text-xs">{proj.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {proj.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
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
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-3 pt-2">
            {student.github && (
              <a
                href={student.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            )}
            {student.linkedin && (
              <a
                href={student.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
          <span className="text-slate-500 text-xs">
            Schedule: {student.availabilitySchedule || "Flexible Hours"}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>

            {onAddToTeam && (
              <button
                onClick={() => {
                  onAddToTeam(student.id);
                  onClose();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  isInTeam
                    ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                }`}
              >
                {isInTeam ? "Remove from Team" : "Add to Team"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
