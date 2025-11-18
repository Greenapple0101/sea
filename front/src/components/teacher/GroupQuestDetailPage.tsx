import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Sidebar } from "./Sidebar";
import { ArrowLeft, CheckCircle, X, Users, Award, Calendar, Target } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

export function GroupQuestDetailPage() {
  const { id } = useParams();
  const questId = Number(id);
  const [questInfo] = useState({
    id: questId,
    title: "출석 체크",
    description: "모든 학생이 수업시간 전까지 폰 10개를 제출해야 보상 지급",
    type: "단체 보상형",
    reward: "산호 30개",
    deadline: "2025-01-31",
    participants: 15,
    completed: 12,
    completionCondition: {
      totalStudents: 15,
      requiredStudents: 12
    }
  });

  const [students, setStudents] = useState([
    { id: 1, name: "김학생", class: "중등 1반", status: "완료", phoneSubmitted: true, approved: true },
    { id: 2, name: "이학생", class: "중등 1반", status: "완료", phoneSubmitted: true, approved: true },
    { id: 3, name: "박학생", class: "중등 1반", status: "완료", phoneSubmitted: true, approved: true },
    { id: 4, name: "최학생", class: "중등 1반", status: "완료", phoneSubmitted: false, approved: false },
    { id: 5, name: "정학생", class: "중등 1반", status: "완료", phoneSubmitted: true, approved: true },
    { id: 6, name: "한학생", class: "중등 1반", status: "미완료", phoneSubmitted: false, approved: false },
    { id: 7, name: "윤학생", class: "중등 1반", status: "완료", phoneSubmitted: true, approved: true },
    { id: 8, name: "서학생", class: "중등 1반", status: "완료", phoneSubmitted: false, approved: false },
    { id: 9, name: "조학생", class: "중등 1반", status: "완료", phoneSubmitted: true, approved: true },
    { id: 10, name: "임학생", class: "중등 1반", status: "미완료", phoneSubmitted: false, approved: false },
  ]);

  const handleApprove = (studentId: number) => {
    const updatedStudents = students.map(student => 
      student.id === studentId 
        ? { ...student, approved: true, phoneSubmitted: true }
        : student
    );
    setStudents(updatedStudents);
    
    // 완료 조건 확인
    const completedCount = updatedStudents.filter(s => s.status === "완료" && s.approved).length;
    const canComplete = completedCount >= questInfo.completionCondition.requiredStudents;
    
    if (canComplete) {
      alert(`🎉 완료 조건을 만족했습니다! (${completedCount}/${questInfo.completionCondition.requiredStudents}명) 단체 보상이 지급됩니다!`);
    } else {
      alert(`${students.find(s => s.id === studentId)?.name} 학생이 확인되었습니다!\n현재 완료: ${completedCount}/${questInfo.completionCondition.requiredStudents}명`);
    }
  };

  const canCompleteQuest = () => {
    const completedCount = students.filter(s => s.status === "완료" && s.approved).length;
    return completedCount >= questInfo.completionCondition.requiredStudents;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "완료": return "bg-green-100 text-green-800 border-green-200";
      case "미완료": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getApprovalColor = (approved: boolean) => {
    return approved 
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로가기
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-black">{questInfo.title} - 달성률 체크</h1>
              <p className="text-gray-600 mt-1">{questInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* 퀘스트 정보 */}
          <Card className="border-2 border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Target className="w-5 h-5" />
                퀘스트 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span className="text-gray-600">보상:</span>
                    <span className="text-black font-medium">{questInfo.reward}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">마감:</span>
                    <span className="text-black">{questInfo.deadline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600">참여:</span>
                    <span className="text-black font-medium">{questInfo.completed}/{questInfo.participants}명</span>
                  </div>
                </div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">완료 조건</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {questInfo.completionCondition.requiredStudents}명 이상 완료 시 보상 지급
                    {canCompleteQuest() && (
                      <span className="text-green-600 font-medium ml-2">✓ 조건 달성</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 제목 */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-black">학생 달성률 체크</h2>
          </div>

          {/* 학생 목록 */}
          <div className="space-y-3">
            {students.map((student) => (
              <Card key={student.id} className="border-2 border-gray-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium text-black">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.class}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {!student.approved && (
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                          onClick={() => handleApprove(student.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          확인
                        </Button>
                      )}
                      
                      {student.approved && (
                        <Badge className="bg-blue-100 text-blue-800">
                          확인됨
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 요약 정보 */}
          <Card className="border-2 border-gray-300 bg-gray-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-black">
                    {students.filter(s => s.status === "완료").length}
                  </div>
                  <div className="text-sm text-gray-600">완료한 학생</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-black">
                    {students.filter(s => s.approved).length}
                  </div>
                  <div className="text-sm text-gray-600">확인된 학생</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-black">
                    {students.filter(s => s.status === "완료" && !s.approved).length}
                  </div>
                  <div className="text-sm text-gray-600">확인 대기</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {students.filter(s => s.status === "완료" && !s.phoneSubmitted).length}
                  </div>
                  <div className="text-sm text-gray-600">폰 미제출</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
