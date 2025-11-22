import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Plus, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { post } from "../../utils/api";

type FormErrors = {
  name?: string | null;
  grade?: string | null;
  invite_code?: string | null;
  formGeneral?: string | null;
};

export function ClassCreatePage() {
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState({
    name: "",
    grade: "",
    subject: "수학",
    description: ""
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // 입력 필드 변경을 처리하는 공통 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setClassInfo(prev => ({ ...prev, [id]: value }));
    // 필드 수정 시, 해당 필드의 에러를 즉시 제거
    if (formErrors[id as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [id as keyof FormErrors]: null }));
    }
  };

  //백엔드 api 호출용
   const handleSave = async () => {
      if (!classInfo.name || !classInfo.grade) {
        setFormErrors({
          name: !classInfo.name ? "반 이름을 입력해주세요." : null,
          grade: !classInfo.grade ? "학년을 입력해주세요." : null
        });
        return;
      }

      setIsLoading(true);
      setFormErrors({});

      try {
        // 백엔드 API 요구사항에 맞게 데이터 변환 (name -> class_name)
        const requestData = {
          class_name: classInfo.name,
          grade: classInfo.grade,
          subject: classInfo.subject,
          description: classInfo.description
        };

        // api.ts의 post 함수 사용 - 자동으로 Authorization 헤더에 Bearer token 추가
        const response = await post('/api/v1/classes', requestData);

        if (!response.ok) {
          const status = response.status;
          const responseData = await response.json();
          if (status === 400 && responseData.error_code === 'INVALID_INPUT' && responseData.data) {
            setFormErrors(responseData.data);
            return;
          }
          throw new Error(responseData.message || '반 생성에 실패했습니다.');
        }

        // 백엔드 응답에서 생성된 반 정보 가져오기
        const responseData = await response.json();
        const createdClass = responseData.data;

        alert(`반이 생성되었습니다!\n반명: ${createdClass.class_name}\n초대코드: ${createdClass.invite_code}`);
        navigate('/teacher/dashboard');

      } catch (error) {
        if (error instanceof Error) {
          console.error("반 생성 실패:", error.message);
          alert(`반 생성에 실패했습니다: ${error.message}`);
        } else {
          console.error("반 생성 실패:", error);
          alert("알 수 없는 에러가 발생했습니다.");
        }
      }
    }; 

  const handleCancel = () => {
    navigate('/teacher/dashboard');
  };

  return (
    <>
      {/* Header */}
      <div className="border-b-2 border-gray-300 p-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black">새 반 만들기</h1>
            <p className="text-gray-600 mt-1">새로운 반을 생성하고 학생들을 초대하세요</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-4xl">
        <Card className="border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Plus className="w-5 h-5" />
              반 정보 입력
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-black font-medium">반 이름 *</Label>
                <Input
                  id="name"
                  value={classInfo.name}
                  onChange={handleChange}
                  placeholder="예: 중등 1반, 고등 2반"
                  className="border-2 border-gray-300 rounded-lg"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600 pt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade" className="text-black font-medium">학년 *</Label>
                <Input
                  id="grade"
                  value={classInfo.grade}
                  onChange={handleChange}
                  placeholder="예: 중1, 고2"
                  className="border-2 border-gray-300 rounded-lg"
                />
                {formErrors.grade && (
                  <p className="text-sm text-red-600 pt-1">{formErrors.grade}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-black font-medium">과목</Label>
                <Input
                  id="subject"
                  value={classInfo.subject}
                  onChange={handleChange}
                  className="border-2 border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* 반 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-black font-medium">반 설명</Label>
              <Textarea
                id="description"
                value={classInfo.description}
                onChange={handleChange}
                placeholder="반에 대한 설명을 입력해주세요"
                className="border-2 border-gray-300 rounded-lg min-h-20"
              />
            </div>

            {/* 액션 버튼들 */}
            <div className="flex gap-3 pt-6 border-t-2 border-gray-300">
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "생성 중..." : "반 생성하기"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              >
                취소
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 안내사항 */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">반 생성 안내</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 반이 생성되면 초대 코드가 발급됩니다</li>
              <li>• 학생들은 초대 코드를 사용해 반에 참여할 수 있습니다</li>
              <li>• 반 정보는 언제든지 수정할 수 있습니다</li>
              <li>• 생성된 반은 반 관리 페이지에서 확인할 수 있습니다</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
