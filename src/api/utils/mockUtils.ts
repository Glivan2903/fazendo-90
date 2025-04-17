
import { Class, ClassDetail, Attendee } from "@/types";
import { generateClassesForDay, generateAttendees } from "../mockData";
import { format, isValid } from "date-fns";

// Mock class data generation for when real data is unavailable
export const fetchMockClasses = async (date: Date): Promise<Class[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const mockClasses = generateClassesForDay(diffDays);
  
  return mockClasses.map(cls => {
    const startTime = cls.startTime instanceof Date && !isNaN(cls.startTime.getTime()) 
      ? cls.startTime 
      : new Date();
      
    const endTime = cls.endTime instanceof Date && !isNaN(cls.endTime.getTime()) 
      ? cls.endTime 
      : new Date(Date.now() + 3600000);
      
    return {
      ...cls,
      id: crypto.randomUUID(),
      startTime,
      endTime
    };
  });
};

export const fetchMockClassDetails = async (classId: string): Promise<{classDetail: ClassDetail, attendees: Attendee[]}> => {
  try {
    let mockClassDetail: ClassDetail;
    let attendeeCount = 8;
    
    if (classId.includes('-') && !classId.includes('-', 2)) {
      const [dayOffsetStr, classIndexStr] = classId.split('-');
      const dayOffset = parseInt(dayOffsetStr);
      const classIndex = parseInt(classIndexStr);
      
      const classes = generateClassesForDay(dayOffset);
      const classData = classes[classIndex];
      attendeeCount = classData.attendeeCount;
      
      mockClassDetail = {
        id: crypto.randomUUID(),
        startTime: classData.startTime,
        endTime: classData.endTime,
        program: {
          id: crypto.randomUUID(),
          name: classData.programName
        },
        coach: {
          id: crypto.randomUUID(),
          name: classData.coachName,
          avatarUrl: classData.coachAvatar
        },
        maxCapacity: classData.maxCapacity,
        attendeeCount: classData.attendeeCount
      };
    } else {
      const now = new Date();
      mockClassDetail = {
        id: classId,
        startTime: new Date(now.setHours(now.getHours() + 1)),
        endTime: new Date(now.setHours(now.getHours() + 2)),
        program: {
          id: crypto.randomUUID(),
          name: "CrossFit"
        },
        coach: {
          id: crypto.randomUUID(),
          name: "Coach",
          avatarUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=Coach"
        },
        maxCapacity: 15,
        attendeeCount: attendeeCount
      };
    }
    
    const attendees = generateAttendees(attendeeCount);
    
    return { classDetail: mockClassDetail, attendees };
  } catch (error) {
    console.error("Error generating mock class details:", error);
    
    const mockClassDetail: ClassDetail = {
      id: crypto.randomUUID(),
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      program: {
        id: crypto.randomUUID(),
        name: "CrossFit"
      },
      coach: {
        id: crypto.randomUUID(),
        name: "Coach",
        avatarUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=Coach"
      },
      maxCapacity: 15,
      attendeeCount: 5
    };
    
    const attendees = generateAttendees(5);
    
    return { classDetail: mockClassDetail, attendees };
  }
};
