import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div className="bg-white border-b border-gray-200 text-gray-800 flex items-center justify-between px-5 h-[50px]">
      <nav className="flex gap-2.5">
        <button className="px-4 py-1.5 text-xs uppercase border rounded bg-blue-600 text-white border-blue-600 font-bold hover:bg-blue-700">
          DISPATCHER
        </button>
      </nav>
      <button
        onClick={handleLogout}
        className="px-4 py-1.5 text-xs uppercase border rounded bg-red-600 text-white border-red-600 font-bold hover:bg-red-700 transition-colors"
      >
        LOGOUT
      </button>
    </div>
  );
}
