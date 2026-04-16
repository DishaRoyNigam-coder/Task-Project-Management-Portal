// src/context/MeetingContext.tsx
import { ReactNode, createContext, useContext, useState } from 'react';

export interface Meeting {
  id: string;
  employeeId: number; // ✅ changed from string to number
  projectId?: string;
  date: string; // YYYY-MM-DD
  title: string;
  notes: string;
}

interface MeetingContextType {
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  getMeetingsByEmployee: (employeeId: number) => Meeting[]; // ✅ parameter as number
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider = ({ children }: { children: ReactNode }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const addMeeting = (meeting: Omit<Meeting, 'id'>) => {
    const newMeeting: Meeting = {
      ...meeting,
      id: `meeting_${Date.now()}`,
    };
    setMeetings((prev) => [...prev, newMeeting]);
  };

  const getMeetingsByEmployee = (employeeId: number) => {
    return meetings.filter((m) => m.employeeId === employeeId);
  };

  return (
    <MeetingContext.Provider value={{ meetings, addMeeting, getMeetingsByEmployee }}>
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetings = () => {
  const context = useContext(MeetingContext);
  if (!context) throw new Error('useMeetings must be used within MeetingProvider');
  return context;
};
