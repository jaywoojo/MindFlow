// src/components/layout/TaskDetails.jsx
import { useState, useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';

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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'long',
    day: 'numeric', 
    year: 'numeric'
  });
};

const TaskDetails = ({ taskId, onEditTask }) => {
  const { tasks, completeTask } = useTasks();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Find the task in the tasks array when taskId changes
  useEffect(() => {
    if (taskId && tasks.length > 0) {
      const foundTask = tasks.find(t => t.id === taskId);
      setTask(foundTask || null);
    } else {
      setTask(null);
    }
  }, [taskId, tasks]);
  
  // Handle complete task action
  const handleCompleteTask = async () => {
    if (!task) return;
    
    try {
      setLoading(true);
      await completeTask(task.id);
      // No need to update the task state here as it will be updated
      // via the tasks state from useTasks when Firestore updates
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!task) {
    return (
      <div className="w-64 h-screen bg-white shadow-md">
        <div className="flex flex-col h-full p-6">
          <h2 className="text-lg font-bold text-gray-800">Task Details</h2>
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">Select a task to view details</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-64 h-screen bg-white shadow-md">
      <div className="flex flex-col h-full p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Task Details</h2>
        
        <h1 className="text-xl font-bold text-gray-800 mb-2">{task.title}</h1>
        
        <div 
          className="text-white text-sm rounded-full px-3 py-1 inline-block mb-6 w-fit"
          style={{ backgroundColor: getCategoryColor(task.category) }}
        >
          {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
        </div>
        
        <div className="mb-4">
          <p className="text-gray-500 text-sm mb-1">Due Date</p>
          <p className="text-gray-800">{formatDate(task.dueDate)}</p>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-1">Priority</p>
          <div 
            className="text-white text-sm rounded-full px-3 py-1 inline-block w-fit"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {task.priority.toUpperCase()}
          </div>
        </div>
        
        {task.status === 'completed' && (
          <div className="mb-6">
            <p className="text-gray-500 text-sm mb-1">Status</p>
            <div className="bg-green-100 text-green-800 text-sm rounded-full px-3 py-1 inline-block w-fit">
              COMPLETED
            </div>
          </div>
        )}
        
        {task.rolloverCount > 0 && (
          <div className="mb-6">
            <p className="text-gray-500 text-sm mb-1">Rollover Count</p>
            <div className="bg-amber-100 text-amber-800 text-sm rounded-full px-3 py-1 inline-block w-fit">
              {task.rolloverCount} {task.rolloverCount === 1 ? 'day' : 'days'}
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-1">Description</p>
          <div className="bg-gray-100 rounded-lg p-4 text-gray-800 text-sm">
            {task.description || 'No description provided.'}
          </div>
        </div>
        
        <div className="mt-auto space-y-3">
          {task.status !== 'completed' && (
            <button 
              onClick={handleCompleteTask}
              disabled={loading}
              className="w-full py-2 bg-gray-700 hover:bg-gray-800 transition-colors text-white rounded font-medium"
            >
              {loading ? 'Completing...' : 'Complete Task'}
            </button>
          )}
          <button 
            onClick={() => onEditTask(task)}
            className="w-full py-2 bg-gray-300 hover:bg-gray-400 transition-colors text-gray-700 rounded"
          >
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;