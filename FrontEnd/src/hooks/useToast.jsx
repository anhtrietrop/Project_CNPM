import { useDispatch } from "react-redux";
import { showToast } from "../redux/toastSlice";

export const useToast = () => {
  const dispatch = useDispatch();

  const toast = {
    success: (message, duration = 3000) => {
      dispatch(showToast({ message, type: "success", duration }));
    },
    error: (message, duration = 3000) => {
      dispatch(showToast({ message, type: "error", duration }));
    },
    info: (message, duration = 3000) => {
      dispatch(showToast({ message, type: "info", duration }));
    },
  };

  return toast;
};
