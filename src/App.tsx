// App.tsx
import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/layout/Sidebar';
import MindMap from './components/mindmap/MindMap';
import TaskDetails from './components/layout/TaskDetails';
import TaskForm from './components/tasks/TaskForm';
import Login from './components/auth/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTasks } from './hooks/useTasks';

function AppContent() {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const { currentUser, logout } = useAuth();
  const { rolloverTasks, loading: tasksLoading } = useTasks();
  const [rolledOverCount, setRolledOverCount] = useState(0);
  const [rolledOverNotification, setRolledOverNotification] = useState(false);

  // Handle task rollover on app load
  /* useEffect(() => {
    async function handleRollover() {
      if (!currentUser || tasksLoading) return;
      
      try {
        // Only rollover tasks once after loading
        const count = await rolloverTasks();
        if (count > 0) {
          setRolledOverCount(count);
          setRolledOverNotification(true);
          // Automatically hide the notification after 5 seconds
          setTimeout(() => {
            setRolledOverNotification(false);
          }, 5000);
        }
      } catch (error) {
        console.error('Error rolling over tasks:', error);
      }
    }
    
    handleRollover();
  }, [currentUser, tasksLoading, rolloverTasks]); */

  const handleAddTask = () => {
    setSelectedTaskId(null);
    setShowTaskForm(true);
  };

  const handleSelectTask = (taskId) => {
    setShowTaskForm(false);
    setSelectedTaskId(taskId);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
  };

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="flex bg-blue-100 overflow-auto">
      <>
        {/* Left Sidebar */}
        <Sidebar 
          onLogout={logout} 
          onAddTask={handleAddTask} 
        />

        {/* Main Content - Mind Map */}
        <main className="flex-1 overflow-hidden relative">
          <MindMap onSelectTask={handleSelectTask} />
          
          {/* Rollover notification */}
          {rolledOverNotification && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-3 flex items-center">
              <div className="bg-amber-100 text-amber-800 rounded-full p-1 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">
                {rolledOverCount} {rolledOverCount === 1 ? 'task' : 'tasks'} rolled over to today
              </span>
              <button 
                onClick={() => setRolledOverNotification(false)}
                className="ml-3 text-gray-400 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </main>

        {/* Right Sidebar - Task Details or Task Form */}
        {showTaskForm ? (
          <TaskForm onClose={handleCloseTaskForm} />
        ) : (
          <TaskDetails taskId={selectedTaskId} />
        )}
      </>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;