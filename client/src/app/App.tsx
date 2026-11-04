import { AppLayout } from './AppLayout';
import { useInitialData } from './useInitialData';
import { useApplyTheme } from '@/features/theme/useApplyTheme';
import { useChatSimulator } from '@/features/chat/hooks/useChatSimulator';

export default function App() {
  useInitialData();
  useApplyTheme();
  useChatSimulator();

  return <AppLayout />;
}
