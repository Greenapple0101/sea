import { useNavigate } from "react-router-dom";
import { User, GraduationCap } from "lucide-react";

export function RoleSelection() {
  const navigate = useNavigate();
  return (
    <div
      className="retro-layout min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg-color)" }}
    >
      <div className="window" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="title-bar">
          <div className="title-bar-text">&nbsp;학습 관리 시스템</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button aria-label="Close" />
          </div>
        </div>
        <div className="window-body">
          <p
            style={{
              textAlign: "center",
              fontSize: "13px",
              marginBottom: "15px",
              marginTop: "15px",
            }}
          >
            역할을 선택하여 로그인하세요.
          </p>

          <div
            className="space-y-4"
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <button
              onClick={() => navigate("/login/teacher")}
              style={{
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              <User size={20} style={{ marginRight: "8px" }} />
              선생님으로 로그인
            </button>

            <button
              onClick={() => navigate("/login/student")}
              style={{
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              <GraduationCap size={20} style={{ marginRight: "8px" }} />
              학생으로 로그인
            </button>
          </div>

          <div
            className="text-center pt-4"
            style={{ marginTop: "20px", textAlign: "center" }}
          >
            <span className="text-gray-700">계정이 없으신가요? </span>
            <button
              onClick={() => navigate("/signup")}
              style={{
                border: "none",
                background: "none",
                boxShadow: "none",
                color: "blue",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
                minWidth: "auto",
              }}
            >
              회원가입하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
