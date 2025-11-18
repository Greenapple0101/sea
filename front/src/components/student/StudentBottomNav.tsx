import React from 'react';
import { Home, BookOpen, Gamepad2, Book, Sword, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AppContext';

type StudentScreen = 'dashboard' | 'quest' | 'gacha' | 'collection' | 'raid';

export function StudentBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const navItems = [
    { id: 'dashboard' as StudentScreen, label: '홈', icon: Home, path: '/student/dashboard' },
    { id: 'quest' as StudentScreen, label: '퀘스트', icon: BookOpen, path: '/student/quests' },
    { id: 'gacha' as StudentScreen, label: '가챠', icon: Gamepad2, path: '/student/gacha' },
    { id: 'collection' as StudentScreen, label: '도감', icon: Book, path: '/student/collection' },
    { id: 'raid' as StudentScreen, label: '레이드', icon: Sword, path: '/student/raid' },
  ];


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300">
      <div className="max-w-md mx-auto">
        <div className="flex gap-1 p-2 overflow-x-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <IconComponent size={20} />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
          
          {/* 로그아웃 버튼 */}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex flex-col items-center justify-center py-2 px-3 rounded transition-all text-gray-600 hover:bg-red-100 hover:text-red-600 whitespace-nowrap"
          >
            <LogOut size={20} />
            <span className="text-xs mt-1">로그아웃</span>
          </button>
        </div>
      </div>
    </div>
  );
}