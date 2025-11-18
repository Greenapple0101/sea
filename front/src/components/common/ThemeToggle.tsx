import { Button } from '../ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/AppContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme({ mode: theme.mode === 'light' ? 'dark' : 'light' });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
    >
      {theme.mode === 'light' ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </Button>
  );
}
