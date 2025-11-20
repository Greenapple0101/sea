import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useAuth } from '../../contexts/AppContext';
import { get, post } from '../../utils/api';

interface StudentRaidPayload {
  raid_id: number;
  class_id: number;
  class_name: string;
  raid_name: string;
  template_display_name: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'TERMINATED';
  total_boss_hp: number;
  current_boss_hp: number;
  remaining_seconds: number;
  reward_coral: number;
  reward_research_data: number;
  special_reward_description?: string;
  my_total_contribution: number;
  remaining_research_data: number;
}

interface RaidLogItem {
  log_id?: number;
  type: string;
  student_name?: string;
  damage_amount?: number;
  message?: string;
  created_at: string;
}

export function StudentRaid() {
  const { user, isAuthenticated, userType } = useAuth();
  const [raidData, setRaidData] = useState<StudentRaidPayload | null>(null);
  const [logs, setLogs] = useState<RaidLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [contributeAmount, setContributeAmount] = useState(0);
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [pendingContribution, setPendingContribution] = useState<number | null>(null);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const appendLog = useCallback((log: RaidLogItem) => {
    setLogs((prev) => [log, ...prev].slice(0, 100));
  }, []);

  const fetchLogs = useCallback(async (raidId: number) => {
    try {
      const response = await get(`/api/v1/raids/${raidId}/logs?page=0&size=50`);
      const json = await response.json();
      if (response.ok && json?.data?.logs) {
        setLogs(json.data.logs);
      }
    } catch (err) {
      console.error('레이드 로그 조회 실패', err);
    }
  }, []);

  const connectWebSocket = useCallback((raidId: number) => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws/raids/${raidId}/logs`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        appendLog({
          type: data.type,
          student_name: data.student_name,
          damage_amount: data.damage_amount,
          message: data.message,
          created_at: data.created_at,
        });
        if (data.type !== 'ATTACK_LOG') {
          refetchRaid();
        }
      } catch (err) {
        console.error('웹소켓 메시지 파싱 실패', err);
      }
    };
    ws.onclose = () => {
      socketRef.current = null;
    };
    socketRef.current = ws;
  }, [appendLog]);

  const refetchRaid = useCallback(async () => {
    try {
      const response = await get('/api/v1/raids/my-raid');
      
      // 404는 레이드가 없는 정상적인 상태로 처리
      if (response.status === 404) {
        setRaidData(null);
        setError(null);
        setLoading(false);
        return;
      }
      
      const json = await response.json();
      if (response.ok) {
        // 백엔드 응답 데이터를 안전하게 매핑
        const data = json.data || {};
        setRaidData({
          raid_id: data.raid_id ?? data.raidId ?? 0,
          class_id: data.class_id ?? data.classId ?? 0,
          class_name: data.class_name ?? data.className ?? '',
          raid_name: data.raid_name ?? data.raidName ?? '',
          template_display_name: data.template_display_name ?? data.templateDisplayName ?? '',
          status: data.status ?? 'EXPIRED',
          total_boss_hp: data.total_boss_hp ?? data.totalBossHp ?? 0,
          current_boss_hp: data.current_boss_hp ?? data.currentBossHp ?? 0,
          remaining_seconds: data.remaining_seconds ?? data.remainingSeconds ?? 0,
          reward_coral: data.reward_coral ?? data.rewardCoral ?? 0,
          reward_research_data: data.reward_research_data ?? data.rewardResearchData ?? 0,
          special_reward_description: data.special_reward_description ?? data.specialRewardDescription,
          my_total_contribution: data.my_total_contribution ?? data.myTotalContribution ?? 0,
          remaining_research_data: data.remaining_research_data ?? data.remainingResearchData ?? 0,
        });
        setError(null);
        const raidId = data.raid_id ?? data.raidId;
        if (raidId) {
          fetchLogs(raidId);
          if (!socketRef.current) {
            connectWebSocket(raidId);
          }
        }
      } else {
        setError(json?.message ?? '레이드 정보를 불러오지 못했습니다.');
        setRaidData(null);
      }
    } catch (err) {
      console.error('레이드 로딩 에러:', err);
      // 네트워크 에러가 아닌 경우에만 에러 표시
      setError(null);
      setRaidData(null);
    } finally {
      setLoading(false);
    }
  }, [connectWebSocket, fetchLogs]);

  useEffect(() => {
    if (!isAuthenticated || userType !== 'student') {
      return;
    }
    refetchRaid();
    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [isAuthenticated, refetchRaid, userType]);

  const formatRemainingTime = useMemo(() => {
    if (!raidData) return '정보 없음';
    const seconds = raidData.remaining_seconds;
    if (seconds <= 0) return '종료됨';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}시간 ${minutes}분`;
  }, [raidData]);

  const handleOpenDiceModal = () => {
    if (!raidData) return;
    if (contributeAmount <= 0 || contributeAmount > raidData.remaining_research_data) {
      alert('올바른 기여량을 입력해주세요.');
      return;
    }
    setPendingContribution(contributeAmount);
    setDiceResult(null);
    setIsContributeOpen(false);
    setIsDiceModalOpen(true);
  };

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setDiceResult(null);
    setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1;
      setDiceResult(value);
      setIsRolling(false);
    }, 700);
  };

  const resetDiceModal = () => {
    setIsDiceModalOpen(false);
    setPendingContribution(null);
    setDiceResult(null);
    setIsRolling(false);
  };

  const handleConfirmContribution = async () => {
    if (!raidData || pendingContribution == null || diceResult == null) return;
    const diceBonus = diceResult; // 주사위 나온 눈금 만큼 추가 피해
    const totalDamage = pendingContribution + diceBonus;
    setIsSubmitting(true);
    try {
      const response = await post(`/api/v1/raids/${raidData.raid_id}/attack`, {
        research_data_amount: pendingContribution,
        total_damage: totalDamage,
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.message ?? '공격이 실패했습니다.');
      }
      const responseData = json.data || {};
      setRaidData((prev) => prev ? {
        ...prev,
        current_boss_hp: responseData.boss_hp?.after ?? responseData.current_boss_hp ?? responseData.currentBossHp ?? prev.current_boss_hp,
        status: responseData.raid_status ?? responseData.raidStatus ?? responseData.status ?? prev.status,
        my_total_contribution: responseData.my_stats?.total_damage ?? responseData.my_total_contribution ?? responseData.myTotalContribution ?? prev.my_total_contribution,
        remaining_research_data: responseData.my_stats?.remaining_research_data ?? responseData.remaining_research_data ?? responseData.remainingResearchData ?? prev.remaining_research_data
      } : prev);
      setContributeAmount(0);
      resetDiceModal();
    } catch (err: any) {
      alert(err.message ?? '공격 요청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !user) {
    return <div className="p-4">로그인 정보 로딩 중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">학생 전용 페이지입니다.</div>;
  }

  if (loading) {
    return (
      <div className="p-6 bg-white">
        <p>레이드 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!raidData) {
    return (
      <div className="p-6 space-y-4 bg-white">
        <div className="text-center py-8">
          <p className="text-lg text-gray-600 mb-4">진행 중인 레이드가 없습니다.</p>
          <p className="text-sm text-gray-500">선생님이 레이드를 생성하면 여기에 표시됩니다.</p>
          <Button 
            onClick={refetchRaid} 
            className="mt-4 bg-black text-white hover:bg-gray-800"
          >
            새로고침
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-4 bg-white">
        <p className="text-red-600">{error}</p>
        <Button onClick={refetchRaid} className="bg-black text-white">다시 시도</Button>
      </div>
    );
  }

  const hpPercent = raidData.current_boss_hp != null && raidData.total_boss_hp != null && raidData.total_boss_hp > 0
    ? (raidData.current_boss_hp / raidData.total_boss_hp) * 100
    : 0;

  return (
    <div className="p-4 space-y-4 bg-white" style={{ writingMode: 'horizontal-tb' }}>
      <Card className="border-2 border-gray-300">
        <CardHeader className="text-center pb-4" style={{ writingMode: 'horizontal-tb', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CardTitle className="text-black text-xl mb-3 whitespace-normal" style={{ writingMode: 'horizontal-tb', display: 'block', width: '100%' }}>{raidData.raid_name}</CardTitle>
          <div className="flex justify-between items-center text-sm mb-2" style={{ writingMode: 'horizontal-tb' }}>
            <span className="text-gray-600 whitespace-nowrap">남은 시간</span>
            <span className="text-black font-medium whitespace-nowrap">{formatRemainingTime}</span>
          </div>
          <div className="text-xs text-gray-500 mt-2 whitespace-normal" style={{ writingMode: 'horizontal-tb' }}>
            상태: {raidData.status === 'ACTIVE' ? '진행중' : '종료됨'}
          </div>
        </CardHeader>
      </Card>

      <Card className="border-2 border-gray-300">
        <CardContent className="p-6">
          <div className="w-full h-48 bg-black rounded mb-4 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-gray-400 rounded-full mx-auto mb-2" />
              <p className="font-medium">{raidData.template_display_name}</p>
            </div>
          </div>

          <div className="space-y-2" style={{ writingMode: 'horizontal-tb' }}>
            <div className="flex justify-between text-sm" style={{ writingMode: 'horizontal-tb' }}>
              <span className="text-black font-medium whitespace-nowrap">보스 HP</span>
              <span className="text-black whitespace-nowrap">
                {(raidData.current_boss_hp ?? 0).toLocaleString()} / {(raidData.total_boss_hp ?? 0).toLocaleString()}
              </span>
            </div>
            <Progress
              value={hpPercent}
              className="h-6 bg-gray-200"
              style={{
                '--progress-background': '#ef4444',
                '--progress-foreground': '#dc2626'
              } as React.CSSProperties}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-300">
        <CardHeader className="pb-4" style={{ writingMode: 'horizontal-tb', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CardTitle className="text-black text-center whitespace-normal" style={{ writingMode: 'horizontal-tb', display: 'block', width: '100%' }}>개인 기여</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4" style={{ writingMode: 'horizontal-tb' }}>
            <div className="text-center p-3 border border-gray-200 rounded" style={{ writingMode: 'horizontal-tb' }}>
              <p className="text-sm text-gray-600 mb-2 whitespace-normal" style={{ writingMode: 'horizontal-tb' }}>보유 탐사데이터</p>
              <p className="text-xl font-medium text-black">{raidData.remaining_research_data}</p>
            </div>
            <div className="text-center p-3 border border-gray-200 rounded" style={{ writingMode: 'horizontal-tb' }}>
              <p className="text-sm text-gray-600 mb-2 whitespace-normal" style={{ writingMode: 'horizontal-tb' }}>나의 총 기여</p>
              <p className="text-xl font-medium text-black">{raidData.my_total_contribution}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setIsContributeOpen(true)}
              className="w-full bg-black text-white hover:bg-gray-800 h-12"
              disabled={raidData.remaining_research_data <= 0 || raidData.status !== 'ACTIVE'}
            >
              에너지 주입
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-300">
        <CardHeader className="pb-4" style={{ writingMode: 'horizontal-tb', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CardTitle className="text-black text-center whitespace-normal" style={{ writingMode: 'horizontal-tb', display: 'block', width: '100%' }}>레이드 완료 보상</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4" style={{ writingMode: 'horizontal-tb' }}>
          <div className="text-center p-3 border border-gray-200 rounded" style={{ writingMode: 'horizontal-tb' }}>
            <p className="text-sm text-gray-600 mb-2 whitespace-normal" style={{ writingMode: 'horizontal-tb' }}>코랄</p>
            <p className="text-lg font-medium text-black">{raidData.reward_coral}</p>
          </div>
          <div className="text-center p-3 border border-gray-200 rounded" style={{ writingMode: 'horizontal-tb' }}>
            <p className="text-sm text-gray-600 mb-2 whitespace-normal" style={{ writingMode: 'horizontal-tb' }}>탐사데이터</p>
            <p className="text-lg font-medium text-black">{raidData.reward_research_data}</p>
          </div>
          {raidData.special_reward_description && (
            <div className="col-span-2 text-center p-3 border border-gray-200 rounded" style={{ writingMode: 'horizontal-tb' }}>
              <p className="text-sm text-gray-600 mb-2 whitespace-normal" style={{ writingMode: 'horizontal-tb' }}>특별 보상</p>
              <p className="text-lg font-medium text-black whitespace-normal" style={{ writingMode: 'horizontal-tb' }}>{raidData.special_reward_description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-300">
        <CardHeader className="pb-4" style={{ writingMode: 'horizontal-tb', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CardTitle className="text-black text-center whitespace-normal" style={{ writingMode: 'horizontal-tb', display: 'block', width: '100%' }}>레이드 로그</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto space-y-3 border-2 border-gray-300 rounded-lg p-3">
            {logs.length === 0 && (
              <p className="text-sm text-gray-500 text-center">아직 활동 로그가 없습니다.</p>
            )}
            {logs.map((log) => {
              let timeString = '알 수 없음';
              try {
                if (log.created_at) {
                  const date = new Date(log.created_at);
                  if (!isNaN(date.getTime())) {
                    timeString = date.toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false
                    });
                  }
                }
              } catch (err) {
                console.error('날짜 파싱 실패:', log.created_at, err);
              }
              
              return (
                <div
                  key={`${log.created_at}-${log.student_name ?? log.type}-${log.log_id ?? Math.random()}`}
                  className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded-r"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 text-sm text-black">
                      <span className="font-medium whitespace-normal">
                        {log.type === 'ATTACK_LOG'
                          ? `${log.student_name ?? '알 수 없음'}님이 ${log.damage_amount ?? 0} 데미지를 입혔습니다.`
                          : log.message ?? '시스템 알림'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                      {timeString}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">에너지 주입</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                보유 탐사데이터: {raidData.remaining_research_data}
              </p>
              <input
                type="number"
                value={contributeAmount}
                onChange={(e) => setContributeAmount(Number(e.target.value))}
                max={raidData.remaining_research_data}
                min={1}
                className="w-full p-3 border border-gray-300 rounded bg-white text-black"
                placeholder="기여할 양을 입력하세요"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleOpenDiceModal}
                className="flex-1 bg-black text-white"
                disabled={
                  contributeAmount <= 0 ||
                  contributeAmount > raidData.remaining_research_data ||
                  raidData.status !== 'ACTIVE'
                }
              >
                기여하기
              </Button>
              <Button
                onClick={() => setIsContributeOpen(false)}
                className="flex-1 bg-white text-black border border-gray-300"
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDiceModalOpen} onOpenChange={(open) => {
        if (!open) {
          resetDiceModal();
        }
      }}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">주사위 보너스</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <p className="text-sm text-gray-600">
              투입 에너지: <span className="font-semibold text-black">{pendingContribution ?? 0}</span>
            </p>
            <div className="w-24 h-24 mx-auto border-2 border-gray-300 rounded-lg flex items-center justify-center text-3xl font-bold text-black bg-gray-100">
              {diceResult ?? (isRolling ? '...' : '?')}
            </div>
            <p className="text-sm text-gray-600">
              주사위 눈금만큼 추가 피해가 적용됩니다.
            </p>
            <Button
              onClick={rollDice}
              className="w-full bg-black text-white"
              disabled={isRolling || diceResult !== null}
            >
              {isRolling ? '굴리는 중...' : diceResult ? '주사위 완료' : '주사위 굴리기'}
            </Button>
            <div className="flex space-x-2">
              <Button
                onClick={handleConfirmContribution}
                className="flex-1 bg-black text-white"
                disabled={diceResult === null || isSubmitting}
              >
                {isSubmitting ? '기여 중...' : `총 피해 ${pendingContribution !== null && diceResult !== null
                    ? pendingContribution + diceResult
                    : '-'
                  } 적용`}
              </Button>
              <Button
                onClick={resetDiceModal}
                className="flex-1 bg-white text-black border border-gray-300"
                disabled={isSubmitting}
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


