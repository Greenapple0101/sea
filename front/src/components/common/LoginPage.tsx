import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from "lucide-react";
import { useAuth, TeacherUser, StudentUser } from "../../contexts/AppContext";
import { getFullUrl, get } from "../../utils/api";

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
      const loginUrl = getFullUrl('/api/v1/auth/login');
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          role: role
        }),
      });
      
      let parsedBody: any = null;
      try {
        parsedBody = await response.json();
      } catch (parseError) {
        console.error('Login response JSON parse error:', parseError);
        setFormErrors(prev => ({
          ...prev,
          formGeneral: '서버가 잘못된 응답을 보냈습니다. 잠시 후 다시 시도해주세요.'
        }));
        return;
      }

      if (!response.ok) {
        const status = response.status;
        const data = parsedBody || {};

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

      const { data } = parsedBody || {};
      if (!data) {
        setFormErrors(prev => ({
          ...prev,
          formGeneral: '로그인 응답이 올바르지 않습니다. 잠시 후 다시 시도해주세요.'
        }));
        return;
      }

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
    <div className="retro-layout min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="window" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="title-bar">
          <div className="title-bar-text">&nbsp;{title}</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button aria-label="Close" />
          </div>
        </div>
        <div className="window-body">
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={() => navigate('/')}
              style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px', minWidth: 'auto' }}
              title="뒤로가기"
              type="button"
            >
              <ArrowLeft size={16} style={{ marginRight: '4px', color: 'black' }} />
              뒤로
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <div className="field-row-stacked" style={{ marginBottom: '12px' }}>
              <label htmlFor="username">아이디</label>
              <input
                id="username"
                type="text"
                placeholder="아이디를 입력하세요"
                value={formData.username}
                onChange={handleChange}
                style={{ width: '100%' }}
              />
              {formErrors.username && (
                <p style={{ color: 'red', marginTop: '4px', marginBottom: 0 }}>{formErrors.username}</p>
              )}
            </div>

            <div className="field-row-stacked" style={{ marginBottom: '16px' }}>
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
                style={{ width: '100%' }}
              />
              {formErrors.password && (
                <p style={{ color: 'red', marginTop: '4px', marginBottom: 0 }}>{formErrors.password}</p>
              )}
            </div>

            {formErrors.formGeneral && (
              <p style={{ color: 'red', textAlign: 'center', marginBottom: '12px' }}>
                {formErrors.formGeneral}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{ minWidth: '120px', fontWeight: 'bold', padding: '6px 12px', flex: 1 }}
              >
                {isLoading ? '접속 중...' : '확인'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/signup')}
                style={{
                  minWidth: 'auto',
                  padding: 0,
                  border: 'none',
                  background: 'none',
                  boxShadow: 'none',
                  color: 'blue',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                회원가입하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}