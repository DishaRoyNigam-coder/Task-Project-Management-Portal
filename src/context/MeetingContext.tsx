// src/context/MeetingContext.tsx
import { ReactNode, createContext, useContext, useState } from 'react';

export interface Meeting {
  id: string;
  employeeId: number;
  projectId?: string;
  date: string; // YYYY-MM-DD
  title: string;
  notes: string;
  duration: number;
}

interface MeetingContextType {
  meetings: Meeting[];
  loading: boolean;
  addMeeting: (meeting: Omit<Meeting, 'id'>) => Promise<void>;
  getMeetingsByEmployee: (employeeId: number) => Meeting[];
  getMeetingsByProject: (projectId: string) => Meeting[]; // ✅ added
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider = ({ children }: { children: ReactNode }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const addMeeting = async (meeting: Omit<Meeting, 'id'>) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newMeeting: Meeting = {
        ...meeting,
        id: `meeting_${Date.now()}`,
      };
      setMeetings((prev) => [...prev, newMeeting]);
    } finally {
      setLoading(false);
    }
  };

  const getMeetingsByEmployee = (employeeId: number) => {
    return meetings.filter((m) => m.employeeId === employeeId);
  };

  // ✅ Implement getMeetingsByProject
  const getMeetingsByProject = (projectId: string) => {
    return meetings.filter((m) => m.projectId === projectId);
  };

  return (
    <MeetingContext.Provider
      value={{
        meetings,
        loading,
        addMeeting,
        getMeetingsByEmployee,
        getMeetingsByProject, // ✅ include it
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetings = () => {
  const context = useContext(MeetingContext);
  if (!context) throw new Error('useMeetings must be used within MeetingProvider');
  return context;
};
