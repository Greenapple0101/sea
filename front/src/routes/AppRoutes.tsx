import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/teacher/Sidebar';

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
    <div className="min-h-screen bg-white">
      <Outlet />
      <StudentBottomNav />
    </div>
  );
};

// Teacher Layout Component
const TeacherLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex">
      <main className="flex-1 ml-64 overflow-y-auto">
        <Outlet />
      </main>
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
          <Route path="class" element={<ClassManagePage />} />
          <Route path="class/create" element={<ClassCreatePage />} />
          <Route path="class/:classId/dashboard" element={<ClassActivityDashboard />} />
          <Route path="students" element={<StudentListPage />} />
          <Route path="students/:id" element={<StudentDetailPage />} />

          {/* Teacher Profile */}
          <Route path="profile" element={<TeacherProfilePage />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
