import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { CheckCircle, X, Image as ImageIcon, ChevronDown, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAuth } from "../../contexts/AppContext";
import { get, post } from "../../utils/api";

interface Assignment {
  assignment_id: number;
  quest_id: number;
  title: string;
  student_id: number;
  student_name: string;
  class_name: string;
  submitted_at: string;
  reward_coral_personal: number;
  reward_research_data_personal: number;
  status: "SUBMITTED";
}

interface DetailedAssignment {
  assignment_id: number;
  quest: {
    quest_id: number;
    title: string;
    teacher_content: string;
  };
  student: {
    student_id: number;
    student_name: string;
    class_name: string;
  };
  reward_coral_personal: number;
  reward_research_data_personal: number;
  status: "SUBMITTED";
  submission: {
    submission_id: number;
    student_content: string;
    attachment_url: string | null; // 첨부파일은 null일 수 있음
    submitted_at: string;
    comment: string | null;
  };
}

function formatDateTime(isoString: string) {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}

export function QuestApprovalPageNew() {
  const { isAuthenticated, userType, access_token, currentClassId } = useAuth();
  const [pendingQuests, setPendingQuests] = useState<Assignment[]>([]);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQuestDetail, setSelectedQuestDetail] = useState<DetailedAssignment | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [customComment, setCustomComment] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [expandedQuestId, setExpandedQuestId] = useState<number | null>(null);

  const presetComments = [
    "잘했어요! 계속 이렇게 해주세요.",
    "수고했어요! 다음에도 기대할게요.",
    "훌륭합니다! 완벽하게 완료했네요.",
    "노력이 보여요. 조금만 더 신경쓰면 좋겠어요.",
  ];

  useEffect(() => {
    if (!isAuthenticated || userType !== 'teacher' || !access_token) {
      setIsLoading(false);
      setError("접근 권한이 없습니다.");
      return;
    }

    const fetchPendingQuests = async () => {
      setIsLoading(true);
      setError(null);

      let url = '/api/v1/quests/personal?status=SUBMITTED';
      if (currentClassId) {
        url += `&class_id=${currentClassId}`;
      }

      try {
        const response = await get(url);
        if (!response.ok) {
          throw new Error('승인 대기 목록을 불러오는 데 실패했습니다.');
        }
        const data = await response.json();

        setPendingQuests(data.data.assignments || []);
      } catch (err) {
        const message = (err instanceof Error) ? err.message : "알 수 없는 에러 발생";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingQuests();
  }, [isAuthenticated, userType, access_token, currentClassId]);

  const handleOpenDetailModal = async (assignmentId: number) => {
    setShowDetailModal(true);
    setIsModalLoading(true);
    setModalError(null);
    setSelectedQuestDetail(null);

    try {
      const response = await get(`/api/v1/quests/personal/${assignmentId}/detail`);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || '퀘스트 상세 정보를 불러오지 못했습니다.');
      }

      const data = await response.json();
      setSelectedQuestDetail(data.data);

    } catch (err) {
      const message = (err instanceof Error) ? err.message : "알 수 없는 에러 발생";
      setModalError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedQuestDetail(null);
    setCustomComment("");
    setModalError(null);
  };

  const handleApproveOrReject = async (action: 'approve' | 'reject') => {
    if (!selectedQuestDetail || !access_token) return;

    setIsSubmitting(true);
    const endpoint = `/api/v1/quests/personal/${selectedQuestDetail.assignment_id}/${action}`;

    try {
      const response = await post(endpoint, {
        comment: customComment || (action === 'approve' ? "잘했어요!" : "다시 확인해주세요.")
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || `${action} 처리에 실패했습니다.`);
      }

      if (action === 'approve') {
        setShowApprovalModal(true);
      } else {
        alert("퀘스트가 반려되었습니다.");
      }

      handleCloseDetailModal();
      setPendingQuests(prev => prev.filter(q => q.assignment_id !== selectedQuestDetail.assignment_id));

    } catch (error) {
      alert((error instanceof Error) ? error.message : "처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        승인 대기 목록을 불러오는 중...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">오류: {error}</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="border-b-2 border-gray-300 p-6">
        <h1 className="text-2xl font-bold">퀘스트 승인</h1>
        <p className="text-gray-600 mt-1">승인 대기 중: {pendingQuests.length}건</p>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="space-y-4 max-w-4xl">
          {pendingQuests.length === 0 && !isLoading && (
            <p>승인 대기 중인 퀘스트가 없습니다.</p>
          )}

          {pendingQuests.map((quest) => {
            const isExpanded = expandedQuestId === quest.assignment_id;
            const toggleExpansion = () => {
              if (isExpanded) {
                setExpandedQuestId(null);
              } else {
                setExpandedQuestId(quest.assignment_id);
              }
            };

            return (
              <Card key={quest.assignment_id} className="border-2 border-gray-300 rounded-lg">
                <CardContent className="p-4">
                  <div
                    className="cursor-pointer"
                    onClick={toggleExpansion}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg">{quest.student_name}</h4>
                          <Badge variant="outline" className="border-2 border-gray-300 rounded-lg">
                            {quest.class_name}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{quest.title}</p>
                      </div>
                      <Badge className="bg-gray-200 text-black border-2 border-gray-300 rounded-lg">
                        {quest.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">제출:</span> {formatDateTime(quest.submitted_at)}
                    </div>
                    <div className="flex justify-center mt-2">
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-300 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-600">보상:</span>
                          <span>코랄 {quest.reward_coral_personal}</span>
                          <span>탐사데이터 {quest.reward_research_data_personal}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                            onClick={() => handleOpenDetailModal(quest.assignment_id)}
                          >
                            상세보기/승인
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quest Detail Dialog */}
      <Dialog open={showDetailModal} onOpenChange={(isOpen: Boolean) => { if (!isOpen) handleCloseDetailModal(); }}>
        <DialogContent className="border-2 border-gray-300 rounded-lg max-w-2xl">
          <DialogHeader>
            <DialogTitle>퀘스트 승인</DialogTitle>
          </DialogHeader>

          {isModalLoading && (
            <div className="py-10 flex justify-center items-center">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              상세 내용을 불러오는 중...
            </div>
          )}

          {modalError && (
            <div className="py-10 text-center text-red-600">
              오류: {modalError}
            </div>
          )}

          {selectedQuestDetail && !isModalLoading && (
            <div className="space-y-4">
              {/* Quest Info */}
              <Card className="border-2 border-gray-300 rounded-lg">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold">{selectedQuestDetail.quest.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedQuestDetail.student.student_name} - {selectedQuestDetail.student.class_name}
                    </p>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">퀘스트 설명</span>
                      <p>{selectedQuestDetail.quest.teacher_content || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">제출 시간</span>
                      <p>{formatDateTime(selectedQuestDetail.submission.submitted_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Comment */}
              <Card className="border-2 border-gray-300 rounded-lg">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-2">학생 수행내용</p>
                  <div className="border-2 border-gray-300 p-3 bg-gray-50 rounded min-h-[50px]">
                    <p className="text-sm text-black whitespace-pre-wrap">
                      {selectedQuestDetail.submission.student_content || "학생 코멘트 없음"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Attachment */}
              {selectedQuestDetail.submission.attachment_url && (
                <Card className="border-2 border-gray-300 rounded-lg">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-2">첨부 파일</p>
                    {/* [참고] 'attachment_url'이 이미지 URL이라고 가정하고 <img> 태그 사용
                      만약 PDF 등이면 <a href..> 태그로 변경 필요
                    */}
                    <a
                      href={selectedQuestDetail.submission.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-2 border-gray-300 p-8 text-center block hover:bg-gray-50"
                    >
                      <img
                        src={selectedQuestDetail.submission.attachment_url}
                        alt="제출된 첨부파일"
                        className="max-w-full max-h-64 mx-auto"
                      />
                      <p className="text-sm text-blue-600 mt-2 underline">
                        클릭하여 원본 보기
                      </p>
                    </a>
                  </CardContent>
                </Card>
              )}

              {/* Comment Section */}
              <div className="space-y-3">
                <h4 className="font-semibold">선생님 코멘트</h4>

                <div className="space-y-2">
                  <label className="text-sm">기본 코멘트 선택</label>
                  <Select onValueChange={(value: string) => setCustomComment(value)}>
                    <SelectTrigger className="border-2 border-gray-300 rounded-lg">
                      <SelectValue placeholder="기본 코멘트를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-300 rounded-lg">
                      {presetComments.map((comment, idx) => (
                        <SelectItem key={idx} value={comment}>
                          {comment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">또는 직접 작성</label>
                  <Textarea
                    placeholder="학생에게 전달할 피드백을 작성하세요"
                    value={customComment}
                    onChange={(e) => setCustomComment(e.target.value)}
                    className="border-2 border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-300">
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                  onClick={() => handleApproveOrReject('reject')}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  {isSubmitting ? "처리 중..." : "반려"}
                </Button>
                <Button
                  className="flex-1 bg-black text-white hover:bg-gray-800 rounded-lg"
                  onClick={() => handleApproveOrReject('approve')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? "승인 중..." : "승인 및 보상 지급"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Success Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="border-2 border-gray-300 rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">완료되었습니다</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-black" />
            <p className="text-lg">퀘스트가 승인되었습니다.</p>
            <p className="text-sm text-gray-600 mt-2">보상이 학생에게 지급되었습니다.</p>
          </div>
          <div className="flex justify-center pt-4">
            <Button
              className="bg-black text-white hover:bg-gray-800 rounded-lg px-8"
              onClick={() => setShowApprovalModal(false)}
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}