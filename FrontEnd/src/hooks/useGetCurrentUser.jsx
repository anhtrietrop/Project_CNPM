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
        dispatch(setUserData(result.data.user));
      } catch (error) {
        dispatch(setUserData(null)); // Set null nếu không có user
      }
    };
    fetchUser();
  }, [dispatch]);

  return null; // ← custom hook nên return something
}

export default useGetCurrentUser; // ← sửa tên
