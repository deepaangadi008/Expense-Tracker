import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar({ profileName = '', profileEmail = '' }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <nav className="bg-blue-600 dark:bg-blue-800 text-white p-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold">Smart Expense Tracker</h1>
      <div className="flex items-center gap-4">
        <div className="hidden md:block text-right leading-tight bg-blue-700 dark:bg-blue-900 px-3 py-2 rounded">
          <p className="text-sm font-semibold">{profileName || 'User'}</p>
          <p className="text-xs opacity-90">{profileEmail || '-'}</p>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 bg-blue-700 dark:bg-blue-900 rounded hover:bg-blue-800"
        >
          {darkMode ? 'Light' : 'Dark'}
        </button>
        <button
          onClick={handleLogout}
          className="p-2 bg-red-600 hover:bg-red-700 rounded font-semibold"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
