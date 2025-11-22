import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AppContext';
import { get } from "../../utils/api";

// API 응답 데이터 타입 정의
interface CompletionStatus {
  completed_count: number;
  required_count: number;
  total_count: number;
  completion_rate: number;
  is_achievable: boolean;
  completion_condition_text: string;
}

interface MyStatus {
  student_id: number;
  student_name: string;
  is_completed: boolean;
  completed_at: string | null;
  status_text: string;
}

interface CompletedStudent {
  student_id: number;
  student_name: string;
  completed_at: string;
}

interface IncompleteStudent {
  student_id: number;
  student_name: string;
  status_text: string;
}

interface QuestDetailData {
  quest_id: number;
  template: string;
  title: string;
  content: string;
  status: string;
  reward_coral: number;
  reward_research_data: number;
  deadline: string;
  created_at: string;
  completion_status: CompletionStatus;
  my_status: MyStatus;
  completed_students: CompletedStudent[];
  incomplete_students: IncompleteStudent[];
}

interface QuestDetailPageProps {
  quest: {
    id: number;
    title?: string;
  };
  onBack: () => void;
}

function formatDateTime(isoString: string | null) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function QuestDetailPage({ quest, onBack }: QuestDetailPageProps) {
  const { user, isAuthenticated, userType, access_token } = useAuth();

  const [questDetail, setQuestDetail] = useState<QuestDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user || !access_token) return;

    const fetchQuestDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await get(`/api/v1/quests/group/${quest.id}/student`);

        if (!response.ok) {
          throw new Error('퀘스트 상세 정보를 불러오는데 실패했습니다.');
        }

        const result = await response.json();
        if (result.success) {
          setQuestDetail(result.data);
        } else {
          throw new Error(result.message || '데이터를 불러오지 못했습니다.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestDetail();
  }, [quest.id, isAuthenticated, user, access_token]);

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-6">로그인 정보 확인 중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">접근 권한이 없습니다.</div>;
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error || !questDetail) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error || '데이터를 찾을 수 없습니다.'}</p>
        <button onClick={onBack}>← 뒤로가기</button>
      </div>
    );
  }

  const { completion_status, my_status } = questDetail;

  return (
    <div className="p-4 space-y-6 max-w-screen-xl mx-auto">
      {/* 상단 네비게이션 */}
      <div style={{ marginBottom: "10px" }}>
        <button onClick={onBack} style={{ minWidth: "80px" }}>
          ← 뒤로가기
        </button>
      </div>

      {/* 퀘스트 상세 정보 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">퀘스트 상세 정보</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button aria-label="Close" onClick={onBack} />
          </div>
        </div>
        <div className="window-body">
          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>{questDetail.title}</h4>
            <p style={{ margin: 0, color: "#666", whiteSpace: "pre-wrap" }}>{questDetail.content}</p>
            <div style={{ marginTop: "8px", fontSize: "12px", color: "#888" }}>
              마감일: {questDetail.deadline}
            </div>
          </div>

          <fieldset style={{ padding: "10px", marginBottom: "10px" }}>
            <legend>진행 현황</legend>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
              <span>달성률 ({completion_status.completion_condition_text})</span>
              <span>{completion_status.completed_count}/{completion_status.total_count}명 ({completion_status.completion_rate}%)</span>
            </div>
            <div className="progress-indicator segmented" style={{ width: "100%", height: "20px", border: "2px inset #dfdfdf" }}>
              <div
                className="progress-indicator-bar"
                style={{
                  width: `${completion_status.completion_rate}%`,
                  backgroundColor: "transparent",
                  backgroundImage: "linear-gradient(90deg, #000080 0 16px, transparent 0 2px)"
                }}
              />
            </div>
            <div style={{ textAlign: "right", fontSize: "11px", marginTop: "4px", color: completion_status.is_achievable ? "green" : "red" }}>
              {completion_status.is_achievable ? "달성 가능" : "달성 불가"}
            </div>
          </fieldset>

          {/* 내 상태 표시 */}
          <div className="status-bar">
            <p className="status-bar-field">내 상태</p>
            <p className="status-bar-field" style={{ textAlign: "right", fontWeight: "bold", color: my_status.is_completed ? "blue" : "red" }}>
              {my_status.status_text} {my_status.completed_at && `(${formatDateTime(my_status.completed_at)})`}
            </p>
          </div>
        </div>
      </div>

      {/* 완료한 학생 목록 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">완료한 학생 목록 ({questDetail.completed_students.length}명)</div>
        </div>
        <div className="window-body">
          <div className="sunken-panel" style={{ height: "200px", overflowY: "auto", background: "#fff", padding: "5px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "4px", borderBottom: "1px solid #000" }}>이름</th>
                  <th style={{ textAlign: "right", padding: "4px", borderBottom: "1px solid #000" }}>완료 시간</th>
                </tr>
              </thead>
              <tbody>
                {questDetail.completed_students.map((student) => (
                  <tr key={student.student_id}>
                    <td style={{ padding: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "16px", height: "16px", background: "#e0e0e0", border: "1px solid #808080", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>S</div>
                        {student.student_name}
                        {student.student_id === Number(user.id) && <span style={{ fontSize: "10px", color: "blue" }}>(나)</span>}
                      </div>
                    </td>
                    <td style={{ padding: "4px", textAlign: "right", fontSize: "12px", color: "#666" }}>
                      {formatDateTime(student.completed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 미완료 학생 목록 윈도우 (있는 경우만 표시) */}
      {questDetail.incomplete_students.length > 0 && (
        <div className="window" style={{ width: "100%" }}>
          <div className="title-bar">
            <div className="title-bar-text">미완료 학생 목록 ({questDetail.incomplete_students.length}명)</div>
          </div>
          <div className="window-body">
            <div className="sunken-panel" style={{ maxHeight: "150px", overflowY: "auto", background: "#fff", padding: "5px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {questDetail.incomplete_students.map((student) => (
                  <li key={student.student_id} style={{ padding: "4px", borderBottom: "1px dotted #ccc", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "16px", height: "16px", background: "#ffcccc", border: "1px solid #ff0000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "red" }}>!</div>
                      {student.student_name}
                      {student.student_id === Number(user.id) && <span style={{ fontSize: "10px", color: "red" }}>(나)</span>}
                    </div>
                    <span style={{ color: "red", fontSize: "12px" }}>{student.status_text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
