// src/hooks/useTasks.ts
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
  getDoc,
  setDoc,
  writeBatch,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

// Helper function to get default color for a category
const getDefaultCategoryColor = (category) => {
  const colors = {
    work: '#a78bfa',     // purple-400
    personal: '#f472b6',  // pink-400
    health: '#4ade80',    // green-400
    finance: '#f87171',   // red-400
    learning: '#ffdf20',  // amber-400 (yellow)
    projects: '#818cf8'   // indigo-400
  };
  
  return colors[category.toLowerCase()] || '#bfdbfe';  // Brighter blue
};

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  // Load tasks and categories for the current user with real-time updates
  useEffect(() => {
    if (!currentUser) {
      console.log("No current user, skipping data load");
      setTasks([]);
      setCategories([]);
      setLoading(false);
      return;
    }
    
    console.log("Setting up real-time listeners for user:", currentUser.uid);
    setLoading(true);
    
    // Use a much simpler approach: fixed document IDs for default categories
    const initializeDefaultCategories = async () => {
      try {
        // Check if default work category exists (as a marker)
        const workCategoryRef = doc(db, `users/${currentUser.uid}/categories`, 'default-work');
        const workDoc = await getDoc(workCategoryRef);
        
        if (!workDoc.exists()) {
          console.log("Creating default categories with fixed IDs");
          
          // Create all default categories with fixed IDs in a batch
          const batch = writeBatch(db);
          
          // Define default categories with fixed IDs
          const defaultCategories = [
            { id: 'default-work', name: 'work', color: '#a78bfa' },     // purple-400
            { id: 'default-personal', name: 'personal', color: '#f472b6' }, // pink-400
            { id: 'default-health', name: 'health', color: '#4ade80' },   // green-400
            { id: 'default-finance', name: 'finance', color: '#f87171' },  // red-400
            { id: 'default-learning', name: 'learning', color: '#ffdf20' }, // amber-400 (actual yellow)
            { id: 'default-projects', name: 'projects', color: '#818cf8' }  // indigo-400
          ];
          
          // Add each category with its fixed ID
          defaultCategories.forEach(category => {
            const categoryRef = doc(db, `users/${currentUser.uid}/categories`, category.id);
            batch.set(categoryRef, {
              name: category.name,
              color: category.color,
              createdAt: Timestamp.now()
            });
          });
          
          // Commit the batch
          await batch.commit();
          console.log("Default categories created with fixed IDs");
        } else {
          console.log("Default categories already exist");
        }
      } catch (error) {
        console.error("Error initializing categories:", error);
      }
    };
    
    // Initialize first, then set up listeners
    let unsubscribeTasks, unsubscribeCategories;
    
    initializeDefaultCategories().then(() => {
      // Reference to user's tasks collection
      const tasksRef = collection(db, `users/${currentUser.uid}/tasks`);
      
      // Set up real-time listener for tasks
      unsubscribeTasks = onSnapshot(
        query(tasksRef, orderBy('createdAt', 'desc')),
        (snapshot) => {
          const tasksData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamps to ISO strings
            createdAt: doc.data().createdAt?.toDate?.() 
              ? doc.data().createdAt.toDate().toISOString()
              : doc.data().createdAt,
            completedAt: doc.data().completedAt?.toDate?.() 
              ? doc.data().completedAt.toDate().toISOString()
              : doc.data().completedAt,
            dueDate: doc.data().dueDate?.toDate?.() 
              ? doc.data().dueDate.toDate().toISOString().split('T')[0]
              : doc.data().dueDate
          }));
          
          console.log("Real-time tasks update, count:", tasksData.length);
          setTasks(tasksData);
        },
        (error) => {
          console.error("Error in tasks listener:", error);
        }
      );
      
      // Reference to user's categories collection
      const categoriesRef = collection(db, `users/${currentUser.uid}/categories`);
      
      // Set up real-time listener for categories
      unsubscribeCategories = onSnapshot(
        categoriesRef,
        (snapshot) => {
          const categoriesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log("Real-time categories update, count:", categoriesData.length);
          setCategories(categoriesData);
          setLoading(false);
        },
        (error) => {
          console.error("Error in categories listener:", error);
          setLoading(false);
        }
      );
    });
    
    // Clean up function
    return () => {
      if (unsubscribeTasks) unsubscribeTasks();
      if (unsubscribeCategories) unsubscribeCategories();
    };
  }, [currentUser]);
  
  // Initialize default categories if user has none
  const initializeDefaultCategories = async () => {
    if (!currentUser) return;
    
    try {
      // Check if user has any categories
      const categoriesRef = collection(db, `users/${currentUser.uid}/categories`);
      const snapshot = await getDocs(categoriesRef);
      
      // If user has no categories, create defaults
      if (snapshot.empty) {
        console.log("Creating default categories for new user");
        const defaultCategories = {
          work: '#a78bfa',     // purple-400
          personal: '#f472b6',  // pink-400
          health: '#4ade80',    // green-400
          finance: '#f87171',   // red-400
          learning: '#ffdf20',  // amber-400 (yellow)
          projects: '#818cf8'   // indigo-400
        };
        
        const batch = writeBatch(db);
        
        Object.entries(defaultCategories).forEach(([name, color]) => {
          const newCategoryRef = doc(categoriesRef);
          batch.set(newCategoryRef, {
            name: name,
            color: color,
            createdAt: Timestamp.now()
          });
        });
        
        await batch.commit();
      }
    } catch (error) {
      console.error("Error initializing default categories:", error);
    }
  };
  
  // Find a category by name
  const getCategoryByName = useCallback((name) => {
    return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
  }, [categories]);
  
  // Add a new task
  const addTask = async (taskData) => {
    if (!currentUser) {
      console.error("No current user found");
      return;
    }
    
    try {
      // Find the category by name, or use the first category as default
      let categoryId = null;
      
      if (taskData.category) {
        const category = getCategoryByName(taskData.category);
        if (category) {
          categoryId = category.id;
        }
      }
      
      // If no valid category found, use first available or create one
      if (!categoryId && categories.length > 0) {
        categoryId = categories[0].id;
      } else if (!categoryId) {
        // Create a default category if none exists
        const newCategoryRef = await addDoc(
          collection(db, `users/${currentUser.uid}/categories`),
          {
            name: 'Tasks',
            color: '#bfdbfe',
            createdAt: Timestamp.now()
          }
        );
        categoryId = newCategoryRef.id;
      }
      
      // Prepare task data
      const newTask = {
        title: taskData.title,
        description: taskData.description || '',
        dueDate: new Date(taskData.dueDate),
        priority: taskData.priority || 'medium',
        status: 'active',
        categoryId: categoryId,
        createdAt: Timestamp.now(),
        rolloverCount: 0
      };
      
      // Add task to Firestore
      const docRef = await addDoc(
        collection(db, `users/${currentUser.uid}/tasks`), 
        newTask
      );
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };
  
  // Update an existing task
  const updateTask = async (taskId, updatedData) => {
    if (!currentUser) {
      console.error("No current user found");
      return;
    }
    
    try {
      // Handle category updates (if category name is provided)
      if (updatedData.category) {
        const category = getCategoryByName(updatedData.category);
        if (category) {
          updatedData.categoryId = category.id;
        }
        // Remove the category field since we're using categoryId
        delete updatedData.category;
      }
      
      // Convert date strings to Firestore timestamps if present
      if (updatedData.dueDate && typeof updatedData.dueDate === 'string') {
        updatedData.dueDate = new Date(updatedData.dueDate);
      }
      
      if (updatedData.completedAt && typeof updatedData.completedAt === 'string') {
        updatedData.completedAt = new Date(updatedData.completedAt);
      }
      
      // Update task in Firestore
      const taskRef = doc(db, `users/${currentUser.uid}/tasks`, taskId);
      await updateDoc(taskRef, updatedData);
      
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };
  
  // Complete a task
  const completeTask = async (taskId) => {
    return updateTask(taskId, { 
      status: 'completed',
      completedAt: new Date()
    });
  };
  
  // Delete a task
  const deleteTask = async (taskId) => {
    if (!currentUser) {
      console.error("No current user found");
      return;
    }
    
    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/tasks`, taskId));
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };
  
  // Add a new category
  const addCategory = async (name, color) => {
    if (!currentUser) return;
    
    try {
      // Check if category with this name already exists
      const existingCategory = getCategoryByName(name);
      if (existingCategory) {
        return existingCategory.id;
      }
      
      // Create new category
      const newCategory = {
        name,
        color: color || getDefaultCategoryColor(name),
        createdAt: Timestamp.now()
      };
      
      // Add to Firestore
      const docRef = await addDoc(
        collection(db, `users/${currentUser.uid}/categories`), 
        newCategory
      );
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };
  
  // Update a category
  const updateCategory = async (categoryId, newData) => {
    if (!currentUser) return;
    
    try {
      console.log("Updating category", categoryId, "with data:", newData);
      
      // Update in Firestore
      const categoryRef = doc(db, `users/${currentUser.uid}/categories`, categoryId);
      await updateDoc(categoryRef, newData);
      
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };
  
  // Delete a category and all its tasks
  const deleteCategory = async (categoryId) => {
    if (!currentUser) return;
    
    try {
      // Find all tasks with this category
      const tasksWithCategory = tasks.filter(task => task.categoryId === categoryId);
      
      // Delete all associated tasks in a batch
      const batch = writeBatch(db);
      
      tasksWithCategory.forEach(task => {
        const taskRef = doc(db, `users/${currentUser.uid}/tasks`, task.id);
        batch.delete(taskRef);
      });
      
      // Delete the category itself
      const categoryRef = doc(db, `users/${currentUser.uid}/categories`, categoryId);
      batch.delete(categoryRef);
      
      // Commit the batch
      await batch.commit();
      
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };
  
  // Get tasks for a specific date
  const getTasksForDate = useCallback((date) => {
    const dateString = date.toDateString();
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate).toDateString();
      return taskDate === dateString;
    });
  }, [tasks]);
  
  // Roll over incomplete tasks from previous days
  /* const rolloverTasks = async () => {
    if (!currentUser) return 0;
    
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
    const batch = writeBatch(db);
    
    overdueTasks.forEach(task => {
      const taskRef = doc(db, `users/${currentUser.uid}/tasks`, task.id);
      batch.update(taskRef, {
        dueDate: today,
        rolloverCount: (task.rolloverCount || 0) + 1
      });
    });
    
    if (overdueTasks.length > 0) {
      await batch.commit();
    }
    
    return overdueTasks.length;
  }; */

  // Utility function to find a category by ID
  const getCategoryById = useCallback((categoryId) => {
    return categories.find(cat => cat.id === categoryId) || null;
  }, [categories]);
  
  return {
    tasks,
    categories,
    loading,
    addTask,
    updateTask,
    completeTask,
    deleteTask,
    getTasksForDate,
    /* rolloverTasks, */
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryByName
  };
}