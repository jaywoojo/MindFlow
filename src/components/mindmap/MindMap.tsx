// src/components/mindmap/MindMap.jsx
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

const MindMap = ({ onSelectTask }) => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Sample data - we'll replace this with state management later
  const data = {
    id: 'today',
    name: 'TODAY',
    type: 'central',
    children: [
      {
        id: 'work',
        name: 'WORK',
        type: 'category',
        color: '#8b5cf6',
        children: [
          { id: 'task1', name: 'Client Meeting', type: 'task' },
          { id: 'task2', name: 'UX Wireframes', type: 'task', rolloverCount: 3 },
          { id: 'task3', name: 'Team Standup', type: 'task', status: 'completed' },
        ]
      },
      {
        id: 'personal',
        name: 'PERSONAL',
        type: 'category',
        color: '#ec4899',
        children: [
          { id: 'task4', name: 'Call Mom', type: 'task' },
          { id: 'task5', name: 'Grocery Shopping', type: 'task', status: 'completed' }
        ]
      },
      {
        id: 'health',
        name: 'HEALTH',
        type: 'category',
        color: '#10b981',
        children: [
          { id: 'task6', name: '30min Workout', type: 'task', streakCount: 5 },
          { id: 'task7', name: 'Meditation', type: 'task' }
        ]
      },
      {
        id: 'finance',
        name: 'FINANCE',
        type: 'category',
        color: '#ef4444',
        children: [
          { id: 'task8', name: 'Pay Rent', type: 'task', dueDate: 'tomorrow' },
          { id: 'task9', name: 'Budget Review', type: 'task', status: 'completed' }
        ]
      },
      {
        id: 'learning',
        name: 'LEARNING',
        type: 'category',
        color: '#f59e0b',
        children: [
          { id: 'task10', name: 'React Course', type: 'task', progress: '3/8' },
          { id: 'task11', name: 'Book Chapter Chapter Chapter', type: 'task' }
        ]
      },
      {
        id: 'projects',
        name: 'PROJECTS',
        type: 'category',
        color: '#4f46e5',
        children: [
          { id: 'task12', name: 'Portfolio Update', type: 'task', rolloverCount: 7 },
          { id: 'task13', name: 'Side Project', type: 'task' }
        ]
      }
    ]
  };

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

    // Function to truncate text
    const truncateText = (text, maxLength) => {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + '...';
    };

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(svgRef.current);
    
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
    const initialY = dimensions.height / 2 * (1 - initialScale);
    svg.call(zoom.transform, d3.zoomIdentity
      .translate(initialX, initialY)
      .scale(initialScale));
    
    // Center of the visualization
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    // Radius settings
    const centralRadius = 40;
    const categoryRadius = 20;
    const taskHeight = 24; // Height for task pills
    const categoryDistance = 240; //200
    const taskDistance = 160;
    
    // Creating the layers for proper z-index:
    // 1. Lines layer (bottom)
    const linesLayer = g.append('g').attr('class', 'lines-layer');
    // 2. Nodes layer (top)
    const nodesLayer = g.append('g').attr('class', 'nodes-layer');
    
    // Create central node - keeping the gray color for the central node
    nodesLayer.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', centralRadius)
      .attr('fill', '#4b5563')  // Gray for central node
      .attr('class', 'central-node');
      
    nodesLayer.append('text')
      .attr('x', centerX)
      .attr('y', centerY)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#f3f4f6')  // Changed from white to light gray
      .attr('font-weight', 'bold')
      .attr('font-size', '16px')
      .text('TODAY');
    
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
        .attr('fill', '#f3f4f6')  // Changed from white to light gray
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
            .attr('fill', category.color)
            .attr('opacity', task.status === 'completed' ? 0.7 : 1);
          
          // Task name (with strikethrough if completed)
          taskGroup.append('text')
            .attr('x', taskX)
            .attr('y', taskY)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#f3f4f6')  // Changed from white to light gray
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
            .attr('dominant-baseline', 'middle')  // Add this line for vertical centering
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
            const checkX = taskX + (pillWidth/2) - 10;
            const checkY = taskY - (taskHeight/2) + 7;
            
            taskGroup.append('circle')
              .attr('cx', checkX)
              .attr('cy', checkY)
              .attr('r', 7)
              .attr('fill', '#10b981');  // Keep green for checkmarks
            
            taskGroup.append('text')
              .attr('x', checkX)
              .attr('y', checkY)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('fill', '#f3f4f6')  // Changed from white to light gray
              .attr('font-weight', 'bold')
              .attr('font-size', '9px')
              .text('✓');
          }
          
          // Add additional information below tasks
          if (task.rolloverCount) {
            taskGroup.append('text')
              .attr('x', taskX)
              .attr('y', taskY + taskHeight/2 + 12)
              .attr('text-anchor', 'middle')
              .attr('fill', 'rgba(0, 0, 0, 0.6)')
              .attr('font-size', '9px')
              .text(`${task.rolloverCount} days rollover`);
          } else if (task.streakCount) {
            taskGroup.append('text')
              .attr('x', taskX)
              .attr('y', taskY + taskHeight/2 + 12)
              .attr('text-anchor', 'middle')
              .attr('fill', 'rgba(0, 0, 0, 0.6)')
              .attr('font-size', '9px')
              .text(`${task.streakCount} days streak`);
          } else if (task.progress) {
            taskGroup.append('text')
              .attr('x', taskX)
              .attr('y', taskY + taskHeight/2 + 12)
              .attr('text-anchor', 'middle')
              .attr('fill', 'rgba(0, 0, 0, 0.6)')
              .attr('font-size', '9px')
              .text(`Module ${task.progress}`);
          } else if (task.dueDate) {
            taskGroup.append('text')
              .attr('x', taskX)
              .attr('y', taskY + taskHeight/2 + 12)
              .attr('text-anchor', 'middle')
              .attr('fill', 'rgba(0, 0, 0, 0.6)')
              .attr('font-size', '9px')
              .text(`Due ${task.dueDate}`);
          }
        });
      }
    });
  }, [dimensions, onSelectTask]);

  return (
    <motion.div 
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <svg ref={svgRef} width="100%" height="100%" className="bg-gray-100" />
      
      {/* Timeline navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-4 py-2 flex space-x-8 shadow-md">
        {['Mar 16', 'Mar 17', 'TODAY', 'Mar 19', 'Mar 20', 'Mar 21'].map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className={`w-5 h-5 rounded-full ${day === 'TODAY' ? 'bg-gray-700' : 'bg-gray-300'} flex items-center justify-center text-xs`}
            >
              {day === 'TODAY' ? '18' : ''}
            </div>
            <span className={`text-xs mt-1 ${day === 'TODAY' ? 'text-gray-800' : 'text-gray-500'}`}>{day}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default MindMap;