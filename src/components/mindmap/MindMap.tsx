// src/components/mindmap/MindMap.jsx
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { useTasks } from '../../hooks/useTasks';

const MindMap = ({ onSelectTask }) => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { tasks, loading, categories, getCategoryById } = useTasks();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Date navigation - 5 days centered on the selected date (2 before, today, 2 after)
  const getDateRange = (centerDate) => {
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(centerDate);
      date.setDate(date.getDate() - 2 + i);
      return date;
    });
  };
  
  const [dateRange, setDateRange] = useState(getDateRange(selectedDate));

  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    // Initial size
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create SVG
    const svg = d3.select(svgRef.current);
    
    // Create dot grid background - Always render this regardless of tasks
    createDotGridBackground(svg, dimensions);
    
    // If still loading or no tasks/categories, just render the central node
    if (loading || !tasks.length) {
      // Create a container group for zoom
      const g = svg.append('g');
      
      // Add zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([0.5, 2])  // Min/max zoom scale
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });
      
      svg.call(zoom);
      
      // Set initial zoom level to fit nicely in the viewport
      const initialScale = 0.9;
      const initialX = dimensions.width / 2 * (1 - initialScale);
      const initialY = (dimensions.height / 2 + 30) * (1 - initialScale); // Adjusted for new center position
      svg.call(zoom.transform, d3.zoomIdentity
        .translate(initialX, initialY)
        .scale(initialScale));
      
      // Center of the visualization
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2 + 30; // Moved down to account for date nav bar at top
      
      // Radius settings
      const centralRadius = 40;
      
      // Create central node - always show this regardless of tasks
      const nodesLayer = g.append('g').attr('class', 'nodes-layer');
      
      nodesLayer.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', centralRadius)
        .attr('fill', '#4b5563')
        .attr('class', 'central-node');
        
      nodesLayer.append('text')
        .attr('x', centerX)
        .attr('y', centerY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#f3f4f6')
        .attr('font-weight', 'bold')
        .attr('font-size', '16px')
        .text(formatDateDisplay(selectedDate));
      
      // Add "No tasks" message if we're not loading but have no tasks
      if (!loading) {
        svg.append('text')
          .attr('x', dimensions.width / 2)
          .attr('y', dimensions.height / 2 + 110) // Below the central node
          .attr('text-anchor', 'middle')
          .attr('font-size', '16px')
          .attr('fill', '#6b7280')
          .text('No tasks for this day. Add a task to get started!');
      }
      
      return;
    }

    // Transform the tasks data into the hierarchical structure needed for the mind map
    const transformTasksToMindMapData = () => {
      // Create a map of categoryId to category objects for quick lookup
      const categoryMap = new Map();
      categories.forEach(category => {
        categoryMap.set(category.id, {
          id: category.id,
          name: category.name,
          color: category.color,
          tasks: []
        });
      });
      
      // Group tasks by category for the selected date
      tasks.forEach(task => {
        const taskDate = new Date(task.dueDate);
        const selectedDateStr = selectedDate.toDateString();
        const taskDateStr = taskDate.toDateString();
        
        if (taskDateStr === selectedDateStr && task.categoryId) {
          const category = categoryMap.get(task.categoryId);
          if (category) {
            category.tasks.push({
              id: task.id,
              name: task.title,
              type: 'task',
              status: task.status,
              rolloverCount: task.rolloverCount,
              dueDate: task.dueDate,
              priority: task.priority
            });
          }
        }
      });
      
      // Filter out categories with no tasks
      const categoriesWithTasks = Array.from(categoryMap.values())
        .filter(category => category.tasks.length > 0);
      
      // Create the hierarchical structure
      const data = {
        id: 'today',
        name: 'TODAY',
        type: 'central',
        children: categoriesWithTasks.map(category => ({
          id: category.id,
          name: category.name.toUpperCase(),
          type: 'category',
          color: category.color,
          children: category.tasks
        }))
      };
      
      return data;
    };
    
    // Function to truncate text
    const truncateText = (text, maxLength) => {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + '...';
    };

    // Get the transformed data
    const data = transformTasksToMindMapData();
    
    // Create a container group for zoom
    const g = svg.append('g');
    
    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])  // Min/max zoom scale
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // Set initial zoom level to fit nicely in the viewport
    const initialScale = 0.9;
    const initialX = dimensions.width / 2 * (1 - initialScale);
    const initialY = (dimensions.height / 2 + 30) * (1 - initialScale); // Adjusted for new center position
    svg.call(zoom.transform, d3.zoomIdentity
      .translate(initialX, initialY)
      .scale(initialScale));
    
    // Center of the visualization
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2 + 30; // Moved down to account for date nav bar at top
    
    // Radius settings
    const centralRadius = 40;
    const categoryRadius = 20;
    const taskHeight = 24; // Height for task pills
    const categoryDistance = 240;
    const taskDistance = 160;
    
    // Creating the layers for proper z-index:
    // 1. Lines layer (bottom)
    const linesLayer = g.append('g').attr('class', 'lines-layer');
    // 2. Nodes layer (top)
    const nodesLayer = g.append('g').attr('class', 'nodes-layer');
    
    // Create central node
    nodesLayer.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', centralRadius)
      .attr('fill', '#4b5563')
      .attr('class', 'central-node');
      
    nodesLayer.append('text')
      .attr('x', centerX)
      .attr('y', centerY)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#f3f4f6')
      .attr('font-weight', 'bold')
      .attr('font-size', '16px')
      .text(formatDateDisplay(selectedDate));
    
    // If no categories with tasks, show a message but keep the central node
    if (data.children.length === 0) {
      // Add "No tasks" message
      svg.append('text')
        .attr('x', dimensions.width / 2)
        .attr('y', dimensions.height / 2 + 90) // Below the central node
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('fill', '#6b7280')
        .text('No tasks for this day. Add a task to get started!');
        
      return;
    }
    
    // Calculate positions for category nodes
    data.children.forEach((category, i) => {
      const angle = (i * (2 * Math.PI / data.children.length)) - Math.PI/2;
      const x = centerX + categoryDistance * Math.cos(angle);
      const y = centerY + categoryDistance * Math.sin(angle);
      
      // Draw line from central node to category (in lines layer)
      linesLayer.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', '#9ca3af')
        .attr('stroke-width', 2);
      
      // Create temp text element to measure width for category pill
      const tempCatText = svg.append('text')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text(category.name)
        .style('visibility', 'hidden');
        
      const catTextWidth = tempCatText.node().getComputedTextLength();
      tempCatText.remove();
      
      // Calculate pill width for category (min 60px, max based on text + padding)
      const catPillWidth = Math.max(catTextWidth + 30, 60);
      const catPillHeight = 40;
      
      // Draw category pill instead of circle
      nodesLayer.append('rect')
        .attr('x', x - catPillWidth/2)
        .attr('y', y - catPillHeight/2)
        .attr('width', catPillWidth)
        .attr('height', catPillHeight)
        .attr('rx', catPillHeight/2)  // Rounded corners
        .attr('ry', catPillHeight/2)
        .attr('fill', category.color)
        .attr('class', 'category-node')
        .attr('id', `node-${category.id}`);
      
      nodesLayer.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#f3f4f6')
        .attr('font-weight', 'bold')
        .attr('font-size', '14px')
        .text(category.name);
      
      // Calculate positions for task nodes
      if (category.children && category.children.length > 0) {
        category.children.forEach((task, j) => {
          // Adjust the angle slightly for each task to spread them out
          const taskAngle = angle + (j - (category.children.length - 1) / 2) * 0.6;
          const taskX = x + taskDistance * Math.cos(taskAngle);
          const taskY = y + taskDistance * Math.sin(taskAngle);
          
          // Draw line from category to task (in lines layer)
          linesLayer.append('line')
            .attr('x1', x)
            .attr('y1', y)
            .attr('x2', taskX)
            .attr('y2', taskY)
            .attr('stroke', '#9ca3af')
            .attr('stroke-width', 2);
          
          // Create task group
          const taskGroup = nodesLayer.append('g')
            .attr('class', 'task-node')
            .attr('id', `node-${task.id}`)
            .style('cursor', 'pointer')
            .on('click', () => onSelectTask(task.id));
            
          // Truncate text if needed
          const taskText = task.name;
          const truncatedText = truncateText(taskText, 20); // Max 20 chars
          const isTextTruncated = taskText !== truncatedText;
          
          // Create temp text element to measure width
          const tempText = svg.append('text')
            .attr('font-size', '10px')
            .text(truncatedText)
            .style('visibility', 'hidden');
            
          const textWidth = tempText.node().getComputedTextLength();
          tempText.remove();
          
          // Calculate pill width (min 40px, max based on text + padding)
          const pillWidth = Math.max(textWidth + 20, 40);
          
          // Draw pill shape
          taskGroup.append('rect')
            .attr('x', taskX - pillWidth/2)
            .attr('y', taskY - taskHeight/2)
            .attr('width', pillWidth)
            .attr('height', taskHeight)
            .attr('rx', taskHeight/2)  // Rounded corners
            .attr('ry', taskHeight/2)
            .attr('fill', task.status === 'completed' ? '#99A1AF' : category.color)  // Dark gray for completed tasks
            .attr('opacity', 1);
          
          // Task name (with strikethrough if completed)
          taskGroup.append('text')
            .attr('x', taskX)
            .attr('y', taskY)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#f3f4f6')
            .attr('font-size', '10px')
            .attr('text-decoration', task.status === 'completed' ? 'line-through' : 'none')
            .text(truncatedText);
          
          // Add tooltip for truncated text
          if (isTextTruncated) {
            // Create hidden tooltip that will be shown on hover
            const tooltip = taskGroup.append('g')
              .attr('class', 'tooltip')
              .style('opacity', 0)
              .style('pointer-events', 'none');
            
            // First create the tooltip text element to measure its width
            const tooltipText = tooltip.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-size', '10px')
            .style('visibility', 'hidden')
            .text(taskText);

            // Measure the text width
            const tooltipWidth = tooltipText.node().getComputedTextLength() + 20; // Add padding

            // Position and make the text visible
            tooltipText
            .attr('x', taskX)
            .attr('y', taskY - 27.5)
            .attr('dominant-baseline', 'middle')
            .style('visibility', 'visible');

            // Tooltip background sized to fit the text
            tooltip.append('rect')
            .attr('x', taskX - (tooltipWidth / 2))
            .attr('y', taskY - 40)
            .attr('width', tooltipWidth)
            .attr('height', 25)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('fill', '#1f2937')
            .attr('opacity', 0.7)
            .lower(); // Move the rectangle behind the text
            
            // Show/hide tooltip on hover
            taskGroup
              .on('mouseenter', function() {
                tooltip.transition()
                  .duration(200)
                  .style('opacity', 1);
              })
              .on('mouseleave', function() {
                tooltip.transition()
                  .duration(200)
                  .style('opacity', 0);
              });
          }
          
          // Add check mark for completed tasks
          if (task.status === 'completed') {
            const checkX = taskX + (pillWidth/2) - 3; // -10
            const checkY = taskY - (taskHeight/2) + 2; // +7
            
            taskGroup.append('circle')
              .attr('cx', checkX)
              .attr('cy', checkY)
              .attr('r', 10) //7
              .attr('fill', '#10b981');  // Green for checkmarks
            
            taskGroup.append('text')
              .attr('x', checkX)
              .attr('y', checkY)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('fill', '#f3f4f6')
              .attr('font-weight', 'bolder')
              .attr('font-size', '12px') //9
              .text('✓');
          }
          
          // Add high or medium priority indicator above the task pill
          if (task.status !== 'completed' && (task.priority === 'high' || task.priority === 'medium')) {
            // Create a warning icon above the task
            const iconY = taskY - taskHeight/2 - 12; // -10
            const iconColor = task.priority === 'high' ? '#ef4444' : '#fbbf24'; // red for high, yellow-400 for medium
            
            // Add colored circle background
            taskGroup.append('circle')
              .attr('cx', taskX)
              .attr('cy', iconY)
              .attr('r', 10) // 8
              .attr('fill', iconColor);
            
            // Add exclamation mark
            taskGroup.append('text')
              .attr('x', taskX)
              .attr('y', iconY)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('fill', 'white')
              .attr('font-size', '14px') //10
              .attr('font-weight', 'bolder') //bold
              .text('!');
          }
        });
      }
    });
  }, [dimensions, tasks, categories, selectedDate, onSelectTask, loading]);

  // Helper functions
  const createDotGridBackground = (svg, dimensions) => {
    // Create dot grid pattern
    const defs = svg.append('defs');
    const pattern = defs.append('pattern')
      .attr('id', 'dots')
      .attr('width', 30)
      .attr('height', 30)
      .attr('patternUnits', 'userSpaceOnUse');
    
    // Add dots to the pattern
    pattern.append('circle')
      .attr('cx', 15)
      .attr('cy', 15)
      .attr('r', 1)
      .attr('fill', '#9ca3af');  // Lighter dot color
    
    // Apply the pattern to a background rectangle
    svg.append('rect')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('fill', '#f5f5f5')  // Light gray background
      .attr('stroke', 'none');
    
    svg.append('rect')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('fill', 'url(#dots)')
      .attr('stroke', 'none');
  };

  const formatDateDisplay = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    if (compareDate.getTime() === today.getTime()) {
      return 'TODAY';
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    return compareDate.getTime() === today.getTime();
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setDateRange(getDateRange(date));
  };
  
  // Navigate to previous or next date range
  const navigateDates = (direction) => {
    const newCenterDate = new Date(selectedDate);
    newCenterDate.setDate(newCenterDate.getDate() + (direction * 5));
    setSelectedDate(newCenterDate);
    setDateRange(getDateRange(newCenterDate));
  };

  return (
    <motion.div 
      className="w-full h-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Date navigation - Now at the top */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-6 py-3 flex items-center shadow-md z-10">
        {/* Previous button */}
        <button 
          onClick={() => navigateDates(-1)} 
          className="mr-4 text-gray-700 hover:text-gray-900 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Date Pills */}
        <div className="flex space-x-4">
          {dateRange.map((date, index) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const dateIsToday = isToday(date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            return (
              <div 
                key={index} 
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleDateChange(date)}
              >
                <div className={`text-xs ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-500'} mb-1`}>
                  {dayName}
                </div>
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs
                    ${isSelected ? 'bg-gray-100 ring-2 ring-gray-600 text-gray-900 font-medium' : 'bg-gray-200 text-gray-700'}
                    ${dateIsToday ? 'ring-2 ring-blue-500' : ''}
                  `}
                >
                  {date.getDate()}
                </div>
                <span className={`text-xs mt-1 
                  ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-500'}
                  ${dateIsToday ? 'text-blue-600 font-medium' : ''}
                `}>
                  {formatDateDisplay(date)}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Next button */}
        <button 
          onClick={() => navigateDates(1)} 
          className="ml-4 text-gray-700 hover:text-gray-900 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <svg ref={svgRef} width="100%" height="100%" className="bg-gray-100" />
    </motion.div>
  );
};

export default MindMap;