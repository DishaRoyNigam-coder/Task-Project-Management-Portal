import React, { ReactNode, createContext, useContext, useState } from 'react';
import { Employee } from 'context/TaskContext';

// reuse same Employee type

export interface Project {
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

export interface ProjectLink {
  id: string;
  projectId: string;
  linkTitle: string;
  linkUrl: string;
  createdBy: string;
}

interface ProjectContextType {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  links: ProjectLink[];
  addLink: (link: Omit<ProjectLink, 'id'>) => void;
  updateLink: (id: string, updates: Partial<Omit<ProjectLink, 'id'>>) => void;
  deleteLink: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const mockEmployees: Employee[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@company.com' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com' },
  { id: 3, name: 'Mike Johnson', email: 'mike.j@company.com' },
  { id: 4, name: 'Emily Davis', email: 'emily.davis@company.com' },
  { id: 5, name: 'Robert Brown', email: 'robert.brown@company.com' },
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // add other projects as needed
];

const initialLinks: ProjectLink[] = [];

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [links, setLinks] = useState<ProjectLink[]>(initialLinks);

  const addLink = (link: Omit<ProjectLink, 'id'>) => {
    const newLink: ProjectLink = {
      ...link,
      id: `link_${Date.now()}`,
    };
    setLinks((prev) => [...prev, newLink]);
  };

  const updateLink = (id: string, updates: Partial<Omit<ProjectLink, 'id'>>) => {
    setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, ...updates } : link)));
  };

  const deleteLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  return (
    <ProjectContext.Provider
      value={{ projects, setProjects, links, addLink, updateLink, deleteLink }}
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
