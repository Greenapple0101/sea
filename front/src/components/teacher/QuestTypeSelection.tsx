import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Sidebar } from "./Sidebar";
import { Users, User, Plus } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function QuestTypeSelection() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'individual') {
      navigate('/teacher/quest/individual', { replace: true });
    } else if (tab === 'group') {
      navigate('/teacher/quest/group', { replace: true });
    }
  }, [location.search, navigate]);
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-black">퀘스트 등록</h1>
              <p className="text-gray-600 mt-1">퀘스트 유형을 선택해주세요</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 개인 퀘스트 */}
            <Card className="border-2 border-gray-300 hover:border-gray-500 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <User className="w-5 h-5" />
                  개인 퀘스트
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  특정 학생에게만 할당되는 개별 퀘스트입니다.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 개별 학생 선택 가능</li>
                  <li>• 맞춤형 퀘스트 내용</li>
                  <li>• 개별 진행률 관리</li>
                  <li>• 개별 보상 지급</li>
                </ul>
                <Button 
                  className="w-full bg-black hover:bg-gray-800 text-white rounded-lg border-2 border-gray-300"
                  onClick={() => navigate('/teacher/quest/individual')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  개인 퀘스트 등록
                </Button>
              </CardContent>
            </Card>

            {/* 단체 퀘스트 */}
            <Card className="border-2 border-gray-300 hover:border-gray-500 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Users className="w-5 h-5" />
                  단체 퀘스트
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  반 전체 학생에게 할당되는 공통 퀘스트입니다.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 반 전체 자동 할당</li>
                  <li>• 템플릿 기반 생성</li>
                  <li>• 일괄 달성률 관리</li>
                  <li>• 자동 보상 지급</li>
                </ul>
                <Button 
                  className="w-full bg-black hover:bg-gray-800 text-white rounded-lg border-2 border-gray-300"
                  onClick={() => navigate('/teacher/quest/group')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  단체 퀘스트 등록
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 안내사항 */}
          <Card className="mt-6 bg-gray-50 border-2 border-gray-300">
            <CardContent className="p-4">
              <h3 className="font-semibold text-black mb-2">퀘스트 유형 안내</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium mb-1 text-black">개인 퀘스트</h4>
                  <p>특정 학생의 학습 상황에 맞춘 맞춤형 퀘스트</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-black">단체 퀘스트</h4>
                  <p>반 전체의 학습 목표 달성을 위한 공통 퀘스트</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
