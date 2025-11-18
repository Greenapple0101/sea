import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useAuth, StudentUser } from "../../contexts/AppContext";

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: string;
  type: 'contribution' | 'first' | 'last' | 'dice' | 'other';
}

interface ContributionData {
  totalContribution: number;
  rank: number;
  totalParticipants: number;
  weeklyContribution: number;
  achievements: Achievement[];
}

export function StudentProfile() {
  const { user, isAuthenticated, userType } = useAuth();

  const [showTitleLog, setShowTitleLog] = useState(false);
  const [showCollection, setShowCollection] = useState(false);

  // 예시 데이터
  const contributionData: ContributionData = {
    totalContribution: 1250,
    rank: 3,
    totalParticipants: 45,
    weeklyContribution: 280,
    achievements: [
      {
        id: '1',
        title: '첫 기여자',
        description: '레이드에 첫 번째로 기여한 사용자',
        earnedDate: '2024-03-10',
        type: 'first'
      },
      {
        id: '2',
        title: '주사위 행운아',
        description: '주사위에서 6이 나온 사용자',
        earnedDate: '2024-03-12',
        type: 'dice'
      },
      {
        id: '3',
        title: '열심히 공부하는 학생',
        description: '일주일 동안 매일 퀘스트 완료',
        earnedDate: '2024-03-15',
        type: 'other'
      }
    ]
  };

  const questCompletionRate = 85; // 85% 완료율

  const getBadgeByType = (type: Achievement['type']) => {
    switch (type) {
      case 'contribution':
        return <Badge className="bg-gray-400">기여도</Badge>;
      case 'first':
        return <Badge className="bg-gray-400">선발대</Badge>;
      case 'last':
        return <Badge className="bg-gray-400">막차</Badge>;
      case 'dice':
        return <Badge className="bg-gray-400">행운</Badge>;
      default:
        return <Badge className="bg-gray-400">특별</Badge>;
    }
  };
  
  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-6">로딩중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">학생 전용 대시보드입니다.</div>;
  }

  const currentUser = user as StudentUser;

  return (
    <div className="p-4 space-y-4 bg-white min-h-screen pb-20">
      {/* 프로필 헤더 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {/* 대표 물고기 */}
            <div className="w-24 h-24 bg-gray-400 rounded-full mx-auto flex items-center justify-center">
              <span className="text-white">물고기</span>
            </div>

            {/* 사용자 정보 */}
            <div>
              <h2 className="text-xl font-medium text-black">{currentUser.real_name}</h2>
              <p className="text-gray-600">@{currentUser.username}</p>
              <p className="text-gray-600">{currentUser.invite_code}</p>
            </div>

            {/* 대표 칭호 */}
            <div>
              <Badge className="bg-black text-white">
                {contributionData.achievements[0]?.title || '새내기 학습자'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 스탯 정보 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-gray-600">현재 퀘스트 달성률</p>
          <p className="text-2xl font-medium text-black">{questCompletionRate}%</p>
        </CardContent>
      </Card>

      {/* 기여도 데이터 */}
      <Card className="border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="text-black">기여도 기록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border border-gray-200 rounded">
              <p className="text-sm text-gray-600">총 기여도</p>
              <p className="text-lg font-medium text-black">{contributionData.totalContribution.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 border border-gray-200 rounded">
              <p className="text-sm text-gray-600">현재 순위</p>
              <p className="text-lg font-medium text-black">
                {contributionData.rank}위 / {contributionData.totalParticipants}명
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">이번 주 기여도</span>
              <span className="text-black">{contributionData.weeklyContribution}</span>
            </div>
            <Progress value={(contributionData.weeklyContribution / 500) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* 칭호 로그 */}
      <Card className="border-2 border-gray-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-black">획득한 칭호</CardTitle>
          <Button
            onClick={() => setShowTitleLog(true)}
            className="bg-white text-black border border-gray-300 hover:bg-gray-100"
            size="sm"
          >
            전체 보기
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {contributionData.achievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                <div className="flex items-center space-x-2">
                  {getBadgeByType(achievement.type)}
                  <span className="text-black">{achievement.title}</span>
                </div>
                <span className="text-xs text-gray-500">{achievement.earnedDate}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼들 */}
      <div className="space-y-3">
        <Button
          onClick={() => setShowCollection(true)}
          className="w-full bg-white text-black border-2 border-gray-300 hover:bg-gray-100"
        >
          도감 보기
        </Button>

      </div>

      {/* 칭호 로그 모달 */}
      <Dialog open={showTitleLog} onOpenChange={setShowTitleLog}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">획득한 칭호 목록</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {contributionData.achievements.map((achievement) => (
              <div key={achievement.id} className="p-3 border border-gray-200 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getBadgeByType(achievement.type)}
                    <span className="font-medium text-black">{achievement.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">{achievement.earnedDate}</span>
                </div>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 도감 모달 (간단한 버전) */}
      <Dialog open={showCollection} onOpenChange={setShowCollection}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">내 물고기 컬렉션</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-gray-600">현재 수집한 물고기: 5종</p>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="w-16 h-16 bg-gray-400 rounded flex items-center justify-center">
                  <span className="text-white text-xs">물고기</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowCollection(false)}
              className="w-full bg-black text-white"
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}