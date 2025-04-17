
// Export the CheckInResult type for the application
export type CheckInResult = 
  | boolean 
  | { 
      hasConflict: boolean; 
      conflictClass?: { 
        id: string; 
        name: string; 
        time: string;
      }
    };
