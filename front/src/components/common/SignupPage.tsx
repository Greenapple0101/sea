import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
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
           const handleSignup = async () => {
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
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-2 border-gray-300">
                <CardHeader className="border-b-2 border-gray-300 relative">
                    {/* 역할 선택 페이지('/')로 돌아가는 버튼 */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 border border-gray-300 hover:bg-gray-100"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <CardTitle className="text-center text-black">회원가입</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">

                    {/* 역할 선택 라디오 버튼 */}
                    <div className="space-y-2">
                        <Label>가입 유형 *</Label>
                        <RadioGroup
                            defaultValue="teacher"
                            className="flex gap-4"
                            onValueChange={(value: 'teacher' | 'student') => setRole(value)}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="teacher" id="r-teacher" />
                                <Label htmlFor="r-teacher">교사</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="student" id="r-student" />
                                <Label htmlFor="r-student">학생</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">아이디 *</Label>
                        <Input id="username" placeholder="아이디를 입력하세요" className="border-2 border-gray-300 rounded-lg" value={formData.username} onChange={handleChange} />
                        {formErrors.username && (
                            <p className="text-sm text-red-600 pt-1">{formErrors.username}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">비밀번호 *</Label>
                        <Input id="password" type="password" placeholder="비밀번호를 입력하세요" className="border-2 border-gray-300 rounded-lg" value={formData.password} onChange={handleChange} />
                        {formErrors.password && (
                            <p className="text-sm text-red-600 pt-1">{formErrors.password}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                        <Input id="confirmPassword" type="password" placeholder="비밀번호를 다시 입력하세요" className="border-2 border-gray-300 rounded-lg" value={formData.confirmPassword} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="real_name">이름 (실명) *</Label>
                        <Input id="real_name" placeholder="이름을 입력하세요" className="border-2 border-gray-300 rounded-lg" value={formData.real_name} onChange={handleChange} />
                        {formErrors.real_name && (
                            <p className="text-sm text-red-600 pt-1">{formErrors.real_name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nickname">닉네임 *</Label>
                        <Input id="nickname" placeholder="닉네임을 입력하세요" className="border-2 border-gray-300 rounded-lg" value={formData.nickname} onChange={handleChange} />
                        {formErrors.nickname && (
                            <p className="text-sm text-red-600 pt-1">{formErrors.nickname}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">이메일 *</Label>
                        <Input id="email" type="email" placeholder="이메일을 입력하세요" className="border-2 border-gray-300 rounded-lg" value={formData.email} onChange={handleChange} />
                        {formErrors.email && (
                            <p className="text-sm text-red-600 pt-1">{formErrors.email}</p>
                        )}
                    </div>

                    {/* 역할이 'student'일 때만 반 코드 입력창 표시 */}
                    {role === 'student' && (
                        <div className="space-y-2 transition-all duration-300">
                            <Label htmlFor="invite_code">반 코드 *</Label>
                            <Input id="invite_code" placeholder="선생님께 받은 반 코드를 입력하세요" className="border-2 border-gray-300 rounded-lg" value={formData.invite_code} onChange={handleChange} />
                            {formErrors.invite_code && (
                                <p className="text-sm text-red-600 pt-1">{formErrors.invite_code}</p>
                            )}
                        </div>
                    )}

                    {/* 약관 동의 */}
                    <div className="flex items-start space-x-2 pt-4 border-t-2 border-gray-300">
                        <Checkbox
                            id="terms"
                            checked={agreed}
                            onCheckedChange={(checked: boolean | 'indeterminate') => {
                                setAgreed(checked === true);
                            }}
                            className="border-2 border-gray-300 rounded-lg mt-1"
                        />
                        <div className="space-y-1">
                            <Label htmlFor="terms" className="cursor-pointer leading-none">
                                서비스 이용약관에 동의합니다
                            </Label>
                            <p className="text-sm text-gray-600">
                                개인정보 처리방침 및 이용약관을 확인하였으며 이에 동의합니다.
                            </p>
                        </div>
                    </div>

                    {/* 폼 하단에 표시될 '일반 에러' 메시지 */}
                    {formErrors.formGeneral && (
                        <p className="text-sm text-red-600 text-center pb-2">{formErrors.formGeneral}</p>
                    )}

                    <Button
                        className="w-full bg-black hover:bg-gray-800 text-white rounded-lg h-12"
                        onClick={handleSignup}
                        disabled={isLoading}
                    >
                        {isLoading ? '회원가입 중...' : '회원가입'}
                    </Button>

                    <div className="text-center pt-2">
                        <Label>이미 계정이 있으신가요? </Label>
                        {/* [추가] 역할에 따라 다른 로그인 페이지로 이동하는 링크 */}
                        <Link
                            to={role === 'teacher' ? '/login/teacher' : '/login/student'}
                            className="text-black underline"
                        >
                            로그인하기
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}