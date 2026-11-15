import { useEffect } from 'react';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import ToastContainer from './components/ui/ToastContainer';
import { DemoAppStateProvider } from './context/DemoAppStateContext';
import { DemoSessionProvider } from './context/DemoSessionContext';
import { ToastProvider, useToast } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';
import { normalizeAppError } from './utils/errorHandler';

function GlobalErrorListener() {
  const { showToast } = useToast();

  useEffect(() => {
    const handleRejection = (event) => {
      const msg = normalizeAppError(event?.reason, '');
      if (!msg || msg.toLowerCase().includes('websocket')) return;
      showToast({
        type: 'error',
        title: 'Unexpected background error',
        message: msg,
      });
    };

    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, [showToast]);

  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <DemoSessionProvider>
          <DemoAppStateProvider>
            <GlobalErrorListener />
            <AppRoutes />
            <ToastContainer />
          </DemoAppStateProvider>
        </DemoSessionProvider>
      </ErrorBoundary>
    </ToastProvider>
  );
}
