import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, Settings, Users } from "lucide-react";
import { ClassCard } from "../common/ClassCard";
import { useAuth, TeacherUser } from '../../contexts/AppContext';
import { get } from '../../utils/api';

interface ClassSummary {
  class_id: number | string;
  class_name: string;
  student_count: number;
  waiting_quest_count: number;
}

export function TeacherDashboardNew() {
  const navigate = useNavigate();

  const { user, isAuthenticated, userType } = useAuth();
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    //로그인 여부 확인
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    if (userType !== 'teacher') {
      setIsLoading(false);
      setError("교사 전용 페이지입니다.");
      return;
    }

    // 반 목록을 불러오는 비동기 함수
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        // api.ts의 get 함수 사용 - 자동으로 Authorization 헤더에 Bearer token 추가
        const response = await get('/api/v1/classes');

        if (!response.ok) {
          throw new Error('반 목록을 불러오는 데 실패했습니다.');
        }


        const data = await response.json();

        console.log(data);

        setClasses(data.data.classes || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("알 수 없는 에러가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [isAuthenticated, user, userType]);

  // 인증 가드 및 로딩/에러 상태에 따른 UI 분기 처리
  if (!isAuthenticated || !user) {
    return <div className="p-6">로딩중...</div>;
  }

  if (userType !== 'teacher') {
    return <div className="p-6 text-red-600">접근 권한이 없습니다.</div>;
  }

  const currentUser = user as TeacherUser;

  if (isLoading) {
    return <div className="p-6">반 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">오류: {error}</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="border-b-2 border-gray-300 p-6">
        <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
          <div>
            <h1>대시보드</h1>
            <p className="text-gray-600 mt-1">{currentUser.real_name} 선생님</p>
          </div>
          <Button
            variant="outline"
            className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
            onClick={() => navigate('/teacher/profile')}
          >
            <Settings className="w-4 h-4 mr-2" />
            회원정보 수정
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2>반 목록</h2>
          <Button
            className="bg-black hover:bg-gray-800 text-white rounded-lg"
            onClick={() => navigate('/teacher/class/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            반 생성하기
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {classes.length > 0 ? (
            classes.map((classItem) => (
              <ClassCard
                key={classItem.class_id}
                class_id={Number(classItem.class_id)}
                class_name={classItem.class_name}
                student_count={classItem.student_count}
                waiting_quest_count={classItem.waiting_quest_count}
                // 반 관리 페이지로 이동
                onClick={() => navigate('/teacher/class', { state: { classId: Number(classItem.class_id) } })}
              />
            ))
          ) : (
            // API에서 받아온 반 목록이 비어있을 경우 메시지를 표시
            <p>생성된 반이 없습니다. '반 생성하기' 버튼을 눌러 새 반을 만들어주세요.</p>
          )}
        </div>
      </div>
    </>
  );
}