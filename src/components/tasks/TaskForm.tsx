// src/components/tasks/TaskForm.jsx
import { useState, useEffect, useRef } from 'react';
import { useTasks } from '../../hooks/useTasks';

const TaskForm = ({ onClose }) => {
  const { addTask, categories, addCategory } = useTasks();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryValue, setNewCategoryValue] = useState('');
  const [detailsWidth, setDetailsWidth] = useState(315); // Default width //256
  const titleInputRef = useRef(null);
  const categoryInputRef = useRef(null);
  const priorityInputRef = useRef(null);
  const newCategoryInputRef = useRef(null);
  const resizerRef = useRef(null);
  const detailsRef = useRef(null);
  
  // Focus title input on load
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);
  
  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (showCategoryOptions && categoryInputRef.current && !categoryInputRef.current.contains(event.target)) {
        setShowCategoryOptions(false);
        setShowNewCategoryInput(false);
      }
      
      if (showPriorityOptions && priorityInputRef.current && !priorityInputRef.current.contains(event.target)) {
        setShowPriorityOptions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCategoryOptions, showPriorityOptions, showNewCategoryInput]);

  // Handle panel resizing
  useEffect(() => {
    const resizer = resizerRef.current;
    const details = detailsRef.current;
    
    if (!resizer || !details) return;
    
    let startX, startWidth;
    
    function startResize(e) {
      startX = e.clientX;
      startWidth = parseInt(document.defaultView.getComputedStyle(details).width, 10);
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);
      document.body.style.cursor = 'ew-resize';
    }
    
    function resize(e) {
      const newWidth = startWidth + (startX - e.clientX);
      if (newWidth > 200 && newWidth < 500) { // Min and max width
        setDetailsWidth(newWidth);
      }
    }
    
    function stopResize() {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = '';
    }
    
    resizer.addEventListener('mousedown', startResize);
    
    return () => {
      resizer.removeEventListener('mousedown', startResize);
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
    };
  }, []);

  // Focus on new category input when shown
  useEffect(() => {
    if (showNewCategoryInput && newCategoryInputRef.current) {
      newCategoryInputRef.current.focus();
    }
  }, [showNewCategoryInput]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = async () => {
    // Basic validation
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }
    
    try {
      setLoading(true);
      await addTask(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while saving the task');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle category selection
  const handleCategorySelect = (category) => {
    handleChange('category', category);
    setShowCategoryOptions(false);
    setShowNewCategoryInput(false);
  };
  
  // Handle new category creation
  const handleCreateCategory = async () => {
    if (!newCategoryValue.trim()) return;
    
    try {
      setLoading(true);
      // Add new category
      await addCategory(newCategoryValue, getCategoryColor(newCategoryValue));
      // Set it as the selected category
      handleChange('category', newCategoryValue);
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setLoading(false);
      setNewCategoryValue('');
      setShowNewCategoryInput(false);
      setShowCategoryOptions(false);
    }
  };
  
  // Handle priority selection
  const handlePrioritySelect = (priority) => {
    handleChange('priority', priority);
    setShowPriorityOptions(false);
  };
  
  // Get color for category
  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (category) return category.color;
    
    // Darker default colors as fallback
    const colors = {
      work: '#a78bfa',     // purple-400
      personal: '#f472b6',  // pink-400
      health: '#4ade80',    // green-400
      finance: '#f87171',   // red-400
      learning: '#ffdf20',  // amber-400 (yellow)
      projects: '#818cf8'   // indigo-400
    };
    
    return colors[categoryName.toLowerCase()] || '#bfdbfe'; // Brighter blue
  };

  // Get priority text color
  const getPriorityColor = (priority) => {
    const colors = {
      low: '#86efac',    // Brighter green
      medium: '#ffdf20',  // Brighter amber
      high: '#fca5a5'     // Brighter red
    };
    
    return colors[priority] || '#bfdbfe'; // Brighter blue
  };
  
  // Get selected category
  const getSelectedCategory = () => {
    if (!formData.category) return null;
    return categories.find(cat => cat.name.toLowerCase() === formData.category.toLowerCase());
  };

  const selectedCategory = getSelectedCategory();

  return (
    <div className="flex h-screen">
      <div 
        ref={resizerRef}
        className="w-1 h-full bg-gray-200 hover:bg-gray-400 cursor-ew-resize"
      ></div>
      <div 
        ref={detailsRef}
        className="bg-white shadow-md h-screen overflow-y-auto"
        style={{ width: `${detailsWidth}px` }}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">New Task</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          
          {/* Title Field */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-500 text-sm w-24">Title</p>
              <input
                ref={titleInputRef}
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="flex-1 p-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-800"
                placeholder="Task title"
              />
            </div>
          </div>
          
          {/* Category Field */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-500 text-sm w-24">Category</p>
              
              <div className="relative flex-1" ref={categoryInputRef}>
                {showCategoryOptions ? (
                  <div className="w-full">
                    <div 
                      className="rounded text-gray-800 text-sm py-1.5 px-2 cursor-pointer w-full bg-gray-100"
                    >
                      {selectedCategory ? (
                        <span 
                          className="rounded px-2 py-0.5 inline-block"
                          style={{ backgroundColor: selectedCategory.color }}
                        >
                          {selectedCategory.name.charAt(0).toUpperCase() + selectedCategory.name.slice(1)}
                        </span>
                      ) : (
                        <span>Select category</span>
                      )}
                    </div>
                    
                    <div className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                      {/* Add "New Category" option at the top */}
                      {showNewCategoryInput ? (
                        <div className="p-2 border-b border-gray-200">
                          <input
                            ref={newCategoryInputRef}
                            type="text"
                            value={newCategoryValue}
                            onChange={(e) => setNewCategoryValue(e.target.value)}
                            className="w-full p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                            placeholder="New category name..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCreateCategory();
                              }
                            }}
                          />
                          <div className="flex mt-1 justify-end">
                            <button
                              onClick={() => setShowNewCategoryInput(false)}
                              className="text-xs text-gray-500 mr-2"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleCreateCategory}
                              className="text-xs bg-gray-700 text-white px-2 py-0.5 rounded"
                            >
                              Create
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="p-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                          onClick={() => setShowNewCategoryInput(true)}
                        >
                          + New Category
                        </div>
                      )}
                      
                      {/* Existing categories */}
                      {categories.map(category => (
                        <div 
                          key={category.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleCategorySelect(category.name)}
                        >
                          <span 
                            className="rounded px-2 py-0.5 inline-block"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded text-gray-800 text-sm py-1.5 px-2 cursor-pointer bg-gray-100"
                    onClick={() => setShowCategoryOptions(true)}
                  >
                    {selectedCategory ? (
                      <span 
                        className="rounded px-2 py-0.5 inline-block"
                        style={{ backgroundColor: selectedCategory.color }}
                      >
                        {selectedCategory.name.charAt(0).toUpperCase() + selectedCategory.name.slice(1)}
                      </span>
                    ) : (
                      <span>Select category</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Due Date Field */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-500 text-sm w-24">Due Date</p>
              
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="flex-1 p-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-800"
              />
            </div>
          </div>
          
          {/* Priority Field */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-500 text-sm w-24">Priority</p>
              
              <div className="relative flex-1" ref={priorityInputRef}>
                {showPriorityOptions ? (
                  <div className="w-full">
                    <div 
                      className="rounded text-gray-800 text-sm py-1.5 px-2 cursor-pointer w-full bg-gray-100"
                    >
                      <span 
                        className="rounded px-2 py-0.5 inline-block"
                        style={{ backgroundColor: getPriorityColor(formData.priority) }}
                      >
                        {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                      </span>
                    </div>
                    
                    <div className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {['low', 'medium', 'high'].map(priority => (
                        <div 
                          key={priority}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handlePrioritySelect(priority)}
                        >
                          <span 
                            className="rounded px-2 py-0.5 inline-block"
                            style={{ backgroundColor: getPriorityColor(priority) }}
                          >
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded text-gray-800 text-sm py-1.5 px-2 cursor-pointer bg-gray-100"
                    onClick={() => setShowPriorityOptions(true)}
                  >
                    <span 
                      className="rounded px-2 py-0.5 inline-block"
                      style={{ backgroundColor: getPriorityColor(formData.priority) }}
                    >
                      {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Description Field */}
          <div className="mb-6">
            <p className="text-gray-500 text-sm mb-2">Description</p>
            
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-800"
              placeholder="Add a description..."
            ></textarea>
          </div>
          
          {/* Save Button */}
          <div className="mt-auto">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2 bg-gray-700 hover:bg-gray-800 transition-colors text-white rounded font-medium"
            >
              {loading ? 'Saving...' : 'Add Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;