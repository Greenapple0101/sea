import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { useEffect, useState } from 'react';
import { useAuth, StudentUser } from '../../contexts/AppContext';
import { get } from '../../utils/api';

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

    // TODO: 백엔드 API 연동 준비
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

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen pb-20 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 이벤트 & 공지 (맨 위) */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-medium text-black">이벤트 & 공지</h3>
          {eventsLoading ? (
            <p className="text-sm text-gray-500">로딩 중...</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-gray-500">이벤트 및 공지가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${event.type === '이벤트' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'}`}>
                      {event.type}
                    </span>
                    <span className="text-sm text-black">{event.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">{event.time}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 현재 레이드 보스 HP 요약 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-6">
          {raidLoading ? (
            <p>레이드 정보를 불러오는 중...</p>
          ) : raidError ? (
            <p className="text-sm text-gray-500">{raidError}</p>
          ) : raidSummary ? (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-black mb-2">{raidSummary.raid_name}</h3>
                <p className="text-lg text-gray-600">{raidSummary.template_display_name}</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">HP</span>
                  <span className="text-black font-semibold">
                    {raidSummary.current_boss_hp.toLocaleString()} / {raidSummary.total_boss_hp.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={(raidSummary.current_boss_hp / raidSummary.total_boss_hp) * 100}
                  className="h-6 bg-gray-200"
                  style={{
                    '--progress-background': '#000000',
                    '--progress-foreground': '#333333'
                  } as React.CSSProperties}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                  <span className="text-sm text-gray-600 font-medium">남은 시간</span>
                  <p className="text-lg text-black font-bold mt-1">
                    {raidSummary.remaining_seconds > 0
                      ? `${Math.floor(raidSummary.remaining_seconds / 3600)}시간`
                      : '종료됨'}
                  </p>
                </div>
                <div className="text-center p-4 bg-black rounded-lg border-2 border-black">
                  <span className="text-sm text-white font-medium">상태</span>
                  <p className="text-lg text-white font-bold mt-1">{raidSummary.status}</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">진행 중인 레이드가 없습니다.</p>
          )}
        </CardContent>
      </Card>

      {/* 단체 퀘스트 달성률 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-medium text-black">현재 단체 퀘스트 달성률</h3>
          {groupQuestsLoading ? (
            <p className="text-sm text-gray-500">로딩 중...</p>
          ) : groupQuests.length === 0 ? (
            <p className="text-sm text-gray-500">진행 중인 단체 퀘스트가 없습니다.</p>
          ) : (
            groupQuests.map((quest) => (
              <div key={quest.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-black">{quest.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{quest.reward}</p>
                  </div>
                  <span className="text-xs text-gray-500">{quest.completed}/{quest.total}명</span>
                </div>
                <Progress
                  value={(quest.completed / quest.total) * 100}
                  className="h-2"
                />
                {quest.incomplete.length > 0 && (
                  <div className="text-xs text-gray-500">
                    미완료 학생: {quest.incomplete.join(', ')}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 내 현재 상태 */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4">
          <h3 className="font-medium text-black mb-4">내 현재 상태</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 border-2 border-gray-300 rounded">
              <p className="text-sm text-gray-600">코랄</p>
              <p className="text-xl font-medium text-black">{currentUser.coral}</p>
            </div>
            <div className="text-center p-3 border-2 border-gray-300 rounded">
              <p className="text-sm text-gray-600">탐사데이터</p>
              <p className="text-xl font-medium text-black">{currentUser.research_data}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 최근 활동 로그 (맨 밑) */}
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-medium text-black">최근 활동 로그</h3>
          {activityLogsLoading ? (
            <p className="text-sm text-gray-500">로딩 중...</p>
          ) : activityLogs.length === 0 ? (
            <p className="text-sm text-gray-500">활동 로그가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white">
                  <div>
                    <p className="text-sm font-medium text-black">{log.title}</p>
                    <p className="text-xs text-gray-600">{log.description}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-black font-semibold">{log.reward}</p>
                    <p className="text-gray-500">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}