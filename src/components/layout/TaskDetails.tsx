// src/components/layout/TaskDetails.jsx
import { useState } from 'react';

// This is a placeholder function - we'll replace with actual data later
const getTaskById = (id) => {
  const tasks = {
    task1: { 
      id: 'task1', 
      title: 'Client Meeting', 
      category: 'work', 
      dueDate: 'March 18, 2025',
      priority: 'medium',
      description: 'Meeting with client to discuss project requirements and timeline. Prepare presentation slides and project proposal.',
    },
    task2: { 
      id: 'task2', 
      title: 'UX Wireframes', 
      category: 'work', 
      dueDate: 'March 18, 2025',
      priority: 'high',
      description: 'Create wireframes for the new dashboard interface. Include mobile and desktop versions with responsive design considerations.',
    }
  };
  
  return tasks[id];
};

const getCategoryColor = (category) => {
  const colors = {
    work: '#8b5cf6',
    personal: '#ec4899',
    health: '#10b981',
    finance: '#ef4444',
    learning: '#f59e0b',
    projects: '#4f46e5'
  };
  
  return colors[category] || '#3b82f6';
};

const getPriorityColor = (priority) => {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444'
  };
  
  return colors[priority] || '#3b82f6';
};

const TaskDetails = ({ taskId }) => {
  const task = taskId ? getTaskById(taskId) : null;
  
  if (!task) {
    return (
      <div className="w-64 h-screen glass-effect">
        <div className="flex flex-col h-full p-6">
          <h2 className="text-lg font-bold text-white">Task Details</h2>
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">Select a task to view details</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (


    <div className="w-64 min-h-screen glass-effect">
      <div className="flex flex-col h-full p-6">
        <h2 className="text-lg font-bold text-white mb-6">Task Details</h2>
        
        <h1 className="text-xl font-bold text-white mb-2">{task.title}</h1>
        
        <div 
          className="text-white text-sm rounded-full px-3 py-1 inline-block mb-6 w-fit"
          style={{ backgroundColor: getCategoryColor(task.category) }}
        >
          {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
        </div>
        
        <div className="mb-4">
          <p className="text-slate-400 text-sm mb-1">Due Date</p>
          <p className="text-white">{task.dueDate}</p>
        </div>
        
        <div className="mb-6">
          <p className="text-slate-400 text-sm mb-1">Priority</p>
          <div 
            className="text-white text-sm rounded-full px-3 py-1 inline-block w-fit"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {task.priority.toUpperCase()}
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-slate-400 text-sm mb-1">Description</p>
          <div className="bg-slate-800 rounded-lg p-4 text-white text-sm">
            {task.description}
          </div>
        </div>
        
        <div className="mt-auto space-y-3">
          <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded font-semibold">
            Complete Task
          </button>
          <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 transition-colors text-slate-300 rounded">
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;