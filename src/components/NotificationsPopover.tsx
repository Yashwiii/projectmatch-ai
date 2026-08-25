import React, { useState, useRef, useEffect } from "react";
import { TeamInvitation } from "../types";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  FolderKanban,
  Check,
  X,
  Send,
  Inbox,
} from "lucide-react";

interface NotificationsPopoverProps {
  invitations: TeamInvitation[];
  onAcceptInvitation: (invitationId: string) => void;
  onDeclineInvitation: (invitationId: string) => void;
  onMarkAllAsRead?: () => void;
  onSelectProject?: (projectId: string) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  invitations,
  onAcceptInvitation,
  onDeclineInvitation,
  onMarkAllAsRead,
  onSelectProject,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "resolved">("all");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Count unread / pending invitations
  const pendingCount = invitations.filter((inv) => inv.status === "Pending").length;
  const unreadCount = invitations.filter((inv) => !inv.isRead || inv.status === "Pending").length;

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredInvitations = invitations.filter((inv) => {
    if (filterTab === "pending") return inv.status === "Pending";
    if (filterTab === "resolved") return inv.status !== "Pending";
    return true;
  });

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Bell Icon Button */}
      <button
        id="btn-notifications-bell"
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && onMarkAllAsRead) {
            onMarkAllAsRead();
          }
        }}
        className={`relative p-2 rounded-xl transition-colors cursor-pointer border focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden ${
          isOpen
            ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-500/20"
            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800"
        }`}
        title="Team Invitations & Notifications"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="notifications-popover-panel"
      >
        <Bell className="w-4 h-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            id="notifications-badge-count"
            aria-hidden="true"
            className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs border-2 border-white dark:border-slate-900 animate-in zoom-in-50"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notifications Popover */}
      {isOpen && (
        <div
          id="notifications-popover-panel"
          role="dialog"
          aria-label="Team Invitations and Notifications"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Notifications
                </span>
                {pendingCount > 0 && (
                  <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    {pendingCount} Pending
                  </span>
                )}
              </div>

              {invitations.length > 0 && onMarkAllAsRead && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  aria-label="Mark all notifications as read"
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div role="tablist" aria-label="Notification filters" className="flex items-center space-x-1 mt-3 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                role="tab"
                aria-selected={filterTab === "all"}
                onClick={() => setFilterTab("all")}
                className={`flex-1 py-1 px-2 rounded-md font-semibold text-[11px] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden ${
                  filterTab === "all"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All ({invitations.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filterTab === "pending"}
                onClick={() => setFilterTab("pending")}
                className={`flex-1 py-1 px-2 rounded-md font-semibold text-[11px] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden ${
                  filterTab === "pending"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filterTab === "resolved"}
                onClick={() => setFilterTab("resolved")}
                className={`flex-1 py-1 px-2 rounded-md font-semibold text-[11px] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden ${
                  filterTab === "resolved"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Resolved ({invitations.length - pendingCount})
              </button>
            </div>
          </div>

          {/* Invitations List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredInvitations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" aria-hidden="true" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {filterTab === "pending" ? "No pending invitations" : "No notifications yet"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  When team owners send invitations or candidates accept requests, they will appear here.
                </p>
              </div>
            ) : (
              filteredInvitations.map((inv) => {
                const isPending = inv.status === "Pending";
                const isAccepted = inv.status === "Accepted";
                const isDeclined = inv.status === "Declined";

                return (
                  <div
                    key={inv.id}
                    id={`notification-item-${inv.id}`}
                    className={`p-4 space-y-3 transition-colors ${
                      isPending
                        ? "bg-indigo-50/40 dark:bg-indigo-950/20"
                        : "hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    {/* Notification Title & Meta */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2.5">
                        <img
                          src={inv.recipientAvatar}
                          alt={`${inv.recipientName}'s profile photo`}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                        />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center space-x-1">
                              <Sparkles className="w-3 h-3" aria-hidden="true" />
                              <span>New Team Invitation</span>
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                            {inv.senderName} wants to connect with you for {inv.projectTitle}
                          </p>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <span className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 shrink-0">
                        {inv.matchScore}% Match
                      </span>
                    </div>

                    {/* Project & Proposed Role Card Details */}
                    <div className="bg-white dark:bg-slate-800/90 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                      <div>
                        <div className="flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <FolderKanban className="w-3 h-3 text-slate-400" aria-hidden="true" />
                          <span>Project:</span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs mt-0.5">
                          {inv.projectTitle}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        <span className="text-slate-500 dark:text-slate-400">Proposed Role:</span>
                        <span className="font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/60">
                          {inv.proposedRole}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2 pt-0.5">
                        {inv.projectDescription}
                      </p>
                    </div>

                    {/* Action Buttons or Status Confirmation */}
                    {isPending ? (
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          type="button"
                          id={`btn-accept-invitation-${inv.id}`}
                          onClick={() => onAcceptInvitation(inv.id)}
                          aria-label={`Accept team invitation from ${inv.senderName} for ${inv.projectTitle}`}
                          className="flex-1 inline-flex items-center justify-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden"
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          id={`btn-decline-invitation-${inv.id}`}
                          onClick={() => onDeclineInvitation(inv.id)}
                          aria-label={`Decline team invitation from ${inv.senderName} for ${inv.projectTitle}`}
                          className="flex-1 inline-flex items-center justify-center space-x-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-900 font-bold text-xs py-2 px-3 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden"
                        >
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Decline</span>
                        </button>
                      </div>
                    ) : isAccepted ? (
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                          <span>Connected ✓</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                          Joined Project
                        </span>
                      </div>
                    ) : (
                      <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" aria-hidden="true" />
                          <span>Connection Declined</span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {inv.recipientName} declined
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Team invitations add accepted candidates directly to project rosters and recalculate Team Health in real time.
          </div>
        </div>
      )}
    </div>
  );
};
