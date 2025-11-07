import { useEffect } from "react";
import axios from "axios";
import { serverURL } from "../App.jsx";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js"; // ← sửa đường dẫn

function useGetCurrentUser() {
  const dispatch = useDispatch(); // ← sửa chính tả

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverURL}/api/user/current`, {
          withCredentials: true,
        });

        // Kiểm tra status code và data
        if (result.data?.user) {
          dispatch(setUserData(result.data.user));
        } else {
          dispatch(setUserData(null));
        }
      } catch {
        // Chỉ set null, không log gì cả (400/401 là bình thường khi chưa login)
        dispatch(setUserData(null));
      }
    };
    fetchUser();
  }, [dispatch]);

  return null; // ← custom hook nên return something
}

export default useGetCurrentUser; // ← sửa tên
