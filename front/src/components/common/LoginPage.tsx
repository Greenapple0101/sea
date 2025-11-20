import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth, TeacherUser, StudentUser } from "../../contexts/AppContext";
import { post, get } from "../../utils/api";

type FormErrors = {
  username: string | null;
  password: string | null;
  formGeneral: string | null; // 아이디/비번 불일치, 서버 에러 등
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login, updateUser } = useAuth();
  const { role } = useParams<{ role: string }>();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({
    username: null,
    password: null,
    formGeneral: null,
  });

  // 입력 필드 변경을 처리하는 공통 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // 사용자가 필드를 수정하면, 해당 필드의 에러 메시지를 즉시 제거
    const errorKey = id as keyof FormErrors;
    if (formErrors[errorKey]) {
      setFormErrors(prev => ({ ...prev, [errorKey]: null }));
    }
  };

  // 역할에 따라 제목과 로그인 로직을 분기
  const title = role === 'teacher' ? '선생님 로그인' : '학생 로그인';


  //백엔드 api 호출용
  const handleLogin = async () => {

    if (role !== 'teacher' && role !== 'student') {
      alert("잘못된 접근입니다.");
      navigate('/');
      return;
    }

    setIsLoading(true);
    setFormErrors({ username: null, password: null, formGeneral: null });

    try {
      const response = await post('/api/v1/auth/login', {
        username: formData.username,
        password: formData.password,
        role: role
      }, { skipAuth: true });


      if (!response.ok) {
        const status = response.status;
        const data = await response.json();

        if (status === 401) {
          setFormErrors(prev => ({ ...prev, formGeneral: data.message || '아이디 또는 비밀번호가 일치하지 않습니다.' }));
          return;
        }
        if (status === 400 && data.error_code === 'INVALID_INPUT' && data.data) {
          setFormErrors(prev => ({ ...prev, ...data.data }));
          return;
        }
        setFormErrors(prev => ({ ...prev, formGeneral: data.message || '로그인에 실패했습니다.' }));
        return;
      }

      const {data} = await response.json();

      // 학생인 경우 전체 사용자 정보를 StudentUser 형식으로 변환하여 저장
      if (role === 'student') {
        const studentUser = {
          id: String(data.student_id),
          real_name: data.real_name,
          nickname: data.nickname,
          username: data.username,
          email: data.email,
          invite_code: '', // 로그인 응답에 없으면 빈 문자열
          coral: data.coral ?? 0,
          research_data: data.research_data ?? 0,
          mainFish: '', // 로그인 응답에 없으면 빈 문자열
        };
        login(studentUser, role as 'teacher' | 'student', data.access_token, data.refresh_token);
        navigate('/student/dashboard');
      } else {
        // Teacher인 경우: 먼저 기본 정보로 로그인하고, classes를 가져와서 업데이트
        const teacherUser = {
          id: String(data.teacher_id),
          real_name: data.real_name,
          nickname: data.nickname,
          username: data.username,
          email: data.email,
          classes: [] as string[], // 일단 빈 배열로 시작
        };
        // 먼저 localStorage에 직접 저장 (동기적으로)
        localStorage.setItem('user', JSON.stringify(teacherUser));
        localStorage.setItem('userType', 'teacher');
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        
        // 그 다음 login() 함수 호출 (React 상태 업데이트)
        login(teacherUser, role as 'teacher' | 'student', data.access_token, data.refresh_token);
        
        // classes 정보 가져오기 (비동기, 실패해도 계속 진행)
        get('/api/v1/classes')
          .then(classesResponse => {
            if (classesResponse.ok) {
              return classesResponse.json();
            }
            return null;
          })
          .then(classesData => {
            if (classesData?.data?.classes) {
              const classIds = (classesData.data.classes || []).map((c: any) => String(c.class_id || c.classId));
              if (classIds.length > 0) {
                updateUser({ classes: classIds });
              }
            }
          })
          .catch(err => {
            console.error('Failed to fetch classes:', err);
          });
        
        // 즉시 대시보드로 이동 (localStorage에 이미 저장됨)
        window.location.href = '/teacher/dashboard';
      }

    } catch (error) {
      console.error('Login error:', error);
      const message = (error instanceof Error) ? error.message : "알 수 없는 에러가 발생했습니다.";
      setFormErrors(prev => ({ ...prev, formGeneral: `네트워크 오류: ${message}` }));
    } finally {
      console.log('Login finished');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-gray-300">
        <CardHeader className="text-center border-b-2 border-gray-300 relative">
          {/* 역할 선택 페이지('/')로 돌아가는 '뒤로가기' 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 border border-gray-300 hover:bg-gray-100"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-16 h-16 bg-gray-300 rounded mx-auto mb-4"></div>
          <CardTitle className="text-black">{title}</CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">아이디</Label>
            <Input
              id="username"
              placeholder="아이디를 입력하세요"
              className="border-2 border-gray-300 rounded-lg"
              value={formData.username}
              onChange={handleChange}
            />
            {formErrors.username && (
              <p className="text-sm text-red-600 pt-1">{formErrors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              className="border-2 border-gray-300 rounded-lg"
              value={formData.password}
              onChange={handleChange}
            />
            {formErrors.password && (
              <p className="text-sm text-red-600 pt-1">{formErrors.password}</p>
            )}
          </div>

          {/* API 에러 메시지를 사용자에게 표시 */}
          {formErrors.formGeneral && (
            <p className="text-sm text-red-600 text-center">{formErrors.formGeneral}</p>
          )}

          <Button
            className="w-full bg-black hover:bg-gray-800 text-white rounded-lg h-12"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>

          <div className="text-center pt-2">
            {/* Link 컴포넌트를 사용해 통합 회원가입 페이지로 이동 */}
            <Link
              to="/signup" // SignupPage.tsx
              className="text-black underline"
            >
              회원가입하기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}