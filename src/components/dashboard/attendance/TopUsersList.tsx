
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface TopUser {
  user_id: string;
  user_name: string;
  email: string;
  avatar_url: string | null;
  total_checkins: number;
  last_checkin_date: string;
}

interface TopUsersListProps {
  users: TopUser[];
  onViewHistory: (userId: string) => void;
}

const TopUsersList: React.FC<TopUsersListProps> = ({ users, onViewHistory }) => {
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Usuários - Check-ins</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.user_id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(user.user_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.user_name}</div>
                  <div className="text-sm text-muted-foreground">{user.total_checkins} check-ins</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewHistory(user.user_id)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Histórico
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopUsersList;
