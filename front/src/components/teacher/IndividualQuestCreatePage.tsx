import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { User, Plus, X, Info, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "../ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useAuth, StudentUser, TeacherUser } from "../../contexts/AppContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { get, post } from "../../utils/api";

interface AiRecommendation {
  student_id: number;
  student_name: string;
  recommended_coral: number;
  recommended_research_data: number;
  reason: string;
}

type FormErrors = {
  title?: string | null;
  teacher_content?: string | null;
  difficulty?: number | null;
  deadline?: string | null;
  reward_coral_default?: number | null;
  reward_research_data_default?: number | null;
  selectedStudents?: string | null;
  formGeneral?: string | null;
};
type EditFormState = {
  coral: string;
  research: string;
  memo: string;
};

export function IndividualQuestCreatePage() {
  const navigate = useNavigate();
  const { isAuthenticated, userType, user, access_token, currentClassId } = useAuth();

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showDifficultyGuide, setShowDifficultyGuide] = useState(false);
  const [showAIReward, setShowAIReward] = useState(false);
  const [questData, setQuestData] = useState({
    title: "",
    teacher_content: "",
    reward_coral_default: "",
    reward_research_data_default: "",
    difficulty: 3,
    deadline: "",
    category: "일반"
  });

  const [aiModeEnabled, setAiModeEnabled] = useState(false);

  const [aiRecommendations, setAiRecommendations] = useState<Map<string, AiRecommendation>>(new Map());
  const [personalRewards, setPersonalRewards] = useState<Map<string, { coral: number, research: number, memo?: string }>>(new Map());
  const [allStudents, setAllStudents] = useState<StudentUser[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [showAiStudentModal, setShowAiStudentModal] = useState(false);
  const [showAiStudentEditModal, setShowAiStudentEditModal] = useState(false);
  const [currentEditingStudentId, setCurrentEditingStudentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({ coral: "", research: "", memo: "" });

  const handleQuestDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setQuestData(prev => ({ ...prev, [id]: value }));
    if (formErrors[id as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [id as keyof FormErrors]: null }));
    }
  };

  const handleDifficultyChange = (value: string) => {
    setQuestData(prev => ({ ...prev, difficulty: Number(value) }));
  };

  useEffect(() => {
    if (!isAuthenticated || userType !== 'teacher') {
      setIsLoadingStudents(false);
      setFetchError("접근 권한이 없습니다.");
      return;
    }

    if (!currentClassId) {
      setIsLoadingStudents(false);
      setFetchError("선택된 반이 없습니다. 반을 먼저 선택해주세요.");
      return;
    }

    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      setFetchError(null);

      try {
        const response = await get(`/api/v1/classes/${currentClassId}/students`);
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.message ?? '학생 목록을 불러오지 못했습니다.');
        }
        setAllStudents(json.data?.students ?? []);
      } catch (err: any) {
        const message = (err instanceof Error) ? err.message : "알 수 없는 에러 발생";
        setFetchError(message);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [isAuthenticated, userType, user, access_token, currentClassId]);

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
    if (formErrors.selectedStudents) {
      setFormErrors(prev => ({ ...prev, selectedStudents: null }));
    }
    setAiRecommendations(new Map());
    setPersonalRewards(new Map());
    setAiModeEnabled(false);
  };

  const handleAiRecommend = async () => {
    if (selectedStudents.length === 0) {
      alert("AI 추천을 받으려면 대상 학생을 1명 이상 선택해야 합니다.");
      return;
    }
    if (!access_token) {
      alert("인증 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await post('/api/v1/quests/personal/ai-recommend', {
        quest_title: questData.title,
        quest_content: questData.teacher_content,
        difficulty: questData.difficulty || 3,
        student_ids: selectedStudents.map(Number)
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json?.message ?? 'AI 추천에 실패했습니다.');
      }

      const responseData = json.data;

      setQuestData(prev => ({
        ...prev,
        reward_coral_default: responseData.reward_coral_default?.toString() || prev.reward_coral_default,
        reward_research_data_default: responseData.reward_research_data_default?.toString() || prev.reward_research_data_default
      }));

      const recommendations: AiRecommendation[] = responseData.recommendations || [];
      const newAiRecsMap = new Map<string, AiRecommendation>();
      const newPersonalRewardsMap = new Map<string, { coral: number, research: number, memo?: string }>();

      recommendations.forEach((rec: AiRecommendation) => {
        const studentId = rec.student_id.toString();
        if (selectedStudents.includes(studentId)) {
          newAiRecsMap.set(studentId, rec);
          newPersonalRewardsMap.set(studentId, {
            coral: rec.recommended_coral,
            research: rec.recommended_research_data,
            memo: ""
          });
        }
      });
      setAiRecommendations(newAiRecsMap);
      setPersonalRewards(newPersonalRewardsMap);

      setShowAIReward(false);
      setShowAiStudentModal(true);
      setAiModeEnabled(true);

    } catch (error) {
      console.error("AI 보상 추천 실패:", error);
      alert((error instanceof Error) ? error.message : "AI 추천 중 오류 발생");
    } finally {
      setIsAiLoading(false);
    }

  };

  const handleOpenEditModal = (studentId: string) => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;

    const personalRec = personalRewards.get(studentId);

    setEditForm({
      coral: personalRec?.coral.toString() || "0",
      research: personalRec?.research.toString() || "0",
      memo: personalRec?.memo || ""
    });
    setCurrentEditingStudentId(studentId);
    setShowAiStudentEditModal(true);
  };

  const handleCancelEdit = () => {
    setShowAiStudentEditModal(false);
    setCurrentEditingStudentId(null);
    setEditForm({ coral: "", research: "", memo: "" });
  };

  const handleConfirmEdit = () => {
    if (!currentEditingStudentId) return;

    const newCoral = Number(editForm.coral) || 0;
    const newResearch = Number(editForm.research) || 0;

    setPersonalRewards(prev => {
      const newMap = new Map(prev);
      newMap.set(currentEditingStudentId, {
        coral: newCoral,
        research: newResearch,
        memo: editForm.memo
      });
      return newMap;
    });

    handleCancelEdit();
  };

  const handleConfirmAllAiRecs = () => {
    setShowAiStudentModal(false);
    alert("AI 추천 보상이 적용되었습니다!");
  };

  const handleCancelAllAiRecs = () => {
    setAiRecommendations(new Map());
    setPersonalRewards(new Map());
    setShowAiStudentModal(false);
    setAiModeEnabled(false);
  };

  const handleSubmit = async () => {
    if (!questData.title || !questData.teacher_content || selectedStudents.length === 0) {
      setFormErrors({
        title: !questData.title ? "퀘스트 제목을 입력해주세요." : null,
        teacher_content: !questData.teacher_content ? "퀘스트 설명을 입력해주세요." : null,
        selectedStudents: selectedStudents.length === 0 ? "대상 학생을 1명 이상 선택해주세요." : null
      });
      return;
    };

    if (!isAuthenticated || userType !== 'teacher' || !user || !access_token) {
      setFormErrors(prev => ({ ...prev, formGeneral: "로그인이 필요하거나 교사 계정이 아닙니다." }));
      return;
    }
    if (!currentClassId) {
      setFormErrors(prev => ({ ...prev, formGeneral: "교사 계정에 반 정보가 없습니다." }));
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const assignments = selectedStudents.map(studentId => {
        const assignment: any = {
          student_id: Number(studentId)
        };

        if (aiModeEnabled) {
          const personalRec = personalRewards.get(studentId);
          const aiRec = aiRecommendations.get(studentId);

          assignment.reward_coral_personal = personalRec?.coral ?? 0;
          assignment.reward_research_data_personal = personalRec?.research ?? 0;
          assignment.ai_reward_coral = aiRec?.recommended_coral || 0;
          assignment.ai_reward_research_data = aiRec?.recommended_research_data || 0;

        } else {
          assignment.reward_coral_personal = Number(questData.reward_coral_default) || 0;
          assignment.reward_research_data_personal = Number(questData.reward_research_data_default) || 0;
        }
        return assignment;
      });

      let formattedDeadline: string | null = null;
      if (questData.deadline) {
        formattedDeadline = questData.deadline + ":00";
      }

      const payload = {
        title: questData.title,
        teacher_content: questData.teacher_content,
        difficulty: questData.difficulty || 3,
        deadline: formattedDeadline,
        class_id: Number(currentClassId),
        ai_used: aiModeEnabled,
        reward_coral_default: Number(questData.reward_coral_default) || 0,
        reward_research_data_default: Number(questData.reward_research_data_default) || 0,
        assignments: assignments
      };

      console.log("퀘스트 등록 페이로드:", JSON.stringify(payload, null, 2));

      const response = await post('/api/v1/quests/personal', payload);
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json?.message ?? "퀘스트 등록에 실패했습니다.");
      }

      alert(json.message || `[SUCCESS] 개인 퀘스트가 등록되었습니다!`);
      navigate('/teacher/quest');

    } catch (err) {
      console.error("퀘스트 등록 실패:", err);
      const message = (err instanceof Error) ? err.message : "알 수 없는 에러 발생";
      setFormErrors(prev => ({
        ...prev,
        formGeneral: message
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentEditStudent = allStudents.find(s => s.id === currentEditingStudentId);
  const currentEditAiRec = currentEditingStudentId ? aiRecommendations.get(currentEditingStudentId) : null;

  return (
    <>
      {/* Header */}
      <div className="border-b-2 border-gray-300 p-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black">개인 퀘스트 등록</h1>
            <p className="text-gray-600 mt-1">특정 학생에게 할당할 개별 퀘스트를 등록합니다</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-4xl">
        <div className="space-y-6">
          {/* 퀘스트 기본 정보 */}
          <Card className="border-2 border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <User className="w-5 h-5" />
                퀘스트 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-black font-medium">퀘스트 제목 *</Label>
                <Input
                  id="title"
                  value={questData.title}
                  onChange={handleQuestDataChange}
                  placeholder="퀘스트 제목을 입력하세요"
                  className="border-2 border-gray-300 rounded-lg"
                />
                {formErrors.title && (
                  <p className="text-sm text-red-600 pt-1">{formErrors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher_content" className="text-black font-medium">퀘스트 설명 *</Label>
                <Textarea
                  id="teacher_content"
                  value={questData.teacher_content}
                  onChange={handleQuestDataChange}
                  placeholder="퀘스트에 대한 자세한 설명을 입력하세요"
                  className="border-2 border-gray-300 rounded-lg min-h-20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-black font-medium">난이도 *</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={questData.difficulty.toString()}
                    onValueChange={handleDifficultyChange}
                  >
                    <SelectTrigger className="w-[280px] border-2 border-gray-300 rounded-lg">
                      <SelectValue placeholder="난이도 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1점 (EASY/개념 확인)</SelectItem>
                      <SelectItem value="2">2점 (BASIC/유형 적용)</SelectItem>
                      <SelectItem value="3">3점 (MEDIUM/복합 응용)</SelectItem>
                      <SelectItem value="4">4점 (HARD/심화 분석)</SelectItem>
                      <SelectItem value="5">5점 (VERY_HARD/창의적 해결)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                    onClick={() => setShowDifficultyGuide(true)}
                  >
                    난이도 가이드
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-black font-medium">대상 학생 선택 *</Label>
                {isLoadingStudents && <p>학생 목록 로딩 중...</p>}
                {fetchError && <p className="text-red-600">{fetchError}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allStudents.map((student) => {
                    const personalRec = personalRewards.get(student.id);
                    const aiRec = aiRecommendations.get(student.id);
                    return (
                      <div
                        key={student.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${selectedStudents.includes(student.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                          }`}
                        onClick={() => toggleStudent(student.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border-2 ${selectedStudents.includes(student.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                            }`}>
                            {selectedStudents.includes(student.id) && (
                              <div className="w-full h-full bg-white rounded-sm flex items-center justify-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-black">{student.real_name}</p>
                            {selectedStudents.includes(student.id) && aiModeEnabled && personalRec && (
                              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                <p className="font-semibold text-blue-700">
                                  적용 보상: C {personalRec.coral} / R {personalRec.research}
                                </p>
                                {aiRec?.reason && (
                                  <p className="text-blue-600">AI 사유: {aiRec.reason}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {formErrors.selectedStudents && (
                  <p className="text-sm text-red-600 pt-3">{formErrors.selectedStudents}</p>
                )}
                <p className="text-sm text-gray-600 mt-3">
                  선택된 학생: {selectedStudents.length}명
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                    onClick={() => setShowAIReward(true)}
                  >
                    AI 보상 추천받기
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-black font-medium">마감일</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={questData.deadline}
                    onChange={handleQuestDataChange}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              {!aiModeEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="reward_coral_default" className="text-black font-medium">기본 코랄 보상</Label>
                    <Input
                      id="reward_coral_default"
                      type="number"
                      value={questData.reward_coral_default}
                      onChange={handleQuestDataChange}
                      placeholder="예: 50"
                      className="border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reward_research_data_default" className="text-black font-medium">기본 탐사 데이터 보상</Label>
                    <Input
                      id="reward_research_data_default"
                      type="number"
                      value={questData.reward_research_data_default}
                      onChange={handleQuestDataChange}
                      placeholder="예: 30"
                      className="border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {formErrors.formGeneral && (
            <p className="text-sm text-red-600 text-center pt-2">{formErrors.formGeneral}</p>
          )}

          {/* 액션 버튼들 */}
          <div className="flex gap-3 pt-6 border-t-2 border-gray-300">
            <Button
              onClick={handleSubmit}
              className="bg-black hover:bg-gray-800 text-white rounded-lg border-2 border-gray-300"
              disabled={isSubmitting || isLoadingStudents}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? "등록 중..." : "개인 퀘스트 등록"}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/teacher/quest')}
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
            >
              취소
            </Button>
          </div>
        </div>
      </div>

      {/* 난이도 기준 모달 */}
      <Dialog open={showDifficultyGuide} onOpenChange={setShowDifficultyGuide}>
        <DialogContent className="max-w-2xl">
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-black mb-2">난이도 기준</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 1점 (EASY/개념 확인): 수업이나 교재에서 배운 핵심 개념이나 공식을 그대로 기억해서 풀 수 있는 문제(예: 일반적인 문제집의 '개념 체크', '보기' 문제)</li>
                <li>• 2점 (BASIC/유형 적용): 배운 개념을 직접적으로 적용하는 가장 대표적인 유형의 문제(예: 쎈 B스텝 - 하)</li>
                <li>• 3점 (MEDIUM/복합 응용): 두 가지 이상의 개념이 함께 사용되거나, 문제의 조건을 한 번 더 생각해야 하는 응용 문제(예: 쎈 B스텝 - 중/상)</li>
                <li>• 4점 (HARD/심화 분석): 문제의 구조를 분석하고 숨겨진 조건을 찾아야 하는 본격적인 심화 문제(예: 쎈 C스텝)</li>
                <li>• 5점 (VERY_HARD/창의적 해결): 기존 풀이법을 넘어서는 창의적인 아이디어가 필요하거나, 여러 단계를 거쳐 논리적으로 증명/추론해야 하는 최고난도 문제(예: 모의고사 킬러문항)</li>
              </ul>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowDifficultyGuide(false)}
                className="bg-black hover:bg-gray-800 text-white rounded-lg"
              >
                확인
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI 보상 추천 모달 */}
      <Dialog open={showAIReward} onOpenChange={setShowAIReward}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black">AI 보상 추천받기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                선택한 학생들({selectedStudents.length}명)을 대상으로 AI가 개별 보상을 추천합니다.<br></br>
                (현재 퀘스트 제목: "{questData.title || '미입력'}")
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAIReward(false)}
                className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              >
                취소
              </Button>
              <Button
                onClick={handleAiRecommend}
                className="bg-black hover:bg-gray-800 text-white rounded-lg"
                disabled={isAiLoading}
              >
                {isAiLoading ? "추천 중..." : "추천받기"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI 학생별 보상 추천 모달 */}
      <Dialog open={showAiStudentModal} onOpenChange={setShowAiStudentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black">학생별 추천 보상</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-700 font-semibold">
                퀘스트: {questData.title || "제목 없음"}
              </p>
            </div>
            <div className="max-h-[60vh] overflow-y-auto space-y-3 p-1">
              {selectedStudents.map(studentId => {
                const student = allStudents.find(s => s.id === studentId);
                const aiRec = aiRecommendations.get(studentId);
                const personalRec = personalRewards.get(studentId);
                if (!student) return null;

                const isEdited = aiRec && personalRec &&
                  (aiRec.recommended_coral !== personalRec.coral || aiRec.recommended_research_data !== personalRec.research);

                return (
                  <div key={studentId} className="p-3 border rounded-lg bg-white shadow-sm">
                    <p className="font-semibold text-black">{student.real_name}</p>
                    {!aiRec || !personalRec ? (
                      <p className="text-sm text-gray-500">AI 추천 정보를 불러올 수 없습니다.</p>
                    ) : (
                      <>
                        <p className="text-sm text-blue-700">
                          AI 추천: {aiRec.recommended_research_data} 탐사데이터, {aiRec.recommended_coral} 코랄
                        </p>
                        <p className={`text-sm font-medium ${isEdited ? 'text-green-700' : 'text-gray-700'}`}>
                          적용 보상: {personalRec.research} 탐사데이터, {personalRec.coral} 코랄
                        </p>
                        <p className="text-xs text-gray-600 mt-1">이유: {aiRec.reason}</p>
                        {personalRec.memo && (
                          <p className="text-xs text-purple-600 mt-1">메모: {personalRec.memo}</p>
                        )}
                        <Button
                          variant="link"
                          className="p-0 h-auto text-sm text-blue-600 hover:text-blue-800"
                          onClick={() => handleOpenEditModal(studentId)}
                        >
                          [수정하기]
                        </Button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelAllAiRecs}
                className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              >
                취소
              </Button>
              <Button
                onClick={handleConfirmAllAiRecs}
                className="bg-black hover:bg-gray-800 text-white rounded-lg"
              >
                전체 확정
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI 개별 학생 보상 수정 모달 */}
      <Dialog open={showAiStudentEditModal} onOpenChange={setShowAiStudentEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-black">
              {currentEditStudent?.real_name} 학생 보상 수정
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentEditAiRec ? (
              <>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">
                    AI 추천: {currentEditAiRec.recommended_research_data} 탐사데이터, {currentEditAiRec.recommended_coral} 코랄
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editResearch" className="text-black font-medium">수정값: 탐사데이터</Label>
                  <Input
                    id="editResearch"
                    type="number"
                    value={editForm.research}
                    onChange={(e) => setEditForm(prev => ({ ...prev, research: e.target.value }))}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                  {(() => {
                    const aiResearch = currentEditAiRec.recommended_research_data;
                    const editedResearch = Number(editForm.research) || 0;
                    const researchChange = aiResearch > 0 ? ((editedResearch - aiResearch) / aiResearch) * 100 : (editedResearch > 0 ? 100 : 0);
                    return (
                      <p className={`text-sm ${researchChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        변경률: {researchChange.toFixed(1)}%
                      </p>
                    )
                  })()}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editCoral" className="text-black font-medium">수정값: 코랄</Label>
                  <Input
                    id="editCoral"
                    type="number"
                    value={editForm.coral}
                    onChange={(e) => setEditForm(prev => ({ ...prev, coral: e.target.value }))}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                  {(() => {
                    const aiCoral = currentEditAiRec.recommended_coral;
                    const editedCoral = Number(editForm.coral) || 0;
                    const coralChange = aiCoral > 0 ? ((editedCoral - aiCoral) / aiCoral) * 100 : (editedCoral > 0 ? 100 : 0);
                    return (
                      <p className={`text-sm ${coralChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        변경률: {coralChange.toFixed(1)}%
                      </p>
                    )
                  })()}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editMemo" className="text-black font-medium">메모 (선택)</Label>
                  <Textarea
                    id="editMemo"
                    value={editForm.memo}
                    onChange={(e) => setEditForm(prev => ({ ...prev, memo: e.target.value }))}
                    placeholder="수정 사유를 입력하세요 (예: 최근 성적 향상으로 상향 조정)"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
              </>
            ) : (
              <p>AI 추천 정보를 불러올 수 없습니다.</p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              >
                취소
              </Button>
              <Button
                onClick={handleConfirmEdit}
                className="bg-black hover:bg-gray-800 text-white rounded-lg"
              >
                확인
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
