
import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="border rounded-md flex overflow-hidden w-full sm:w-auto">
      <Button 
        variant={viewMode === "grid" ? "secondary" : "ghost"}
        size="sm"
        className="rounded-none flex-1"
        onClick={() => setViewMode("grid")}
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        Grade
      </Button>
      <Button 
        variant={viewMode === "list" ? "secondary" : "ghost"}
        size="sm"
        className="rounded-none flex-1"
        onClick={() => setViewMode("list")}
      >
        <List className="h-4 w-4 mr-2" />
        Lista
      </Button>
    </div>
  );
};

export default ViewToggle;
