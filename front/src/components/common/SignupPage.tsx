import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { post } from "../../utils/api";

type FormErrors = {
    username?: string | null;
    password?: string | null;
    confirmPassword?: string | null;
    real_name?: string | null;
    nickname?: string | null;
    email?: string | null;
    invite_code?: string | null;
    formGeneral?: string | null; // 약관 동의, 일반 서버 에러용
};

export function SignupPage() {
    const navigate = useNavigate();
    //teacher, student role 저장
    const [role, setRole] = useState<'teacher' | 'student'>('teacher');

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        real_name: "",
        nickname: "",
        email: "",
        invite_code: "" // 학생일 경우에만 사용될 반 코드
    });

    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({
        username: null,
        password: null,
        confirmPassword: null,
        real_name: null,
        nickname: null,
        email: null,
        invite_code: null,
        formGeneral: null,
    });

    // 입력 필드 변경을 처리하는 공통 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        const errorKey = id as keyof FormErrors;
        if (formErrors[errorKey]) {
            setFormErrors(prev => ({ ...prev, [errorKey]: null }));
        }
    };


    //백엔드 api 호출용
    const handleSignup = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
            if (formData.password !== formData.confirmPassword) {
                setFormErrors(prev => ({ ...prev, confirmPassword: "비밀번호가 일치하지 않습니다." }));
                return;
            }
            if (!agreed) {
                setFormErrors(prev => ({ ...prev, formGeneral: "서비스 이용약관에 동의해주세요." }));
                return;
            }
            if (role === 'student' && !formData.invite_code) {
                setFormErrors(prev => ({ ...prev, invite_code: "학생은 반 코드를 필수로 입력해야 합니다." }));
                return;
            }
    
            setIsLoading(true);
            setFormErrors({
                username: null, password: null, confirmPassword: null, real_name: null,
                nickname: null, email: null, invite_code: null, formGeneral: null,
            }); 
    
            try {
                let apiEndpoint = "";
                let payload: any = {
                    username: formData.username,
                    password: formData.password,
                    real_name: formData.real_name,
                    nickname: formData.nickname,
                    email: formData.email,
                };

                console.log(payload);
    
                if (role === 'teacher') {
                    apiEndpoint = '/api/v1/auth/teacher/signup';
                } else {
                    apiEndpoint = '/api/v1/auth/student/signup';
                    payload.invite_code = formData.invite_code;
                }
    
                const response = await post(apiEndpoint, payload, { skipAuth: true });
    
                if (!response.ok) {
                    const status = response.status;
                    const data = await response.json();
                    if (status === 409) {
                        const field = data.error_code === 'EMAIL_TAKEN' ? 'email' : 'username';
                        setFormErrors(prev => ({ ...prev, [field as keyof FormErrors]: data.message || '이미 사용 중입니다.' }));
                        return;
                    }
                    if (status === 400 && data.error_code === 'INVALID_INPUT' && data.data) {
                        setFormErrors(prev => ({ ...prev, ...data.data })); 
                        return;
                    }
                    if (status === 400 && data.error_code === 'INVALID_CLASS_CODE') {
                        setFormErrors(prev => ({ ...prev, invite_code: data.message || '유효하지 않은 반 코드입니다.' }));
                        return;
                    }
                    setFormErrors(prev => ({ ...prev, formGeneral: data.message || '회원가입에 실패했습니다. (서버 오류)' }));
                    return;
                }
    
                alert("회원가입에 성공했습니다! 로그인 페이지로 이동합니다.");
                if (role === 'teacher') {
                    navigate('/login/teacher');
                } else {
                    navigate('/login/student');
                }
    
            } catch (error) {
                const message = (error instanceof Error) ? error.message : "알 수 없는 에러가 발생했습니다.";
                setFormErrors({ formGeneral: `네트워크 오류: ${message}` });
            } finally {
                setIsLoading(false);
            }
        }; 

    return (
        <div className="retro-layout min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg-color)" }}>
            <div className="window" style={{ width: "100%", maxWidth: "460px" }}>
                <div className="title-bar">
                    <div className="title-bar-text">&nbsp;회원가입</div>
                    <div className="title-bar-controls">
                        <button aria-label="Minimize" />
                        <button aria-label="Maximize" />
                        <button aria-label="Close" />
                    </div>
                </div>
                <div className="window-body">
                    <div style={{ marginBottom: "15px" }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{ display: "flex", alignItems: "center", padding: "4px 8px", minWidth: "auto" }}
                            type="button"
                        >
                            <ArrowLeft size={16} style={{ marginRight: "4px", color: "black" }} />
                            돌아가기
                        </button>
                    </div>
                    <fieldset style={{ marginBottom: "15px" }}>
                        <legend>가입 유형 *</legend>
                        <div className="field-row">
                            <input
                                id="r-teacher"
                                type="radio"
                                name="role"
                                checked={role === 'teacher'}
                                onChange={() => setRole('teacher')}
                            />
                            <label htmlFor="r-teacher">교사</label>
                        </div>
                        <div className="field-row">
                            <input
                                id="r-student"
                                type="radio"
                                name="role"
                                checked={role === 'student'}
                                onChange={() => setRole('student')}
                            />
                            <label htmlFor="r-student">학생</label>
                        </div>
                    </fieldset>
                    <form onSubmit={handleSignup}>
                        <div className="field-row-stacked" style={{ marginBottom: "10px" }}>
                            <label htmlFor="username">아이디 *</label>
                            <input
                                id="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="아이디를 입력하세요"
                                style={{ width: "100%" }}
                            />
                            {formErrors.username && <p style={{ color: "red", margin: "2px 0" }}>{formErrors.username}</p>}
                        </div>
                        <div className="field-row-stacked" style={{ marginBottom: "10px" }}>
                            <label htmlFor="password">비밀번호 *</label>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="비밀번호를 입력하세요"
                                style={{ width: "100%" }}
                            />
                            {formErrors.password && <p style={{ color: "red", margin: "2px 0" }}>{formErrors.password}</p>}
                        </div>
                        <div className="field-row-stacked" style={{ marginBottom: "10px" }}>
                            <label htmlFor="confirmPassword">비밀번호 확인 *</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="비밀번호를 다시 입력하세요"
                                style={{ width: "100%" }}
                            />
                            {formErrors.confirmPassword && <p style={{ color: "red", margin: "2px 0" }}>{formErrors.confirmPassword}</p>}
                        </div>
                        <div className="field-row-stacked" style={{ marginBottom: "10px" }}>
                            <label htmlFor="real_name">이름 (실명) *</label>
                            <input
                                id="real_name"
                                type="text"
                                value={formData.real_name}
                                onChange={handleChange}
                                placeholder="이름을 입력하세요"
                                style={{ width: "100%" }}
                            />
                            {formErrors.real_name && <p style={{ color: "red", margin: "2px 0" }}>{formErrors.real_name}</p>}
                        </div>
                        <div className="field-row-stacked" style={{ marginBottom: "10px" }}>
                            <label htmlFor="nickname">닉네임 *</label>
                            <input
                                id="nickname"
                                type="text"
                                value={formData.nickname}
                                onChange={handleChange}
                                placeholder="닉네임을 입력하세요"
                                style={{ width: "100%" }}
                            />
                            {formErrors.nickname && <p style={{ color: "red", margin: "2px 0" }}>{formErrors.nickname}</p>}
                        </div>
                        <div className="field-row-stacked" style={{ marginBottom: "10px" }}>
                            <label htmlFor="email">이메일 *</label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="이메일을 입력하세요"
                                style={{ width: "100%" }}
                            />
                            {formErrors.email && <p style={{ color: "red", margin: "2px 0" }}>{formErrors.email}</p>}
                        </div>
                        {role === 'student' && (
                            <div className="field-row-stacked" style={{ marginBottom: "10px" }}>
                                <label htmlFor="invite_code">반 코드 *</label>
                                <input
                                    id="invite_code"
                                    type="text"
                                    value={formData.invite_code}
                                    onChange={handleChange}
                                    placeholder="선생님께 받은 반 코드를 입력하세요"
                                    style={{ width: "100%" }}
                                />
                                {formErrors.invite_code && <p style={{ color: "red", margin: "2px 0" }}>{formErrors.invite_code}</p>}
                            </div>
                        )}
                        <div className="field-row" style={{ marginTop: "20px", marginBottom: "20px", alignItems: "flex-start" }}>
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <label htmlFor="terms" style={{ lineHeight: "1.4", display: "inline-block", paddingTop: "2px" }}>
                                서비스 이용약관에 동의합니다.<br />
                                <span style={{ fontSize: "0.9em", color: "#666" }}>
                                    개인정보 처리방침 및 이용약관을 확인하였으며 이에 동의합니다.
                                </span>
                            </label>
                        </div>

                        {formErrors.formGeneral && (
                            <p style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>{formErrors.formGeneral}</p>
                        )}

                        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px", marginBottom: "10px" }}>
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{ padding: "6px 20px", fontWeight: "bold", width: "100%" }}
                            >
                                {isLoading ? '진행 중...' : '회원가입'}
                            </button>
                        </div>
                    </form>

                    <div style={{ textAlign: "center", marginTop: "10px" }}>
                        <span>이미 계정이 있으신가요? </span>
                        <Link
                            to={role === 'teacher' ? '/login/teacher' : '/login/student'}
                            style={{ color: "blue", textDecoration: "underline" }}
                        >
                            로그인하기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}