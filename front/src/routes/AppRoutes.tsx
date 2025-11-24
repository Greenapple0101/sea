import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/teacher/Sidebar';
import { useAuth } from '../contexts/AppContext';

// Components
import { RoleSelection } from '../components/RoleSelection';
import { StudentCollection } from '../components/student/StudentCollection';
import { StudentBottomNav } from '../components/student/StudentBottomNav';

const LoginPage = lazy(() => import('../components/common/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('../components/common/SignupPage').then(m => ({ default: m.SignupPage })));

// Student components
const StudentDashboard = lazy(() => import('../components/student/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const StudentQuests = lazy(() => import('../components/student/StudentQuests').then(m => ({ default: m.StudentQuests })));
const StudentGacha = lazy(() => import('../components/student/StudentGacha').then(m => ({ default: m.StudentGacha })));
const StudentRaid = lazy(() => import('../components/student/StudentRaid').then(m => ({ default: m.StudentRaid })));

// Teacher components
const TeacherDashboardNew = lazy(() => import('../components/teacher/TeacherDashboardNew').then(m => ({ default: m.TeacherDashboardNew })));
const QuestTypeSelection = lazy(() => import('../components/teacher/QuestTypeSelection').then(m => ({ default: m.QuestTypeSelection })));
const IndividualQuestCreatePage = lazy(() => import('../components/teacher/IndividualQuestCreatePage').then(m => ({ default: m.IndividualQuestCreatePage })));
const GroupQuestCreatePage = lazy(() => import('../components/teacher/GroupQuestCreatePage').then(m => ({ default: m.GroupQuestCreatePage })));
const GroupQuestManagePage = lazy(() => import('../components/teacher/GroupQuestManagePage').then(m => ({ default: m.GroupQuestManagePage })));
const GroupQuestDetailPage = lazy(() => import('../components/teacher/GroupQuestDetailPage').then(m => ({ default: m.GroupQuestDetailPage })));
const QuestApprovalPageNew = lazy(() => import('../components/teacher/QuestApprovalPageNew').then(m => ({ default: m.QuestApprovalPageNew })));
const RaidCreatePageNew = lazy(() => import('../components/teacher/RaidCreatePageNew').then(m => ({ default: m.RaidCreatePageNew })));
const RaidManagePage = lazy(() => import('../components/teacher/RaidManagePage').then(m => ({ default: m.RaidManagePage })));
const ClassManagePage = lazy(() => import('../components/teacher/ClassManagePage').then(m => ({ default: m.ClassManagePage })));
const StudentListPage = lazy(() => import('../components/teacher/StudentListPage').then(m => ({ default: m.StudentListPage })));
const StudentDetailPage = lazy(() => import('../components/teacher/StudentDetailPage').then(m => ({ default: m.StudentDetailPage })));
const TeacherProfilePage = lazy(() => import('../components/teacher/TeacherProfilePage').then(m => ({ default: m.TeacherProfilePage })));
const ClassCreatePage = lazy(() => import('../components/teacher/ClassCreatePage').then(m => ({ default: m.ClassCreatePage })));
const ClassActivityDashboard = lazy(() => import('../components/teacher/ClassActivityDashboard').then(m => ({ default: m.ClassActivityDashboard })));

// Student Layout Component
const StudentLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (!tab) return;

    const tabToPath: Record<string, string> = {
      dashboard: '/student/dashboard',
      quests: '/student/quests',
      gacha: '/student/gacha',
      collection: '/student/collection',
      raid: '/student/raid',
    };

    const target = tabToPath[tab];
    if (target && target !== location.pathname) {
      navigate(target, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  return (
    <div
      className="retro-layout min-h-screen"
      style={{
        backgroundImage: 'var(--bg-url)',
        backgroundRepeat: 'repeat',
        paddingBottom: '70px',
      }}
    >
      <div className="px-3 py-4 max-w-screen-xl mx-auto space-y-4">
        <Outlet />
      </div>
      <StudentBottomNav />
    </div>
  );
};

// Teacher Layout Component
const TeacherLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // localStorage에서 직접 확인
  const storedUser = localStorage.getItem('user');
  const storedUserType = localStorage.getItem('userType');
  
  useEffect(() => {
    // 로그인 페이지에서는 체크하지 않음
    if (location.pathname.startsWith('/login')) {
      return;
    }
    
    // 인증되지 않았으면 로그인 페이지로 리다이렉트
    if (!storedUser || storedUserType !== 'teacher') {
      navigate('/login/teacher', { replace: true });
    }
  }, [storedUser, storedUserType, navigate, location.pathname]);
  
  // 로그인 페이지로 가는 중이면 아무것도 렌더링하지 않음
  if (location.pathname.startsWith('/login')) {
    return null;
  }
  
  // 인증되지 않았으면 로딩 화면 표시
  if (!storedUser || storedUserType !== 'teacher') {
    return <div className="p-6">로딩중...</div>;
  }

  return (
    <div className="window min-h-screen" style={{ margin: '20px', width: 'calc(100% - 40px)', height: 'calc(100vh - 40px)' }}>
      <div className="title-bar">
        <div className="title-bar-text">SCA 선생님 대시보드</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="window-body bg-white flex" style={{ padding: 0, height: 'calc(100% - 30px)' }}>
        <Sidebar />
        <main className="flex-1 border-l-2 border-gray-300 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Main Routes Component
export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<div className="p-6">로딩중...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="quests" element={<StudentQuests />} />
          <Route path="gacha" element={<StudentGacha />} />
          <Route path="collection" element={<StudentCollection />} />
          <Route path="raid" element={<StudentRaid />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboardNew />} />

          {/* Teacher Quest Routes */}
          <Route path="quest" element={<QuestTypeSelection />} />
          <Route path="quest/individual" element={<IndividualQuestCreatePage />} />
          <Route path="quest/group" element={<GroupQuestCreatePage />} />
          <Route path="quest/group/manage" element={<GroupQuestManagePage />} />
          <Route path="quest/group/detail/:id" element={<GroupQuestDetailPage />} />
          <Route path="quest/approval" element={<QuestApprovalPageNew />} />

          {/* Teacher Raid Routes */}
          <Route path="raid/create" element={<RaidCreatePageNew />} />
          <Route path="raid/manage" element={<RaidManagePage />} />

          {/* Teacher Class Routes */}
          <Route path="class/:classId?" element={<ClassManagePage />} />
          <Route path="class/create" element={<ClassCreatePage />} />
          <Route path="class/:classId/dashboard" element={<ClassActivityDashboard />} />
          <Route path="students/:classId?" element={<StudentListPage />} />
          <Route path="students/:classId/:id" element={<StudentDetailPage />} />

          {/* Teacher Profile */}
          <Route path="profile" element={<TeacherProfilePage />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
