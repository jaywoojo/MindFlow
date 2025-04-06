//App.tsx
import { useState } from 'react'
import './App.css'
import Sidebar from './components/layout/Sidebar';
import MindMap from './components/mindmap/MindMap';
import TaskDetails from './components/layout/TaskDetails';
import Login from './components/auth/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const { currentUser, logout } = useAuth();

  return (
    <div className="flex bg-blue-100 overflow-auto">  {/* Took out h-screen overflow-hidden because it doesn't make a difference yet */}
      {!currentUser && (
        <div className="fixed inset-0 flex items-center justify-center z-10">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold  text-gray-800 mb-4">Welcome to MindFlow</h1>
            <p className="text-gray-500 mb-6">Sign in to manage your tasks</p>
            <button
              onClick={() => setShowLogin(true)}
              className="px-6 py-2 bg-gray-700 text-white rounded font-bold hover:bg-gray-00 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {showLogin && <Login onClose={() => setShowLogin(false)} />}

      {currentUser && (
        <>
          {/* Left Sidebar */}
          <Sidebar onLogout={logout} />

          {/* Main Content - Mind Map */}
          <main className="flex-1 overflow-hidden relative">
            <MindMap onSelectTask={setSelectedTaskId} />
          </main>

          {/* Right Sidebar - Task Details */}
          <TaskDetails taskId={selectedTaskId} />
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


