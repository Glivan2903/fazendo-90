
import React, { useState } from "react";
import { Class } from "@/types";
import { format } from "date-fns";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSchedule } from "@/hooks/use-schedule";
import ViewToggle from "@/components/schedule/ViewToggle";
import GridView from "@/components/schedule/GridView";
import ListView from "@/components/schedule/ListView";
import ClassFormDialog from "@/components/schedule/ClassFormDialog";

interface ScheduleTabProps {
  classes: Class[];
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ classes: initialClasses }) => {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"grid" | "list">(isMobile ? "list" : "grid");
  
  const {
    classes,
    loading,
    selectedDate,
    showNewDialog,
    showEditDialog,
    selectedClass,
    deleteLoading,
    formData,
    programs,
    coaches,
    dateRange,
    setShowNewDialog,
    setShowEditDialog,
    handleSaveClass,
    handleDeleteClass,
    handleDateChange,
    handleProgramChange,
    handleCoachChange,
    handleTimeChange,
    handleCapacityChange,
    openNewDialog,
    openEditDialog,
    getClassDataForDayAndHour,
    handlePrevWeek,
    handleNextWeek,
    resetToCurrentWeek,
    handlePrevDay,
    handleNextDay,
    resetToToday
  } = useSchedule(initialClasses);

  // Open new dialog with pre-selected day and hour
  const handleOpenNewWithParams = (dayOffset: number, hour: string) => {
    const dayDate = new Date(dateRange.start);
    dayDate.setDate(dayDate.getDate() + dayOffset);
    const [hourVal, minuteVal] = hour.split(":");
    
    const newFormData = {
      ...formData,
      date: dayDate,
      startHour: hourVal,
      startMinute: minuteVal,
      endHour: (parseInt(hourVal) + 1).toString().padStart(2, "0"),
      endMinute: minuteVal
    };
    
    // We need to manually update the form data in the hook
    handleDateChange(dayDate);
    handleTimeChange("startHour", hourVal);
    handleTimeChange("startMinute", minuteVal);
    handleTimeChange("endHour", (parseInt(hourVal) + 1).toString().padStart(2, "0"));
    handleTimeChange("endMinute", minuteVal);
    
    setShowNewDialog(true);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle>Grade Horária</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            
            <Button 
              variant="default" 
              onClick={() => openNewDialog()}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Aula
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            viewMode === "grid" && !isMobile ? (
              <GridView 
                classes={classes}
                dateRange={dateRange}
                handlePrevWeek={handlePrevWeek}
                handleNextWeek={handleNextWeek}
                resetToCurrentWeek={resetToCurrentWeek}
                getClassDataForDayAndHour={getClassDataForDayAndHour}
                openEditDialog={openEditDialog}
                openNewDialog={handleOpenNewWithParams}
              />
            ) : (
              <ListView 
                classes={classes}
                selectedDate={selectedDate}
                handlePrevDay={handlePrevDay}
                handleNextDay={handleNextDay}
                resetToToday={resetToToday}
                openEditDialog={openEditDialog}
              />
            )
          )}
        </CardContent>
      </Card>
      
      {/* New Class Dialog */}
      <ClassFormDialog
        isNew={true}
        isOpen={showNewDialog}
        setIsOpen={setShowNewDialog}
        loading={loading}
        deleteLoading={deleteLoading}
        formData={formData}
        programs={programs}
        coaches={coaches}
        onSave={handleSaveClass}
        onDelete={handleDeleteClass}
        onDateChange={handleDateChange}
        onProgramChange={handleProgramChange}
        onCoachChange={handleCoachChange}
        onTimeChange={handleTimeChange}
        onCapacityChange={handleCapacityChange}
      />
      
      {/* Edit Class Dialog */}
      <ClassFormDialog
        isNew={false}
        isOpen={showEditDialog}
        setIsOpen={setShowEditDialog}
        loading={loading}
        deleteLoading={deleteLoading}
        formData={formData}
        programs={programs}
        coaches={coaches}
        onSave={handleSaveClass}
        onDelete={handleDeleteClass}
        onDateChange={handleDateChange}
        onProgramChange={handleProgramChange}
        onCoachChange={handleCoachChange}
        onTimeChange={handleTimeChange}
        onCapacityChange={handleCapacityChange}
      />
    </div>
  );
};

export default ScheduleTab;
