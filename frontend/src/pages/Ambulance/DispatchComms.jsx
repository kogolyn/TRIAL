import React, { useState } from "react";

function DispatchComms({ messages = [], onRadioDispatch, onSendMessage }) {
  const [newMessage, setNewMessage] = useState("");

  const formatTime = (date) => {
    const parsed = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Now";

    const now = new Date();
    const diffMs = now - parsed;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  const handleSendMessage = async () => {
    const text = newMessage.trim();
    if (!text) return;

    if (onSendMessage) {
      await onSendMessage(text);
    }
    setNewMessage("");
  };

  return (
    <div className="rounded-xl border border-[#2a3142] overflow-hidden shadow-lg flex flex-col max-h-[600px] bg-[#111827]">
      <div className="px-6 py-4 border-b border-[#2a3142] flex justify-between items-center bg-[#1a1f2e]">
        <h3 className="text-base font-semibold text-blue-400">Dispatch Communications</h3>
        <button className="text-gray-400 hover:text-white transition-colors text-xl">*</button>
      </div>

      <div className="px-4 py-3 bg-[#1a1f2e] border-b border-[#2a3142]">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onRadioDispatch}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>R</span>
            <span>Radio Dispatch</span>
          </button>
          <button
            onClick={() => onSendMessage?.("Emergency support requested by ambulance crew.")}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>E</span>
            <span>Emergency Call</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#111827]">
        {messages.length === 0 && (
          <div className="text-sm text-gray-400 border border-[#2a3142] rounded-lg p-4 bg-[#1a1f2e]">
            No dispatch messages yet.
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg.id || `${msg.sender || "msg"}-${idx}`}
            className="bg-[#1a1f2e] border border-[#2a3142] rounded-lg p-4 hover:bg-[#1f2937] transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    msg.sender === "Dispatch" ? "bg-red-500" : "bg-green-500"
                  } animate-pulse`}
                />
                <span className="text-white font-semibold text-sm">{msg.sender || "System"}</span>
              </div>
              <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
            </div>

            <div className="mb-2">
              <span className="inline-block px-2 py-1 bg-gray-700 text-blue-400 text-xs font-mono rounded">
                {msg.code || "COMM"}
              </span>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">{msg.message}</p>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-[#1a1f2e] border-t border-[#2a3142]">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type message to dispatch..."
            className="flex-1 px-4 py-2 bg-[#111827] border border-[#2a3142] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default DispatchComms;
