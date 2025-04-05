// src/components/mindmap/MindMap.jsx
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

const MindMap = ({ onSelectTask }) => { //This means MindMap is a component that takes in onSelectTask "prop" as a parameter.
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
          { id: 'task3', name: 'Team Standup', type: 'task', status: 'completed' }
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
          { id: 'task11', name: 'Book Chapter', type: 'task' }
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
      .attr('fill', '#334155');
    
    // Apply the pattern to a background rectangle
    svg.append('rect')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('fill', '#0f172a')
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
    const categoryRadius = 30;
    const taskRadius = 20;
    const categoryDistance = 200;
    const taskDistance = 100;
    
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
      .attr('fill', '#3b82f6')
      .attr('class', 'central-node');
      
    nodesLayer.append('text')
      .attr('x', centerX)
      .attr('y', centerY)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-size', '16px')
      .text('TODAY');
    
    // Calculate positions for category nodes
    data.children.forEach((category, i) => {
      const angle = (i * (2 * Math.PI / data.children.length)) - Math.PI/2; // Confusing bc in SVG coordinates, positive y goes DOWN. Which is different from the unit circle.
      const x = centerX + categoryDistance * Math.cos(angle);
      const y = centerY + categoryDistance * Math.sin(angle);
      
      // Draw line from central node to category (in lines layer)
      linesLayer.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', '#4b5563')
        .attr('stroke-width', 2);
      
      // Draw category node (in nodes layer)
      nodesLayer.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', categoryRadius)
        .attr('fill', category.color)
        .attr('class', 'category-node')
        .attr('id', `node-${category.id}`);
      
      nodesLayer.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle') // horizontal centering
        .attr('dominant-baseline', 'middle') // vertical centering
        .attr('fill', 'white')
        .attr('font-weight', 'bold')
        .attr('font-size', '14px')
        .text(category.name);
      
      // Calculate positions for task nodes
      if (category.children && category.children.length > 0) {
        category.children.forEach((task, j) => {
          // Adjust the angle slightly for each task to spread them out
          const taskAngle = angle + (j - (category.children.length - 1) / 2) * 0.6; //0.6 adjusts the spread of the tasks
          const taskX = x + taskDistance * Math.cos(taskAngle);
          const taskY = y + taskDistance * Math.sin(taskAngle);
          
          // Draw line from category to task (in lines layer)
          linesLayer.append('line')
            .attr('x1', x)
            .attr('y1', y)
            .attr('x2', taskX)
            .attr('y2', taskY)
            .attr('stroke', '#4b5563')
            .attr('stroke-width', 2);
          
          // Draw task node (in nodes layer)
          const taskGroup = nodesLayer.append('g')
            .attr('class', 'task-node')
            .attr('id', `node-${task.id}`)
            .style('cursor', 'pointer')
            .on('click', () => onSelectTask(task.id));
          
          taskGroup.append('circle')
            .attr('cx', taskX)
            .attr('cy', taskY)
            .attr('r', taskRadius)
            .attr('fill', category.color)
            .attr('opacity', task.status === 'completed' ? 0.7 : 1);
          
          // Task name (with strikethrough if completed)
          taskGroup.append('text')
            .attr('x', taskX)
            .attr('y', taskY)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', 'white')
            .attr('font-size', '10px')
            .attr('text-decoration', task.status === 'completed' ? 'line-through' : 'none')
            .text(task.name);
          
          // Add check mark for completed tasks
          if (task.status === 'completed') {
            taskGroup.append('circle')
              .attr('cx', taskX + taskRadius - 5)
              .attr('cy', taskY - taskRadius + 5)
              .attr('r', 8)
              .attr('fill', '#10b981');
            
            taskGroup.append('text')
              .attr('x', taskX + taskRadius - 5)
              .attr('y', taskY - taskRadius + 5)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('fill', 'white')
              .attr('font-weight', 'bold')
              .attr('font-size', '10px')
              .text('✓');
          }
          
          // Add additional information below tasks
          if (task.rolloverCount) {
            taskGroup.append('text')
              .attr('x', taskX)
              .attr('y', taskY + taskRadius + 10)
              .attr('text-anchor', 'middle')
              .attr('fill', 'rgba(255, 255, 255, 0.7)')
              .attr('font-size', '9px')
              .text(`${task.rolloverCount} days rollover`); //${task.rolloverCount} is JS string interpolation
          } else if (task.streakCount) {
            taskGroup.append('text')
              .attr('x', taskX)
              .attr('y', taskY + taskRadius + 10)
              .attr('text-anchor', 'middle')
              .attr('fill', 'rgba(255, 255, 255, 0.7)')
              .attr('font-size', '9px')
              .text(`${task.streakCount} days streak`);
          } else if (task.progress) {
            taskGroup.append('text')
              .attr('x', taskX)
              .attr('y', taskY + taskRadius + 10)
              .attr('text-anchor', 'middle')
              .attr('fill', 'rgba(255, 255, 255, 0.7)')
              .attr('font-size', '9px')
              .text(`Module ${task.progress}`);
          } else if (task.dueDate) {
            taskGroup.append('text')
              .attr('x', taskX)
              .attr('y', taskY + taskRadius + 10)
              .attr('text-anchor', 'middle')
              .attr('fill', 'rgba(255, 255, 255, 0.7)')
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
      <svg ref={svgRef} width="100%" height="100%" className="bg-slate-900" />
      
      {/* Timeline navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800 rounded-full px-4 py-2 flex space-x-8">
        {['Mar 16', 'Mar 17', 'TODAY', 'Mar 19', 'Mar 20', 'Mar 21'].map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className={`w-5 h-5 rounded-full ${day === 'TODAY' ? 'bg-blue-600' : 'bg-slate-600'} flex items-center justify-center text-xs`}
            >
              {day === 'TODAY' ? '18' : ''}
            </div>
            <span className={`text-xs mt-1 ${day === 'TODAY' ? 'text-white' : 'text-slate-400'}`}>{day}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default MindMap;