import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from "../../contexts/AppContext";
import { get, post } from "../../utils/api";
import zelusBg from '../../styles/boss/zelus_bg.png';
import krakenBg from '../../styles/boss/kraken_bg.png';
import diceSprite from '../../styles/dice.png';

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
  class_id: number;
  class_name: string;
  raid_name: string;
  template: string;
  template_name: string;
  difficulty: string;
  status: string;
  boss_hp: BossHp;
  end_date: string;
  remaining_time: string;
  reward_coral: number;
  participants: number;
  special_reward_description?: string;
  my_contribution: MyContribution;
  my_research_data: number;
}

interface RaidLog {
  log_id: number;
  student_name: string;
  damage: number;
  timestamp: string;
}

interface AttackResponseData {
  raid_id: number;
  attack_log_id: number;
  research_data_used: number;
  damage_dealt: number;
  boss_hp: {
    before: number;
    after: number;
    percentage: number;
  };
  raid_completed: boolean;
  rewards: {
    coral: number;
    research_data: number;
  } | null;
  my_stats: {
    total_damage: number;
    remaining_research_data: number;
  };
  attacked_at: string;
}

// 주사위 표시용
const DiceDisplay = ({ isRolling, result }: { isRolling: boolean; result: number | null }) => {
  const [animFrame, setAnimFrame] = useState(0);

  // 애니메이션 루프 (로딩 중일 때만 동작)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRolling) {
      interval = setInterval(() => {
        setAnimFrame((prev) => (prev + 1) % 6);
      }, 100);
    } else {
      setAnimFrame(0);
    }
    return () => clearInterval(interval);
  }, [isRolling]);

  const frameSize = 16;
  let bgX = 0;
  let bgY = 0;

  if (isRolling) {
    bgX = -(animFrame * frameSize);
    bgY = -224;
  } else if (result) {
    bgX = -((result - 1) * frameSize);
    bgY = 0;
  } else {
    bgX = 0;
    bgY = 0;
  }

  return (
    <div
      className="window"
      style={{
        width: "80px",
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#333",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          width: `${frameSize}px`,
          height: `${frameSize}px`,
          backgroundImage: `url(${diceSprite})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: `${bgX}px ${bgY}px`,
          transform: "scale(2)",
          transformOrigin: "center",
          imageRendering: "pixelated"
        }}
      />
    </div>
  );
};

export function StudentRaid() {
  const { user, isAuthenticated, userType, access_token } = useAuth();

  const [raidInfo, setRaidInfo] = useState<RaidInfo | null>(null);
  const [logs, setLogs] = useState<RaidLog[]>([]);
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

  // 날짜 포맷팅 헬퍼 (로그용)
  const formatLogTime = (dateString: string) => {
    if (!dateString) return '-';
    // 1. ISO 문자열을 Date 객체로 변환
    const date = new Date(dateString);
    // 2. 유효성 검사
    if (isNaN(date.getTime())) return 'Invalid Date';
    // 3. 시간 포맷팅
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 1. 레이드 정보 및 로그 조회
  const fetchRaidData = async () => {
    if (!access_token) return;
    if (!raidInfo) setLoading(true);
    setError(null);

    try {
      const raidRes = await get('/api/v1/raids/my-raid');
      if (raidRes.status === 404) {
        setRaidInfo(null);
        setLoading(false);
        return;
      }
      if (!raidRes.ok) {
        const errJson = await raidRes.json();
        throw new Error(errJson.message || "레이드 정보를 불러오는데 실패했습니다.");
      }

      const raidJson = await raidRes.json();
      const raidData = raidJson.data as RaidInfo;
      setRaidInfo(raidJson.data);

      // 로그 조회 (REST 방식)
      if (raidData && raidData.raid_id) {
        const logsRes = await get(`/api/v1/raids/${raidData.raid_id}/logs`);
        if (logsRes.ok) {
          const logsJson = await logsRes.json();
          setLogs(logsJson.data.logs || []);
        }
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

  const handleCloseModal = () => {
    setIsContributeOpen(false);
    setContributeAmount(0);
    setDiceResult(null);
    setIsDiceRolling(false);
  };

  // 2. 에너지 주입 (공격)
  const handleEnergyContribute = () => {
    if (!raidInfo) return;
    if (contributeAmount <= 0 || contributeAmount > raidInfo.my_research_data) {
      alert('보유한 데이터보다 많은 양을 사용할 수 없습니다.');
      return;
    }

    setIsDiceRolling(true);
    setDiceResult(null);

    // 주사위 애니메이션 (2초)
    setTimeout(async () => {
      const dice = Math.floor(Math.random() * 6) + 1;
      const bonusMultiplier = 1 + (dice / 6); // 0.16 ~ 1.0
      const calculatedDamage = Math.floor(contributeAmount * bonusMultiplier);

      setDiceResult(dice);
      setIsDiceRolling(false);

      setLastContributeResult({
        base: contributeAmount,
        bonus: calculatedDamage - contributeAmount,
        total: calculatedDamage,
        diceResult: dice
      });

      try {
        const payload = {
          research_data_amount: contributeAmount,
          total_damage: calculatedDamage
        };
        const response = await post(`/api/v1/raids/${raidInfo.raid_id}/attack`, payload);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "공격에 실패했습니다.");
        }

        if (result.success) {
          const data = result.data as AttackResponseData;
          setRaidInfo(prev => {
            if (!prev) return null;
            return {
              ...prev,
              // 보스 체력 업데이트
              boss_hp: {
                total: prev.boss_hp.total, // Total은 변하지 않음
                current: data.boss_hp.after,
                percentage: data.boss_hp.percentage
              },
              // 내 정보 업데이트
              my_research_data: data.my_stats.remaining_research_data,
              my_contribution: {
                ...prev.my_contribution,
                total_damage: data.my_stats.total_damage,
                last_attack_at: data.attacked_at
              },
              // 레이드 완료 여부 체크 (필요시 status 업데이트)
              status: data.raid_completed ? "COMPLETED" : prev.status
            };
          });

          fetchRaidData();
          if (data.raid_completed) {
            alert("축하합니다! 레이드 보스를 처치했습니다!");
            handleCloseModal();
          }
        }
      } catch (err) {
        alert((err as Error).message);
        handleCloseModal();
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

  if (loading && !raidInfo) {
    return (
      <div className="p-6 flex flex-col justify-center items-center min-h-screen">
        <div className="window" style={{ width: "300px" }}>
          <div className="title-bar"><div className="title-bar-text">로딩 중</div></div>
          <div className="window-body text-center p-4">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <span>레이드 정보를 수신 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!raidInfo) {
    return (
      <div className="p-6 flex flex-col justify-center items-center min-h-screen">
        <div className="window" style={{ width: "300px" }}>
          <div className="title-bar">
            <div className="title-bar-text">알림</div>
            <div className="title-bar-controls"><button aria-label="Close" /></div>
          </div>
          <div className="window-body text-center p-3">
            <p>현재 진행 중인 레이드가 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const getBossBgImage = (template: string) => {
    if (template === 'KRAKEN') {
      return krakenBg;
    }
    if (template === 'ZELUS_INDUSTRY') {
      return zelusBg;
    }
    return krakenBg; // 기본값
  };

  // 템플릿 아이콘 결정(이미지로 변경 전 임시)
  const getBossIcon = (template: string) => {
    if (template === 'KRAKEN') return '🐙';
    if (template === 'ZELUS_INDUSTRY') return '🏭';
    return '👾';
  };

  return (
    <>
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
              height: "180px",
              width: "100%",
              marginBottom: "10px",

              // 배경 이미지 설정
              backgroundImage: `url(${getBossBgImage(raidInfo.template)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",

              backgroundColor: "#333",
            }}></div>

            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "18px" }}>
                {raidInfo.template_name}
              </h3>
              <div style={{ fontSize: "13px", color: "#666" }}>
                남은 시간: <span style={{ color: "#d32f2f", fontWeight: "bold" }}>{raidInfo.remaining_time}</span>
              </div>
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
              {raidInfo.special_reward_description && (
                <div style={{ textAlign: "center", fontSize: "12px", color: "blue", marginTop: "4px" }}>
                  🎁 {raidInfo.special_reward_description}
                </div>
              )}
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
              disabled={raidInfo.my_research_data <= 0 || raidInfo.status !== 'ACTIVE'}
              style={{ width: "100%", height: "40px", fontWeight: "bold", marginBottom: "10px", cursor: raidInfo.status !== 'ACTIVE' ? 'not-allowed' : 'pointer' }}
            >
              {raidInfo.status === 'ACTIVE' ? '⚡ 에너지 주입 (공격)' : '레이드 종료됨'}
            </button>

            {/* 마지막 결과 표시 */}
            {lastContributeResult && (
              <div className="sunken-panel" style={{ padding: "10px", background: "#fff" }}>
                <div style={{ textAlign: "center", fontSize: "12px", color: "#666", marginBottom: "5px" }}>-- Last Attack Log --</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "12px" }}>소모: {lastContributeResult.base}</div>
                    <div style={{ fontSize: "12px", color: "green" }}>보너스: +{lastContributeResult.bonus}</div>
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
                <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>아직 기록된 로그가 없습니다.</div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {logs.map((log) => (
                    <li key={log.log_id} style={{ marginBottom: "6px", borderBottom: "1px dotted #ccc", paddingBottom: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px" }}>
                          <strong style={{ color: "#000080" }}>{log.student_name}</strong>님이
                          <span style={{ color: "#d32f2f", fontWeight: "bold", marginLeft: "4px" }}>{log.damage.toLocaleString()}</span> 대미지를 입혔습니다!
                        </span>
                        <span style={{ fontSize: "11px", color: "#666" }}>{formatLogTime(log.timestamp)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
                <button aria-label="Close" onClick={handleCloseModal} />
              </div>
            </div>
            <div className="window-body">

              <div className="field-row-stacked" style={{ marginBottom: "15px" }}>
                <label>주입할 탐사데이터 양 (보유: {raidInfo.my_research_data})</label>
                <input
                  type="number"
                  value={contributeAmount === 0 ? '' : contributeAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setContributeAmount(val === '' ? 0 : Number(val));
                  }}
                  max={raidInfo.my_research_data}
                  min={1}
                  style={{ width: "100%", marginTop: "5px" }}
                  placeholder="주입할 탐사데이터 양"
                  disabled={diceResult !== null}
                />
              </div>

              <fieldset style={{ marginBottom: "15px" }}>
                <legend>Dice Bonus Chance</legend>
                <p style={{ margin: "5px 0", fontSize: "12px" }}>
                  {diceResult ? "공격 완료! 결과가 적용되었습니다." : "주사위를 굴려 추가 데미지를 입힙니다!"}
                </p>

                <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
                  <DiceDisplay isRolling={isDiceRolling} result={diceResult} />
                </div>

                {diceResult && lastContributeResult && (
                  <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', color: 'blue' }}>
                    최종 데미지: {lastContributeResult.total.toLocaleString()}
                  </div>
                )}
              </fieldset>

              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                {!diceResult ? (
                  <>
                    <button
                      onClick={handleEnergyContribute}
                      disabled={contributeAmount <= 0 || contributeAmount > raidInfo.my_research_data || isDiceRolling}
                      style={{ minWidth: "80px", fontWeight: "bold" }}
                    >
                      {isDiceRolling ? "계산 중..." : "공격 개시"}
                    </button>
                    <button onClick={handleCloseModal} style={{ minWidth: "80px" }} disabled={isDiceRolling}>
                      취소
                    </button>
                  </>
                ) : (
                  <button onClick={handleCloseModal} style={{ width: "100%", fontWeight: "bold" }}>
                    확인
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}