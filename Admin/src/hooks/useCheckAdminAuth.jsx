import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { serverURL } from "../App";
import { setAdminData, clearAdminData } from "../redux/adminSlice";

const useCheckAdminAuth = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/user/current`, {
          withCredentials: true,
        });

        // Kiểm tra role admin
        if (response.data.user.role === "admin") {
          dispatch(setAdminData(response.data.user));
        } else {
          dispatch(clearAdminData());
        }
      } catch (error) {
        // Nếu không có token hoặc lỗi, clear admin data
        dispatch(clearAdminData());
      }
    };

    checkAuth();
  }, [dispatch]);
};

export default useCheckAdminAuth;
