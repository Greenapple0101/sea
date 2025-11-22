import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Plus, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get, post } from "../../utils/api";

interface StudentProfile {
  student_id: number;
  real_name: string;
  class_name: string;
  coral: number;
  research_data: number;
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

interface OngoingQuest {
  assignment_id: number;
  quest_id: number;
  title: string;
  deadline: string;
}

export function StudentDetailPage() {
  const navigate = useNavigate();
  const { classId, id } = useParams<{ classId?: string; id: string }>();
  
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingQuest[]>([]);
  const [ongoingQuests, setOngoingQuests] = useState<OngoingQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{[key: number]: string}>({});
  const [selectedQuestId, setSelectedQuestId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleNavigate = (page: string) => {
    const routeMap: Record<string, string> = {
      'teacher-dashboard': '/teacher/dashboard',
      'quest-create-new': '/teacher/quest',
      'class-manage': classId ? `/teacher/class/${classId}` : '/teacher/class',
      'class-create': '/teacher/class/create',
      'student-list': classId ? `/teacher/students/${classId}` : '/teacher/students',
      'raid-create-new': '/teacher/raid/create',
      'raid-manage': '/teacher/raid/manage',
      'quest-approval': '/teacher/quest/approval',
    };
    const route = routeMap[page] || '/teacher/dashboard';
    navigate(route);
  };

  // 학생 프로필 정보 가져오기
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!id || id === 'undefined') {
        setError('학생 ID가 없습니다.');
        setLoading(false);
        return;
      }

      const studentId = parseInt(id);
      if (isNaN(studentId)) {
        setError('유효하지 않은 학생 ID입니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 학생 목록에서 해당 학생 정보 찾기 (학생 목록 API가 더 안정적)
        let studentData: StudentProfile | null = null;
        
        if (classId) {
          try {
            const classResponse = await get(`/api/v1/classes/${classId}/students`);
            const classJson = await classResponse.json();
            
            if (classResponse.ok && classJson.data?.students) {
              const foundStudent = classJson.data.students.find(
                (s: any) => s.student_id === studentId
              );
              
              if (foundStudent) {
                studentData = {
                  student_id: foundStudent.student_id,
                  real_name: foundStudent.name || '이름 없음',
                  class_name: classJson.data.class_name || '',
                  coral: foundStudent.coral || 0,
                  research_data: foundStudent.research_data || 0,
                };
              }
            }
          } catch (err) {
            console.error('학생 목록 조회 실패:', err);
          }
        }

        // 학생 목록에서 찾지 못했거나 classId가 없으면 프로필 API 시도
        if (!studentData) {
          try {
            const profileResponse = await get(`/api/v1/auth/student/${studentId}`);
            const profileJson = await profileResponse.json();
            
            if (profileResponse.ok && profileJson.data) {
              const profileData = profileJson.data;
              studentData = {
                student_id: profileData.student_id,
                real_name: profileData.real_name || profileData.username || '이름 없음',
                class_name: profileData.class_name || '',
                coral: profileData.coral || 0,
                research_data: profileData.research_data || 0,
              };
            }
          } catch (err) {
            console.error('학생 프로필 API 실패:', err);
          }
        }

        if (!studentData) {
          throw new Error('학생 정보를 찾을 수 없습니다.');
        }

        setStudent(studentData);

        // 승인 대기 중인 퀘스트 가져오기 (해당 학생의 것만 필터링)
        const pendingResponse = await get('/api/v1/quests/personal/pending');
        const pendingJson = await pendingResponse.json();
        
        if (pendingResponse.ok && pendingJson.data?.assignments) {
          const studentPendingQuests = pendingJson.data.assignments.filter(
            (quest: PendingQuest) => quest.student_id === parseInt(id)
          );
          setPendingApprovals(studentPendingQuests);
        }

        // 진행 중인 퀘스트는 별도 API가 필요하지만, 현재는 빈 배열로 설정
        // TODO: 진행 중인 퀘스트 API가 있으면 연동
        setOngoingQuests([]);

      } catch (err: any) {
        console.error('학생 데이터 로딩 에러:', err);
        setError(err.message ?? '학생 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  // 실시간 마감 시간 계산
  useEffect(() => {
    if (ongoingQuests.length === 0) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const newTimeLeft: {[key: number]: string} = {};
      
      ongoingQuests.forEach(quest => {
        const deadline = new Date(quest.deadline);
        const diff = deadline.getTime() - now.getTime();
        
        if (diff <= 0) {
          newTimeLeft[quest.assignment_id] = "마감됨";
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          
          if (days > 0) {
            newTimeLeft[quest.assignment_id] = `${days}일 ${hours}시간 남음`;
          } else if (hours > 0) {
            newTimeLeft[quest.assignment_id] = `${hours}시간 ${minutes}분 남음`;
          } else {
            newTimeLeft[quest.assignment_id] = `${minutes}분 남음`;
          }
        }
      });
      
      setTimeLeft(newTimeLeft);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, [ongoingQuests]);

  // 퀘스트 승인 처리
  const handleApprove = async (assignmentId: number) => {
    setActionLoading(true);
    setSelectedQuestId(assignmentId);
    
    try {
      const response = await post(`/api/v1/quests/personal/${assignmentId}/approve`, {
        comment: "승인되었습니다."
      });
      const json = await response.json();
      
      if (!response.ok) {
        throw new Error(json?.message ?? '퀘스트 승인에 실패했습니다.');
      }

      setShowApprovalModal(true);
      // 승인 대기 목록에서 제거
      setPendingApprovals(prev => prev.filter(q => q.assignment_id !== assignmentId));
    } catch (err: any) {
      alert(err.message ?? '퀘스트 승인에 실패했습니다.');
    } finally {
      setActionLoading(false);
      setSelectedQuestId(null);
    }
  };

  // 퀘스트 달성률 계산 (간단한 계산, 실제로는 백엔드에서 제공해야 함)
  const calculateQuestCompletionRate = () => {
    // TODO: 백엔드에서 퀘스트 달성률을 제공하면 그 값을 사용
    // 현재는 임시로 0 반환
    return 0;
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>학생 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error || '학생 정보를 찾을 수 없습니다.'}</p>
        <Button 
          variant="outline"
          onClick={() => navigate(classId ? `/teacher/students/${classId}` : '/teacher/students')}
        >
          학생 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  const studentInitial = student.real_name.charAt(0) || '?';
  const questCompletionRate = calculateQuestCompletionRate();

  return (
    <>
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 border-2 border-gray-300">
              <AvatarFallback className="bg-gray-200 text-black text-xl">
                {studentInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1>{student.real_name}</h1>
              <p className="text-gray-600 mt-1">{student.class_name}</p>
            </div>
            <Button 
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              variant="outline"
              onClick={() => handleNavigate('quest-create-new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              퀘스트 등록
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          {/* Stats */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardContent className="p-4">
              <h3 className="mb-4">학생 스테이터스</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center border-2 border-gray-300 p-3">
                  <p className="text-sm text-gray-600 mb-1">코랄</p>
                  <h3>{student.coral}</h3>
                </div>
                <div className="text-center border-2 border-gray-300 p-3">
                  <p className="text-sm text-gray-600 mb-1">탐사데이터</p>
                  <h3>{student.research_data}</h3>
                </div>
                <div className="text-center border-2 border-gray-300 p-3">
                  <p className="text-sm text-gray-600 mb-1">퀘스트 달성률</p>
                  <h3>{questCompletionRate}%</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3>승인 대기 중인 퀘스트</h3>
                <Badge className="bg-black text-white rounded-lg">
                  {pendingApprovals.length}건
                </Badge>
              </div>
              {pendingApprovals.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">승인 대기 중인 퀘스트가 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.map((quest) => (
                    <Card key={quest.assignment_id} className="border-2 border-gray-300 rounded-lg">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4>{quest.title}</h4>
                            <p className="text-sm text-gray-600">
                              제출: {new Date(quest.submitted_at).toLocaleString('ko-KR')}
                            </p>
                          </div>
                          <Button 
                            size="sm"
                            className="bg-black text-white hover:bg-gray-800 rounded-lg"
                            onClick={() => handleApprove(quest.assignment_id)}
                            disabled={actionLoading && selectedQuestId === quest.assignment_id}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {actionLoading && selectedQuestId === quest.assignment_id ? '처리 중...' : '승인'}
                          </Button>
                        </div>
                        <div className="flex gap-2 text-sm border-t-2 border-gray-300 pt-2">
                          <span className="text-gray-600">보상:</span>
                          <span>코랄 {quest.reward_coral_personal}</span>
                          <span>탐사데이터 {quest.reward_research_data_personal}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ongoing Quests */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardContent className="p-4">
              <h3 className="mb-4">현재 진행 중인 퀘스트</h3>
              {ongoingQuests.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">진행 중인 퀘스트가 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {ongoingQuests.map((quest) => (
                    <Card key={quest.assignment_id} className="border-2 border-gray-300 rounded-lg">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <h4>{quest.title}</h4>
                          <span className={`text-sm ${timeLeft[quest.assignment_id] === "마감됨" ? "text-red-600" : "text-gray-600"}`}>
                            {timeLeft[quest.assignment_id] || "로딩 중..."}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      {/* 승인 모달 */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-black">
              승인되었습니다
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-600">퀘스트가 성공적으로 승인되었습니다.</p>
          </div>
          <div className="flex justify-center">
            <Button 
              className="bg-black text-white hover:bg-gray-800 rounded-lg"
              onClick={() => {
                setShowApprovalModal(false);
                // 학생 정보 새로고침
                window.location.reload();
              }}
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
