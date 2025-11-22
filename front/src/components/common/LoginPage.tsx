import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AppContext";
import { post } from "../../utils/api";

type FormErrors = {
  username: string | null;
  password: string | null;
  formGeneral: string | null; // 아이디/비번 불일치, 서버 에러 등
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

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


      const result = await response.json();
      console.log('로그인 응답:', result);
      
      // 백엔드 응답의 success 필드 확인 (가장 중요!)
      if (!result.success) {
        const errorMessage = result.message || '아이디 또는 비밀번호가 일치하지 않습니다.';
        console.error('로그인 실패:', errorMessage);
        setFormErrors(prev => ({ ...prev, formGeneral: errorMessage }));
        return;
      }

      // HTTP 상태 코드도 확인
      if (!response.ok) {
        const status = response.status;
        const errorMessage = result.message || (status === 401 ? '아이디 또는 비밀번호가 일치하지 않습니다.' : '로그인에 실패했습니다.');
        console.error('HTTP 에러:', status, errorMessage);
        setFormErrors(prev => ({ ...prev, formGeneral: errorMessage }));
        return;
      }

      const { data } = result;
      
      // data가 없으면 에러
      if (!data) {
        console.error('로그인 응답에 data가 없습니다:', result);
        setFormErrors(prev => ({ ...prev, formGeneral: '로그인 응답 데이터가 없습니다.' }));
        return;
      }
      
      // 필수 필드 확인
      if (!data.access_token || !data.refresh_token) {
        console.error('토큰이 없습니다:', data);
        setFormErrors(prev => ({ ...prev, formGeneral: '로그인 토큰을 받지 못했습니다.' }));
        return;
      }
      
      // 사용자 정보 확인
      if (role === 'teacher' && !data.teacher_id) {
        console.error('선생님 정보가 없습니다:', data);
        setFormErrors(prev => ({ ...prev, formGeneral: '선생님 정보를 받지 못했습니다.' }));
        return;
      }
      if (role === 'student' && !data.student_id) {
        console.error('학생 정보가 없습니다:', data);
        setFormErrors(prev => ({ ...prev, formGeneral: '학생 정보를 받지 못했습니다.' }));
        return;
      }

      // 백엔드 응답 구조에 맞게 user 객체 생성
      let userData: any;
      if (role === 'teacher') {
        userData = {
          id: String(data.teacher_id),
          username: data.username,
          real_name: data.real_name,
          nickname: data.nickname,
          email: data.email,
          classes: [] // 초기값, 나중에 API로 가져올 수 있음
        };
      } else {
        userData = {
          id: String(data.student_id),
          username: data.username,
          real_name: data.real_name,
          nickname: data.nickname,
          email: data.email,
          invite_code: '',
          coral: data.coral || 0,
          research_data: data.research_data || 0,
          mainFish: ''
        };
      }

      login(userData, role as 'teacher' | 'student', data.access_token, data.refresh_token);

      if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
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
    <div className="retro-layout min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: "var(--bg-url)" }}>
      <div className="window" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="title-bar">
          <div className="title-bar-text">&nbsp;{title}</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button aria-label="Close" />
          </div>
        </div>
        <div className="window-body">
          <div style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}>
            <button
              onClick={() => navigate('/')}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 8px",
                minWidth: "auto"
              }}
              title="뒤로가기"
            >
              <ArrowLeft size={16} style={{ marginRight: "4px", color: "black" }} />
              뒤로
            </button>
          </div>
        </div>
        <form onSubmit={handleLogin}>
          <div className="field-row-stacked" style={{ marginBottom: "12px" }}>
            <label htmlFor="username">아이디</label>
            <input
              id="username"
              type="text"
              placeholder="아이디를 입력하세요"
              style={{ width: "100%" }}
              value={formData.username}
              onChange={handleChange}
            />
            {formErrors.username && (
              <p style={{ color: "red", marginTop: "4px", margin: 0 }}>{formErrors.username}</p>
            )}
          </div>
          <div className="field-row-stacked" style={{ marginBottom: "20px" }}>
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              style={{ width: "100%" }}
              value={formData.password}
              onChange={handleChange}
            />
            {formErrors.password && (
              <p style={{ color: "red", marginTop: "4px", margin: 0 }}>{formErrors.password}</p>
            )}
          </div>
          {/* 공통 에러 메시지 */}
          {formErrors.formGeneral && (
            <p style={{ color: "red", textAlign: "center", marginBottom: "12px" }}>
              {formErrors.formGeneral}
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                minWidth: "100px",
                fontWeight: "bold",
                padding: "6px 12px"
              }}
            >
              {isLoading ? '접속 중...' : '확인'}
            </button>

            <button
              onClick={() => navigate('/signup')}
              style={{
                minWidth: "auto",
                padding: "0",
                border: "none",
                background: "none",
                boxShadow: "none",
                color: "blue",
                textDecoration: "underline",
                cursor: "pointer"
              }}
            >
              회원가입하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}