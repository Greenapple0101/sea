import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { useAuth, StudentUser } from "../../contexts/AppContext";

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: string;
  type: 'contribution' | 'first' | 'last' | 'dice' | 'other';
}

interface ContributionData {
  totalContribution: number;
  rank: number;
  totalParticipants: number;
  weeklyContribution: number;
  achievements: Achievement[];
}

export function StudentProfile() {
  const { user, isAuthenticated, userType } = useAuth();

  const [showTitleLog, setShowTitleLog] = useState(false);
  const [showCollection, setShowCollection] = useState(false);

  // 예시 데이터
  const contributionData: ContributionData = {
    totalContribution: 1250,
    rank: 3,
    totalParticipants: 45,
    weeklyContribution: 280,
    achievements: [
      {
        id: '1',
        title: '첫 기여자',
        description: '레이드에 첫 번째로 기여한 사용자',
        earnedDate: '2024-03-10',
        type: 'first'
      },
      {
        id: '2',
        title: '주사위 행운아',
        description: '주사위에서 6이 나온 사용자',
        earnedDate: '2024-03-12',
        type: 'dice'
      },
      {
        id: '3',
        title: '열심히 공부하는 학생',
        description: '일주일 동안 매일 퀘스트 완료',
        earnedDate: '2024-03-15',
        type: 'other'
      }
    ]
  };

  const questCompletionRate = 85; // 85% 완료율

  const getBadgeByType = (type: Achievement['type']) => {
    switch (type) {
      case 'contribution':
        return <Badge className="bg-gray-400">기여도</Badge>;
      case 'first':
        return <Badge className="bg-gray-400">선발대</Badge>;
      case 'last':
        return <Badge className="bg-gray-400">막차</Badge>;
      case 'dice':
        return <Badge className="bg-gray-400">행운</Badge>;
      default:
        return <Badge className="bg-gray-400">특별</Badge>;
    }
  };
  
  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-6">로그인 정보 확인 중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">접근 권한이 없습니다.</div>;
  }

  const currentUser = user as StudentUser;

  return (
    <div className="p-4 space-y-6 pb-20 max-w-screen-xl mx-auto" style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh" }}>
      {/* 프로필 헤더 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">&nbsp;프로필</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button aria-label="Close" />
          </div>
        </div>
        <div className="window-body">
          <div style={{ textAlign: "center" }}>
            {/* 대표 물고기 */}
            <div className="sunken-panel" style={{
              width: "100px", height: "100px", margin: "0 auto 15px auto",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#c0c0c0", borderRadius: "50%"
            }}>
              <span style={{ fontSize: "40px" }}>🐟</span>
            </div>

            {/* 사용자 정보 */}
            <h2 style={{ margin: "5px 0", fontWeight: "bold" }}>{currentUser.real_name}</h2>
            <p style={{ fontSize: "12px", color: "#666", margin: "5px 0" }}>@{currentUser.username}</p>
            {currentUser.invite_code && (
              <p style={{ fontSize: "12px", color: "#666", margin: "5px 0" }}>초대 코드: {currentUser.invite_code}</p>
            )}

            {/* 대표 칭호 */}
            <div style={{ marginTop: "10px" }}>
              <Badge className="bg-black text-white">
                {contributionData.achievements[0]?.title || '새내기 학습자'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 스탯 정보 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">퀘스트 달성률</div>
        </div>
        <div className="window-body text-center">
          <p style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>현재 퀘스트 달성률</p>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>{questCompletionRate}%</p>
        </div>
      </div>

      {/* 기여도 데이터 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">기여도 기록</div>
        </div>
        <div className="window-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
            <div className="sunken-panel" style={{ padding: "10px", textAlign: "center", background: "var(--color-white)" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>총 기여도</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "18px", fontWeight: "bold" }}>{contributionData.totalContribution.toLocaleString()}</p>
            </div>
            <div className="sunken-panel" style={{ padding: "10px", textAlign: "center", background: "var(--color-white)" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>현재 순위</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "18px", fontWeight: "bold" }}>
                {contributionData.rank}위 / {contributionData.totalParticipants}명
              </p>
            </div>
          </div>

          <fieldset style={{ padding: "10px" }}>
            <legend>이번 주 기여도</legend>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
              <span>{contributionData.weeklyContribution}</span>
              <span>500</span>
            </div>
            <div className="progress-indicator segmented" style={{ width: "100%", height: "20px" }}>
              <div
                className="progress-indicator-bar"
                style={{
                  width: `${(contributionData.weeklyContribution / 500) * 100}%`,
                  background: "linear-gradient(90deg, #4a90e2 0 16px, transparent 0 2px)",
                  backgroundColor: "transparent"
                }}
              />
            </div>
          </fieldset>
        </div>
      </div>

      {/* 칭호 로그 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">획득한 칭호</div>
          <div className="title-bar-controls">
            <button aria-label="Help" onClick={() => setShowTitleLog(true)} />
          </div>
        </div>
        <div className="window-body">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {contributionData.achievements.slice(0, 3).map((achievement) => (
              <fieldset key={achievement.id} style={{ padding: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {getBadgeByType(achievement.type)}
                    <span style={{ fontWeight: "bold" }}>{achievement.title}</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "#666" }}>{achievement.earnedDate}</span>
                </div>
              </fieldset>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <button onClick={() => setShowTitleLog(true)} style={{ minWidth: "100px" }}>
              전체 보기
            </button>
          </div>
        </div>
      </div>

      {/* 액션 버튼 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="window-body">
          <button
            onClick={() => setShowCollection(true)}
            style={{ width: "100%", height: "40px", fontWeight: "bold" }}
          >
            도감 보기
          </button>
        </div>
      </div>

      {/* [모달] 칭호 로그 */}
      {showTitleLog && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="window" style={{ width: '90%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="title-bar">
              <div className="title-bar-text">획득한 칭호 목록</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setShowTitleLog(false)} />
              </div>
            </div>
            <div className="window-body" style={{ overflowY: 'auto', flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {contributionData.achievements.map((achievement) => (
                  <fieldset key={achievement.id} style={{ padding: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {getBadgeByType(achievement.type)}
                        <span style={{ fontWeight: "bold" }}>{achievement.title}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: "#666" }}>{achievement.earnedDate}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>{achievement.description}</p>
                  </fieldset>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <button onClick={() => setShowTitleLog(false)} style={{ minWidth: "80px" }}>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* [모달] 도감 */}
      {showCollection && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="window" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="title-bar">
              <div className="title-bar-text">내 물고기 컬렉션</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setShowCollection(false)} />
              </div>
            </div>
            <div className="window-body text-center">
              <p style={{ fontSize: "12px", color: "#666", marginBottom: "15px" }}>현재 수집한 물고기: 5종</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "15px" }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="sunken-panel" style={{
                    width: "80px", height: "80px", margin: "0 auto",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "#c0c0c0"
                  }}>
                    <span style={{ fontSize: "30px" }}>🐟</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowCollection(false)} style={{ minWidth: "100px" }}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
