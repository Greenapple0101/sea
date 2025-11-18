import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus, Users, Copy, Sword, BarChart3 } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Progress } from "../ui/progress";
import { SectionCard } from "../common/SectionCard";
import { get, post } from "../../utils/api";

interface ClassSummaryOption {
  id: number;
  name: string;
}

interface QuestProgress {
  completed: number;
  required: number;
}

interface OngoingQuest {
  questId: number;
  title: string;
  progress: QuestProgress;
}

interface BossHpInfo {
  current: number;
  total: number;
  percentage: number;
}

interface OngoingRaid {
  raidId: number;
  title: string;
  bossHp: BossHpInfo;
  participants: number;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'TERMINATED';
}

interface ClassDetail {
  classId: number;
  className: string;
  inviteCode: string;
  ongoingGroupQuests: OngoingQuest[];
  ongoingRaid: OngoingRaid | null;
}

export function ClassManagePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { classId?: number } | null;

  const [isRaidModalOpen, setIsRaidModalOpen] = useState(false);
  const [classListLoading, setClassListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(locationState?.classId ?? null);
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [raidActionMessage, setRaidActionMessage] = useState<string | null>(null);
  const [isTerminating, setIsTerminating] = useState(false);

  const activeQuests = classDetail?.ongoingGroupQuests ?? [];
  const activeRaid = classDetail?.ongoingRaid ?? null;
  const isActiveRaid = activeRaid?.status === 'ACTIVE';

  useEffect(() => {
    // location.state에서 classId를 받지 못했으면 첫 번째 반 가져오기
    if (!selectedClassId) {
      const fetchFirstClass = async () => {
        setClassListLoading(true);
        try {
          const response = await get('/api/v1/classes');
          const json = await response.json();
          if (response.ok && json.data?.classes?.length > 0) {
            const firstClass = json.data.classes[0];
            setSelectedClassId(firstClass.class_id ?? firstClass.classId);
          }
        } catch (err: any) {
          setError(err.message ?? '반 정보를 불러오지 못했습니다.');
        } finally {
          setClassListLoading(false);
        }
      };
      fetchFirstClass();
    } else {
      setClassListLoading(false);
    }
  }, []);

  const loadClassDetail = useCallback(async (classId: number) => {
    setDetailLoading(true);
    setError(null);
    try {
      const response = await get(`/api/v1/classes/${classId}`);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.message ?? '반 상세 정보를 불러오지 못했습니다.');
      }
      setClassDetail(json.data);
    } catch (err: any) {
      setError(err.message ?? '반 상세 정보를 불러오지 못했습니다.');
      setClassDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadClassDetail(selectedClassId);
    } else {
      setClassDetail(null);
    }
  }, [selectedClassId, loadClassDetail]);

  const handleCopyCode = () => {
    if (!classDetail?.inviteCode) return;
    navigator.clipboard.writeText(classDetail.inviteCode)
      .then(() => alert('초대 코드가 복사되었습니다!'))
      .catch(() => alert('복사에 실패했습니다.'));
  };

  const handleTerminateRaid = async () => {
    if (!activeRaid) return;
    const terminatedRaidId = activeRaid.raidId;
    setIsTerminating(true);
    setRaidActionMessage(null);
    try {
      const response = await post(`/api/v1/raids/${activeRaid.raidId}/terminate`);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.message ?? '레이드 종료에 실패했습니다.');
      }
      setRaidActionMessage('레이드를 종료했습니다.');
      if (selectedClassId) {
        loadClassDetail(selectedClassId);
      }
      navigate('/teacher/raid/manage', {
        state: {
          initialFilter: 'ENDED',
          focusRaidId: terminatedRaidId
        }
      });
    } catch (err: any) {
      setRaidActionMessage(err.message ?? '레이드 종료에 실패했습니다.');
    } finally {
      setIsTerminating(false);
    }
  };

  const handleRefresh = () => {
    if (selectedClassId) {
      loadClassDetail(selectedClassId);
    }
  };

  const daysLeftLabel = useMemo(() => {
    if (!activeRaid?.endDate) return null;
    const now = new Date();
    const end = new Date(activeRaid.endDate);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) {
      return '마감됨';
    }
    return `${diff}일 남음`;
  }, [activeRaid?.endDate]);

  const raidHpPercentage = activeRaid
    ? activeRaid.bossHp?.percentage ?? (
      activeRaid.bossHp?.total
        ? Math.min(100, Math.round((activeRaid.bossHp.current / activeRaid.bossHp.total) * 100))
        : 0
    )
    : 0;

  const raidHpLabel = activeRaid
    ? `${activeRaid.bossHp?.current?.toLocaleString() ?? 0} / ${activeRaid.bossHp?.total?.toLocaleString() ?? 0}`
    : "";

  const isInitialLoading = classListLoading && !classDetail;

  const endDateLabel = useMemo(() => {
    if (!activeRaid?.endDate) {
      return null;
    }
    const date = new Date(activeRaid.endDate);
    return isNaN(date.getTime()) ? null : date.toLocaleString();
  }, [activeRaid?.endDate]);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-white flex">
        <Sidebar />
        <div className="flex-1 border-l-2 border-gray-300 p-6">
          데이터를 불러오는 중입니다...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1>{classDetail?.className ?? '반을 선택하세요'}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {detailLoading
                  ? '반 정보를 불러오는 중입니다...'
                  : classDetail
                  ? '반 관리와 레이드 진행 상황을 확인하세요.'
                  : '좌측 셀렉트 박스에서 반을 선택해주세요.'}
              </p>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                onClick={handleRefresh}
                disabled={!selectedClassId || detailLoading}
              >
                {detailLoading ? '새로고침 중...' : '정보 새로고침'}
              </Button>
            </div>
          </div>

          {classDetail?.inviteCode && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">초대 코드:</span>
              <code className="px-2 py-1 border-2 border-gray-300 bg-gray-100">
                {classDetail.inviteCode}
              </code>
              <Button 
                variant="ghost" 
                size="sm"
                className="border border-gray-300 hover:bg-gray-100"
                onClick={handleCopyCode}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="px-6 pt-4 text-sm text-red-600">{error}</div>
        )}

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
            <Button 
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              variant="outline"
              onClick={() => {
                if (selectedClassId) {
                  navigate(`/teacher/class/${selectedClassId}/dashboard`);
                } else {
                  alert('반을 먼저 선택해주세요.');
                }
              }}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              반 대시보드
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
            {detailLoading ? (
              <p className="text-sm text-gray-500">퀘스트 정보를 불러오는 중입니다...</p>
            ) : activeQuests.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activeQuests.map((quest) => {
                  const completed = quest.progress?.completed ?? 0;
                  const required = quest.progress?.required ?? 0;
                  const percentage = required > 0 ? (completed / required) * 100 : 0;
                  return (
                    <Card 
                      key={quest.questId} 
                      className="border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4>{quest.title}</h4>
                          <Badge variant="outline" className="border-2 border-gray-300 rounded-lg">
                            {completed}/{required}
                          </Badge>
                        </div>
                        <Progress 
                          value={percentage} 
                          className="h-2"
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">진행 중인 단체 퀘스트가 없습니다.</p>
            )}
          </SectionCard>

          {/* Active Raid */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3>현재 진행 중인 레이드</h3>
                {raidActionMessage && (
                  <span className="text-xs text-gray-600">{raidActionMessage}</span>
                )}
              </div>
              {detailLoading ? (
                <p className="text-sm text-gray-500">레이드 정보를 불러오는 중입니다...</p>
              ) : activeRaid && isActiveRaid ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4>{activeRaid.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        종료일: {endDateLabel ?? '정보 없음'}
                      </p>
                    </div>
                    {daysLeftLabel && (
                      <Badge variant="outline" className="border-2 border-gray-300 rounded-lg">
                        {daysLeftLabel}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">보스 HP</span>
                      <span>{raidHpLabel}</span>
                    </div>
                    <Progress value={raidHpPercentage} className="h-2" />
                  </div>
                  <div className="flex justify-between text-sm border-t-2 border-gray-300 pt-3">
                    <span className="text-gray-600">참여자</span>
                    <span>{activeRaid.participants ?? 0}명</span>
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
                      onClick={handleTerminateRaid}
                      disabled={isTerminating}
                    >
                      {isTerminating ? '종료 중...' : '레이드 종료'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p>진행 중인 레이드가 없습니다.</p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button 
                      variant="outline"
                      className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                      onClick={() => navigate('/teacher/raid/create')}
                    >
                      새 레이드 시작
                    </Button>
                    <Button
                      className="bg-black text-white hover:bg-gray-800 rounded-lg"
                      onClick={() => navigate('/teacher/raid/manage', { state: { initialFilter: 'ENDED' } })}
                    >
                      마감된 레이드 보기
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 레이드 상세 모달 */}
      <Dialog open={isRaidModalOpen} onOpenChange={setIsRaidModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-2 border-gray-300">
          {activeRaid ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-black">
                  <Sword className="w-5 h-5 text-black" />
                  {activeRaid.title} 상세 정보
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* 레이드 상태 */}
                <div className="flex items-center gap-2">
                  {daysLeftLabel && (
                    <Badge variant="outline" className="border-2 border-gray-300 rounded-lg bg-white text-black">
                      {daysLeftLabel}
                    </Badge>
                  )}
                  <span className="text-sm text-gray-600">현재 진행 중</span>
                </div>

                {/* 보스 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">보스 정보</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-black">보스 HP</span>
                        <span className="text-black font-semibold">{raidHpLabel}</span>
                      </div>
                      <div className="border-2 border-gray-300 h-6 overflow-hidden rounded bg-gray-200">
                        <div 
                          className="h-full bg-black transition-all duration-300"
                          style={{ width: `${raidHpPercentage}%` }}
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
                      {activeRaid.participants ?? 0}명 참여
                    </span>
                  </div>
                </div>

                {/* 레이드 통계 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">레이드 통계</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-100 rounded-lg text-center border-2 border-gray-300">
                      <div className="text-2xl font-bold text-black">{raidHpPercentage}%</div>
                      <div className="text-sm text-gray-600">남은 HP%</div>
                    </div>
                    {daysLeftLabel && (
                      <div className="p-4 bg-gray-100 rounded-lg text-center border-2 border-gray-300">
                        <div className="text-2xl font-bold text-black">{daysLeftLabel}</div>
                        <div className="text-sm text-gray-600">남은 시간</div>
                      </div>
                    )}
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
                    onClick={() => {
                      setIsRaidModalOpen(false);
                      handleTerminateRaid();
                    }}
                    disabled={isTerminating}
                  >
                    {isTerminating ? '종료 중...' : '레이드 종료'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-sm text-gray-600">
              진행 중인 레이드가 없습니다.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}