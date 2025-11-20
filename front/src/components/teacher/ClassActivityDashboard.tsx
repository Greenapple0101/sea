import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft, TrendingUp, Users, Award, Target } from "lucide-react";
import { get } from "../../utils/api";

interface WeeklySummary {
  submissions: number;
  approvalRate: number;
  raidAttacks: number;
  raidParticipants: number;
  totalCoralRewarded: number;
}

interface QuestActivityTrend {
  date: string;
  submissions: number;
  approvals: number;
}

interface TopStudent {
  studentId: number;
  studentName: string;
  submissionCount: number;
}

interface RaidParticipant {
  studentId: number;
  studentName: string;
  totalDamage: number;
  attackCount: number;
}

interface ClassDashboardData {
  className: string;
  weeklySummary: WeeklySummary;
  questActivityTrend: QuestActivityTrend[];
  topSubmitters: TopStudent[];
  raidParticipants: RaidParticipant[];
  coralRanking: Array<{
    studentId: number;
    studentName: string;
    totalCoral: number;
  }>;
  researchDataUsage: {
    totalUsed: number;
    averagePerStudent: number;
  };
}

export function ClassActivityDashboard() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<ClassDashboardData | null>(null);

  // 빈 데이터 기본값
  const getEmptyData = (): ClassDashboardData => {
    return {
      className: "반 정보 없음",
      weeklySummary: {
        submissions: 0,
        approvalRate: 0,
        raidAttacks: 0,
        raidParticipants: 0,
        totalCoralRewarded: 0
      },
      questActivityTrend: [],
      topSubmitters: [],
      raidParticipants: [],
      coralRanking: [],
      researchDataUsage: {
        totalUsed: 0,
        averagePerStudent: 0
      }
    };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!classId) {
        setError('반 ID가 없습니다.');
        setDashboardData(getEmptyData());
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await get(`/api/v1/classes/${classId}/dashboard`);
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.message ?? '대시보드 데이터를 불러오지 못했습니다.');
        }
        setDashboardData(json.data || getEmptyData());
      } catch (err: any) {
        console.error('대시보드 데이터 로드 실패:', err);
        setError(err.message ?? '대시보드 데이터를 불러오지 못했습니다.');
        setDashboardData(getEmptyData());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [classId]);

  if (loading) {
    return (
      <div className="p-6">
        <p>대시보드 데이터를 불러오는 중...</p>
      </div>
    );
  }

  // dashboardData가 없으면 빈 데이터 사용
  const displayData = dashboardData || getEmptyData();
  
  // 안전성 체크
  if (!displayData || !displayData.weeklySummary) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => navigate('/teacher/class')}
            className="border-2 border-gray-300 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <div className="space-y-2">
            <p className="text-red-600 font-semibold">데이터 구조가 올바르지 않습니다.</p>
            <p className="text-sm text-gray-600">{error || '대시보드 데이터를 불러올 수 없습니다.'}</p>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(displayData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">{displayData.className || '반 정보 없음'} 반 활동 대시보드</h1>
              <p className="text-sm text-gray-600 mt-1">
                반별 학습 활동 데이터 분석 및 통계
              </p>
              {error && (
                <p className="text-xs text-red-600 mt-1">⚠️ {error}</p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/teacher/class')}
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
          {/* 이번 주 요약 */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                이번 주 요약
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">퀘스트 제출</div>
                  <div className="text-2xl font-bold text-black">{(displayData.weeklySummary?.submissions ?? 0)}건</div>
                  <div className="text-xs text-gray-500 mt-1">승인율 {displayData.weeklySummary?.approvalRate ?? 0}%</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">레이드 공격</div>
                  <div className="text-2xl font-bold text-black">{(displayData.weeklySummary?.raidAttacks ?? 0)}회</div>
                  <div className="text-xs text-gray-500 mt-1">참여 {displayData.weeklySummary?.raidParticipants ?? 0}명</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">코랄 지급</div>
                  <div className="text-2xl font-bold text-black">{(displayData.weeklySummary?.totalCoralRewarded ?? 0).toLocaleString()}개</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">탐사데이터 사용</div>
                  <div className="text-2xl font-bold text-black">{(displayData.researchDataUsage?.totalUsed ?? 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">평균 {(displayData.researchDataUsage?.averagePerStudent ?? 0).toLocaleString()}/명</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 퀘스트 활동 추이 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-gray-300 rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  퀘스트 활동 추이 (최근 7일)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayData.questActivityTrend && displayData.questActivityTrend.length > 0 ? (
                    displayData.questActivityTrend.map((trend, idx) => {
                      const approvalRate = trend.submissions > 0 
                        ? Math.round((trend.approvals / trend.submissions) * 100) 
                        : 0;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{trend.date}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">제출: {trend.submissions}건</span>
                              <span className="text-sm text-green-600">승인: {trend.approvals}건</span>
                              <span className="text-xs text-gray-500">({approvalRate}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, (trend.submissions / 10) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">데이터가 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 제출 많이 한 학생 TOP 3 */}
            <Card className="border-2 border-gray-300 rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  제출 많이 한 학생 TOP 3
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayData.topSubmitters && displayData.topSubmitters.length > 0 ? (
                    displayData.topSubmitters.map((student, idx) => (
                      <div key={student.studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <span className="font-medium text-black">{student.studentName}</span>
                        </div>
                        <span className="text-sm text-gray-600">{student.submissionCount}건</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">데이터가 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 레이드 참여도 */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                레이드 참여도
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayData.raidParticipants && displayData.raidParticipants.length > 0 ? (
                  displayData.raidParticipants.slice(0, 5).map((participant, idx) => (
                    <div key={participant.studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium text-black">{participant.studentName}</div>
                          <div className="text-xs text-gray-500">공격 {participant.attackCount}회</div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-black">{participant.totalDamage.toLocaleString()} 데미지</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">레이드 참여 데이터가 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 코랄 지급 순위 */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                코랄 지급 순위
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {displayData.coralRanking && displayData.coralRanking.length > 0 ? (
                  displayData.coralRanking.map((student, idx) => (
                    <div key={student.studentId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 w-6">{idx + 1}위</span>
                        <span className="text-sm text-black">{student.studentName}</span>
                      </div>
                      <span className="text-sm font-semibold text-black">{student.totalCoral.toLocaleString()} 코랄</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">데이터가 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
    </>
  );
}

