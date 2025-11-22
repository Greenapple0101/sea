import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
  const { user, isAuthenticated, userType, access_token } = useAuth();
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
      setError(null);
      setRaidData(null);
    } finally {
      setLoading(false);
    }
  }, [connectWebSocket, fetchLogs]);

  useEffect(() => {
    if (!isAuthenticated || userType !== 'student' || !access_token) {
      return;
    }
    refetchRaid();
    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [isAuthenticated, refetchRaid, userType, access_token]);

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
    const diceBonus = diceResult;
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
    return <div className="p-6">로그인 정보 확인 중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">접근 권한이 없습니다.</div>;
  }

  if (loading) {
    return (
      <div className="p-6 flex flex-col justify-center items-center min-h-screen" style={{ backgroundColor: "var(--bg-color)" }}>
        <div className="window" style={{ width: "300px" }}>
          <div className="title-bar">
            <div className="title-bar-text">로딩 중</div>
          </div>
          <div className="window-body text-center p-4">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <span>레이드 정보를 수신 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!raidData) {
    return (
      <div className="p-6 flex flex-col justify-center items-center min-h-screen" style={{ backgroundColor: "var(--bg-color)" }}>
        <div className="window" style={{ width: "300px" }}>
          <div className="title-bar">
            <div className="title-bar-text">알림</div>
            <div className="title-bar-controls">
              <button aria-label="Close" />
            </div>
          </div>
          <div className="window-body text-center p-4">
            <p>진행 중인 레이드가 없습니다.</p>
            <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>선생님이 레이드를 생성하면 여기에 표시됩니다.</p>
            <button onClick={refetchRaid} style={{ marginTop: "15px", minWidth: "100px" }}>
              새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col justify-center items-center min-h-screen" style={{ backgroundColor: "var(--bg-color)" }}>
        <div className="window" style={{ width: "300px" }}>
          <div className="title-bar">
            <div className="title-bar-text">오류</div>
            <div className="title-bar-controls">
              <button aria-label="Close" />
            </div>
          </div>
          <div className="window-body text-center p-4">
            <p style={{ color: "red" }}>{error}</p>
            <button onClick={refetchRaid} style={{ marginTop: "15px", minWidth: "100px" }}>
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hpPercent = raidData.current_boss_hp != null && raidData.total_boss_hp != null && raidData.total_boss_hp > 0
    ? (raidData.current_boss_hp / raidData.total_boss_hp) * 100
    : 0;

  return (
    <div className="p-4 space-y-6 pb-20 max-w-screen-xl mx-auto" style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh" }}>
      {/* 1. 보스 & 레이드 정보 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">&nbsp;{raidData.raid_name} ({raidData.status === 'ACTIVE' ? '진행중' : '종료됨'})</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button aria-label="Close" />
          </div>
        </div>
        <div className="window-body">

          {/* 보스 이미지 영역 */}
          <div className="sunken-panel" style={{
            height: "180px", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "#000", color: "#fff", marginBottom: "10px"
          }}>
            <div style={{ width: "80px", height: "80px", background: "#808080", borderRadius: "50%", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>
              🐙
            </div>
            <h3 style={{ margin: 0 }}>{raidData.template_display_name}</h3>
            <div style={{ fontSize: "12px", color: "#ccc" }}>남은 시간: {formatRemainingTime}</div>
          </div>

          {/* 체력바 */}
          <div style={{ marginBottom: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
              <span>HP Status</span>
              <span>{raidData.current_boss_hp.toLocaleString()} / {raidData.total_boss_hp.toLocaleString()}</span>
            </div>
            <div className="progress-indicator segmented" style={{ width: "100%", height: "24px", border: "2px inset #dfdfdf" }}>
              <div
                className="progress-indicator-bar"
                style={{
                  width: `${hpPercent}%`,
                  background: "linear-gradient(90deg, #d32f2f 0 16px, transparent 0 2px)",
                  backgroundColor: "transparent"
                }}
              />
            </div>
          </div>

          {/* 보상 정보 */}
          <fieldset style={{ padding: "10px" }}>
            <legend>Clear Reward</legend>
            <div style={{ textAlign: "center", fontWeight: "bold" }}>
              보상: 코랄 {raidData.reward_coral}개
              {raidData.special_reward_description && (
                <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                  특별 보상: {raidData.special_reward_description}
                </div>
              )}
            </div>
          </fieldset>
        </div>
      </div>

      {/* 2. 내 행동 (기여) 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">&nbsp;개인 기여</div>
        </div>
        <div className="window-body">

          {/* 내 자원 현황 */}
          <div className="status-bar" style={{ marginBottom: "15px" }}>
            <p className="status-bar-field">보유 탐사데이터</p>
            <p className="status-bar-field" style={{ textAlign: "right", fontWeight: "bold" }}>
              {raidData.remaining_research_data}
            </p>
          </div>

          <div className="status-bar" style={{ marginBottom: "15px" }}>
            <p className="status-bar-field">나의 총 기여</p>
            <p className="status-bar-field" style={{ textAlign: "right", fontWeight: "bold" }}>
              {raidData.my_total_contribution}
            </p>
          </div>

          {/* 액션 버튼 */}
          <button
            onClick={() => setIsContributeOpen(true)}
            disabled={raidData.remaining_research_data <= 0 || raidData.status !== 'ACTIVE'}
            style={{ width: "100%", height: "40px", fontWeight: "bold", marginBottom: "10px" }}
          >
            ⚡ 에너지 주입
          </button>
        </div>
      </div>

      {/* 3. 레이드 로그 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">레이드 로그</div>
        </div>
        <div className="window-body">
          <div className="sunken-panel" style={{ height: "200px", overflowY: "auto", background: "#fff", padding: "6px" }}>
            {logs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>기록된 레이드 로그가 없습니다.</div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {logs.map((log, index) => (
                  <li key={log.log_id ?? index} style={{ marginBottom: "6px", borderBottom: "1px dotted #ccc", paddingBottom: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>
                        {log.type === 'ATTACK_LOG' ? (
                          <>
                            <strong style={{ color: "#000080" }}>{log.student_name ?? '알 수 없음'}</strong>님이
                            <span style={{ color: "#d32f2f", fontWeight: "bold", marginLeft: "4px" }}>{log.damage_amount ?? 0}</span> 데미지를 입혔습니다.
                          </>
                        ) : (
                          <span>{log.message ?? '시스템 알림'}</span>
                        )}
                      </span>
                      <span style={{ fontSize: "11px", color: "#666" }}>
                        {new Date(log.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* [모달] 에너지 주입 */}
      {isContributeOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="window" style={{ width: '90%', maxWidth: '350px' }}>
            <div className="title-bar">
              <div className="title-bar-text">에너지 주입</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setIsContributeOpen(false)} />
              </div>
            </div>
            <div className="window-body">

              <div className="field-row-stacked" style={{ marginBottom: "15px" }}>
                <label>주입할 데이터 양 (보유: {raidData.remaining_research_data})</label>
                <input
                  type="number"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(Number(e.target.value))}
                  max={raidData.remaining_research_data}
                  min={1}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                <button
                  onClick={handleOpenDiceModal}
                  disabled={contributeAmount <= 0 || contributeAmount > raidData.remaining_research_data || raidData.status !== 'ACTIVE'}
                  style={{ minWidth: "80px", fontWeight: "bold" }}
                >
                  기여하기
                </button>
                <button onClick={() => setIsContributeOpen(false)} style={{ minWidth: "80px" }}>
                  취소
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* [모달] 주사위 보너스 */}
      {isDiceModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="window" style={{ width: '90%', maxWidth: '350px' }}>
            <div className="title-bar">
              <div className="title-bar-text">주사위 보너스</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={resetDiceModal} />
              </div>
            </div>
            <div className="window-body text-center">
              <fieldset style={{ marginBottom: "15px" }}>
                <legend>Dice Bonus Chance</legend>
                <p style={{ margin: "5px 0", fontSize: "12px" }}>주사위를 굴려 추가 데미지를 입힙니다!</p>
                <p style={{ margin: "5px 0", fontSize: "11px", color: "#666" }}>
                  투입 에너지: <span style={{ fontWeight: "bold" }}>{pendingContribution ?? 0}</span>
                </p>

                <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
                  {isRolling ? (
                    <div className="window" style={{ width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : diceResult ? (
                    <div className="window" style={{ width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold" }}>
                      {diceResult}
                    </div>
                  ) : (
                    <div className="window" style={{ width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                      🎲
                    </div>
                  )}
                </div>
              </fieldset>

              <div style={{ marginBottom: "15px" }}>
                {diceResult && pendingContribution && (
                  <div className="sunken-panel" style={{ padding: "10px", background: "#fff" }}>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>예상 총 데미지</div>
                    <div style={{ fontWeight: "bold", fontSize: "18px", color: "blue" }}>
                      {pendingContribution + diceResult}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                <button
                  onClick={rollDice}
                  disabled={isRolling || diceResult !== null}
                  style={{ minWidth: "100px", fontWeight: "bold" }}
                >
                  {isRolling ? '굴리는 중...' : diceResult ? '주사위 완료' : '주사위 굴리기'}
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "15px" }}>
                <button
                  onClick={handleConfirmContribution}
                  disabled={diceResult === null || isSubmitting}
                  style={{ minWidth: "100px", fontWeight: "bold" }}
                >
                  {isSubmitting ? '기여 중...' : '확인'}
                </button>
                <button
                  onClick={resetDiceModal}
                  disabled={isSubmitting}
                  style={{ minWidth: "80px" }}
                >
                  취소
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
