// src/components/layout/Sidebar.tsx
import { useState, useEffect } from 'react';
// import { BrainCircuit } from 'lucide-react'; // Comment out the old icon
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
// Import the logo from assets
import MindFlowLogo from '../../assets/mindflow-logo-thicker.png'; // Adjust path as needed

const Sidebar = ({ onLogout, onAddTask }) => {
  const { currentUser } = useAuth();
  const { tasks } = useTasks();
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    totalTasks: 0,
    completionRate: 0
  });

  // Get the user's name and photo URL from their Google profile
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const photoURL = currentUser?.photoURL;
  
  // Create a proxied URL to bypass CORS restrictions
  const proxyPhotoURL = photoURL ? `https://images.weserv.nl/?url=${encodeURIComponent(photoURL)}` : null;

  // Calculate task statistics
  useEffect(() => {
    if (!tasks.length) return;

    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter tasks due today
    const todaysTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });
    
    // Count completed tasks for today
    const completedToday = todaysTasks.filter(task => task.status === 'completed').length;
    
    // Calculate completion rate for today's tasks
    const todayCompletionRate = todaysTasks.length > 0 
      ? Math.round((completedToday / todaysTasks.length) * 100) 
      : 0;
    
    setStats({
      tasksCompleted: completedToday,
      totalTasks: todaysTasks.length,
      completionRate: todayCompletionRate
    });
  }, [tasks]);

  return (
    <aside className="w-64 min-h-screen overflow-y-auto glass-effect">
      <div className="flex flex-col h-full p-6">
        {/* App Logo - Updated to use the MindFlow logo */}
        <div className="flex items-center mb-10">
          {/* Comment out the old logo
          <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          */}
          <img 
            src={MindFlowLogo} 
            alt="MindFlow Logo" 
            className="h-10 w-10 object-contain"
          />
          <h1 className="ml-2 text-xl font-bold text-gray-800">MindFlow</h1>
        </div>

        {/* User Profile */}
        <div className="flex flex-col items-center mb-8">
          {photoURL ? (
            <img 
              src={proxyPhotoURL} 
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
              style={{ width: `${(stats.tasksCompleted / stats.totalTasks) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">{stats.tasksCompleted}/{stats.totalTasks} Tasks Complete</p>
        </div>

        {/* Statistics */}
        <div>
          <p className="text-sm text-gray-600 mb-2">TODAY'S STATISTICS</p>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="text-sm text-gray-800">{stats.completionRate}%</span>
            </div>
          </div>
        </div>

        {/* Add Task Button */}
        <div className="mt-auto">
          <button 
            onClick={onAddTask}
            className="w-full py-2 px-4 bg-gray-700 rounded flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-white font-medium">Add Task</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;