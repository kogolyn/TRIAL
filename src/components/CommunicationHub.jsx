import React, { useState } from "react";

const quickMessages = [
  "En route, ETA 5 mins",
  "Patient loaded, transporting",
  "Arrived at hospital",
];

const CommunicationHub = () => {
  const [messages, setMessages] = useState([]);
  const [customMessage, setCustomMessage] = useState("");

  const sendMessage = (text) => {
    const newMessage = {
      text,
      time: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [newMessage, ...prev]);
  };

  const handleCustomSend = () => {
    if (customMessage.trim() === "") return;
    sendMessage(customMessage);
    setCustomMessage("");
  };

  return (
    <div className="mt-5">
      <h2 className="text-lg font-semibold mb-3">Communication Hub</h2>

      {/* Quick Messages */}
      <div className="flex gap-2 flex-wrap">
        {quickMessages.map((msg, index) => (
          <button
            key={index}
            onClick={() => sendMessage(msg)}
            className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            {msg}
          </button>
        ))}
      </div>

      {/* Custom Message */}
      <div className="mt-4 flex items-center">
        <input
          type="text"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Type custom message..."
          className="p-2 w-7/12 mr-3 border rounded"
        />
        <button
          onClick={handleCustomSend}
          className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
        >
          Send
        </button>
      </div>

      {/* Message Log */}
      <div className="mt-5">
        <h3 className="text-md font-medium mb-2">Message Log</h3>
        {messages.length === 0 && <p className="text-sm text-slate-500">No messages sent yet.</p>}

        {messages.map((msg, index) => (
          <div
            key={index}
            className="bg-gray-100 p-2 rounded mb-2 text-sm"
          >
            <strong className="text-xs mr-2">{msg.time}</strong>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunicationHub;
