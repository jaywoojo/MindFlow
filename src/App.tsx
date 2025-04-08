//App.tsx
import { useState } from 'react'
import './App.css'
import Sidebar from './components/layout/Sidebar';
import MindMap from './components/mindmap/MindMap';
import TaskDetails from './components/layout/TaskDetails';
import TaskForm from './components/tasks/TaskForm';
import Login from './components/auth/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTasks } from './hooks/useTasks';

function AppContent() {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { currentUser, logout } = useAuth();
  const { addTask, updateTask } = useTasks();

  const handleAddTask = async (taskData) => {
    try {
      await addTask(taskData);
      setShowTaskForm(false);
    } catch (error) {
      // Error handling will be done in the TaskForm component
      console.error('Error adding task:', error);
    }
  };

  const handleEditTask = async (taskData) => {
    if (editingTask) {
      try {
        await updateTask(editingTask.id, taskData);
        setShowTaskForm(false);
        setEditingTask(null);
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  const openTaskForm = (task = null) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const closeTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  return (
    <div className="flex bg-blue-100 overflow-auto">
      {!currentUser && (
        <div className="fixed inset-0 flex items-center justify-center z-10">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to MindFlow</h1>
            <p className="text-gray-500 mb-6">Sign in to manage your tasks</p>
            <button
              onClick={() => setShowLogin(true)}
              className="px-6 py-2 bg-gray-700 text-white rounded font-bold hover:bg-gray-800 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {showLogin && <Login onClose={() => setShowLogin(false)} />}

      {showTaskForm && (
        <TaskForm 
          onClose={closeTaskForm}
          onSubmit={editingTask ? handleEditTask : handleAddTask}
          initialData={editingTask}
        />
      )}

      {currentUser && (
        <>
          {/* Left Sidebar */}
          <Sidebar 
            onLogout={logout} 
            onAddTask={() => openTaskForm()} 
          />

          {/* Main Content - Mind Map */}
          <main className="flex-1 overflow-hidden relative">
            <MindMap onSelectTask={setSelectedTaskId} />
          </main>

          {/* Right Sidebar - Task Details */}
          <TaskDetails 
            taskId={selectedTaskId} 
            onEditTask={(task) => openTaskForm(task)} 
          />
        </>
      )}
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