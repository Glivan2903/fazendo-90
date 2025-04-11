
import { Class, Attendee, ClassDetail } from "../types";
import { addDays, setHours, setMinutes } from "date-fns";

// Helper function to create a date with specific hours and minutes
const createDate = (dayOffset: number, hours: number, minutes: number): Date => {
  const date = addDays(new Date(), dayOffset);
  return setMinutes(setHours(date, hours), minutes);
};

// Generate mock classes for a specific day
export const generateClassesForDay = (dayOffset: number): Class[] => {
  const classTemplates = [
    {
      programName: "CrossFit",
      coachName: "Bruna Rojo",
      coachAvatar: "/lovable-uploads/0df74c4f-9f71-44b4-aac0-b2ba15a0276b.png",
      maxCapacity: 15,
      time: { start: 6, end: 7 }
    },
    {
      programName: "CrossFit",
      coachName: "Alex Domingues",
      coachAvatar: "/lovable-uploads/12ca6493-c2c5-4b27-9e7c-398f9b76cd21.png",
      maxCapacity: 15,
      time: { start: 7, end: 8 }
    },
    {
      programName: "Mobilidade",
      coachName: "Ana Flávia Lima",
      coachAvatar: "/lovable-uploads/0b0be4d9-7d54-4156-b169-fcbcfb037380.png",
      maxCapacity: 10,
      time: { start: 8, end: 9 }
    },
    {
      programName: "CrossFit",
      coachName: "Leonardo Souza",
      coachAvatar: undefined,
      maxCapacity: 15,
      time: { start: 10, end: 11 }
    },
    {
      programName: "CrossFit",
      coachName: "Bruna Rojo",
      coachAvatar: "/lovable-uploads/0df74c4f-9f71-44b4-aac0-b2ba15a0276b.png",
      maxCapacity: 15,
      time: { start: 17, end: 18 }
    },
    {
      programName: "CrossFit",
      coachName: "Alex Domingues",
      coachAvatar: "/lovable-uploads/12ca6493-c2c5-4b27-9e7c-398f9b76cd21.png",
      maxCapacity: 15,
      time: { start: 18, end: 19 }
    },
    {
      programName: "CrossFit",
      coachName: "Leonardo Souza",
      coachAvatar: undefined,
      maxCapacity: 15,
      time: { start: 19, end: 20 }
    }
  ];

  return classTemplates.map((template, index) => {
    const attendeeCount = Math.floor(Math.random() * (template.maxCapacity + 1));
    const isCheckedIn = Math.random() > 0.7;
    
    return {
      id: `${dayOffset}-${index}`,
      startTime: createDate(dayOffset, template.time.start, 0),
      endTime: createDate(dayOffset, template.time.end, 0),
      programName: template.programName,
      coachName: template.coachName,
      coachAvatar: template.coachAvatar,
      maxCapacity: template.maxCapacity,
      attendeeCount: attendeeCount,
      spotsLeft: template.maxCapacity - attendeeCount,
      isCheckedIn: isCheckedIn,
    };
  });
};

// Generate mock attendees
export const generateAttendees = (count: number): Attendee[] => {
  const attendees: Attendee[] = [
    { id: '1', name: 'Alex Domingues', avatarUrl: '/lovable-uploads/12ca6493-c2c5-4b27-9e7c-398f9b76cd21.png' },
    { id: '2', name: 'Bruna Rojo', avatarUrl: '/lovable-uploads/0df74c4f-9f71-44b4-aac0-b2ba15a0276b.png' },
    { id: '3', name: 'Ana Flávia Lima', avatarUrl: '/lovable-uploads/0b0be4d9-7d54-4156-b169-fcbcfb037380.png' },
    { id: '4', name: 'Carolina Santos', avatarUrl: undefined },
    { id: '5', name: 'Diego Pereira', avatarUrl: undefined },
    { id: '6', name: 'Fernanda Oliveira', avatarUrl: undefined },
    { id: '7', name: 'Gabriel Martins', avatarUrl: undefined },
    { id: '8', name: 'Helena Costa', avatarUrl: undefined },
    { id: '9', name: 'Ivan Silva', avatarUrl: undefined },
    { id: '10', name: 'Júlia Ferreira', avatarUrl: undefined },
    { id: '11', name: 'Kauê Rodrigues', avatarUrl: undefined },
    { id: '12', name: 'Larissa Almeida', avatarUrl: undefined },
    { id: '13', name: 'Marcelo Barbosa', avatarUrl: undefined },
    { id: '14', name: 'Natália Lima', avatarUrl: undefined },
    { id: '15', name: 'Otávio Souza', avatarUrl: undefined },
  ];

  // Return a random subset of attendees
  return attendees.slice(0, Math.min(count, attendees.length));
};
