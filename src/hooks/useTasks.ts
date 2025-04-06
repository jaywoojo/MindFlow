// src/hooks/useTasks.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  doc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  // Load tasks for the current user
  useEffect(() => {
    async function loadTasks() {
      if (!currentUser) {
        setTasks([]);
        setLoading(false);
        return;
      }
      
      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(tasksQuery);
        const tasksData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTasks(tasksData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setLoading(false);
      }
    }
    
    loadTasks();
  }, [currentUser]);
  
  // Add a new task
  async function addTask(task) {
    if (!currentUser) return;
    
    try {
      const taskData = {
        ...task,
        userId: currentUser.uid,
        createdAt: new Date(),
        status: 'active'
      };
      
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      
      setTasks(prevTasks => [
        { id: docRef.id, ...taskData },
        ...prevTasks
      ]);
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }
  
  // Update an existing task
  async function updateTask(taskId, updatedData) {
    if (!currentUser) return;
    
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, updatedData);
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, ...updatedData } : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }
  
  // Complete a task
  async function completeTask(taskId) {
    return updateTask(taskId, { 
      status: 'completed',
      completedAt: new Date()
    });
  }
  
  // Delete a task
  async function deleteTask(taskId) {
    if (!currentUser) return;
    
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
  
  // Get tasks for a specific date
  function getTasksForDate(date) {
    const dateString = date.toDateString();
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate).toDateString();
      return taskDate === dateString;
    });
  }
  
  // Roll over incomplete tasks from previous days
  async function rolloverTasks() {
    if (!currentUser) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find tasks that are overdue and not completed
    const overdueTasks = tasks.filter(task => {
      if (task.status === 'completed') return false;
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate < today;
    });
    
    // Roll over each task
    for (const task of overdueTasks) {
      const rolloverCount = (task.rolloverCount || 0) + 1;
      await updateTask(task.id, {
        dueDate: today.toISOString(),
        rolloverCount
      });
    }
  }
  
  return {
    tasks,
    loading,
    addTask,
    updateTask,
    completeTask,
    deleteTask,
    getTasksForDate,
    rolloverTasks
  };
}