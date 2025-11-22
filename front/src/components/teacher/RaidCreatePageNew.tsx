import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useNavigate, useLocation } from "react-router-dom";
import { get, post } from "../../utils/api";
import { useAuth } from "../../contexts/AppContext";

interface ClassSummary {
  class_id: number;
  class_name: string;
}

interface RaidCreationInfo {
  class_info: {
    class_id: number;
    class_name: string;
    student_count: number;
  };
  templates: {
    code: string;
    display_name: string;
    description: string;
  }[];
  difficulty_options: {
    code: string;
    display_name: string;
    hp: number;
    min_hp: number;
    max_hp: number;
  }[];
  active_raid?: {
    raid_id: number;
    raid_name: string;
    status: string;
    current_hp: number;
    total_hp: number;
    end_date: string;
  } | null;
}

export function RaidCreatePageNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { classId?: number } | null;
  const { currentClassId } = useAuth();
  // 우선순위: location.state > currentClassId (전역 상태)
  const [selectedClass, setSelectedClass] = useState<number | null>(
    locationState?.classId ?? (currentClassId ? Number(currentClassId) : null)
  );
  const [classList, setClassList] = useState<ClassSummary[]>([]);
  const [creationInfo, setCreationInfo] = useState<RaidCreationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    raid_name: "",
    template: "ZELUS_INDUSTRY", // 기본값 설정
    difficulty: "",
    start_date: "",
    end_date: "",
    boss_hp: "",
    reward_coral: 100,
    special_reward_description: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  // 반 목록 조회
  useEffect(() => {
    const fetchClassList = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await get('/api/v1/classes');
        const json = await response.json();
        console.log('반 목록 조회 응답:', { status: response.status, ok: response.ok, json }); // 디버깅용
        
        if (response.ok && json.data) {
          const classes = json.data.classes || [];
          setClassList(classes);
          
          // location.state나 currentClassId가 없고, 반 목록이 있으면 currentClassId 사용
          if (!selectedClass && currentClassId) {
            const classId = Number(currentClassId);
            if (!isNaN(classId)) {
              console.log('currentClassId에서 반 선택:', classId); // 디버깅용
              setSelectedClass(classId);
            }
          } else if (classes.length === 0) {
            setError('생성된 반이 없습니다. 먼저 반을 생성해주세요.');
          }
        } else {
          const errorMsg = json?.message || '반 목록을 불러오지 못했습니다.';
          console.error('반 목록 조회 실패:', errorMsg);
          setError(errorMsg);
        }
      } catch (err: any) {
        console.error('반 목록 조회 중 오류:', err);
        if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
          setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        } else {
          setError('반 목록을 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchClassList();
  }, [selectedClass]);

  const loadCreationInfo = useCallback(async (classId: number) => {
    setInfoLoading(true);
    setError(null);
    try {
      const response = await get(`/api/v1/raids/creation-info?class_id=${classId}`);
      const json = await response.json();
      console.log('Raid creation info API response:', { status: response.status, ok: response.ok, json }); // 디버깅용
      
      if (!response.ok) {
        // 백엔드에서 반환한 에러 메시지 사용
        const errorMsg = json?.message || json?.data?.message || 
          (response.status === 404 
            ? `반 정보를 찾을 수 없습니다. (반 ID: ${classId})` 
            : '레이드 생성 정보를 불러오지 못했습니다.');
        
        // CLASS_NOT_FOUND 에러인 경우 더 명확한 메시지
        if (json?.error_code === 'CLASS_NOT_FOUND' || response.status === 404) {
          setError(`반을 찾을 수 없습니다. (반 ID: ${classId}) 반이 존재하는지 확인해주세요.`);
        } else {
          setError(errorMsg);
        }
        setCreationInfo(null);
        return;
      }

      if (json.data) {
        console.log('Raid creation info data:', json.data); // 디버깅용
        setCreationInfo(json.data);
        setError(null); // 성공 시 오류 메시지 제거
        const firstDifficulty = json.data.difficulty_options?.[0];
        setFormState((prev) => ({
          ...prev,
          template: prev.template || json.data.templates?.[0]?.code || 'ZELUS_INDUSTRY',
          difficulty: firstDifficulty?.code ?? prev.difficulty,
          reward_coral: firstDifficulty?.code === 'LOW' ? 100 : firstDifficulty?.code === 'MEDIUM' ? 150 : firstDifficulty?.code === 'HIGH' ? 200 : 100
        }));
      } else {
        setError('레이드 생성 정보를 불러오지 못했습니다.');
        setCreationInfo(null);
      }
    } catch (err: any) {
      console.error('Error loading creation info:', err);
      // 네트워크 오류인 경우
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else {
        const errorMsg = err?.message ?? '레이드 생성 정보를 불러오는 중 오류가 발생했습니다.';
        setError(errorMsg);
      }
      setCreationInfo(null);
    } finally {
      setInfoLoading(false);
    }
  }, []);

  // 반이 선택되면 레이드 생성 정보 불러오기
  useEffect(() => {
    if (!selectedClass) {
      setCreationInfo(null);
      return;
    }
    loadCreationInfo(selectedClass);
  }, [selectedClass, loadCreationInfo]);

  const handleRefreshInfo = () => {
    if (selectedClass) {
      loadCreationInfo(selectedClass);
    }
  };

  const canCreate = useMemo(() => {
    if (!creationInfo || !selectedClass) {
      console.log('canCreate: false - creationInfo or selectedClass missing', { creationInfo, selectedClass });
      return false;
    }
    if (creationInfo.active_raid) {
      console.log('canCreate: false - active raid exists', creationInfo.active_raid);
      return false;
    }
    // 더 엄격한 검증
    const bossHpNum = Number(formState.boss_hp);
    const isValid = Boolean(
      formState.raid_name?.trim() &&
      formState.start_date?.trim() &&
      formState.end_date?.trim() &&
      formState.difficulty &&
      formState.boss_hp?.trim() &&
      !isNaN(bossHpNum) &&
      bossHpNum > 0 &&
      formState.reward_coral > 0
    );
    if (!isValid) {
      console.log('canCreate: false - form validation failed', {
        raid_name: formState.raid_name,
        start_date: formState.start_date,
        end_date: formState.end_date,
        difficulty: formState.difficulty,
        boss_hp: formState.boss_hp,
        bossHpNum,
        reward_coral: formState.reward_coral
      });
    }
    return isValid;
  }, [creationInfo, formState, selectedClass]);

  const missingFields = useMemo(() => {
    const fields: string[] = [];
    if (!formState.raid_name) fields.push('레이드 이름');
    if (!formState.start_date) fields.push('시작 날짜');
    if (!formState.end_date) fields.push('종료 날짜');
    if (!formState.difficulty) fields.push('난이도');
    if (!formState.boss_hp || Number(formState.boss_hp) <= 0) fields.push('보스 HP');
    if (!formState.reward_coral || formState.reward_coral <= 0) fields.push('코랄 보상');
    return fields;
  }, [formState]);

  const handleSubmit = async () => {
    if (!selectedClass) return;
    setSubmitMessage(null);
    setSubmitting(true);
    try {
      // datetime-local 형식을 ISO 8601 형식으로 변환
      const formatDateTime = (dateTimeString: string): string => {
        if (!dateTimeString) return '';
        // datetime-local 형식 (YYYY-MM-DDTHH:mm)을 ISO 8601 형식으로 변환
        return dateTimeString + ':00'; // 초 추가
      };

      const payload = {
        class_id: selectedClass,
        raid_name: formState.raid_name.trim(),
        template: formState.template,
        difficulty: formState.difficulty,
        start_date: formatDateTime(formState.start_date),
        end_date: formatDateTime(formState.end_date),
        boss_hp: Number(formState.boss_hp),
        reward_coral: formState.reward_coral,
        special_reward_description: formState.special_reward_description.trim() || null
      };

      console.log('레이드 생성 요청:', payload); // 디버깅용

      const response = await post('/api/v1/raids', payload);
      const json = await response.json();
      
      console.log('레이드 생성 응답:', { status: response.status, ok: response.ok, json }); // 디버깅용

      if (!response.ok) {
        const errorMsg = json?.message || json?.data?.message || '레이드 생성에 실패했습니다.';
        throw new Error(errorMsg);
      }
      
      setSubmitMessage('레이드가 성공적으로 생성되었습니다.');
      setTimeout(() => navigate('/teacher/raid/manage'), 1000);
    } catch (err: any) {
      console.error('레이드 생성 에러:', err);
      setSubmitMessage(err.message ?? '레이드 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6">반 목록을 불러오는 중...</div>;
  }

  return (
    <>
        <div className="border-b-2 border-gray-300 p-6">
          <h1>레이드 등록</h1>
        </div>

        <div className="p-6">
          {error && !infoLoading && (
            <div className="mb-6 p-4 border-2 border-red-300 bg-red-50 rounded-lg">
              <p className="text-red-700 font-semibold">오류</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => {
                  setError(null);
                  if (selectedClass) {
                    loadCreationInfo(selectedClass);
                  }
                }}
              >
                다시 시도
              </Button>
            </div>
          )}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>대상 반</Label>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                {classList.length > 0 ? (
                  <Select
                    value={selectedClass?.toString() || ""}
                    onValueChange={(value) => {
                      const classId = parseInt(value, 10);
                      setSelectedClass(classId);
                      setCreationInfo(null); // 반 변경 시 정보 초기화
                      setError(null); // 오류 메시지 초기화
                      // 반 선택 시 즉시 정보 불러오기
                      if (classId) {
                        loadCreationInfo(classId);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="반을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {classList.map((cls) => (
                        <SelectItem key={cls.class_id ?? cls.classId} value={String(cls.class_id ?? cls.classId)}>
                          {cls.class_name} ({cls.student_count ?? 0}명)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : loading ? (
                  <div className="px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50">
                    반 목록을 불러오는 중...
                  </div>
                ) : (
                  <div className="px-4 py-2 border-2 border-red-300 rounded-lg bg-red-50 text-red-800">
                    생성된 반이 없습니다
                  </div>
                )}
                {selectedClass && (
                  <Button
                    variant="outline"
                    className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                    onClick={handleRefreshInfo}
                    disabled={infoLoading}
                  >
                    {infoLoading ? '정보 새로고침 중...' : '정보 새로고침'}
                  </Button>
                )}
              </div>
              {selectedClass && creationInfo?.class_info && (
                <div className="px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-sm mt-3">
                  선택된 반: {creationInfo.class_info.class_name} (학생 {creationInfo.class_info.student_count}명)
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>레이드 이름</Label>
              <Input
                value={formState.raid_name}
                onChange={(e) => setFormState((prev) => ({ ...prev, raid_name: e.target.value }))}
                placeholder="예: 중간고사 대비"
                className="border-2 border-gray-300 rounded-lg"
              />
            </div>

            {/* 템플릿 선택 (스토리) */}
            <div className="space-y-2">
              <Label>설명 / 스토리</Label>
              {!selectedClass ? (
                <div className="px-6 py-12 border-2 border-gray-300 rounded-lg bg-gray-50 text-center">
                  반을 먼저 선택해주세요
                </div>
              ) : infoLoading ? (
                <div className="px-6 py-12 border-2 border-gray-300 rounded-lg bg-gray-50 text-center">
                  템플릿 정보를 불러오는 중...
                </div>
              ) : creationInfo?.templates && creationInfo.templates.length > 0 ? (
                <RadioGroup 
                  value={formState.template || creationInfo.templates[0]?.code || 'ZELUS_INDUSTRY'} 
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, template: value }))}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2"
                >
                  {creationInfo.templates.map((template) => (
                    <Card 
                      key={template.code} 
                      className={`border-2 rounded-lg transition-colors ${
                        formState.template === template.code 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value={template.code} id={template.code} className="mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <Label htmlFor={template.code} className="cursor-pointer font-bold text-base text-black block mb-2">
                              {template.display_name}
                            </Label>
                            <p className="text-sm text-gray-900 font-medium">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              ) : (
                <div className="px-6 py-12 border-2 border-red-300 rounded-lg bg-red-50 text-center text-red-800">
                  템플릿 정보를 불러올 수 없습니다. "정보 새로고침" 버튼을 클릭하세요.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>참여 기간</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="space-y-1">
                  <Label className="text-sm">시작</Label>
                  <Input
                    type="datetime-local"
                    value={formState.start_date}
                    onChange={(e) => setFormState((prev) => ({ ...prev, start_date: e.target.value }))}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">종료</Label>
                  <Input
                    type="datetime-local"
                    value={formState.end_date}
                    onChange={(e) => setFormState((prev) => ({ ...prev, end_date: e.target.value }))}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>난이도</Label>
              <div className="mt-2">
                <Select value={formState.difficulty} onValueChange={(value) => {
                  const coralReward = value === 'LOW' ? 100 : value === 'MEDIUM' ? 150 : value === 'HIGH' ? 200 : 100;
                  setFormState((prev) => ({ 
                    ...prev, 
                    difficulty: value,
                    reward_coral: coralReward
                  }));
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="난이도를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="LOW">하 난이도 (Easy)</SelectItem>
                    <SelectItem value="MEDIUM">중 난이도 (Normal)</SelectItem>
                    <SelectItem value="HIGH">상 난이도 (Hard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formState.difficulty && (
                <div className="text-sm text-gray-600 mt-2">
                  {formState.difficulty === 'LOW' && '학생 참여율이 낮아도 클리어 가능한 난이도'}
                  {formState.difficulty === 'MEDIUM' && '평균 협력으로 클리어 가능한 표준 난이도'}
                  {formState.difficulty === 'HIGH' && '전원 참여해야 클리어 가능한 높은 난이도'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>보스 HP</Label>
              <Input
                type="number"
                value={formState.boss_hp}
                onChange={(e) => setFormState((prev) => ({ ...prev, boss_hp: e.target.value }))}
                placeholder="보스 HP를 입력하세요"
                className="border-2 border-gray-300 rounded-lg mt-2"
              />
              {formState.difficulty && (() => {
                const hpRanges: Record<string, { min: number; max: number }> = {
                  'LOW': { min: 30000, max: 36000 },
                  'MEDIUM': { min: 38000, max: 46000 },
                  'HIGH': { min: 48000, max: 56000 }
                };
                const range = hpRanges[formState.difficulty];
                
                return range ? (
                  <p className="text-sm text-gray-500">
                    추천 범위: {range.min.toLocaleString()} ~ {range.max.toLocaleString()}
                  </p>
                ) : null;
              })()}
            </div>

            <Card className="border-2 border-gray-300 rounded-lg">
              <CardContent className="p-4 pt-4 space-y-3">
                <h4 className="text-base font-semibold">공통 보상</h4>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">코랄</Label>
                  <Select 
                    value={formState.reward_coral.toString()} 
                    onValueChange={(value) => setFormState((prev) => ({ ...prev, reward_coral: Number(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="코랄 보상을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">하: 100 코랄</SelectItem>
                      <SelectItem value="150">중: 150 코랄</SelectItem>
                      <SelectItem value="200">상: 200 코랄</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">특별 보상 (선택)</Label>
                  <Input
                    value={formState.special_reward_description}
                    onChange={(e) => setFormState((prev) => ({ ...prev, special_reward_description: e.target.value }))}
                    placeholder="예: 아이스크림 파티"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {creationInfo?.active_raid && (
              <Card className="border-2 border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <p className="text-red-700 font-semibold">이미 진행 중인 레이드가 있습니다.</p>
                  <p className="text-sm text-red-600 mt-1">
                    {creationInfo.active_raid.raid_name} (종료 예정: {creationInfo.active_raid.end_date})
                  </p>
                </CardContent>
              </Card>
            )}

            {submitMessage && (
              <p className="text-sm text-center">{submitMessage}</p>
            )}


            <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
              <Button
                variant="outline"
                className="flex-1 border-2 border-gray-300 rounded-lg hover:bg-gray-100 h-12 font-semibold"
                onClick={() => navigate('/teacher/dashboard')}
                disabled={submitting}
              >
                취소
              </Button>
              <div className="flex-1 flex flex-col gap-1">
                <Button
                  disabled={!canCreate || submitting}
                  onClick={handleSubmit}
                  className="w-full bg-black hover:bg-gray-800 text-white rounded-lg h-12 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
                >
                  {submitting ? '등록 중...' : '레이드 등록'}
                </Button>
                {!canCreate && !submitting && (
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {!selectedClass 
                      ? '반 정보를 불러오는 중...' 
                      : !creationInfo 
                        ? (infoLoading ? '반 정보를 불러오는 중...' : '반 정보를 불러올 수 없습니다. "정보 새로고침" 버튼을 클릭하세요.')
                        : creationInfo.active_raid 
                          ? '진행 중인 레이드가 있습니다' 
                          : missingFields.length > 0 
                            ? `필수 항목: ${missingFields.join(', ')}` 
                            : '모든 필드를 입력해주세요'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
