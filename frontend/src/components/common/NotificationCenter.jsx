import React from "react";
import { Bell, CheckCircle2, CircleAlert } from "lucide-react";

function getPriorityClass(priority) {
  if (priority === "critical") {
    return "bg-red-100 text-red-700 border-red-200";
  }
  if (priority === "high") {
    return "bg-orange-100 text-orange-700 border-orange-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function NotificationCenter({
  title = "Live Notifications",
  connected = false,
  notifications = [],
  unreadCount = 0,
  onAcknowledge,
  onMarkAsRead,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
            {unreadCount} unread
          </span>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            connected ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {connected ? "Connected" : "Offline"}
        </span>
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">No notifications yet.</div>
        ) : (
          notifications.map((notification) => (
            <article key={notification._id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                  {notification.details ? (
                    <p className="text-xs text-slate-500 mt-1">{notification.details}</p>
                  ) : null}
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded border font-semibold ${getPriorityClass(
                        notification.priority,
                      )}`}
                    >
                      {(notification.priority || "normal").toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <CircleAlert className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => onMarkAsRead?.(notification._id)}
                  className="text-xs px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Mark read
                </button>
                <button
                  onClick={() => onAcknowledge?.(notification._id)}
                  className="text-xs px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Acknowledge
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
