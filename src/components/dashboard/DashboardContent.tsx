
import React from "react";
import OverviewTab from "./OverviewTab";
import ScheduleTab from "./ScheduleTab";
import UsersTab from "./UsersTab";
import AttendanceTab from "./AttendanceTab";
import ErrorDisplay from "./ErrorDisplay";
import { User } from "../../types";
import { Table } from "@/components/ui/table";
import Loading from "@/components/ui/loading";
import FinancialTab from "./FinancialTab";

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
  // Handle error display
  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {activeTab === "overview" && (
        <OverviewTab
          classes={todayClasses}
          loading={false}
        />
      )}

      {activeTab === "schedule" && <ScheduleTab classes={scheduleClasses} />}

      {activeTab === "users" && <UsersTab users={users} onEditUser={onEditUser} />}

      {activeTab === "attendance" && <AttendanceTab />}
      
      {activeTab === "financial" && <FinancialTab />}

      {activeTab !== "overview" &&
        activeTab !== "schedule" &&
        activeTab !== "users" &&
        activeTab !== "attendance" &&
        activeTab !== "financial" && (
          <ErrorDisplay title="Erro" message="Aba não encontrada" />
        )}
    </>
  );
};

export default DashboardContent;
