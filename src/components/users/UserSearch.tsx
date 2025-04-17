
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserSearchProps {
  searchTerm: string;
  onSearch: (value: string) => void;
}

const UserSearch = ({ searchTerm, onSearch }: UserSearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Buscar usuários..."
        className="pl-10 w-full"
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

export default UserSearch;
