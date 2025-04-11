
import React from "react";
import { Attendee } from "../types";
import Avatar from "./Avatar";

interface AttendeeListProps {
  attendees: Attendee[];
}

const AttendeeList: React.FC<AttendeeListProps> = ({ attendees }) => {
  if (!attendees.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum aluno confirmado ainda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {attendees.map((attendee) => (
        <div
          key={attendee.id}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
        >
          <Avatar
            url={attendee.avatarUrl}
            name={attendee.name}
            size={32}
          />
          <span className="font-medium">{attendee.name}</span>
        </div>
      ))}
    </div>
  );
};

export default AttendeeList;
