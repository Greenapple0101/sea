import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface StudentUser {
  id: string;
  real_name: string;
  nickname: string;
  username: string;
  email: string;
  invite_code: string;
  coral: number;
  research_data: number;
  total_earned_coral?: number;
  total_earned_research_data?: number;
  mainFish: string;
}

export interface TeacherUser {
  id: string;
  real_name: string;
  nickname: string;
  username: string;
  email: string;
  classes: string[];
}

export type User = StudentUser | TeacherUser;

export interface Theme {
  mode: 'light' | 'dark';
  language: 'ko' | 'en';
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

// State Interface
export interface AppState {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  userType: 'student' | 'teacher' | null;
  currentClassId: string | null;

  // Theme
  theme: Theme;

  // UI State
  loading: boolean;
  notifications: Notification[];

  // Data
  quests: any[];
  raids: any[];
}

// Action Types
export type AppAction =
  | { type: 'SET_USER'; payload: { user: User; userType: 'student' | 'teacher'; accessToken: string; refreshToken: string } }
  | { type: 'CLEAR_USER' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_CURRENT_CLASS'; payload: string }
  | { type: 'SET_THEME'; payload: Partial<Theme> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_QUESTS'; payload: any[] }
  | { type: 'SET_RAIDS'; payload: any[] };

// [이유] 새로고침 시에도 로그인 상태 유지
const storedUser = localStorage.getItem('user');
const storedUserType = localStorage.getItem('userType');

// 안전하게 user 파싱
let parsedUser: User | null = null;
try {
  if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
    parsedUser = JSON.parse(storedUser);
  }
} catch (error) {
  console.error('Failed to parse stored user:', error);
  localStorage.removeItem('user');
}

const storedCurrentClassId = localStorage.getItem('currentClassId');

// Initial State
const initialState: AppState = {
  user: parsedUser,
  isAuthenticated: !!parsedUser,
  userType: storedUserType as 'student' | 'teacher' | null,
  currentClassId: storedCurrentClassId,
  theme: {
    mode: 'light',
    language: 'ko'
  },
  loading: false,
  notifications: [],
  quests: [],
  raids: []
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER': {
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('userType', action.payload.userType);
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);

      const isTeacher = action.payload.userType === 'teacher';
      const teacherUser = action.payload.user as TeacherUser;
      let firstClassId: string | null = null;

      if (isTeacher && teacherUser.classes && teacherUser.classes.length > 0) {
        firstClassId = teacherUser.classes[0];
        localStorage.setItem('currentClassId', firstClassId);
      }

      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        userType: action.payload.userType,
        currentClassId: firstClassId
      };
    }

    case 'UPDATE_USER':
      if (!state.user) {
        return state;
      }
      const updatedUser = { ...state.user, ...action.payload } as User;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return {
        ...state,
        user: updatedUser
      };

    case 'CLEAR_USER':
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentClassId');
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        userType: null,
        currentClassId: null
      };

    case 'SET_CURRENT_CLASS':
      localStorage.setItem('currentClassId', action.payload);
      return {
        ...state,
        currentClassId: action.payload
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: { ...state.theme, ...action.payload }
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'ADD_NOTIFICATION':
      const notification: Notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date()
      };
      return {
        ...state,
        notifications: [...state.notifications, notification]
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case 'SET_QUESTS':
      return {
        ...state,
        quests: action.payload
      };

    case 'SET_RAIDS':
      return {
        ...state,
        raids: action.payload
      };

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider Component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom Hooks
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function useAuth() {
  const { state, dispatch } = useApp();

  const login = (user: any, userType: 'student' | 'teacher', accessToken: string, refreshToken: string) => {
    dispatch({ type: 'SET_USER', payload: { user: user as User, userType, accessToken, refreshToken } });
  };

  const logout = () => {
    dispatch({ type: 'CLEAR_USER' });
  };

  const updateUser = (payload: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload });
  };

  const setCurrentClass = (classId: string) => {
    dispatch({ type: 'SET_CURRENT_CLASS', payload: classId });
  };

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    userType: state.userType,
    access_token: state.isAuthenticated ? localStorage.getItem('accessToken') : null,
    currentClassId: state.currentClassId,
    setCurrentClass,
    login,
    logout,
    updateUser
  };
}

export function useTheme() {
  const { state, dispatch } = useApp();

  const setTheme = (theme: Partial<Theme>) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  return {
    theme: state.theme,
    setTheme
  };
}

export function useNotifications() {
  const { state, dispatch } = useApp();

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  return {
    notifications: state.notifications,
    addNotification,
    removeNotification
  };
}

export function useQuests() {
  const { state, dispatch } = useApp();

  const setQuests = (quests: any[]) => {
    dispatch({ type: 'SET_QUESTS', payload: quests });
  };

  return {
    quests: state.quests,
    setQuests
  };
}

export function useRaids() {
  const { state, dispatch } = useApp();

  const setRaids = (raids: any[]) => {
    dispatch({ type: 'SET_RAIDS', payload: raids });
  };

  return {
    raids: state.raids,
    setRaids
  };
}
