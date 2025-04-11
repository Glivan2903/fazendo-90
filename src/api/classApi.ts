
import { Class, ClassDetail, Attendee } from "../types";
import { generateClassesForDay, generateAttendees } from "./mockData";
import { addDays } from "date-fns";

// Mock API service to fetch classes for a specific date
export const fetchClasses = async (date: Date): Promise<Class[]> => {
  // Calculate day offset from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  // Simulate API delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(generateClassesForDay(diffDays));
    }, 500);
  });
};

// Mock API service to fetch a specific class details
export const fetchClassDetails = async (classId: string): Promise<{classDetail: ClassDetail, attendees: Attendee[]}> => {
  // Parse day offset and class index from the ID
  const [dayOffsetStr, classIndexStr] = classId.split('-');
  const dayOffset = parseInt(dayOffsetStr);
  const classIndex = parseInt(classIndexStr);
  
  // Get the classes for that day
  const classes = generateClassesForDay(dayOffset);
  const classData = classes[classIndex];
  
  // Create class detail object
  const classDetail: ClassDetail = {
    id: classId,
    startTime: classData.startTime,
    endTime: classData.endTime,
    program: {
      id: '1',
      name: classData.programName
    },
    coach: {
      id: '1',
      name: classData.coachName,
      avatarUrl: classData.coachAvatar
    },
    maxCapacity: classData.maxCapacity,
    attendeeCount: classData.attendeeCount
  };
  
  // Generate random attendees
  const attendees = generateAttendees(classData.attendeeCount);
  
  // Simulate API delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        classDetail,
        attendees
      });
    }, 700);
  });
};

// Mock API service to check in to a class
export const checkInToClass = async (classId: string): Promise<boolean> => {
  // Simulate API delay and success
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, 800);
  });
};

// Mock API service to cancel check in
export const cancelCheckIn = async (classId: string): Promise<boolean> => {
  // Simulate API delay and success
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, 800);
  });
};
