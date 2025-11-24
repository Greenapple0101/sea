import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from "../../contexts/AppContext";
import { get, post } from "../../utils/api";

interface BossHp {
  total: number;
  current: number;
  percentage: number;
}

interface MyContribution {
  total_damage: number;
  last_attack_at: string | null;
}

interface RaidInfo {
  raid_id: number;
  template: string;
  template_name: string;
  raid_name: string;
  difficulty: string;
  status: "ACTIVE" | "COMPLETED" | "Failed";
  boss_hp: BossHp;
  end_date: string;
  remaining_time: string;
  reward_coral: number;
  participants: number;
  my_contribution: MyContribution;
  my_research_data: number;
}

interface AttackLog {
  log_id: number;
  student_name: string;
  damage: number;
  timestamp: string;
  time_ago: string;
}

export function StudentRaid() {
  const { user, isAuthenticated, userType, access_token } = useAuth();

  const [raidInfo, setRaidInfo] = useState<RaidInfo | null>(null);
  const [logs, setLogs] = useState<AttackLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [contributeAmount, setContributeAmount] = useState(0);

  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [lastContributeResult, setLastContributeResult] = useState<{
    base: number;
    bonus: number;
    total: number;
    diceResult: number;
  } | null>(null);

  // 1. 레이드 정보 및 로그 조회
  const fetchRaidData = async () => {
    if (!access_token) return;
    setLoading(true);
    setError(null);

    try {
      const raidRes = await get('/api/v1/raids/my-raid');
      if (raidRes.status === 404) {
        setError("진행 중인 레이드가 없습니다.");
        setRaidInfo(null);
        return;
      }
      if (!raidRes.ok) throw new Error("레이드 정보를 불러오는데 실패했습니다.");

      const raidJson = await raidRes.json();
      setRaidInfo(raidJson.data);

      // 로그 조회 (REST 방식)
      const logsRes = await get(`/api/v1/raids/{raidId}/logs`);
      if (logsRes.ok) {
        const logsJson = await logsRes.json();
        setLogs(logsJson.data.logs);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userType === 'student') {
      fetchRaidData();
    }
  }, [isAuthenticated, userType, access_token]);

  // 2. 에너지 주입 (공격)
  const handleEnergyContribute = () => {
    if (!raidInfo) return;
    if (contributeAmount <= 0 || contributeAmount > raidInfo.my_research_data) {
      alert('올바른 기여량을 입력해주세요.');
      return;
    }

    setIsDiceRolling(true);
    setDiceResult(null);

    // 주사위 애니메이션 (2초)
    setTimeout(async () => {
      // 1. 주사위 결과 및 데미지 계산 (Client Side)
      const dice = Math.floor(Math.random() * 6) + 1;
      const bonusMultiplier = dice / 6; // 0.16 ~ 1.0
      const bonus = Math.floor(contributeAmount * bonusMultiplier);
      const totalDamage = contributeAmount + bonus;

      setDiceResult(dice);
      setIsDiceRolling(false);

      setLastContributeResult({
        base: contributeAmount,
        bonus: bonus,
        total: totalDamage,
        diceResult: dice
      });

      try {
        const response = await post(`/api/v1/raids/${raidInfo.raid_id}/attack`, {
          research_data_amount: contributeAmount,
          total_damage: totalDamage
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "공격 실패");
        }

        if (result.success) {
          const data = result.data;
          setRaidInfo(prev => prev ? ({
            ...prev,
            boss_hp: {
              total: prev.boss_hp.total,
              current: data.boss_hp.after,
              percentage: data.boss_hp.percentage
            },
            my_research_data: data.my_stats.remaining_research_data
          }) : null);

          fetchRaidData();
          alert(result.message);
        }
      } catch (err) {
        alert((err as Error).message);
      } finally {
        setIsContributeOpen(false);
        setContributeAmount(0);
      }

    }, 2000);
  };

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-6">로그인 정보 확인 중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">접근 권한이 없습니다.</div>;
  }

  if (loading) {
    return (
      <div className="p-6 flex flex-col justify-center items-center min-h-screen">
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

  if (error || !raidInfo) {
    return (
      <div className="p-6 flex flex-col justify-center items-center min-h-screen">
        <div className="window" style={{ width: "300px" }}>
          <div className="title-bar">
            <div className="title-bar-text">알림</div>
            <div className="title-bar-controls">
              <button aria-label="Close" />
            </div>
          </div>
          <div className="window-body text-center p-4">
            <p>{error || "진행 중인 레이드가 없습니다."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20 max-w-screen-xl mx-auto" style={{ minHeight: "100vh" }}>
      {/* 1. 보스 & 레이드 정보 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">&nbsp;{raidInfo.raid_name} ({raidInfo.difficulty})</div>
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
            {/* 보스 이미지 Placeholder */}
            <div style={{ width: "80px", height: "80px", background: "#808080", borderRadius: "50%", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>
              🐙
            </div>
            <h3 style={{ margin: 0 }}>{raidInfo.template_name}</h3>
            <div style={{ fontSize: "12px", color: "#ccc" }}>남은 시간: {raidInfo.remaining_time}</div>
          </div>

          {/* 체력바 */}
          <div style={{ marginBottom: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
              <span>HP Status</span>
              <span>{raidInfo.boss_hp.current.toLocaleString()} / {raidInfo.boss_hp.total.toLocaleString()}</span>
            </div>
            <div className="progress-indicator segmented" style={{ width: "100%", height: "24px", border: "2px inset #dfdfdf" }}>
              <div
                className="progress-indicator-bar"
                style={{
                  width: `${raidInfo.boss_hp.percentage}%`,
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
              보상: 코랄 {raidInfo.reward_coral}개
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
              {raidInfo.my_research_data}
            </p>
          </div>

          {/* 액션 버튼 */}
          <button
            onClick={() => setIsContributeOpen(true)}
            disabled={raidInfo.my_research_data <= 0}
            style={{ width: "100%", height: "40px", fontWeight: "bold", marginBottom: "10px" }}
          >
            ⚡ 에너지 주입
          </button>

          {/* 마지막 결과 표시 */}
          {lastContributeResult && (
            <div className="sunken-panel" style={{ padding: "10px", background: "#fff" }}>
              <div style={{ textAlign: "center", fontSize: "12px", color: "#666", marginBottom: "5px" }}>-- Last Attack Log --</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div>기본: {lastContributeResult.base}</div>
                  <div>보너스: +{lastContributeResult.bonus}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: "bold", fontSize: "16px", color: "blue" }}>DMG: {lastContributeResult.total}</div>
                  <div style={{ fontSize: "11px", background: "#e0e0e0", padding: "2px 4px", display: "inline-block", marginTop: "2px" }}>
                    Dice: {lastContributeResult.diceResult}
                  </div>
                </div>
              </div>
            </div>
          )}
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
                {logs.map((log) => (
                  <li key={log.log_id} style={{ marginBottom: "6px", borderBottom: "1px dotted #ccc", paddingBottom: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>
                        <strong style={{ color: "#000080" }}>{log.student_name}</strong>님이
                        <span style={{ color: "#d32f2f", fontWeight: "bold", marginLeft: "4px" }}>{log.damage}</span> 데미지를 입혔습니다.
                      </span>
                      <span style={{ fontSize: "11px", color: "#666" }}>{log.time_ago}</span>
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
                <label>주입할 데이터 양 (보유: {raidInfo.my_research_data})</label>
                <input
                  type="number"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(Number(e.target.value))}
                  max={raidInfo.my_research_data}
                  min={1}
                  style={{ width: "100%" }}
                />
              </div>

              <fieldset style={{ marginBottom: "15px" }}>
                <legend>Dice Bonus Chance</legend>
                <p style={{ margin: "5px 0", fontSize: "12px" }}>주사위를 굴려 추가 데미지를 입힙니다!</p>

                <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
                  {isDiceRolling ? (
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

              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                <button
                  onClick={handleEnergyContribute}
                  disabled={contributeAmount <= 0 || contributeAmount > raidInfo.my_research_data || isDiceRolling}
                  style={{ minWidth: "80px", fontWeight: "bold" }}
                >
                  {isDiceRolling ? "굴리는 중..." : "확인"}
                </button>
                <button onClick={() => setIsContributeOpen(false)} style={{ minWidth: "80px" }}>
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