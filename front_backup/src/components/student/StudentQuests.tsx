import { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { useAuth, StudentUser } from "../../contexts/AppContext";
import { Loader2, File as FileIcon, X } from 'lucide-react';
import { get, apiCall } from '../../utils/api';

interface MyPersonalQuest {
  assignment_id: number;
  quest_id: number;
  title: string;
  teacher_content: string;
  reward_coral_personal: number;
  reward_research_data_personal: number;
  status: "ASSIGNED" | "SUBMITTED" | "REJECTED" | "APPROVED" | "EXPIRED";
  created_at: string;
  submission?: {
    submitted_at?: string;
    comment?: string;
  };
}

const formatDateTime = (isoString: string | undefined) => {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (e) {
    return "날짜 오류";
  }
};

export function StudentQuests() {
  const { user, isAuthenticated, userType, access_token } = useAuth();

  const [activeQuests, setActiveQuests] = useState<MyPersonalQuest[]>([]);
  const [approvedQuests, setApprovedQuests] = useState<MyPersonalQuest[]>([]);
  const [expiredQuests, setExpiredQuests] = useState<MyPersonalQuest[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedQuest, setSelectedQuest] = useState<MyPersonalQuest | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

  const [submitText, setSubmitText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API로부터 퀘스트 목록을 불러오는 함수
  const fetchAllQuests = async () => {
    if (!access_token) return;

    setIsLoading(true);
    setError(null);

    try {
      const [activeRes, approvedRes, expiredRes] = await Promise.all([
        get('/api/v1/quests/personal/my?status=ACTIVE'),
        get('/api/v1/quests/personal/my?status=APPROVED'),
        get('/api/v1/quests/personal/my?status=EXPIRED')
      ]);

      if (!activeRes.ok || !approvedRes.ok || !expiredRes.ok) {
        throw new Error('퀘스트 목록을 불러오는 데 실패했습니다.');
      }

      const activeData = await activeRes.json();
      const approvedData = await approvedRes.json();
      const expiredData = await expiredRes.json();

      setActiveQuests(activeData.data.quests || []);
      setApprovedQuests(approvedData.data.quests || []);
      setExpiredQuests(expiredData.data.quests || []);

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userType === 'student' && access_token) {
      fetchAllQuests();
    } else if (!isAuthenticated) {
      setIsLoading(false);
      setError("로그인이 필요합니다.");
    }
  }, [isAuthenticated, userType, access_token]);

  const getStatusBadge = (status: MyPersonalQuest['status']) => {
    switch (status) {
      case 'ASSIGNED':
        return <Badge className="bg-blue-600 text-white">제출 필요</Badge>;
      case 'SUBMITTED':
        return <Badge className="bg-yellow-500 text-black">승인 대기중</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-600 text-white">반려됨 (재제출)</Badge>;
      case 'APPROVED':
        return <Badge className="bg-green-600 text-white">승인 완료</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-gray-500 text-white">만료됨</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusText = (status: MyPersonalQuest['status']) => {
    switch (status) {
      case 'ASSIGNED': return <span style={{ color: "blue", fontWeight: "bold" }}>[제출 필요]</span>;
      case 'SUBMITTED': return <span style={{ color: "yellow", fontWeight: "bold" }}>[승인 대기]</span>;
      case 'REJECTED': return <span style={{ color: "red", fontWeight: "bold" }}>[반려됨]</span>;
      case 'APPROVED': return <span style={{ color: "green", fontWeight: "bold" }}>[승인 완료]</span>;
      case 'EXPIRED': return <span style={{ color: "gray", fontWeight: "bold" }}>[만료됨]</span>;
      default: return <span>[{status}]</span>;
    }
  };

  const getButtonText = (status: MyPersonalQuest['status']) => {
    switch (status) {
      case 'ASSIGNED':
        return '제출하기';
      case 'REJECTED':
        return '다시 제출';
      case 'SUBMITTED':
        return '승인대기중';
      case 'APPROVED':
        return '코멘트 확인';
      case 'EXPIRED':
        return '만료됨';
    }
  };

  const isButtonDisabled = (status: MyPersonalQuest['status']) => {
    return status === 'SUBMITTED' || status === 'EXPIRED';
  };

  const handleQuestAction = (quest: MyPersonalQuest) => {
    setSelectedQuest(quest);
    if (quest.status === 'ASSIGNED' || quest.status === 'REJECTED') {
      // 반려된 경우, 이전 제출 내용을 불러올 수 있으나,
      // API 명세에 재제출 시 이전 내용 로드 기능이 없으므로 새로 입력
      setSubmitText('');
      setAttachedFiles([]);
      setSubmitError(null);
      setIsSubmitOpen(true);
    } else if (quest.status === 'APPROVED') {
      setIsCommentOpen(true);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFiles([file]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedQuest || !access_token) return;
    if (!submitText.trim() && attachedFiles.length === 0) {
      setSubmitError('제출 내용이나 첨부파일 중 하나는 필수입니다.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.append('content', submitText);
    if (attachedFiles.length > 0) {
      formData.append('attachment', attachedFiles[0]);
    }

    const method = selectedQuest.status === 'REJECTED' ? 'PUT' : 'POST';
    const endpoint = `/api/v1/quests/personal/${selectedQuest.assignment_id}/submit`;

    try {
      // apiCall이 FormData를 자동으로 감지하여 적절한 Content-Type을 설정
      const response = await apiCall(endpoint, {
        method: method,
        body: formData
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || '제출에 실패했습니다.');
      }

      alert(data.message || '퀘스트가 제출되었습니다!');
      setIsSubmitOpen(false);
      setSubmitText('');
      setAttachedFiles([]);
      fetchAllQuests(); // 퀘스트 목록 새로고침

    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>퀘스트 목록을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">오류: {error}</div>;
  }

  return (
    <div className="p-4 space-y-6 pb-20 max-w-screen-xl mx-auto" style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh" }}>

      {/* 메인 퀘스트 목록 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">오늘의 퀘스트</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button aria-label="Close" />
          </div>
        </div>

        <div className="window-body">
          <div style={{ textAlign: "center", marginBottom: "15px", fontWeight: "bold" }}>
            수행할 퀘스트 목록
          </div>

          <div className="space-y-4">
            {activeQuests.length === 0 && (
              <div className="sunken-panel" style={{ padding: "20px", textAlign: "center" }}>
                진행 중인 퀘스트가 없습니다.
              </div>
            )}

            {activeQuests.map((quest) => (
              <fieldset key={quest.assignment_id} style={{ marginBottom: "10px", padding: "10px" }}>
                <legend style={{ fontWeight: "bold" }}>{quest.title}</legend>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: "4px" }}>
                      {getStatusBadge(quest.status)}
                      <span style={{ marginLeft: "8px", fontSize: "12px", color: "#666" }}>
                        {quest.status === 'SUBMITTED' ? `제출: ${formatDateTime(quest.submission?.submitted_at)}` : `생성: ${formatDateTime(quest.created_at)}`}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px" }}>
                      보상: <span style={{ color: "blue" }}>C {quest.reward_coral_personal}</span> / <span style={{ color: "purple" }}>R {quest.reward_research_data_personal}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuestAction(quest)}
                    disabled={isButtonDisabled(quest.status)}
                    style={{ minWidth: "80px", fontWeight: "bold" }}
                  >
                    {getButtonText(quest.status)}
                  </button>
                </div>
              </fieldset>
            ))}
          </div>

          {/* 하단 버튼들 */}
          <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={() => setIsExpiredModalOpen(true)} style={{ minWidth: "140px" }}>
              마감된 퀘스트 ({expiredQuests.length})
            </button>
            <button onClick={() => setIsCompletedModalOpen(true)} style={{ minWidth: "140px" }}>
              완료된 퀘스트 ({approvedQuests.length})
            </button>
          </div>
        </div>
      </div>

      {/* 내 재화 현황 윈도우 */}
      <div className="window" style={{ width: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">보유 재화</div>
        </div>
        <div className="window-body">
          <div style={{ display: "flex", gap: "10px" }}>
            <div className="sunken-panel" style={{ flex: 1, padding: "10px", textAlign: "center", background: "var(--color-white)" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>코랄</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "18px", fontWeight: "bold" }}>{currentUser.coral}</p>
            </div>
            <div className="sunken-panel" style={{ flex: 1, padding: "10px", textAlign: "center", background: "var(--color-white)" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>탐사데이터</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "18px", fontWeight: "bold" }}>{currentUser.research_data}</p>
            </div>
          </div>
        </div>
      </div>

      {/* [모달] 완료된 퀘스트 목록 */}
      {isCompletedModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="window" style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="title-bar">
              <div className="title-bar-text">승인 완료 목록</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setIsCompletedModalOpen(false)} />
              </div>
            </div>
            <div className="window-body" style={{ overflowY: 'auto', flex: 1 }}>
              <div className="space-y-3">
                {approvedQuests.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>완료된 퀘스트가 없습니다.</p>}
                {approvedQuests.map((quest) => (
                  <fieldset key={quest.assignment_id} style={{ padding: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: "bold" }}>{quest.title}</div>
                        <div style={{ fontSize: "12px", color: "#666" }}>완료일: {formatDateTime(quest.submission?.submitted_at)}</div>
                      </div>
                      <button onClick={() => { setSelectedQuest(quest); setIsCommentOpen(true); }}>
                        코멘트
                      </button>
                    </div>
                  </fieldset>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <button onClick={() => setIsCompletedModalOpen(false)}>닫기</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* [모달] 마감된 퀘스트 목록 */}
      {isExpiredModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="window" style={{ width: '90%', maxWidth: '600px' }}>
            <div className="title-bar">
              <div className="title-bar-text">마감된 퀘스트</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setIsExpiredModalOpen(false)} />
              </div>
            </div>
            <div className="window-body">
              <div className="sunken-panel" style={{ height: '200px', overflowY: 'auto', background: 'var(--color-white)', padding: '8px' }}>
                {expiredQuests.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>마감된 퀘스트가 없습니다.</p>}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {expiredQuests.map((quest) => (
                    <li key={quest.assignment_id} style={{ borderBottom: '1px dotted #ccc', padding: '4px 0' }}>
                      <span style={{ color: '#666' }}>[만료]</span> {quest.title}
                      <span style={{ float: 'right', fontSize: '11px' }}>{formatDateTime(quest.created_at)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <button onClick={() => setIsExpiredModalOpen(false)}>확인</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* [모달] 코멘트 확인 */}
      {isCommentOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="window" style={{ width: '90%', maxWidth: '500px' }}>
            <div className="title-bar">
              <div className="title-bar-text">선생님 피드백</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setIsCommentOpen(false)} />
              </div>
            </div>
            <div className="window-body">
              <p style={{ fontWeight: "bold", marginBottom: "5px" }}>{selectedQuest?.title}</p>
              <p style={{ fontSize: "12px", marginBottom: "15px" }}>제출일: {formatDateTime(selectedQuest?.submission?.submitted_at)}</p>

              <fieldset style={{ padding: "10px", backgroundColor: "var(--color-white)" }}>
                <legend>Teacher's Comment</legend>
                <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                  {selectedQuest?.submission?.comment || "작성된 코멘트가 없습니다."}
                </p>
              </fieldset>

              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <button onClick={() => setIsCommentOpen(false)} style={{ minWidth: "80px" }}>확인</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* [모달] 퀘스트 제출 */}
      {isSubmitOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="window" style={{ width: '90%', maxWidth: '600px' }}>
            <div className="title-bar">
              <div className="title-bar-text">퀘스트 제출</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setIsSubmitOpen(false)} />
              </div>
            </div>
            <div className="window-body">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div style={{ marginBottom: "10px" }}>
                  <label style={{ fontWeight: "bold" }}>{selectedQuest?.title}</label>
                  <div className="sunken-panel" style={{ padding: "8px", marginTop: "4px", background: "#eee" }}>
                    {selectedQuest?.teacher_content}
                  </div>
                </div>

                {/* 반려 사유 */}
                {selectedQuest?.status === 'REJECTED' && (
                  <div style={{ border: "2px solid red", padding: "8px", marginBottom: "10px", backgroundColor: "#ffcccc" }}>
                    <strong>[반려 사유]</strong><br />
                    {selectedQuest.submission?.comment || "사유가 없습니다. 다시 제출해주세요."}
                  </div>
                )}

                <div className="field-row-stacked" style={{ marginBottom: "10px" }}>
                  <label>수행 내용</label>
                  <textarea
                    value={submitText}
                    onChange={(e) => setSubmitText(e.target.value)}
                    rows={5}
                    style={{ width: "100%" }}
                  ></textarea>
                </div>

                <div className="field-row-stacked" style={{ marginBottom: "10px" }}>
                  <label>첨부파일 (10MB 이하)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      id="file-upload"
                      accept=".pdf, .jpg, .jpeg, .png, .doc, .docx"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                {attachedFiles.length > 0 && (
                  <div style={{ marginBottom: "10px", padding: "4px", border: "1px dotted black" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                        <FileIcon size={14} />
                        <span>{attachedFiles[0].name}</span>
                      </div>
                      <button type="button" onClick={() => handleRemoveFile(0)} style={{ padding: "0 4px" }}>X</button>
                    </div>
                  </div>
                )}

                {submitError && (
                  <p style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>{submitError}</p>
                )}

                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "15px" }}>
                  <button type="submit" disabled={isSubmitting} style={{ minWidth: "100px", fontWeight: "bold" }}>
                    {isSubmitting ? "전송 중..." : (selectedQuest?.status === 'REJECTED' ? '다시 제출' : '제출하기')}
                  </button>
                  <button type="button" onClick={() => setIsSubmitOpen(false)} style={{ minWidth: "80px" }}>
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}