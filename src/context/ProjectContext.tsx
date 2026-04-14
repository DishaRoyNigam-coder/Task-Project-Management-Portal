// src/context/ProjectContext.tsx
import React, { ReactNode, createContext, useContext, useState } from 'react';

interface Employee {
  id: string;
  name: string;
  email: string;
}

export interface ProjectLink {
  id: string;
  projectId: string;
  linkTitle: string;
  linkUrl: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  projectName: string;
  clientName: string;
  teamMembers: Employee[];
  driveLink: string;
  projectNotes: string;
  projectPhase: string;
  status: 'Active' | 'Completed' | 'Archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  assignedTo: Employee;
}

interface ProjectContextType {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  links: ProjectLink[];
  setLinks: React.Dispatch<React.SetStateAction<ProjectLink[]>>;
  addLink: (link: Omit<ProjectLink, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLink: (id: string, updates: Partial<ProjectLink>) => void;
  deleteLink: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const mockEmployees: Employee[] = [
    { id: 'emp1', name: 'John Doe', email: 'john.doe@company.com' },
    { id: 'emp2', name: 'Jane Smith', email: 'jane.smith@company.com' },
    { id: 'emp3', name: 'Mike Johnson', email: 'mike.j@company.com' },
    { id: 'emp4', name: 'Emily Davis', email: 'emily.davis@company.com' },
    { id: 'emp5', name: 'Robert Brown', email: 'robert.brown@company.com' },
  ];

  const initialProjects: Project[] = [
    {
      id: 'proj1',
      projectName: 'Mobile Banking App',
      clientName: 'FinBank Corp',
      teamMembers: [mockEmployees[0], mockEmployees[1]],
      driveLink: 'https://drive.google.com/drive/folders/abc123',
      projectNotes: 'Implement biometric login and transaction history',
      projectPhase: 'Development',
      status: 'Active',
      createdBy: 'Admin User',
      createdAt: '2025-03-01T10:00:00Z',
      updatedAt: '2025-03-15T14:30:00Z',
    },
    {
      id: 'proj2',
      projectName: 'E-commerce Platform',
      clientName: 'ShopStream',
      teamMembers: [mockEmployees[2], mockEmployees[3]],
      driveLink: 'https://drive.google.com/drive/folders/def456',
      projectNotes: 'Integrate payment gateway and inventory system',
      projectPhase: 'Planning',
      status: 'Active',
      createdBy: 'Admin User',
      createdAt: '2025-03-10T09:15:00Z',
      updatedAt: '2025-03-10T09:15:00Z',
    },
  ];

  const initialTasks: Task[] = [
    {
      id: 'task1',
      projectId: 'proj1',
      title: 'Design login UI',
      priority: 'High',
      dueDate: '2025-04-10',
      assignedTo: mockEmployees[0],
    },
    {
      id: 'task2',
      projectId: 'proj1',
      title: 'Implement API integration',
      priority: 'Medium',
      dueDate: '2025-04-15',
      assignedTo: mockEmployees[1],
    },
  ];

  const initialLinks: ProjectLink[] = [
    {
      id: 'link1',
      projectId: 'proj1',
      linkTitle: 'Figma Design',
      linkUrl: 'https://figma.com/file/abc123',
      createdBy: 'Admin User',
      createdAt: '2025-03-01T10:00:00Z',
      updatedAt: '2025-03-01T10:00:00Z',
    },
    {
      id: 'link2',
      projectId: 'proj1',
      linkTitle: 'Staging Website',
      linkUrl: 'https://staging.myapp.com',
      createdBy: 'Admin User',
      createdAt: '2025-03-05T14:20:00Z',
      updatedAt: '2025-03-05T14:20:00Z',
    },
  ];

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [links, setLinks] = useState<ProjectLink[]>(initialLinks);

  const addLink = (linkData: Omit<ProjectLink, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newLink: ProjectLink = {
      ...linkData,
      id: `link_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setLinks((prev) => [newLink, ...prev]);
  };

  const updateLink = (id: string, updates: Partial<ProjectLink>) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === id ? { ...link, ...updates, updatedAt: new Date().toISOString() } : link,
      ),
    );
  };

  const deleteLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        setProjects,
        tasks,
        setTasks,
        links,
        setLinks,
        addLink,
        updateLink,
        deleteLink,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within ProjectProvider');
  return context;
};

export default ProjectContext;
