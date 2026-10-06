import {
  createContext,
  useCallback,
  useContext,
  useState
} from 'react';

/* eslint-disable react-refresh/only-export-components */

const Context =
  createContext(() => {});

export function ToastProvider({
  children
}) {
  const [toasts, setToasts] =
    useState([]);

  const notify = useCallback(
    (
      message,
      type = 'success'
    ) => {
      const id =
        Date.now() +
        Math.random();

      setToasts((current) => [
        ...current,
        {
          id,
          message,
          type
        }
      ]);

      setTimeout(() => {
        setToasts((current) =>
          current.filter(
            (toast) =>
              toast.id !== id
          )
        );
      }, 3500);
    },
    []
  );

  return (
    <Context.Provider
      value={notify}
    >
      {children}

      <div className="fixed right-[22px] top-[22px] z-[1000] grid gap-[10px] max-[520px]:left-3 max-[520px]:right-3 max-[520px]:top-3">
        {toasts.map(
          (toast) => (
            <div
              key={toast.id}
              className={`min-w-[260px] max-w-[380px] border-l-[3px] px-[18px] py-[14px] text-[12px] text-white shadow-[0_12px_35px_#0002] max-[520px]:min-w-0 max-[520px]:max-w-none ${
                toast.type ===
                'error'
                  ? 'border-[#d6a0a5] bg-[#681d25]'
                  : 'border-[#9ec2a8] bg-[#263b2d]'
              }`}
            >
              {toast.message}
            </div>
          )
        )}
      </div>
    </Context.Provider>
  );
}

export const useToast = () =>
  useContext(Context);