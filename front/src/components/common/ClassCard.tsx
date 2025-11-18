import React from "react";
import { Card, CardContent } from "../ui/card";

interface ClassCardProps {
  class_id: number;
  class_name: string;
  student_count: number;
  waiting_quest_count: number;
  onClick?: (id: number) => void;
  className?: string;
}

function ClassCardInner({ 
  class_id, 
  class_name, 
  student_count, 
  waiting_quest_count, 
  onClick,
  className = ""
}: ClassCardProps) {
  return (
    <Card 
      className={`border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      onClick={() => onClick?.(class_id)}
    >
      <CardContent className="p-6">
        <h3 className="mb-4">{class_name}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between border-b border-gray-300 pb-2">
            <span className="text-gray-600">학생 수</span>
            <span className="font-medium">{student_count}명</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">승인 대기중인 퀘스트</span>
            <span className="font-medium">{waiting_quest_count}개</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const ClassCard = React.memo(ClassCardInner);
