import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth, StudentUser } from '../../contexts/AppContext';

interface QuestDetailPageProps {
  quest: {
    id: number;
    title: string;
    description: string;
    completed: number;
    total: number;
    incompleteStudents: string[];
  };
  onBack: () => void;
}

export function QuestDetailPage({ quest, onBack }: QuestDetailPageProps) {
  const { user, isAuthenticated, userType } = useAuth();

  // 완료한 학생 목록 (실제로는 API에서 가져와야 함)
  const completedStudents = [
    { name: '김학생', completedAt: '2024-01-15 14:30', status: '완료' },
    { name: '이학생', completedAt: '2024-01-15 15:20', status: '완료' },
    { name: '박학생', completedAt: '2024-01-15 16:10', status: '완료' },
    { name: '최학생', completedAt: '2024-01-15 17:00', status: '완료' },
    { name: '정학생', completedAt: '2024-01-15 18:30', status: '완료' },
    { name: '한학생', completedAt: '2024-01-15 19:15', status: '완료' },
    { name: '서학생', completedAt: '2024-01-15 20:00', status: '완료' },
    { name: '윤학생', completedAt: '2024-01-15 21:30', status: '완료' },
    { name: '임학생', completedAt: '2024-01-15 22:15', status: '완료' },
    { name: '조학생', completedAt: '2024-01-15 23:00', status: '완료' },
    { name: '강학생', completedAt: '2024-01-16 09:30', status: '완료' },
    { name: '송학생', completedAt: '2024-01-16 10:20', status: '완료' }
  ];

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-6">로딩중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">학생 전용 상세 페이지입니다.</div>;
  }

  const currentUser = user as StudentUser;

  // 본인 확인 여부 (실제로는 사용자 데이터에서 가져와야 함)
  const myStatus = completedStudents.find(student => student.name === currentUser.real_name) ? '완료' : '미완료';

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-2 border-gray-300"
        >
          ← 뒤로가기
        </Button>
        <h1 className="text-xl font-bold text-black">퀘스트 상세</h1>
        <div></div>
      </div>

      {/* 퀘스트 정보 */}
      <Card className="border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="text-black">{quest.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{quest.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">진행률:</span>
              <span className="font-semibold text-black">{quest.completed}/{quest.total}명</span>
            </div>
            <Badge className="bg-gray-100 text-black border-gray-300">
              {Math.round((quest.completed / quest.total) * 100)}% 완료
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 본인 상태 */}
      <Card className="border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="text-black">내 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">M</span>
              </div>
              <div>
                <p className="font-medium text-black">{currentUser.real_name}</p>
                <p className="text-sm text-gray-600">@{currentUser.real_name}</p>
              </div>
            </div>
            <Badge className={myStatus === '완료' ? 'bg-black text-white border-black' : 'bg-gray-100 text-black border-gray-300'}>
              {myStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 완료한 학생 목록 */}
      <Card className="border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="text-black">완료한 학생 ({quest.completed}명)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {completedStudents.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">S</span>
                  </div>
                  <div>
                    <p className="font-medium text-black">{student.name}</p>
                    <p className="text-xs text-gray-600">{student.completedAt}</p>
                  </div>
                </div>
                <Badge className="bg-black text-white border-black">
                  {student.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 미완료 학생 목록 */}
      {quest.incompleteStudents.length > 0 && (
        <Card className="border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="text-black">미완료 학생 ({quest.incompleteStudents.length}명)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quest.incompleteStudents.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">S</span>
                    </div>
                    <div>
                      <p className="font-medium text-black">{student}</p>
                      <p className="text-xs text-gray-600">미완료</p>
                    </div>
                  </div>
                  <Badge className="bg-gray-100 text-black border-gray-300">
                    미완료
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
