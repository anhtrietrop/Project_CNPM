import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Toast from "./Toast";
import { removeToast } from "../redux/adminSlice";

const ToastContainer = () => {
  const toasts = useSelector((state) => state.admin.toasts || []);
  const dispatch = useDispatch();

  const handleClose = (id) => {
    dispatch(removeToast(id));
  };

  return (
    <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-3 max-w-md">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={handleClose}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
