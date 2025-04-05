//App.tsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Sidebar from './components/layout/Sidebar';
import MindMap from './components/mindmap/MindMap';
import TaskDetails from './components/layout/TaskDetails';

function App() {
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null); // Tells typescript what type the value will be

  return (
    <div className="flex bg-slate-700 overflow-auto">  {/* Took out h-screen overflow-hidden because it doesn't make a difference yet */}
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content - Mind Map */}
      <main className="flex-1 overflow-hidden"> 
        <div className="h-full">
          <MindMap onSelectTask={setSelectedTaskId} /> {/* This means hey, I'm going to send you the prop value setSelectedTaskId and you take it and use it as the onSelectTask "prop" */}
        </div>
      </main>

      {/* Right Sidebar - Task Details */}
      <TaskDetails taskId={selectedTaskId} />
    </div>
  );
}

export default App;


