import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { CheckCircle, X, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { get, post } from "../../utils/api";

interface ClassSummary {
  class_id: number;
  class_name: string;
}

interface PendingQuest {
  assignment_id: number;
  quest_id: number;
  title: string;
  student_id: number;
  student_name: string;
  class_name: string;
  submitted_at: string;
  reward_coral_personal: number;
  reward_research_data_personal: number;
  status: string;
}

interface QuestDetail {
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
  status: string;
  submission: {
    submission_id: number;
    student_content: string;
    attachment_url?: string;
    submitted_at: string;
    comment?: string;
  } | null;
}

export function QuestApprovalPageNew() {
  const [pendingQuests, setPendingQuests] = useState<PendingQuest[]>([]);
  const [selectedQuestDetail, setSelectedQuestDetail] = useState<QuestDetail | null>(null);
  const [customComment, setCustomComment] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(undefined);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetComments = [
    "잘했어요! 계속 이렇게 해주세요.",
    "수고했어요! 다음에도 기대할게요.",
    "훌륭합니다! 완벽하게 완료했네요.",
    "노력이 보여요. 조금만 더 신경쓰면 좋겠어요.",
  ];

  const fetchPendingQuests = useMemo(() => async () => {
    setListLoading(true);
    setError(null);
    try {
      // 토큰 확인
      const accessToken = localStorage.getItem('accessToken');
      const userType = localStorage.getItem('userType');
      console.log('토큰 확인:', { hasToken: !!accessToken, userType });
      
      const response = await get(`/api/v1/quests/personal/pending`);
      console.log('API 응답 상태:', response.status, response.statusText);
      
      const json = await response.json();
      console.log('API 응답 데이터:', json);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('접근 권한이 없습니다. 선생님 계정으로 로그인해주세요.');
        } else if (response.status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(json?.message ?? '승인 대기 퀘스트를 불러오지 못했습니다.');
      }
      setPendingQuests(json.data?.assignments ?? []);
    } catch (err: any) {
      console.error('퀘스트 로딩 에러:', err);
      setError(err.message ?? '승인 대기 퀘스트를 불러오지 못했습니다.');
      setPendingQuests([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingQuests();
  }, [fetchPendingQuests]);

  const openDetail = async (assignmentId: number) => {
    setDetailLoading(true);
    setCustomComment("");
    setSelectedPreset(undefined);
    try {
      const response = await get(`/api/v1/quests/personal/${assignmentId}/detail`);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.message ?? '퀘스트 상세를 불러오지 못했습니다.');
      }
      setSelectedQuestDetail(json.data);
    } catch (err: any) {
      alert(err.message ?? '퀘스트 상세를 불러오지 못했습니다.');
      setSelectedQuestDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedQuestDetail(null);
    setCustomComment("");
    setSelectedPreset(undefined);
  };

  const getCommentPayload = () => {
    return customComment?.trim().length ? customComment.trim() : selectedPreset ?? "";
  };

  const triggerApprove = async (assignmentId: number) => {
    setActionLoading(true);
    try {
      const response = await post(`/api/v1/quests/personal/${assignmentId}/approve`, {
        comment: getCommentPayload()
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.message ?? '퀘스트 승인에 실패했습니다.');
      }
      setShowApprovalModal(true);
      closeDetail();
      fetchPendingQuests();
    } catch (err: any) {
      alert(err.message ?? '퀘스트 승인에 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const triggerReject = async (assignmentId: number) => {
    setActionLoading(true);
    try {
      const response = await post(`/api/v1/quests/personal/${assignmentId}/reject`, {
        comment: getCommentPayload()
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.message ?? '퀘스트 반려에 실패했습니다.');
      }
      setShowRejectModal(true);
      closeDetail();
      fetchPendingQuests();
    } catch (err: any) {
      alert(err.message ?? '퀘스트 반려에 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
        <div className="border-b-2 border-gray-300 p-6" style={{ pointerEvents: 'none', position: 'relative', zIndex: 1 }}>
          <h1>퀘스트 승인</h1>
          <p className="text-gray-600 mt-1">승인 대기 중: {pendingQuests.length}건</p>
        </div>

        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <Button
                variant="outline"
                className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                onClick={() => fetchPendingQuests()}
              >
                새로고침
              </Button>
            </div>

          {error && (
            <div className="mb-4 p-3 border border-red-300 bg-red-50 text-sm text-red-600 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4 max-w-4xl">
            {listLoading ? (
              <p className="text-sm text-gray-500">승인 대기 목록을 불러오는 중입니다...</p>
            ) : pendingQuests.length === 0 ? (
              <p className="text-sm text-gray-500">승인 대기 중인 퀘스트가 없습니다.</p>
            ) : pendingQuests.map((quest) => (
              <Card key={quest.assignment_id} className="border-2 border-gray-300 rounded-lg" style={{ overflow: 'visible' }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4>{quest.student_name}</h4>
                        <Badge variant="outline" className="border-2 border-gray-300 rounded-lg">
                          {quest.class_name}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{quest.title}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="border-2 border-gray-300 p-2">
                      <span className="text-gray-600">제출 시간</span>
                      <p className="mt-1">{new Date(quest.submitted_at).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t-2 border-gray-300 pt-4">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-600">보상:</span>
                      <span>코랄 {quest.reward_coral_personal}</span>
                      <span>탐사데이터 {quest.reward_research_data_personal}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                        onClick={() => openDetail(quest.assignment_id)}
                      >
                        상세보기
                      </Button>
                      <Button
                        className="bg-black text-white hover:bg-gray-800 rounded-lg"
                        onClick={() => openDetail(quest.assignment_id)}
                        style={{ position: 'relative', zIndex: 9999 }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        승인
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      <Dialog open={selectedQuestDetail !== null} onOpenChange={closeDetail}>
        <DialogContent className="!rounded-2xl border-2 border-gray-300 max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b-2 border-gray-200">
            <DialogTitle>퀘스트 승인</DialogTitle>
            <DialogDescription className="sr-only">퀘스트 상세 정보를 확인하고 승인 또는 반려할 수 있습니다.</DialogDescription>
          </DialogHeader>

          {detailLoading && <p className="text-sm text-gray-500 px-6 py-4">퀘스트 상세를 불러오는 중입니다...</p>}

          {selectedQuestDetail && !detailLoading && (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="space-y-4 overflow-y-auto flex-1 px-6 py-4" style={{ 
                scrollbarWidth: 'thin', 
                scrollbarColor: '#d1d5db #f3f4f6',
                maxHeight: 'calc(90vh - 200px)'
              }}>
              <Card className="border-2 border-gray-300 rounded-lg">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h4>{selectedQuestDetail.quest.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedQuestDetail.student.student_name} - {selectedQuestDetail.student.class_name}
                    </p>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">퀘스트 내용</span>
                      <p>{selectedQuestDetail.quest.teacher_content || "내용 없음"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">제출 시간</span>
                      <p>{selectedQuestDetail.submission?.submitted_at
                        ? new Date(selectedQuestDetail.submission.submitted_at).toLocaleString()
                        : "미제출"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-300 rounded-lg">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-2">학생 수행내용</p>
                  <div className="border-2 border-gray-300 p-3 bg-gray-50 rounded min-h-20">
                    <p className="text-sm text-black">
                      {selectedQuestDetail.submission?.student_content || "작성된 내용이 없습니다."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {selectedQuestDetail.submission?.attachment_url && (
                <Card className="border-2 border-gray-300 rounded-lg">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-2">첨부 파일</p>
                    <div className="border-2 border-gray-300 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">증거 이미지</span>
                      </div>
                      <Button
                        variant="outline"
                        className="border-2 border-gray-300 rounded-lg"
                        onClick={() => window.open(selectedQuestDetail.submission?.attachment_url, "_blank")}
                      >
                        보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                <h4>선생님 코멘트</h4>

                <div className="space-y-2">
                  <label className="text-sm">기본 코멘트 선택</label>
                  <Select
                    value={selectedPreset}
                    onValueChange={(value) => {
                      setSelectedPreset(value);
                      setCustomComment(value);
                    }}
                  >
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
              </div>

              <div className="flex gap-3 pt-4 border-t-2 border-gray-200 flex-shrink-0 px-6 pb-6 bg-white">
                <Button 
                  variant="outline" 
                  className="flex-1 border-2 border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
                  disabled={actionLoading}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (selectedQuestDetail) {
                      triggerReject(selectedQuestDetail.assignment_id);
                    }
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  반려
                </Button>
                <Button 
                  className="flex-1 bg-black text-white hover:bg-gray-800 rounded-lg cursor-pointer"
                  disabled={actionLoading}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (selectedQuestDetail) {
                      triggerApprove(selectedQuestDetail.assignment_id);
                    }
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  승인 및 보상 지급
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="border-2 border-gray-300 rounded-lg max-w-md">
          <DialogHeader className="text-center">
            <DialogTitle className="text-center text-xl font-bold">완료되었습니다</DialogTitle>
            <DialogDescription className="sr-only">퀘스트 승인이 완료되었습니다.</DialogDescription>
          </DialogHeader>
          <div className="text-center py-4 space-y-2">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-black" />
            <p className="text-lg font-medium text-black whitespace-normal">퀘스트가 승인되었습니다.</p>
            <p className="text-sm text-gray-600 mt-2 whitespace-normal">보상이 학생에게 지급되었습니다.</p>
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

      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="border-2 border-gray-300 rounded-lg max-w-md">
          <DialogHeader className="text-center">
            <DialogTitle className="text-center text-xl font-bold">반려 처리 완료</DialogTitle>
            <DialogDescription className="sr-only">퀘스트 반려가 완료되었습니다.</DialogDescription>
          </DialogHeader>
          <div className="text-center py-4 space-y-2">
            <X className="w-16 h-16 mx-auto mb-4 text-black" />
            <p className="text-lg font-medium text-black whitespace-normal">퀘스트가 반려되었습니다.</p>
            <p className="text-sm text-gray-600 mt-2 whitespace-normal">학생에게 반려 사유가 전달되었습니다.</p>
          </div>
          <div className="flex justify-center pt-4">
            <Button 
              className="bg-black text-white hover:bg-gray-800 rounded-lg px-8"
              onClick={() => setShowRejectModal(false)}
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
