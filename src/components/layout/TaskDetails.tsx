
// src/components/layout/TaskDetails.tsx
const TaskDetails = ({ taskId }: { taskId: string | null }) => {
    return (
      <div className="w-64 h-screen glass-effect p-4">
        <h2 className="text-lg font-bold text-white">Task Details</h2>
        {taskId ? (
          <p className="text-white">Viewing task: {taskId}</p>
        ) : (
          <p className="text-gray-400">No task selected</p>
        )}
      </div>
    );
  };
  
  export default TaskDetails;