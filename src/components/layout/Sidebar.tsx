// src/components/layout/Sidebar.tsx
import { useState } from 'react';
import { BrainCircuit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ onLogout }) => {
  const { currentUser } = useAuth();
  const [tasksCompleted, setTasksCompleted] = useState(4);
  const [totalTasks, setTotalTasks] = useState(7);
  const [focusTime, setFocusTime] = useState(2.5);
  const [taskStreak, setTaskStreak] = useState(5);
  const [completionRate, setCompletionRate] = useState(68);

  // Get the user's name and photo URL from their Google profile
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const photoURL = currentUser?.photoURL;

  return (
   /*  <aside className="w-64 min-h-screen bg-slate-800 overflow-y-auto">
      <div className="flex flex-col min-h-screen p-6"> */

    <aside className="w-64 min-h-screen overflow-y-auto glass-effect">
      <div className="flex flex-col h-full p-6">
      {/* App Logo */}
      <div className="flex items-center mb-10">
          <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <h1 className="ml-3 text-xl font-bold text-gray-800">MindFlow</h1>
        </div>

        {/* User Profile */}
        <div className="flex flex-col items-center mb-8">
          {photoURL ? (
            <img 
              src={photoURL} 
              alt="Profile" 
              className="w-20 h-20 rounded-full mb-3 object-cover border-2 border-gray-300"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-full mb-3 flex items-center justify-center text-xl font-bold text-gray-700">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="text-lg font-medium text-gray-800 mb-1">
            {userName}
          </h2>
          <button 
            onClick={onLogout}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-2">TODAY'S PROGRESS</p>
          <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
            <div 
              className="h-2 bg-green-600 rounded-full" 
              style={{ width: `${(tasksCompleted / totalTasks) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">{tasksCompleted}/{totalTasks} Tasks Complete</p>
        </div>

        {/* Statistics */}
        <div>
          <p className="text-sm text-gray-600 mb-2">STATISTICS</p>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="text-sm text-gray-600">Focus Time</span>
              <span className="text-sm text-gray-800">{focusTime} hrs</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="text-sm text-gray-600">Task Streak</span>
              <span className="text-sm text-gray-800">{taskStreak} days</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="text-sm text-gray-800">{completionRate}%</span>
            </div>
          </div>
        </div>

        {/* Add Task Button */}
        <div className="mt-auto">
          <button className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto hover:bg-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
