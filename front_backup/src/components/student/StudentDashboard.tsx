import { useState, useEffect } from 'react';
import { QuestDetailPage } from './QuestDetailPage';
import { useAuth, StudentUser } from '../../contexts/AppContext';
import { get } from '../../utils/api';
import { Loader2 } from 'lucide-react';

// --- API Interfaces ---

interface StudentInfo {
  student_id: number;
  username: string;
  real_name: string;
  nickname: string;
  class_name: string;
  coral: number;
  research_data: number;
}

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  content: string;
  created_at: string;
  time_ago: string;
}

interface Notifications {
  announcements: NotificationItem[];
  events: NotificationItem[];
}

interface ActiveRaid {
  raid_id: number;
  raid_name: string;
  template: string;
  boss_hp: {
    current: number;
    total: number;
    percentage: number;
  };
  remaining_time: string;
  participants: number;
}

interface GroupQuest {
  quest_id: number;
  title: string;
  description: string;
  completed_count: number;
  total_count: number;
  completion_rate: number;
  my_status: string;
  incomplete_students: string[];
}

interface RecentActivity {
  log_id: number;
  type: string;
  icon: string;
  title: string;
  description: string;
  reward: string;
  created_at: string;
  time_ago: string;
}

interface DashboardData {
  student_info: StudentInfo;
  notifications: Notifications;
  active_raid: ActiveRaid | null;
  group_quests: GroupQuest[];
  recent_activities: RecentActivity[];
}

export function StudentDashboard() {
  const { user, isAuthenticated, userType, access_token } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedQuest, setSelectedQuest] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user || !access_token) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 백엔드에 통합 대시보드 API가 없으므로 여러 API를 조합
        const currentUser = user as StudentUser;
        
        // 기본 학생 정보는 이미 user context에 있음
        const student_info: StudentInfo = {
          student_id: parseInt(currentUser.id),
          username: currentUser.username,
          real_name: currentUser.real_name,
          nickname: currentUser.nickname,
          class_name: '', // TODO: user context에서 가져오기
          coral: currentUser.coral,
          research_data: currentUser.research_data
        };

        // 여러 API를 병렬로 호출
        const [raidRes, noticesRes, groupQuestsRes, activityLogsRes] = await Promise.all([
          get('/api/v1/raids/my-raid').catch(() => null),
          get('/api/v1/notices/events').catch(() => null),
          get('/api/v1/quests/group/my-class').catch(() => null),
          get('/api/v1/activity-logs').catch(() => null)
        ]);

        // 레이드 정보 처리
        let active_raid: ActiveRaid | null = null;
        if (raidRes && raidRes.ok) {
          const raidData = await raidRes.json();
          if (raidData.data) {
            const raid = raidData.data;
            active_raid = {
              raid_id: raid.raid_id,
              raid_name: raid.raid_name || '레이드',
              template: raid.boss_type || 'BOSS',
              boss_hp: {
                current: raid.current_boss_hp || 0,
                total: raid.total_boss_hp || 0,
                percentage: raid.total_boss_hp > 0 
                  ? Math.round((raid.current_boss_hp / raid.total_boss_hp) * 100) 
                  : 0
              },
              remaining_time: raid.remaining_time || '계산 중...',
              participants: raid.participants || 0
            };
          }
        }

        // 공지 및 이벤트 처리
        const notifications: Notifications = {
          announcements: [],
          events: []
        };
        if (noticesRes && noticesRes.ok) {
          const noticesData = await noticesRes.json();
          if (noticesData.data) {
            notifications.events = noticesData.data.map((n: any) => ({
              id: n.notice_id,
              type: n.notice_type,
              title: n.title,
              content: n.content || '',
              created_at: n.created_at,
              time_ago: n.time_ago || ''
            }));
          }
        }

        // 단체 퀘스트 처리
        const group_quests: GroupQuest[] = [];
        if (groupQuestsRes && groupQuestsRes.ok) {
          const questsData = await groupQuestsRes.json();
          if (questsData.data) {
            group_quests.push(...questsData.data.map((q: any) => ({
              quest_id: q.group_quest_id,
              title: q.title,
              description: q.description || '',
              completed_count: q.completed_count || 0,
              total_count: q.total_count || 0,
              completion_rate: q.total_count > 0 
                ? Math.round((q.completed_count / q.total_count) * 100) 
                : 0,
              my_status: q.my_status || '미완료',
              incomplete_students: q.incomplete_students || []
            })));
          }
        }

        // 활동 로그 처리
        const recent_activities: RecentActivity[] = [];
        if (activityLogsRes && activityLogsRes.ok) {
          const logsData = await activityLogsRes.json();
          if (logsData.data) {
            recent_activities.push(...logsData.data.map((log: any) => ({
              log_id: log.log_id,
              type: log.log_type,
              icon: log.icon || '📜',
              title: log.title || '',
              description: log.description || '',
              reward: log.reward || '',
              created_at: log.created_at,
              time_ago: log.time_ago || ''
            })));
          }
        }

        // 대시보드 데이터 조합
        const dashboardData: DashboardData = {
          student_info,
          notifications,
          active_raid,
          group_quests,
          recent_activities
        };

        setDashboardData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, user, access_token]);

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-6">로그인 정보 확인 중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">접근 권한이 없습니다.</div>;
  }

  const currentUser = user as StudentUser;

  // 퀘스트 상세 페이지가 선택된 경우
  if (selectedQuest) {
    return (
      <QuestDetailPage
        quest={selectedQuest}
        onBack={() => setSelectedQuest(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>오류: {error || '데이터를 불러올 수 없습니다.'}</p>
      </div>
    );
  }

  const { student_info, notifications, active_raid, group_quests, recent_activities } = dashboardData;

  const allNotifications = [
    ...notifications.announcements.map(n => ({ ...n, category: '공지' })),
    ...notifications.events.map(e => ({ ...e, category: '이벤트' }))
  ];

  return (
    <div className="p-4 space-y-6 min-h-screen pb-20 max-w-screen-xl mx-auto" style={{ backgroundColor: "var(--bg-color)" }}>
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
          <div className="sunken-panel" style={{ padding: "10px", background: "var(--color-white)", maxHeight: "150px", overflowY: "auto" }}>
            {allNotifications.length > 0 ? (
              <ul className="tree-view" style={{ border: "none", boxShadow: "none", margin: 0, padding: 0 }}>
                {allNotifications.map((item) => (
                  <li key={`${item.category}-${item.id}`} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dotted #888" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                      <span style={{ fontWeight: "bold", color: item.category === '공지' ? "blue" : "red", whiteSpace: "nowrap" }}>
                        [{item.category}]
                      </span>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span>
                    </span>
                    <span style={{ fontSize: "12px", color: "#666", whiteSpace: "nowrap", marginLeft: "8px" }}>{item.time_ago}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ textAlign: "center", color: "#666" }}>새로운 소식이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. 레이드 현황 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">&nbsp;현재 레이드: {active_raid ? active_raid.raid_name : '진행 중 아님'}</div>
          <div className="title-bar-controls">
            <button aria-label="Help" />
          </div>
        </div>
        <div className="window-body">
          {active_raid ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "15px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>BOSS: {active_raid.template}</h4>

                {/* HP 정보 & 프로그레스 바 (98.css style) */}
                <div className="field-row" style={{ justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>HP Status</span>
                  <span>{active_raid.boss_hp.current.toLocaleString()} / {active_raid.boss_hp.total.toLocaleString()}</span>
                </div>
                <div className="progress-indicator segmented" style={{ width: "100%", height: "24px" }}>
                  <div
                    className="progress-indicator-bar"
                    style={{ width: `${active_raid.boss_hp.percentage}%` }}
                  />
                </div>
              </div>

              {/* 레이드 상세 정보 (Grid) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="status-bar">
                  <p className="status-bar-field">남은 시간</p>
                  <p className="status-bar-field" style={{ textAlign: "right" }}>{active_raid.remaining_time}</p>
                </div>
                <div className="status-bar">
                  <p className="status-bar-field">참여자</p>
                  <p className="status-bar-field" style={{ textAlign: "right" }}>{active_raid.participants}명</p>
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
          <div className="space-y-4">
            {group_quests.length > 0 ? (
              group_quests.map((quest) => (
                <fieldset key={quest.quest_id} style={{ padding: "10px", marginBottom: "10px" }}>
                  <legend
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                    onClick={() => setSelectedQuest({ id: quest.quest_id, title: quest.title })}
                  >
                    {quest.title} (상세보기 ↗)
                  </legend>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <span>{quest.description}</span>
                    <span>{quest.completed_count}/{quest.total_count}명</span>
                  </div>

                  {/* 미니 프로그레스 바 */}
                  <div className="progress-indicator" style={{ height: "16px", width: "100%" }}>
                    <div
                      className="progress-indicator-bar"
                      style={{ width: `${quest.completion_rate}%`, backgroundColor: "#000080" }}
                    />
                  </div>

                  {quest.incomplete_students.length > 0 && (
                    <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
                      <span style={{ color: "red" }}>미완료:</span> {quest.incomplete_students.join(", ")}
                    </div>
                  )}
                </fieldset>
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#666" }}>진행 중인 단체 퀘스트가 없습니다.</p>
            )}
          </div>
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
            <div className="sunken-panel" style={{ flex: 1, padding: "10px", textAlign: "center", background: "var(--color-white)" }}>
              <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>코랄</p>
              <p style={{ fontSize: "18px", fontWeight: "bold", margin: "4px 0 0 0" }}>{currentUser.coral}</p>
            </div>
            <div className="sunken-panel" style={{ flex: 1, padding: "10px", textAlign: "center", background: "var(--color-white)" }}>
              <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>탐사데이터</p>
              <p style={{ fontSize: "18px", fontWeight: "bold", margin: "4px 0 0 0" }}>{currentUser.research_data}</p>
            </div>
          </div>

          {/* 활동 로그 (스크롤 가능한 영역) */}
          <fieldset>
            <legend>시스템 로그</legend>
            <div className="sunken-panel" style={{ height: "150px", overflowY: "scroll", padding: "6px", background: "var(--color-white)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {recent_activities.length > 0 ? (
                    recent_activities.map((log) => (
                      <tr key={log.log_id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "4px", verticalAlign: "top", width: "30px", textAlign: "center" }}>
                          {log.icon === 'C' ? '💎' : log.icon === 'E' ? '⚡' : '📜'}
                        </td>
                        <td style={{ padding: "4px" }}>
                          <div style={{ fontWeight: "bold", fontSize: "12px" }}>{log.title}</div>
                          <div style={{ fontSize: "11px", color: "#666" }}>{log.description}</div>
                        </td>
                        <td style={{ padding: "4px", textAlign: "right", whiteSpace: "nowrap" }}>
                          {log.reward && <div style={{ color: "blue", fontSize: "12px" }}>{log.reward}</div>}
                          <div style={{ fontSize: "10px", color: "#888" }}>{log.time_ago}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ padding: "10px", textAlign: "center", color: "#666" }}>
                        최근 활동 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
}