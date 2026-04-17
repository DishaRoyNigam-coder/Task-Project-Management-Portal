import React, { ReactNode, createContext, useContext, useState } from 'react';

export type UpdateType = 'Completed' | 'Delayed' | 'Pending';

type TaskUpdate = {
  status: 'pending' | 'rejected' | 'approved' | 'in_review';
  id: string;
  taskId: string;
  employeeId: string;
  type: UpdateType;
  description: string;
  createdAt: string;
};

interface UpdateContextType {
  updates: TaskUpdate[];
  loading: boolean; // ✅ added loading flag
  submitUpdate: (update: Omit<TaskUpdate, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  rejectUpdate: (updateId: string) => void;
  getUpdatesForTask: (taskId: string) => TaskUpdate[];
  getUpdatesByEmployee: (employeeId: string) => TaskUpdate[];
}

const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

export const UpdateProvider = ({ children }: { children: ReactNode }) => {
  const [updates, setUpdates] = useState<TaskUpdate[]>(() => {
    const stored = localStorage.getItem('taskUpdates');
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored) as Array<{
        status: string;
        id: string;
        taskId: string;
        employeeId: string;
        type: UpdateType;
        description: string;
        createdAt: string;
      }>;

      // Validate and narrow status to the correct union
      return parsed.filter((item): item is TaskUpdate => {
        return ['pending', 'rejected', 'approved', 'in_review'].includes(item.status);
      });
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState<boolean>(false);

  const saveToLocalStorage = (newUpdates: TaskUpdate[]) => {
    localStorage.setItem('taskUpdates', JSON.stringify(newUpdates));
    setUpdates(newUpdates);
  };

  // ✅ Made async, added loading state
  const submitUpdate = async (update: Omit<TaskUpdate, 'id' | 'createdAt' | 'status'>) => {
    setLoading(true);
    try {
      // Simulate async operation (e.g., API call) – replace with real API if needed
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newUpdate: TaskUpdate = {
        ...update,
        id: `upd_${Date.now()}_${Math.random()}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      saveToLocalStorage([newUpdate, ...updates]);
    } finally {
      setLoading(false);
    }
  };

  const rejectUpdate = (updateId: string) => {
    const updated: TaskUpdate[] = updates.map((up) =>
      up.id === updateId ? { ...up, status: 'rejected' } : up,
    );
    saveToLocalStorage(updated);
  };

  const getUpdatesForTask = (taskId: string) =>
    updates
      .filter((up) => up.taskId === taskId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const getUpdatesByEmployee = (employeeId: string) =>
    updates
      .filter((up) => up.employeeId === employeeId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <UpdateContext.Provider
      value={{
        updates,
        loading,
        submitUpdate,
        rejectUpdate,
        getUpdatesForTask,
        getUpdatesByEmployee,
      }}
    >
      {children}
    </UpdateContext.Provider>
  );
};

export const useUpdates = () => {
  const ctx = useContext(UpdateContext);
  if (!ctx) throw new Error('useUpdates must be used within UpdateProvider');
  return ctx;
};
