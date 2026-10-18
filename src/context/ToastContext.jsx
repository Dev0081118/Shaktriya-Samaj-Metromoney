import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* eslint-disable react-refresh/only-export-components */
const Context = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const navigate = useNavigate();

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => () => {
    for (const timer of timers.current.values()) clearTimeout(timer);
    timers.current.clear();
  }, []);

  // Backward compatible: notify(message, type), optional third argument for navigation.
  const notify = useCallback((message, type = 'success', options = {}) => {
    const id = `${Date.now()}-${Math.random()}`;
    const path = typeof options === 'string' ? options : options?.path;
    setToasts((current) => [...current, { id, message, type, path }]);
    timers.current.set(id, setTimeout(() => dismiss(id), 6500));
    return id;
  }, [dismiss]);

  return (
    <Context.Provider value={notify}>
      {children}
      <div role="region" aria-label="Notifications" className="fixed right-[22px] top-[22px] z-[1000] grid gap-[10px] max-[520px]:left-3 max-[520px]:right-3 max-[520px]:top-3">
        {toasts.map((toast) => (
          <div key={toast.id} className={`flex min-w-[260px] max-w-[380px] items-start gap-2 border-l-[3px] px-[18px] py-[14px] text-[12px] text-white shadow-[0_12px_35px_#0002] max-[520px]:min-w-0 max-[520px]:max-w-none ${toast.type === 'error' ? 'border-[#d6a0a5] bg-[#681d25]' : 'border-[#d9b675] bg-[#263b2d]'}`}>
            {toast.path ? (
              <button type="button" className="flex-1 cursor-pointer text-left underline-offset-2 hover:underline" onClick={() => { dismiss(toast.id); navigate(toast.path); }}>
                {toast.message} <span className="ml-1 font-bold">View →</span>
              </button>
            ) : <span className="flex-1">{toast.message}</span>}
            <button type="button" aria-label="Dismiss notification" className="shrink-0 rounded px-1 hover:bg-white/20" onClick={() => dismiss(toast.id)}>×</button>
          </div>
        ))}
      </div>
    </Context.Provider>
  );
}

export const useToast = () => useContext(Context);
