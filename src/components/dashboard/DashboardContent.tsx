
import React from "react";
import { Loader2 } from "lucide-react";
import OverviewTab from "@/components/dashboard/OverviewTab";
import ScheduleTab from "@/components/dashboard/ScheduleTab";
import ProgramsTab from "@/components/dashboard/ProgramsTab";
import UsersTab from "@/components/dashboard/UsersTab";
import AttendanceTab from "@/components/dashboard/AttendanceTab";

interface DashboardContentProps {
  activeTab: string;
  loading: boolean;
  todayClasses: any[];
  scheduleClasses: any[];
  users: any[];
  attendance: any[];
  onEditUser: (user: any) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  activeTab,
  loading,
  todayClasses,
  scheduleClasses,
  users,
  attendance,
  onEditUser
}) => {
  return (
    <div className="p-4">
      {loading && activeTab !== "overview" && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}
      
      {activeTab === "overview" && (
        <OverviewTab classes={todayClasses} loading={loading} />
      )}
      
      {activeTab === "schedule" && !loading && (
        <ScheduleTab classes={scheduleClasses} />
      )}

      {activeTab === "programs" && (
        <ProgramsTab />
      )}
      
      {activeTab === "users" && !loading && (
        <UsersTab users={users} onEditUser={onEditUser} />
      )}
      
      {activeTab === "attendance" && !loading && (
        <AttendanceTab attendanceData={attendance} />
      )}
    </div>
  );
};

export default DashboardContent;
