import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { useAuth, StudentUser } from "../../contexts/AppContext";
import { get, post, getFullUrl } from "../../utils/api";
import { Loader2, File as FileIcon, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface Quest {
  assignment_id: number;
  quest_id: number;
  title: string;
  teacher_content: string;
  reward_coral_personal: number;
  reward_research_data_personal: number;
  status: 'ASSIGNED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  created_at: string;
  submission?: {
    submitted_at?: string;
    comment?: string;
  };
  approved_at?: string;
  comment?: string;
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
  const { user, isAuthenticated, userType, updateUser } = useAuth();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [submitText, setSubmitText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [expiredQuests, setExpiredQuests] = useState<Quest[]>([]);
  const [approvedQuests, setApprovedQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사용자 정보 새로고침
  const refreshUserInfo = async () => {
    try {
      const response = await get('/api/v1/auth/student/me');
      const json = await response.json();
      if (response.ok && json.data) {
        updateUser({
          coral: json.data.coral ?? 0,
          research_data: json.data.research_data ?? 0,
          total_earned_coral: json.data.total_earned_coral ?? 0,
          total_earned_research_data: json.data.total_earned_research_data ?? 0,
        });
      }
    } catch (err) {
      console.error('사용자 정보 새로고침 실패:', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || userType !== 'student') {
      setLoading(false);
      return;
    }

    // 페이지 로드 시 사용자 정보 새로고침
    refreshUserInfo();

    const fetchQuests = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await get('/api/v1/quests/personal/my');
        const json = await response.json();
        console.log('퀘스트 API 응답:', json); // 디버깅용
        if (!response.ok) {
          throw new Error(json?.message ?? '퀘스트 목록을 불러오지 못했습니다.');
        }
        console.log('활성 퀘스트:', json.data?.active_quests); // 디버깅용
        console.log('만료 퀘스트:', json.data?.expired_quests); // 디버깅용
        console.log('승인 퀘스트:', json.data?.approved_quests); // 디버깅용
        setActiveQuests(json.data?.active_quests ?? []);
        setExpiredQuests(json.data?.expired_quests ?? []);
        setApprovedQuests(json.data?.approved_quests ?? []);
      } catch (err: any) {
        console.error('퀘스트 로딩 에러:', err); // 디버깅용
        setError(err.message ?? '퀘스트 목록을 불러오지 못했습니다.');
        setActiveQuests([]);
        setExpiredQuests([]);
        setApprovedQuests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuests();

    // 30초마다 사용자 정보 새로고침
    const intervalId = setInterval(() => {
      refreshUserInfo();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, userType]);

  // 메인 목록: 진행중 + 승인대기중 퀘스트들
  const quests = activeQuests.filter(quest => {
    return quest.status === 'ASSIGNED' || quest.status === 'SUBMITTED' || quest.status === 'REJECTED';
  });

  const formatTimeLeft = (createdAt: string, status: Quest['status']) => {
    // 승인대기중인 퀘스트는 제출일 표시
    if (status === 'SUBMITTED') {
      return '';
    }
    return formatDateTime(createdAt);
  };

  const getStatusBadge = (status: Quest['status']) => {
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
    }
  };

  const getButtonText = (status: Quest['status']) => {
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

  const isButtonDisabled = (status: Quest['status']) => {
    return status === 'SUBMITTED' || status === 'EXPIRED';
  };

  const handleQuestAction = (quest: Quest) => {
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
    } else {
      setIsDetailOpen(true);
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
    if (!selectedQuest) return;
    if (!submitText.trim() && attachedFiles.length === 0) {
      setSubmitError('제출 내용이나 첨부파일 중 하나는 필수입니다.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let attachmentUrl: string | null = null;

      // 파일이 있으면 먼저 업로드
      if (attachedFiles.length > 0) {
        const file = attachedFiles[0];
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const accessToken = localStorage.getItem('accessToken');
        const uploadHeaders: HeadersInit = {};
        if (accessToken) {
          uploadHeaders['Authorization'] = `Bearer ${accessToken}`;
        }

        const uploadUrl = getFullUrl('/api/v1/files/upload');
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: uploadHeaders,
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json().catch(() => ({}));
          throw new Error(uploadError.message || '파일 업로드에 실패했습니다.');
        }

        const uploadData = await uploadResponse.json();
        if (uploadData.success && uploadData.data?.url) {
          attachmentUrl = uploadData.data.url;
        } else {
          throw new Error('파일 업로드 응답이 올바르지 않습니다.');
        }
      }

      // 퀘스트 제출
      const requestBody = {
        content: submitText,
        attachment_url: attachmentUrl
      };

      const method = selectedQuest.status === 'REJECTED' ? 'PUT' : 'POST';
      const endpoint = `/api/v1/quests/personal/${selectedQuest.assignment_id}/submit`;
      const fullUrl = getFullUrl(endpoint);

      const accessToken = localStorage.getItem('accessToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(fullUrl, {
        method: method,
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        throw new Error('서버 응답을 파싱할 수 없습니다.');
      }
      
      // 401 에러인 경우 토큰 갱신 후 재시도
      if (response.status === 401) {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const refreshUrl = getFullUrl('/api/v1/auth/refresh');
            const refreshResponse = await fetch(refreshUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem('accessToken', refreshData.data.access_token);
              if (refreshData.data.refresh_token) {
                localStorage.setItem('refreshToken', refreshData.data.refresh_token);
              }
              
              // 재시도
              const retryResponse = await fetch(fullUrl, {
                method: method,
                headers: {
                  'Authorization': `Bearer ${refreshData.data.access_token}`,
                },
                body: formData,
              });
              
              let retryData;
              try {
                const retryText = await retryResponse.text();
                retryData = retryText ? JSON.parse(retryText) : {};
              } catch (parseError) {
                throw new Error('서버 응답을 파싱할 수 없습니다.');
              }
              
              if (!retryResponse.ok || !retryData.success) {
                throw new Error(retryData.message || '제출에 실패했습니다.');
              }
              
              alert(retryData.message || '퀘스트가 제출되었습니다!');
              setIsSubmitOpen(false);
              setSubmitText('');
              setAttachedFiles([]);
              
              // 퀘스트 목록 새로고침
              const refreshQuestResponse = await get('/api/v1/quests/personal/my');
              const refreshQuestJson = await refreshQuestResponse.json();
              if (refreshQuestResponse.ok) {
                setActiveQuests(refreshQuestJson.data?.active_quests ?? []);
                setExpiredQuests(refreshQuestJson.data?.expired_quests ?? []);
                setApprovedQuests(refreshQuestJson.data?.approved_quests ?? []);
              }
              
              // 사용자 정보 새로고침
              refreshUserInfo();
              return;
            }
          }
        } catch (refreshErr) {
          // 토큰 갱신 실패 시 로그아웃
          localStorage.removeItem('user');
          localStorage.removeItem('userType');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/';
          return;
        }
      }

      if (!response.ok) {
        const errorMessage = data.message || data.error || `서버 오류가 발생했습니다. (${response.status})`;
        throw new Error(errorMessage);
      }
      
      if (data.success === false) {
        throw new Error(data.message || '제출에 실패했습니다.');
      }

      alert(data.message || '퀘스트가 제출되었습니다!');
      setIsSubmitOpen(false);
      setSubmitText('');
      setAttachedFiles([]);
      
      // 퀘스트 목록 새로고침
      const refreshResponse = await get('/api/v1/quests/personal/my');
      const refreshJson = await refreshResponse.json();
      if (refreshResponse.ok) {
        setActiveQuests(refreshJson.data?.active_quests ?? []);
        setExpiredQuests(refreshJson.data?.expired_quests ?? []);
        setApprovedQuests(refreshJson.data?.approved_quests ?? []);
      }
      
      // 사용자 정보 새로고침
      refreshUserInfo();
    } catch (err: any) {
      console.error('Submit error:', err);
      const errorMessage = err.message || '서버 오류가 발생했습니다.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (userType !== 'student') {
    return <div className="p-6">학생 전용 대시보드입니다.</div>;
  }

  const currentUser = user as StudentUser;

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">퀘스트 목록을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4 space-y-4 bg-white">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-medium text-black">오늘의 퀘스트</h1>
      </div>

      {/* 퀘스트 리스트 */}
      <div className="space-y-3">
        {quests.length === 0 ? (
          <Card className="border-2 border-gray-300">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">진행 중인 퀘스트가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          quests.map((quest) => (
            <Card key={quest.assignment_id} className="border-2 border-gray-300" style={{ borderStyle: 'outset', borderWidth: '2px' }}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={quest.status === 'APPROVED'}
                    disabled={quest.status !== 'ASSIGNED' && quest.status !== 'REJECTED'}
                    className="mt-1"
                  />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-black line-clamp-1 mb-1">{quest.title}</h3>
                        <div className="flex items-center space-x-2 text-sm">
                          {getStatusBadge(quest.status)}
                          <span className="text-sm text-gray-600">
                            {quest.status === 'SUBMITTED' 
                              ? `제출: ${formatDateTime(quest.submission?.submitted_at)}` 
                              : `생성: ${formatTimeLeft(quest.created_at, quest.status)}`}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleQuestAction(quest)}
                        disabled={isButtonDisabled(quest.status)}
                        className={`px-3 py-1 text-sm ${isButtonDisabled(quest.status)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : quest.status === 'APPROVED'
                              ? 'bg-gray-800 text-white hover:bg-gray-900'
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                        style={!isButtonDisabled(quest.status) ? {
                          border: '2px outset #c0c0c0',
                          backgroundColor: quest.status === 'APPROVED' ? '#808080' : '#c0c0c0',
                          color: '#000',
                          cursor: 'pointer'
                        } : {}}
                      >
                        {getButtonText(quest.status)}
                      </button>
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-black font-semibold"><span className="text-blue-600">C</span> {quest.reward_coral_personal}</span>
                      <span className="text-black font-semibold"><span className="text-purple-600">R</span> {quest.reward_research_data_personal}</span>
                    </div>

                    {quest.teacher_content && (
                      <div className="text-xs text-gray-500">
                        <span>{quest.teacher_content}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 하단 버튼들 */}
      <div className="mt-4 flex justify-center space-x-4">
        <button
          onClick={() => setIsExpiredModalOpen(true)}
          className="px-4 py-2 text-sm bg-gray-100 text-black hover:bg-gray-200"
          style={{ border: '2px outset #c0c0c0', backgroundColor: '#c0c0c0', cursor: 'pointer' }}
        >
          마감지난 퀘스트들 ({expiredQuests.length})
        </button>
        <button
          onClick={() => setIsCompletedModalOpen(true)}
          className="px-4 py-2 text-sm bg-gray-100 text-black hover:bg-gray-200"
          style={{ border: '2px outset #c0c0c0', backgroundColor: '#c0c0c0', cursor: 'pointer' }}
        >
          승인완료된 퀘스트들 ({approvedQuests.length})
        </button>
      </div>

      {/* 하단 획득 현황 */}
      <Card className="border-2 border-gray-300 mt-6" style={{ borderStyle: 'inset', borderWidth: '2px', marginBottom: '20px' }}>
        <CardHeader className="text-center justify-items-center">
          <CardTitle className="text-black text-center w-full">총 획득 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 border border-gray-200 rounded" style={{ borderStyle: 'inset', borderWidth: '2px', backgroundColor: '#f0f0f0' }}>
              <p className="text-sm text-gray-600">획득한 코랄</p>
              <p className="text-xl font-medium text-black">{currentUser.total_earned_coral ?? 0}</p>
            </div>
            <div className="p-3 border border-gray-200 rounded" style={{ borderStyle: 'inset', borderWidth: '2px', backgroundColor: '#f0f0f0' }}>
              <p className="text-sm text-gray-600">획득한 탐사데이터</p>
              <p className="text-xl font-medium text-black">{currentUser.total_earned_research_data ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 세부정보 모달 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">{selectedQuest?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-black">{selectedQuest?.teacher_content || '설명이 없습니다.'}</p>
            <div className="flex justify-between">
              <span className="text-gray-600">보상:</span>
              <span className="text-black">
                코랄 {selectedQuest?.reward_coral_personal}, 탐사데이터 {selectedQuest?.reward_research_data_personal}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">생성일:</span>
              <span className="text-black">{selectedQuest && formatTimeLeft(selectedQuest.created_at, selectedQuest.status)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 승인완료된 퀘스트 모달 */}
      <Dialog open={isCompletedModalOpen} onOpenChange={setIsCompletedModalOpen}>
        <DialogContent className="bg-white border-2 border-gray-300 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black">승인완료된 퀘스트들</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {approvedQuests.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">승인 완료된 퀘스트가 없습니다.</p>
            ) : (
              approvedQuests.map((quest) => (
                <Card key={quest.assignment_id} className="border-2 border-gray-300">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-black line-clamp-1 mb-1">{quest.title}</h3>
                            <div className="flex items-center space-x-2 text-sm">
                              {getStatusBadge(quest.status)}
                              <span className="text-sm text-gray-600">
                                완료일: {formatDateTime(quest.submission?.submitted_at)}
                              </span>
                            </div>
                          </div>

                          <Button
                            onClick={() => {
                              setSelectedQuest(quest);
                              setIsCommentOpen(true);
                            }}
                            className="px-3 py-1 text-sm bg-gray-800 text-white hover:bg-gray-900"
                            size="sm"
                          >
                            코멘트 확인
                          </Button>
                        </div>

                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-black font-semibold"><span className="text-blue-600">C</span> {quest.reward_coral_personal}</span>
                          <span className="text-black font-semibold"><span className="text-purple-600">R</span> {quest.reward_research_data_personal}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => setIsCompletedModalOpen(false)}
              className="bg-black text-white hover:bg-gray-800"
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 마감된 퀘스트 모달 */}
      <Dialog open={isExpiredModalOpen} onOpenChange={setIsExpiredModalOpen}>
        <DialogContent className="bg-white border-2 border-gray-300 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black">마감지난 퀘스트들</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {expiredQuests.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">마감된 퀘스트가 없습니다.</p>
            ) : (
              expiredQuests.map((quest) => (
                <div key={quest.assignment_id} className="p-3 border border-gray-300 rounded">
                  <h3 className="font-medium text-black">{quest.title}</h3>
                  <p className="text-sm text-gray-600">생성일: {new Date(quest.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => setIsExpiredModalOpen(false)}
              className="bg-black text-white hover:bg-gray-800"
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 선생님 코멘트 모달 */}
      <Dialog open={isCommentOpen} onOpenChange={setIsCommentOpen}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black">선생님 코멘트</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-black mb-2">{selectedQuest?.title}</h3>
              <p className="text-sm text-gray-600">제출일: {formatDateTime(selectedQuest?.submission?.submitted_at)}</p>
            </div>

            <div className="border-2 border-gray-300 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 mb-2">선생님 피드백</h4>
              <p className="text-black leading-relaxed whitespace-pre-wrap">
                {selectedQuest?.submission?.comment || selectedQuest?.comment || "추가 코멘트가 없습니다."}
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => setIsCommentOpen(false)}
                className="bg-black text-white hover:bg-gray-800"
              >
                확인
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 제출 모달 */}
      <Dialog open={isSubmitOpen} onOpenChange={(isOpen: Boolean) => { if (!isOpen) setIsSubmitOpen(false); }}>
        <DialogContent className="bg-white border-2 border-gray-300 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-black">{selectedQuest?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3" style={{ writingMode: 'horizontal-tb' }}>
            <p className="text-sm text-gray-700 whitespace-normal" style={{ writingMode: 'horizontal-tb' }}>
              {selectedQuest?.teacher_content}
            </p>

            {/* 반려된 경우, 반려 사유 표시 */}
            {selectedQuest?.status === 'REJECTED' && (
              <div className="bg-red-50 border border-red-200 rounded p-3" style={{ writingMode: 'horizontal-tb' }}>
                <p className="text-sm font-semibold text-red-800 mb-1">반려 사유</p>
                <p className="text-sm text-red-700 whitespace-normal">
                  {selectedQuest.submission?.comment || selectedQuest.comment || "사유가 없습니다. 다시 제출해주세요."}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-black mb-1 block">수행 내용</label>
              <Textarea
                value={submitText}
                onChange={(e) => setSubmitText(e.target.value)}
                placeholder="수행 내용을 입력하세요..."
                className="border-gray-300 bg-white text-black"
                rows={3}
              />
            </div>

            {/* 첨부파일 섹션 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-black">첨부파일</label>
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf, .jpg, .jpeg, .png, .doc, .docx"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="bg-gray-100 text-black border border-gray-300 hover:bg-gray-200 text-xs px-3 py-1 h-7"
                >
                  파일 선택
                </Button>
              </div>

              {/* 첨부된 파일 목록 */}
              {attachedFiles.length > 0 && (
                <div className="space-y-1">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-1.5 bg-gray-50 border border-gray-300 rounded text-xs">
                      <div className="flex items-center space-x-1.5 overflow-hidden flex-1 min-w-0">
                        <FileIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-black truncate">{file.name}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="bg-gray-100 text-black border border-gray-300 hover:bg-gray-200 p-0.5 h-5 w-5 flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded p-2">
                <p className="text-xs text-red-700">{submitError}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-black text-white hover:bg-gray-800 h-9 text-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (selectedQuest?.status === 'REJECTED' ? '다시 제출' : '제출하기')}
              </Button>
              <Button
                type="button"
                onClick={() => setIsSubmitOpen(false)}
                className="flex-1 bg-white text-black border border-gray-300 hover:bg-gray-50 h-9 text-sm"
              >
                취소
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}