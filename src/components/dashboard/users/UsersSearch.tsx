
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UsersSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const UsersSearch: React.FC<UsersSearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Buscar usuários..."
        className="pl-10 w-full"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default UsersSearch;
