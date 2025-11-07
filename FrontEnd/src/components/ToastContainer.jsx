import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Toast from "./Toast";
import { hideToast } from "../redux/toastSlice";

function ToastContainer() {
  const { toasts } = useSelector((state) => state.toast);
  const dispatch = useDispatch();

  const handleClose = (id) => {
    dispatch(hideToast(id));
  };

  return (
    <div className="fixed top-0 right-0 z-[9999] pointer-events-none">
      <div className="p-4 space-y-3 pointer-events-auto">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              transform: `translateY(${index * 10}px)`,
              transition: "transform 0.3s ease",
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => handleClose(toast.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ToastContainer;
