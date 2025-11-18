import React from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";

interface StudentListItemProps {
  id: number;
  name: string;
  avatar: string;
  pendingQuests: number;
  coral: number;
  research_data: number;
  className?: string;
}

function StudentListItemInner({ 
  id, 
  name, 
  avatar, 
  pendingQuests, 
  coral, 
  research_data, 
  className = ""
}: StudentListItemProps) {
  return (
    <Card 
      className={`border-2 border-gray-300 rounded-lg cursor-default ${className}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="w-12 h-12 border-2 border-gray-300">
            <AvatarFallback className="bg-gray-200 text-black">
              {avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4>{name}</h4>
            {pendingQuests > 0 && (
              <Badge className="mt-1 bg-black text-white rounded-lg">
                승인 요청 {pendingQuests}건
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm border-t-2 border-gray-300 pt-3">
          <div className="flex justify-between">
            <span className="text-gray-600">코랄</span>
            <span>{coral}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">탐사데이터</span>
            <span>{research_data}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export const StudentListItem = React.memo(StudentListItemInner);
