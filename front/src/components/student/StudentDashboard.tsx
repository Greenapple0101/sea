import { useEffect, useState } from 'react';
import { useAuth, StudentUser } from '../../contexts/AppContext';
import { get } from '../../utils/api';
import { Loader2 } from 'lucide-react';
import { QuestDetailPage } from './QuestDetailPage';

interface StudentRaidSummary {
  raid_name: string;
  template_display_name: string;
  current_boss_hp: number;
  total_boss_hp: number;
  remaining_seconds: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'TERMINATED';
}

export function StudentDashboard() {
  const { user, isAuthenticated, userType, updateUser } = useAuth();

  const [raidSummary, setRaidSummary] = useState<StudentRaidSummary | null>(null);
  const [raidLoading, setRaidLoading] = useState(true);
  const [raidError, setRaidError] = useState<string | null>(null);
  const [events, setEvents] = useState<Array<{ id: number; type: string; message: string; time: string }>>([]);
  const [groupQuests, setGroupQuests] = useState<Array<{ id: string; title: string; reward: string; completed: number; total: number; incomplete: string[] }>>([]);
  const [activityLogs, setActivityLogs] = useState<Array<{ id: number; title: string; description: string; reward: string; time: string }>>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [groupQuestsLoading, setGroupQuestsLoading] = useState(false);
  const [activityLogsLoading, setActivityLogsLoading] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<{ id: string; title: string } | null>(null);

  // 사용자 정보 새로고침
  const refreshUserInfo = async () => {
    try {
      const response = await get('/api/v1/auth/student/me');
      const json = await response.json();
      if (response.ok && json.data) {
        updateUser({
          coral: json.data.coral ?? 0,
          research_data: json.data.research_data ?? 0,
        });
      }
    } catch (err) {
      console.error('사용자 정보 새로고침 실패:', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || userType !== 'student') {
      setRaidLoading(false);
      return;
    }

    // 페이지 로드 시 사용자 정보 새로고침
    refreshUserInfo();

    const fetchRaid = async () => {
      try {
        const response = await get('/api/v1/raids/my-raid');
        const json = await response.json();
        if (response.ok) {
          setRaidSummary({
            raid_name: json.data.raid_name,
            template_display_name: json.data.template_display_name,
            current_boss_hp: json.data.current_boss_hp,
            total_boss_hp: json.data.total_boss_hp,
            remaining_seconds: json.data.remaining_seconds,
            status: json.data.status,
          });
        } else {
          setRaidError(json?.message ?? '레이드를 불러올 수 없습니다.');
        }
      } catch (err) {
        setRaidError('레이드를 불러올 수 없습니다.');
      } finally {
        setRaidLoading(false);
      }
    };

    const fetchEvents = async () => {
      setEventsLoading(true);
      try {
        // const response = await get('/api/v1/notices/events');
        // const json = await response.json();
        // if (response.ok) {
        //   setEvents(json.data ?? []);
        // }
        setEvents([]); // 임시로 빈 배열
      } catch (err) {
        console.error('이벤트 & 공지 조회 실패', err);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    const fetchGroupQuests = async () => {
      setGroupQuestsLoading(true);
      try {
        // const response = await get('/api/v1/quests/group/my-class');
        // const json = await response.json();
        // if (response.ok) {
        //   setGroupQuests(json.data ?? []);
        // }
        setGroupQuests([]); // 임시로 빈 배열
      } catch (err) {
        console.error('단체 퀘스트 조회 실패', err);
        setGroupQuests([]);
      } finally {
        setGroupQuestsLoading(false);
      }
    };

    const fetchActivityLogs = async () => {
      setActivityLogsLoading(true);
      try {
        // const response = await get('/api/v1/activity-logs');
        // const json = await response.json();
        // if (response.ok) {
        //   setActivityLogs(json.data ?? []);
        // }
        setActivityLogs([]); // 임시로 빈 배열
      } catch (err) {
        console.error('활동 로그 조회 실패', err);
        setActivityLogs([]);
      } finally {
        setActivityLogsLoading(false);
      }
    };

    fetchRaid();
    fetchEvents();
    fetchGroupQuests();
    fetchActivityLogs();

    // 30초마다 사용자 정보 새로고침
    const intervalId = setInterval(() => {
      refreshUserInfo();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, userType]);

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-6">로딩중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">학생 전용 대시보드입니다.</div>;
  }

  const currentUser = user as StudentUser;

  // 퀘스트 상세 페이지가 선택된 경우
  if (selectedQuest) {
    return (
      <QuestDetailPage
        quest={{ id: parseInt(selectedQuest.id), title: selectedQuest.title }}
        onBack={() => setSelectedQuest(null)}
      />
    );
  }

  return (
    <div className="retro-layout p-4 space-y-6 min-h-screen pb-20 max-w-screen-xl mx-auto" style={{ backgroundColor: "#c0c0c0" }}>
      {/* 1. 이벤트 & 공지 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">&nbsp;이벤트 & 공지</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button aria-label="Close" />
          </div>
        </div>
        <div className="window-body">
          <div className="sunken-panel" style={{ padding: "10px", background: "#fff", maxHeight: "150px", overflowY: "auto" }}>
            {eventsLoading ? (
              <p style={{ textAlign: "center", color: "#666" }}>로딩 중...</p>
            ) : events.length === 0 ? (
              <p style={{ textAlign: "center", color: "#666" }}>이벤트 및 공지가 없습니다.</p>
            ) : (
              <ul className="tree-view" style={{ border: "none", boxShadow: "none", margin: 0, padding: 0 }}>
                {events.map((event) => (
                  <li key={event.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dotted #888" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                      <span style={{ fontWeight: "bold", color: event.type === '이벤트' ? "red" : "blue", whiteSpace: "nowrap" }}>
                        [{event.type}]
                      </span>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{event.message}</span>
                    </span>
                    <span style={{ fontSize: "12px", color: "#666", whiteSpace: "nowrap", marginLeft: "8px" }}>{event.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* 2. 레이드 현황 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">&nbsp;현재 레이드: {raidSummary ? raidSummary.raid_name : '진행 중 아님'}</div>
          <div className="title-bar-controls">
            <button aria-label="Help" />
          </div>
        </div>
        <div className="window-body">
          {raidLoading ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
              레이드 정보를 불러오는 중...
            </div>
          ) : raidError ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
              {raidError}
            </div>
          ) : raidSummary ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "15px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>BOSS: {raidSummary.template_display_name}</h4>

                {/* HP 정보 & 프로그레스 바 (98.css style) */}
                <div className="field-row" style={{ justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>HP Status</span>
                  <span>{raidSummary.current_boss_hp.toLocaleString()} / {raidSummary.total_boss_hp.toLocaleString()}</span>
                </div>
                <div className="progress-indicator segmented" style={{ width: "100%", height: "24px" }}>
                  <div
                    className="progress-indicator-bar"
                    style={{ width: `${(raidSummary.current_boss_hp / raidSummary.total_boss_hp) * 100}%` }}
                  />
                </div>
              </div>

              {/* 레이드 상세 정보 (Grid) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="status-bar">
                  <p className="status-bar-field">남은 시간</p>
                  <p className="status-bar-field" style={{ textAlign: "right" }}>
                    {raidSummary.remaining_seconds > 0
                      ? `${Math.floor(raidSummary.remaining_seconds / 3600)}시간`
                      : '종료됨'}
                  </p>
                </div>
                <div className="status-bar">
                  <p className="status-bar-field">상태</p>
                  <p className="status-bar-field" style={{ textAlign: "right" }}>{raidSummary.status}</p>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
              현재 진행 중인 레이드가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 3. 단체 퀘스트 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">&nbsp;단체 퀘스트 현황</div>
        </div>
        <div className="window-body">
          <p style={{ marginBottom: "10px" }}>우리 반 달성률</p>
          {groupQuestsLoading ? (
            <p style={{ textAlign: "center", color: "#666" }}>로딩 중...</p>
          ) : groupQuests.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>진행 중인 단체 퀘스트가 없습니다.</p>
          ) : (
            groupQuests.map((quest) => (
              <fieldset key={quest.id} style={{ padding: "10px", marginBottom: "10px" }}>
                <legend
                  style={{ fontWeight: "bold", cursor: "pointer" }}
                  onClick={() => setSelectedQuest({ id: quest.id, title: quest.title })}
                >
                  {quest.title} (상세보기 ↗)
                </legend>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                  <span>{quest.reward}</span>
                  <span>{quest.completed}/{quest.total}명</span>
                </div>

                {/* 미니 프로그레스 바 */}
                <div className="progress-indicator" style={{ height: "16px", width: "100%" }}>
                  <div
                    className="progress-indicator-bar"
                    style={{ width: `${(quest.completed / quest.total) * 100}%`, backgroundColor: "#000080" }}
                  />
                </div>

                {quest.incomplete.length > 0 && (
                  <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
                    <span style={{ color: "red" }}>미완료:</span> {quest.incomplete.join(", ")}
                  </div>
                )}
              </fieldset>
            ))
          )}
        </div>
      </div>

      {/* 4. 내 정보 및 로그 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">&nbsp;내 정보</div>
        </div>
        <div className="window-body">
          {/* 자산 현황 */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <div className="sunken-panel" style={{ flex: 1, padding: "10px", textAlign: "center", background: "#fff" }}>
              <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>코랄</p>
              <p style={{ fontSize: "18px", fontWeight: "bold", margin: "4px 0 0 0" }}>{currentUser.coral}</p>
            </div>
            <div className="sunken-panel" style={{ flex: 1, padding: "10px", textAlign: "center", background: "#fff" }}>
              <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>탐사데이터</p>
              <p style={{ fontSize: "18px", fontWeight: "bold", margin: "4px 0 0 0" }}>{currentUser.research_data}</p>
            </div>
          </div>

          {/* 활동 로그 (스크롤 가능한 영역) */}
          <fieldset>
            <legend>시스템 로그</legend>
            <div className="sunken-panel" style={{ height: "150px", overflowY: "scroll", padding: "6px", background: "#fff" }}>
              {activityLogsLoading ? (
                <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>로딩 중...</p>
              ) : activityLogs.length === 0 ? (
                <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>최근 활동 내역이 없습니다.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {activityLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "4px", verticalAlign: "top", width: "30px", textAlign: "center" }}>
                          {log.reward?.includes('코랄') ? '💎' : log.reward?.includes('탐사') ? '⚡' : '📜'}
                        </td>
                        <td style={{ padding: "4px" }}>
                          <div style={{ fontWeight: "bold", fontSize: "12px" }}>{log.title}</div>
                          <div style={{ fontSize: "11px", color: "#666" }}>{log.description}</div>
                        </td>
                        <td style={{ padding: "4px", textAlign: "right", whiteSpace: "nowrap" }}>
                          {log.reward && <div style={{ color: "blue", fontSize: "12px" }}>{log.reward}</div>}
                          <div style={{ fontSize: "10px", color: "#888" }}>{log.time}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
