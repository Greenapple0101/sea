import { Button } from "../ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Plus,
  Users,
  Swords,
  CheckCircle,
  Menu,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AppContext";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();

  // 홈 페이지에서는 홈만 표시
  const homeNavItems = [
    { id: '/teacher/dashboard', label: '홈', icon: Home },
  ];

  // 다른 페이지에서는 모든 메뉴 표시
  const allNavItems = [
    { id: '/teacher/dashboard', label: '홈', icon: Home },
    { id: '/teacher/class', label: '반 관리', icon: Users },
    { id: '/teacher/quest', label: '퀘스트 등록', icon: Plus },
    { id: '/teacher/raid/create', label: '레이드 등록', icon: Swords },
    { id: '/teacher/quest/approval', label: '퀘스트 승인', icon: CheckCircle },
  ];

  const isDashboard = location.pathname === '/teacher/dashboard';
  const navItems = isDashboard ? homeNavItems : allNavItems;

  return (
    <div className={`max-h-screen bg-white border-r-2 border-gray-300 transition-all ${collapsed ? 'w-20' : 'w-64'} flex flex-col`}>
      <div className="p-4 border-b-2 border-gray-300">
        <div className="flex items-center justify-between">
          {!collapsed && <h2>SCA 수학학원</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="border border-gray-300 hover:bg-gray-100"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start rounded-none ${isActive
                ? 'bg-black text-white hover:bg-gray-800'
                : 'hover:bg-gray-100 border border-transparent hover:border-gray-300'
                }`}
              onClick={() => navigate(item.id)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {!collapsed && item.label}
            </Button>
          );
        })}
      </nav>
      <div className="p-4 border-t-2 border-gray-300">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-none text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-300"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!collapsed && "로그아웃"}
        </Button>
      </div>
    </div>
  );
}