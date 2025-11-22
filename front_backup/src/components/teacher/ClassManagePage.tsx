import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus, Users, Copy, Check, Sword, Trophy, Loader2 } from "lucide-react";
import { Progress } from "../ui/progress";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SectionCard } from "../common/SectionCard";
import { useAuth } from "../../contexts/AppContext";
import { get } from "../../utils/api";

interface ApiQuestProgress {
  completed: number;
  required: number;
}

interface ApiGroupQuest {
  quest_id: number;
  title: string;
  progress: ApiQuestProgress;
}

interface ApiBossHp {
  current: number;
  total: number;
  percentage: number;
}

interface ApiRaid {
  raid_id: number;
  title: string;
  boss_hp: ApiBossHp;
  participants: number;
  end_date: string;
}

interface ApiClassDetails {
  class_id: number;
  class_name: string;
  ongoing_group_quests: ApiGroupQuest[];
  ongoing_raid: ApiRaid | null;
  invite_code: string; // 반 api에도 invite_code 필요
}

// 남은 일수 계산 헬퍼 함수
function calculateDaysLeft(endDateString: string): number {
  if (!endDateString) return 0;
  try {
    const end = new Date(endDateString);
    const now = new Date();
    // 남은 시간이 0 미만이면 0을 반환
    const diffTime = Math.max(end.getTime() - now.getTime(), 0);
    // 남은 일수를 올림하여 계산
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (e) {
    return 0;
  }
}

export function ClassManagePage() {
  const navigate = useNavigate();
  const { currentClassId, access_token } = useAuth();

  const [classDetails, setClassDetails] = useState<ApiClassDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRaidModalOpen, setIsRaidModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {

    if (!currentClassId || !access_token) {
      setError("반 정보를 불러올 수 없습니다. (인증 오류)");
      setIsLoading(false);
      return;
    }


    const fetchClassData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // API 명세서에 맞는 엔드포인트로 변경
        const response = await get(`/api/v1/classes/${currentClassId}`);

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "데이터를 불러오는 데 실패했습니다.");
        }
        const data = await response.json();
        if (data.success) {
          setClassDetails(data.data);
        } else {
          throw new Error(data.message || "데이터 포맷 오류");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassData();
  }, [currentClassId, access_token]);

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        반 정보를 불러오는 중...
      </div>
    );
  }

  if (error) {
    return <div className="flex-1 p-6 text-red-600">오류: {error}</div>;
  }

  if (!classDetails) {
    return <div className="flex-1 p-6">반 정보를 찾을 수 없습니다.</div>;
  }

  // classDetails에서 데이터 추출
  const { class_name, ongoing_group_quests=[], ongoing_raid, invite_code } = classDetails;

  // 레이드 상세 모달용 변수
  const activeRaid = ongoing_raid;
  const daysLeft = activeRaid ? calculateDaysLeft(activeRaid.end_date) : 0;

  const handleCopyCode = () => {
    if (!invite_code || isCopied) return;

    navigator.clipboard.writeText(invite_code)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch(err => {
        console.error('클립보드 복사 실패:', err);
        alert('복사에 실패했습니다.');
      });
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <h1>{class_name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">초대 코드:</span>
              <code className="px-2 py-1 border-2 border-gray-300 bg-gray-100">
                {invite_code}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="border border-gray-300 hover:bg-gray-100"
                onClick={handleCopyCode}
                disabled={isCopied}
              >
                {isCopied ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Quick Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              variant="outline"
              onClick={() => navigate('/teacher/students')}
            >
              <Users className="w-4 h-4 mr-2" />
              학생 목록 조회
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              onClick={() => navigate('/teacher/class/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              반 생성하기
            </Button>
            <Button 
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              variant="outline"
              onClick={() => navigate('/teacher/quest')}
            >
              <Plus className="w-4 h-4 mr-2" />
              퀘스트 등록
            </Button>
            <Button 
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              variant="outline"
              onClick={() => navigate('/teacher/raid/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              레이드 등록
            </Button>
          </div>

          {/* Active Quests */}
          <SectionCard
            title="현재 진행 중인 단체 퀘스트"
            headerAction={
              <button
                className="bg-black text-white px-4 py-2 rounded-lg border-2 border-black font-semibold"
                onClick={() => navigate('/teacher/quest/group/manage')}
                style={{ backgroundColor: '#000000', color: 'white' }}
              >
                단체 퀘스트 관리
              </button>
            }
          >
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {ongoing_group_quests.length > 0 ? (
                ongoing_group_quests.map((quest) => (
                  <Card
                    key={quest.quest_id}
                    className="border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4>{quest.title}</h4>
                        <Badge variant="outline" className="border-2 border-gray-300 rounded-lg">
                          {quest.progress.completed}/{quest.progress.required}
                        </Badge>
                      </div>
                      <Progress
                        value={(quest.progress.completed / quest.progress.required) * 100}
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">진행 중인 단체 퀘스트가 없습니다.</p>
              )}
            </div>
          </SectionCard>

          {/* Active Raid */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardContent className="p-4">
              <h3 className="mb-4">현재 진행 중인 레이드</h3>
              {activeRaid ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4>{activeRaid.title}</h4>
                    <Badge variant="outline" className="border-2 border-gray-300 rounded-lg">
                      {daysLeft}일 남음
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">보스 HP</span>
                      <span>{activeRaid.boss_hp.percentage}%</span>
                    </div>
                    <div className="border-2 border-gray-300 h-6 overflow-hidden">
                      <div
                        className="h-full bg-black"
                        style={{ width: `${activeRaid.boss_hp.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm border-t-2 border-gray-300 pt-3">
                    <span className="text-gray-600">참여자</span>
                    <span>{activeRaid.participants}명</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                      onClick={() => setIsRaidModalOpen(true)}
                    >
                      상세 보기
                    </Button>
                    <Button
                      className="flex-1 bg-black text-white hover:bg-gray-800 rounded-lg"
                    >
                      레이드 종료
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p>진행 중인 레이드가 없습니다</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                    onClick={() => navigate('/teacher/raid/create')}
                  >
                    레이드 시작하기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 레이드 상세 모달 */}
      {activeRaid && (
        <Dialog open={isRaidModalOpen} onOpenChange={setIsRaidModalOpen}>
          <DialogContent className="max-w-2xl bg-white border-2 border-gray-300">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-black">
                <Sword className="w-5 h-5 text-black" />
                {activeRaid.title} 상세 정보
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* 레이드 상태 */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-2 border-gray-300 rounded-lg bg-white text-black">
                  {daysLeft}일 남음
                </Badge>
                <span className="text-sm text-gray-600">현재 진행 중</span>
              </div>

              {/* 보스 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black">보스 정보</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-black">보스 HP</span>
                      <span className="text-black font-semibold">{activeRaid.boss_hp.percentage}%</span>
                    </div>
                    <div className="border-2 border-gray-300 h-6 overflow-hidden rounded bg-gray-200">
                      <div
                        className="h-full bg-black transition-all duration-300"
                        style={{ width: `${activeRaid.boss_hp.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 참여자 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black">참여 현황</h3>
                <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                  <Users className="w-5 h-5 text-black" />
                  <span className="text-lg font-semibold text-black">
                    {activeRaid.participants}명 참여
                  </span>
                </div>
              </div>

              {/* 레이드 통계 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black">레이드 통계</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-100 rounded-lg text-center border-2 border-gray-300">
                    <div className="text-2xl font-bold text-black">{activeRaid.boss_hp.percentage}%</div>
                    <div className="text-sm text-gray-600">남은 HP</div>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg text-center border-2 border-gray-300">
                    <div className="text-2xl font-bold text-black">{daysLeft}일</div>
                    <div className="text-sm text-gray-600">남은 시간</div>
                  </div>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex gap-2 pt-4 border-t-2 border-gray-300">
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 rounded-lg bg-white text-black hover:bg-gray-100"
                  onClick={() => setIsRaidModalOpen(false)}
                >
                  닫기
                </Button>
                <Button
                  className="flex-1 bg-black hover:bg-gray-800 text-white rounded-lg"
                >
                  레이드 종료
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}