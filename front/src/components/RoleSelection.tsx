import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export function RoleSelection() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="xp-window w-full max-w-md">
        <div className="xp-title-bar">
          <span className="xp-title-text">학습 관리 시스템</span>
          <div className="xp-title-buttons">
            <button className="xp-close">✕</button>
          </div>
        </div>

        <div className="xp-body">
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-6">역할을 선택하여 로그인하세요.</p>
          </div>

          <div className="space-y-3">
            <button
              className="xp-button"
              onClick={() => navigate('/login/teacher')}
            >
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="2" width="16" height="18" rx="2" fill="#E5E5E5" stroke="#4B4B4B" strokeWidth="1"/>
                <circle cx="11" cy="8" r="4" fill="#BFD7FF" stroke="#0046C0" strokeWidth="1"/>
                <path d="M5 19C5.4 15 8 13 11 13C14 13 16.6 15 17 19" stroke="#0046C0" strokeWidth="1.2"/>
              </svg>
              선생님으로 로그인
            </button>

            <button
              className="xp-button"
              onClick={() => navigate('/login/student')}
            >
              <svg width="18" height="18" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6H9L11 8H20V17H2V6Z" fill="#FFEB99" stroke="#C2A100" strokeWidth="1"/>
                <path d="M2 6H20V17H2V6Z" fill="#FFF4C2" opacity="0.6"/>
              </svg>
              학생으로 로그인
            </button>
          </div>

          <div className="text-center pt-6 mt-6 border-t border-gray-300">
            <span className="text-gray-700 text-[13px]">계정이 없으신가요? </span>
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-600 underline text-[13px] hover:text-blue-800"
            >
              회원가입하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
