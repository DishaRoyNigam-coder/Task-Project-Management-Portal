// src/context/TaskContext.tsx
import React, { ReactNode, createContext, useContext, useState } from 'react';

export interface Employee {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string; // YYYY-MM-DD
  assignedTo: Employee;
  status: 'Pending' | 'In progress' | 'Done';
  createdAt: string;
  updatedAt: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteTask: (id: string) => void;
  getTask: (id: string) => Task | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Mock employees (same as in projects)
const mockEmployees: Employee[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@company.com' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com' },
  { id: 3, name: 'Mike Johnson', email: 'mike.j@company.com' },
  { id: 4, name: 'Emily Davis', email: 'emily.davis@company.com' },
  { id: 5, name: 'Robert Brown', email: 'robert.brown@company.com' },
];

const initialTasks: Task[] = [
  {
    id: 'task1',
    projectId: 'proj1',
    title: 'Design login UI',
    priority: 'High',
    dueDate: '2025-04-10',
    assignedTo: mockEmployees[0],
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task2',
    projectId: 'proj1',
    title: 'Implement API integration',
    priority: 'Medium',
    dueDate: '2025-04-15',
    assignedTo: mockEmployees[1],
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (
    id: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>,
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task,
      ),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const getTask = (id: string) => tasks.find((task) => task.id === id);

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, getTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};
export { mockEmployees };
export default TaskContext;
// src/context/TaskContext.tsx
