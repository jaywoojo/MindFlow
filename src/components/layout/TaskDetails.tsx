// src/components/layout/TaskDetails.jsx
import { useState, useEffect, useRef } from 'react';
import { useTasks } from '../../hooks/useTasks';

const TaskDetails = ({ taskId }) => {
  const { tasks, completeTask, updateTask, categories, updateCategory, deleteCategory, addCategory, getCategoryById } = useTasks();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [titleValue, setTitleValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [categoryEditValue, setCategoryEditValue] = useState('');
  const [categoryEditMode, setCategoryEditMode] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [newCategoryValue, setNewCategoryValue] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [detailsWidth, setDetailsWidth] = useState(315); // Default width // 256
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const categoryInputRef = useRef(null);
  const priorityInputRef = useRef(null);
  const statusInputRef = useRef(null);
  const newCategoryInputRef = useRef(null);
  const menuRef = useRef(null);
  const resizerRef = useRef(null);
  const detailsRef = useRef(null);

  // Find the task in the tasks array when taskId changes
  useEffect(() => {
    if (taskId && tasks.length > 0) {
      const foundTask = tasks.find(t => t.id === taskId);
      setTask(foundTask || null);
      if (foundTask) {
        setTitleValue(foundTask.title || '');
        setDescriptionValue(foundTask.description || '');
        const category = getCategoryById(foundTask.categoryId);
        if (category) {
          setCategoryEditValue(category.name || '');
        }
      }
    } else {
      setTask(null);
    }
  }, [taskId, tasks, getCategoryById]);

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
      
      if (showStatusOptions && statusInputRef.current && !statusInputRef.current.contains(event.target)) {
        setShowStatusOptions(false);
      }
      
      if (showCategoryMenu && menuRef.current && !menuRef.current.contains(event.target)) {
        setShowCategoryMenu(false);
        setCategoryEditMode(''); // Reset edit mode when clicking outside
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCategoryOptions, showPriorityOptions, showStatusOptions, showCategoryMenu, showNewCategoryInput]);

  // Focus input when editing field changes
  useEffect(() => {
    if (editingField === 'title' && titleRef.current) {
      titleRef.current.focus();
    } else if (editingField === 'description' && descriptionRef.current) {
      descriptionRef.current.focus();
    } else if (showNewCategoryInput && newCategoryInputRef.current) {
      newCategoryInputRef.current.focus();
    }
  }, [editingField, showNewCategoryInput]);

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

  // Handle complete task action
  const handleCompleteTask = async () => {
    if (!task) return;
    
    try {
      setLoading(true);
      await completeTask(task.id);
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle field updates
  const handleUpdateField = async (field, value) => {
    if (!task) return;
    
    try {
      setLoading(true);
      await updateTask(task.id, { [field]: value });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    } finally {
      setLoading(false);
      setEditingField(null);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric', 
      year: 'numeric'
    });
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    handleUpdateField('categoryId', categoryId);
    setCategoryEditValue('');
    setShowCategoryOptions(false);
    setShowNewCategoryInput(false);
  };
  
  // Handle new category creation
  const handleCreateCategory = async () => {
    if (!newCategoryValue.trim()) return;
    
    try {
      setLoading(true);
      // Add new category
      const categoryId = await addCategory(newCategoryValue, getCategoryColor(newCategoryValue));
      // Assign to current task
      await handleUpdateField('categoryId', categoryId);
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
    handleUpdateField('priority', priority);
    setShowPriorityOptions(false);
  };

  // Handle status selection
  const handleStatusSelect = (status) => {
    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    handleUpdateField('status', status);
    if (completedAt) {
      handleUpdateField('completedAt', completedAt);
    }
    setShowStatusOptions(false);
  };

  // Handle title changes
  const handleTitleChange = (e) => {
    setTitleValue(e.target.value);
  };
  
  // Handle title save
  const handleTitleSave = () => {
    if (titleValue.trim()) {
      handleUpdateField('title', titleValue);
    }
  };

  // Handle description changes
  const handleDescriptionChange = (e) => {
    setDescriptionValue(e.target.value);
  };

  // Handle description save
  const handleDescriptionSave = () => {
    handleUpdateField('description', descriptionValue);
  };

  // Handle date change
  const handleDateChange = (e) => {
    handleUpdateField('dueDate', e.target.value);
  };

  // Get color for category
  const getCategoryColor = (categoryName) => {
    // Look up the color in the categories list
    const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (category) return category.color;
    
    // Brighter default colors as fallback
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

  // Get the current category for the task
  const getCurrentCategory = () => {
    if (!task || !task.categoryId) return null;
    return categories.find(c => c.id === task.categoryId) || null;
  };

  // Display empty state if no task is selected
  if (!task) {
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
            <h2 className="text-lg font-bold text-gray-800">Task Details</h2>
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600">Select a task to view details</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get the current category
  const currentCategory = getCurrentCategory();

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
          <h2 className="text-lg font-bold text-gray-800 mb-6">Task Details</h2>
          
          {/* Title - Now Editable */}
          {editingField === 'title' ? (
            <div className="mb-6">
              <input
                ref={titleRef}
                type="text"
                value={titleValue}
                onChange={handleTitleChange}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleSave();
                  }
                }}
                className="w-full text-xl font-bold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-gray-500 pb-1"
                placeholder="Task title"
              />
            </div>
          ) : (
            <h1 
              className="text-xl font-bold text-gray-800 mb-6 cursor-pointer hover:text-gray-600 transition-colors"
              onClick={() => setEditingField('title')}
            >
              {task.title}
            </h1>
          )}
          
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
                      <span 
                        className="rounded px-2 py-0.5 inline-block"
                        style={{ backgroundColor: currentCategory ? currentCategory.color : '#bfdbfe' }}
                      >
                        {currentCategory ? currentCategory.name.charAt(0).toUpperCase() + currentCategory.name.slice(1) : 'Select category'}
                      </span>
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
                          className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleCategorySelect(category.id)}
                        >
                          <span 
                            className="text-gray-800 rounded px-2 py-0.5"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                          </span>
                          <button 
                            className="text-gray-600 hover:text-gray-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategoryId(category.id);
                              setCategoryEditValue(category.name);
                              setShowCategoryMenu(true);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Category edit menu */}
                    {showCategoryMenu && selectedCategoryId && (
                      <div 
                        ref={menuRef}
                        className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20"
                        style={{ top: '100%' }}
                      >
                        {categoryEditMode ? (
                          <div className="p-2">
                            <input
                              type="text"
                              value={categoryEditValue}
                              onChange={(e) => setCategoryEditValue(e.target.value)}
                              className="w-full p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateCategory(selectedCategoryId, {
                                    name: categoryEditValue,
                                  });
                                  setCategoryEditMode('');
                                  setShowCategoryMenu(false);
                                }
                              }}
                              onBlur={() => {
                                if (categoryEditValue) {
                                  updateCategory(selectedCategoryId, {
                                    name: categoryEditValue,
                                  });
                                }
                                setCategoryEditMode('');
                                setShowCategoryMenu(false);
                              }}
                            />
                          </div>
                        ) : (
                          <>
                            <div 
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCategoryEditMode(selectedCategoryId);
                                const category = categories.find(c => c.id === selectedCategoryId);
                                if (category) {
                                  setCategoryEditValue(category.name);
                                }
                              }}
                            >
                              Rename
                            </div>
                            <div 
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete category "${categories.find(c => c.id === selectedCategoryId)?.name || ''}"? All tasks using this category will be deleted.`)) {
                                  deleteCategory(selectedCategoryId);
                                  setShowCategoryMenu(false);
                                }
                              }}
                            >
                              Delete
                            </div>
                            <div className="p-2 border-t border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">Colors</p>
                              <div className="flex flex-wrap gap-1">
                                {/* {['#c4b5fa', '#fca5cf', '#86efac', '#fca5a5', '#fcd34d', '#a5b4fc', '#bfdbfe', '#e7e5e4'].map(color => ( */}
                                {/* {['#7c3aed', '#db2777', '#10b981', '#dc2626', '#d97706', '#4f46e5', '#3b82f6', '#44403c'].map(color => ( */}
                                {['#f87171', '#fb923c', '#ffdf20', '#4ade80', '#60a5fa', '#818cf8', '#a78bfa', '#f472b6', '#e7e5e4'].map(color => (
                                  <div 
                                    key={color}
                                    className="w-4 h-4 rounded-full cursor-pointer border border-gray-300"
                                    style={{ backgroundColor: color }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log("Changing color to", color);
                                      // Update the category color
                                      updateCategory(selectedCategoryId, {
                                        color: color
                                      });
                                      setShowCategoryMenu(false);
                                    }}
                                  ></div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="rounded text-gray-800 text-sm py-1.5 px-2 cursor-pointer bg-gray-100"
                    onClick={() => setShowCategoryOptions(true)}
                  >
                    <span 
                      className="rounded px-2 py-0.5 inline-block"
                      style={{ backgroundColor: currentCategory ? currentCategory.color : '#bfdbfe' }}
                    >
                      {currentCategory ? currentCategory.name.charAt(0).toUpperCase() + currentCategory.name.slice(1) : 'Select category'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Due Date Field */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-500 text-sm w-24">Due Date</p>
              
              {editingField === 'dueDate' ? (
                <input
                  type="date"
                  defaultValue={new Date(task.dueDate).toISOString().split('T')[0]}
                  onChange={handleDateChange}
                  onBlur={() => setEditingField(null)}
                  className="flex-1 p-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-800"
                />
              ) : (
                <p 
                  className="flex-1 text-gray-800 text-sm cursor-pointer rounded py-1.5 px-2 bg-gray-100"
                  onClick={() => setEditingField('dueDate')}
                >
                  {formatDate(task.dueDate)}
                </p>
              )}
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
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
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
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Status Field */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-500 text-sm w-24">Status</p>
              
              <div className="relative flex-1" ref={statusInputRef}>
                {showStatusOptions ? (
                  <div className="w-full">
                    <div 
                      className="rounded text-gray-800 text-sm py-1.5 px-2 cursor-pointer w-full bg-gray-100"
                    >
                      <span 
                        className="rounded px-2 py-0.5 inline-block"
                        style={{ 
                          backgroundColor: task.status === 'completed' ? '#86efac' : '#e7e5e4' 
                        }}
                      >
                        {task.status === 'completed' ? 'Completed' : 'In progress'}
                      </span>
                    </div>
                    
                    <div className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleStatusSelect('active')}
                      >
                        <span className="rounded px-2 py-0.5 inline-block bg-gray-200">
                          In progress
                        </span>
                      </div>
                      <div 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleStatusSelect('completed')}
                      >
                        <span className="rounded px-2 py-0.5 inline-block bg-green-300">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded text-gray-800 text-sm py-1.5 px-2 cursor-pointer bg-gray-100"
                    onClick={() => setShowStatusOptions(true)}
                  >
                    <span 
                      className="rounded px-2 py-0.5 inline-block"
                      style={{ 
                        backgroundColor: task.status === 'completed' ? '#86efac' : '#e7e5e4' 
                      }}
                    >
                      {task.status === 'completed' ? 'Completed' : 'In progress'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Rollover Count */}
          {task.rolloverCount > 0 && (
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-500 text-sm w-24">Rollover Count</p>
                <div className="flex-1 text-gray-800 rounded text-sm py-1.5 px-2 bg-gray-100">
                  <span className="rounded px-2 py-0.5 inline-block bg-amber-200">
                    {task.rolloverCount} {task.rolloverCount === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Description Field */}
          <div className="mb-6">
            <p className="text-gray-500 text-sm mb-2">Description</p>
            
            {editingField === 'description' ? (
              <textarea
                ref={descriptionRef}
                value={descriptionValue}
                onChange={handleDescriptionChange}
                onBlur={handleDescriptionSave}
                rows={3}
                className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-800"
                placeholder="Add a description..."
              ></textarea>
            ) : (
              <div 
                className="bg-gray-100 rounded p-4 text-gray-800 text-sm cursor-text min-h-[80px]"
                onClick={() => setEditingField('description')}
              >
                {task.description || 'Add a description...'}
              </div>
            )}
          </div>
          
          {/* Complete Task Button (only if not completed) */}
          {task.status !== 'completed' && (
            <div className="mt-auto">
              <button 
                onClick={handleCompleteTask}
                disabled={loading}
                className="w-full py-2 bg-gray-700 hover:bg-gray-800 transition-colors text-white rounded font-medium"
              >
                {loading ? 'Completing...' : 'Complete Task'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;