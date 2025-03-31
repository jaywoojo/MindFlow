
// src/components/mindmap/MindMap.tsx
const MindMap = ({ onSelectTask }: { onSelectTask: (id: string | null) => void }) => {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white text-xl">Mind Map will be displayed here</p>
      </div>
    );
  };
  
  export default MindMap;