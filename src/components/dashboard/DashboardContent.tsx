
import React from "react";
import { Loader2 } from "lucide-react";
import OverviewTab from "./OverviewTab";
import ScheduleTab from "./ScheduleTab";
import ProgramsTab from "./ProgramsTab";
import UsersTab from "./UsersTab";
import AttendanceTab from "./AttendanceTab";
import { User } from "@/types";

interface DashboardContentProps {
  activeTab: string;
  loading: boolean;
  todayClasses: any[];
  scheduleClasses: any[];
  users: User[];
  attendance: any[];
  onEditUser: (user: User) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  activeTab,
  loading,
  todayClasses,
  scheduleClasses,
  users,
  attendance,
  onEditUser,
}) => {
  if (loading && activeTab !== "overview") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  switch (activeTab) {
    case "overview":
      return <OverviewTab classes={todayClasses} loading={loading} />;
    case "schedule":
      return <ScheduleTab classes={scheduleClasses} />;
    case "programs":
      return <ProgramsTab />;
    case "users":
      return <UsersTab users={users} onEditUser={onEditUser} />;
    case "attendance":
      return <AttendanceTab attendanceData={attendance} />;
    default:
      return null;
  }
};

export default DashboardContent;
