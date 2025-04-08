// src/hooks/useTasks.js
import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  doc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  // Load tasks for the current user
  const loadTasks = useCallback(async () => {
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }
    
    try {
      const tasksQuery = query(
        collection(db, `users/${currentUser.uid}/tasks`),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(tasksQuery);
      const tasksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to ISO string if they exist
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
        dueDate: doc.data().dueDate?.toDate?.() 
          ? doc.data().dueDate.toDate().toISOString()
          : doc.data().dueDate || new Date().toISOString(),
        completedAt: doc.data().completedAt?.toDate?.() 
          ? doc.data().completedAt.toDate().toISOString()
          : doc.data().completedAt
      }));
      
      setTasks(tasksData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setLoading(false);
    }
  }, [currentUser]);
  
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);
  
  // Add a new task
  async function addTask(task) {
    if (!currentUser) return;
    
    try {
      // Convert date strings to Firestore timestamps
      const dueDate = new Date(task.dueDate);
      
      const taskData = {
        ...task,
        createdAt: Timestamp.now(),
        dueDate: Timestamp.fromDate(dueDate),
        status: 'active',
        rolloverCount: 0
      };
      
      const docRef = await addDoc(
        collection(db, `users/${currentUser.uid}/tasks`), 
        taskData
      );
      
      // Convert Firestore timestamps to ISO strings for local state
      const newTask = {
        id: docRef.id,
        ...taskData,
        createdAt: taskData.createdAt.toDate().toISOString(),
        dueDate: taskData.dueDate.toDate().toISOString()
      };
      
      setTasks(prevTasks => [newTask, ...prevTasks]);
      
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
      const taskRef = doc(db, `users/${currentUser.uid}/tasks`, taskId);
      
      // Convert date strings to Firestore timestamps if present
      const firestoreData = { ...updatedData };
      
      if (firestoreData.dueDate) {
        firestoreData.dueDate = Timestamp.fromDate(new Date(firestoreData.dueDate));
      }
      
      await updateDoc(taskRef, firestoreData);
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            // Convert any Firestore timestamps back to ISO strings
            const updatedTask = { ...task, ...updatedData };
            
            if (firestoreData.dueDate) {
              updatedTask.dueDate = new Date(updatedData.dueDate).toISOString();
            }
            
            return updatedTask;
          }
          return task;
        })
      );
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }
  
  // Complete a task
  async function completeTask(taskId) {
    if (!currentUser) return;
    
    try {
      const taskRef = doc(db, `users/${currentUser.uid}/tasks`, taskId);
      const completedAt = Timestamp.now();
      
      await updateDoc(taskRef, { 
        status: 'completed',
        completedAt
      });
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: 'completed', 
                completedAt: completedAt.toDate().toISOString() 
              } 
            : task
        )
      );
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }
  
  // Delete a task
  async function deleteTask(taskId) {
    if (!currentUser) return;
    
    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/tasks`, taskId));
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
  
  // Get tasks for a specific date
  function getTasksForDate(date) {
    const dateString = new Date(date).toDateString();
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
      
      const taskRef = doc(db, `users/${currentUser.uid}/tasks`, task.id);
      await updateDoc(taskRef, {
        dueDate: Timestamp.fromDate(today),
        rolloverCount
      });
    }
    
    // Reload tasks to reflect the changes
    if (overdueTasks.length > 0) {
      await loadTasks();
    }
    
    return overdueTasks.length;
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