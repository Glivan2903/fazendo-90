
// This file re-exports all class-related API functions for backward compatibility
// This helps us maintain compatibility with existing code while refactoring

export { fetchClasses } from './classListApi';
export { fetchClassDetails } from './classDetailApi';
export { 
  checkInToClass, 
  cancelCheckIn, 
  checkConflictingCheckins, 
  changeCheckIn 
} from './checkinApi';

export type { CheckInResult } from './checkinApi';
