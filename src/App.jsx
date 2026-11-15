import ToastContainer from './components/ui/ToastContainer';
import { DemoAppStateProvider } from './context/DemoAppStateContext';
import { DemoSessionProvider } from './context/DemoSessionContext';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <ToastProvider>
      <DemoSessionProvider>
        <DemoAppStateProvider>
          <AppRoutes />
          <ToastContainer />
        </DemoAppStateProvider>
      </DemoSessionProvider>
    </ToastProvider>
  );
}
