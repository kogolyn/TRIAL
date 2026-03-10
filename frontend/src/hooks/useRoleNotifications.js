import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

function normalizeRole(role) {
  if (role === "medical") {
    return "hospital";
  }
  return role;
}

function upsertById(list, incoming) {
  if (!incoming?._id) {
    return list;
  }
  const idx = list.findIndex((item) => item._id === incoming._id);
  if (idx === -1) {
    return [incoming, ...list];
  }

  const next = [...list];
  next[idx] = { ...next[idx], ...incoming };
  return next;
}

export default function useRoleNotifications(user, options = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);

  const role = useMemo(() => normalizeRole(user?.role), [user?.role]);
  const userId = user?.id || user?._id;
  const ambulanceId = options.ambulanceId || user?.ambulanceId || localStorage.getItem("ambulanceId");
  const hospitalId = options.hospitalId || user?.hospitalId || localStorage.getItem("hospitalId");

  const refresh = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      const [notificationsRes, unreadRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/notifications/user/${userId}`, { params: { limit: 50 } }),
        axios.get(`${API_BASE_URL}/api/notifications/unread/${userId}`),
      ]);

      setNotifications(notificationsRes.data?.data || []);
      setUnreadCount(unreadRes.data?.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error.message);
    }
  }, [userId]);

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!userId || !notificationId) {
        return false;
      }

      try {
        await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`, { userId });
        setNotifications((prev) =>
          prev.map((item) => {
            if (item._id !== notificationId) {
              return item;
            }
            return {
              ...item,
              recipients: (item.recipients || []).map((recipient) => {
                if (String(recipient.userId) !== String(userId)) {
                  return recipient;
                }
                return { ...recipient, read: true };
              }),
            };
          }),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        return true;
      } catch (error) {
        console.error("Failed to mark notification as read:", error.message);
        return false;
      }
    },
    [userId],
  );

  const acknowledge = useCallback(
    async (notificationId) => {
      if (!userId || !notificationId) {
        return false;
      }

      try {
        await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/ack`, { userId });
        setNotifications((prev) =>
          prev.map((item) => {
            if (item._id !== notificationId) {
              return item;
            }
            return {
              ...item,
              recipients: (item.recipients || []).map((recipient) => {
                if (String(recipient.userId) !== String(userId)) {
                  return recipient;
                }
                return { ...recipient, read: true, acknowledged: true, acknowledgedAt: new Date().toISOString() };
              }),
            };
          }),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        return true;
      } catch (error) {
        console.error("Failed to acknowledge notification:", error.message);
        return false;
      }
    },
    [userId],
  );

  useEffect(() => {
    if (!userId || !role) {
      return undefined;
    }

    const refreshTimer = setTimeout(() => {
      refresh();
    }, 0);

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-role", role);
      socket.emit("join-user", String(userId));
      if (ambulanceId) {
        socket.emit("join-ambulance", String(ambulanceId));
      }
      if (hospitalId) {
        socket.emit("join-hospital", String(hospitalId));
      }
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("notification:new", (payload) => {
      setNotifications((prev) => {
        const exists = prev.some((item) => item._id === payload?._id);
        if (!exists) {
          setUnreadCount((count) => count + 1);
        }
        return upsertById(prev, payload);
      });
    });

    socket.on("notification:acknowledged", ({ notificationId, userId: ackUserId }) => {
      if (String(ackUserId) !== String(userId)) {
        return;
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item._id !== notificationId
            ? item
            : {
                ...item,
                recipients: (item.recipients || []).map((recipient) => {
                  if (String(recipient.userId) !== String(userId)) {
                    return recipient;
                  }
                  return { ...recipient, acknowledged: true, read: true, acknowledgedAt: new Date().toISOString() };
                }),
              },
        ),
      );
    });

    return () => {
      clearTimeout(refreshTimer);
      socket.disconnect();
      setConnected(false);
    };
  }, [ambulanceId, hospitalId, refresh, role, userId]);

  return {
    notifications,
    unreadCount,
    connected,
    refresh,
    markAsRead,
    acknowledge,
  };
}
