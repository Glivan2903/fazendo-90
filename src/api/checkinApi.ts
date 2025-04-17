
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { checkUserCheckinConflicts, verifyClassAvailability } from "./utils/classUtils";

// Type for the conflict return value
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

// Check in to a class
export const checkInToClass = async (classId: string): Promise<CheckInResult> => {
  try {
    console.log("Realizando check-in para a aula:", classId);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user");
      toast.error("Você precisa estar logado para fazer check-in");
      return false;
    }
    
    // Check for conflicting check-ins
    const conflictResult = await checkUserCheckinConflicts(user.id, classId);
    if (conflictResult.hasConflict) {
      console.log("User already has check-in on same day:", conflictResult);
      return conflictResult;
    }
    
    // Verify class capacity and user check-in status
    const availability = await verifyClassAvailability(classId, user.id);
    
    if (!availability.classExists) {
      return false;
    }
    
    if (!availability.hasCapacity) {
      toast.error("Esta aula está lotada");
      return false;
    }
    
    if (availability.userCheckedIn) {
      toast.error("Você já está inscrito nesta aula");
      return false;
    }
    
    // Insert check-in
    const { data: insertData, error: insertError } = await supabase
      .from('checkins')
      .insert([
        { class_id: classId, user_id: user.id, status: 'confirmed' }
      ])
      .select();
    
    if (insertError) {
      console.error("Error checking in:", insertError);
      toast.error("Erro ao fazer check-in");
      return false;
    }
    
    console.log("Check-in realizado com sucesso:", insertData);
    return true;
  } catch (error) {
    console.error("Exception during check-in:", error);
    toast.error("Erro ao fazer check-in");
    return false;
  }
};

// Cancel check-in for a class
export const cancelCheckIn = async (classId: string): Promise<boolean> => {
  try {
    console.log("Cancelando check-in para a aula:", classId);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user");
      toast.error("Você precisa estar logado para cancelar o check-in");
      return false;
    }
    
    const { error } = await supabase
      .from('checkins')
      .delete()
      .eq('class_id', classId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error canceling check-in:", error);
      toast.error("Erro ao cancelar check-in");
      return false;
    }
    
    console.log("Check-in cancelado com sucesso!");
    return true;
  } catch (error) {
    console.error("Exception during check-in cancellation:", error);
    toast.error("Erro ao cancelar check-in");
    return false;
  }
};

// Check for conflicting check-ins for the current user
export const checkConflictingCheckins = async (classId: string): Promise<{ 
  hasConflict: boolean; 
  conflictClass?: { 
    id: string; 
    name: string; 
    time: string;
  }
}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user");
      return { hasConflict: false };
    }
    
    return await checkUserCheckinConflicts(user.id, classId);
  } catch (error) {
    console.error("Error checking conflicting check-ins:", error);
    return { hasConflict: false };
  }
};

// Change check-in from one class to another
export const changeCheckIn = async (fromClassId: string, toClassId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user");
      toast.error("Você precisa estar logado para alterar o check-in");
      return false;
    }
    
    console.log(`Alterando check-in: de ${fromClassId} para ${toClassId}`);
    
    // First, cancel the current check-in
    const { error: deleteError } = await supabase
      .from('checkins')
      .delete()
      .eq('class_id', fromClassId)
      .eq('user_id', user.id);
      
    if (deleteError) {
      console.error("Erro ao cancelar check-in anterior:", deleteError);
      toast.error("Erro ao cancelar o check-in anterior");
      return false;
    }
    
    console.log("Check-in anterior cancelado com sucesso");
    
    // Then, check capacity of new class
    const availability = await verifyClassAvailability(toClassId, user.id);
    
    if (!availability.classExists) {
      // Try to restore previous check-in
      await supabase
        .from('checkins')
        .insert([
          { class_id: fromClassId, user_id: user.id, status: 'confirmed' }
        ]);
        
      return false;
    }
    
    if (!availability.hasCapacity) {
      toast.error("A aula selecionada está lotada");
      
      // Try to restore previous check-in
      await supabase
        .from('checkins')
        .insert([
          { class_id: fromClassId, user_id: user.id, status: 'confirmed' }
        ]);
        
      return false;
    }
    
    // Insert the new check-in
    const { data: insertData, error: insertError } = await supabase
      .from('checkins')
      .insert([
        { class_id: toClassId, user_id: user.id, status: 'confirmed' }
      ])
      .select();
    
    if (insertError) {
      console.error("Erro ao fazer check-in na nova aula:", insertError);
      toast.error("Erro ao fazer check-in na nova aula");
      
      // Try to restore previous check-in
      await supabase
        .from('checkins')
        .insert([
          { class_id: fromClassId, user_id: user.id, status: 'confirmed' }
        ]);
        
      return false;
    }
    
    console.log("Check-in na nova aula realizado com sucesso:", insertData);
    toast.success("Check-in alterado com sucesso!");
    return true;
  } catch (error) {
    console.error("Exception during check-in change:", error);
    toast.error("Erro ao alterar check-in");
    return false;
  }
};
