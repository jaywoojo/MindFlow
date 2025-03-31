// src/components/layout/Sidebar.tsx
import { useState } from 'react';
import { BrainCircuit } from 'lucide-react';

const Sidebar = () => {
  const [tasksCompleted, setTasksCompleted] = useState(4);
  const [totalTasks, setTotalTasks] = useState(7);
  const [focusTime, setFocusTime] = useState(2.5);
  const [taskStreak, setTaskStreak] = useState(5);
  const [completionRate, setCompletionRate] = useState(68);

  return (
    <aside className="w-64 min-h-screen bg-slate-800 overflow-y-auto">
      <div className="flex flex-col min-h-screen p-6">
        {/* App Logo */}
        <div className="flex items-center mb-10">
          {/* <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div> */}
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <h1 className="ml-3 text-xl font-bold">MindFlow</h1>
        </div>

        {/* User Profile */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-slate-700 rounded-full mb-3"></div>
          <h2 className="text-lg font-medium">Jay Jo</h2>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <p className="text-sm text-slate-400 mb-2">TODAY'S PROGRESS</p>
          <div className="w-full h-2 bg-slate-700 rounded-full mb-2">
            <div 
              className="h-2 bg-blue-600 rounded-full" 
              style={{ width: `${(tasksCompleted / totalTasks) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm">{tasksCompleted}/{totalTasks} Tasks Complete</p>
        </div>

        {/* Statistics */}
        <div>
          <p className="text-sm text-slate-400 mb-2">STATISTICS</p>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-sm text-slate-400">Focus Time</span>
              <span className="text-sm">{focusTime} hrs</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-sm text-slate-400">Task Streak</span>
              <span className="text-sm">{taskStreak} days</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-sm text-slate-400">Completion Rate</span>
              <span className="text-sm">{completionRate}%</span>
            </div>
          </div>
        </div>

        {/* Add Task Button */}
        <div className="mt-auto">
          <div class="mt-6">
            <button className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;