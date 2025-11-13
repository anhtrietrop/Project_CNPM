import { useDispatch } from "react-redux";
import { addToast } from "../redux/adminSlice";

export const useToast = () => {
  const dispatch = useDispatch();

  const showToast = (message, type = "info", duration = 3000) => {
    const id = Date.now();
    dispatch(addToast({ id, message, type, duration }));
  };

  return {
    success: (message, duration) => showToast(message, "success", duration),
    error: (message, duration) => showToast(message, "error", duration),
    info: (message, duration) => showToast(message, "info", duration),
  };
};
