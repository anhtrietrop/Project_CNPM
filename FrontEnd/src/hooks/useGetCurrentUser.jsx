import { useEffect } from "react";
import axios from "axios";
import { serverURL } from "../App.jsx";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js"; // ← sửa đường dẫn

function useGetCurrentUser() {
  const dispatch = useDispatch(); // ← sửa chính tả

  useEffect(() => {
    // ← sửa chính tả
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverURL}/api/user/current`, {
          withCredentials: true,
        });
        dispatch(setUserData(result.data.user));
        console.log(result.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, []); // ← thêm dependency array

  return null; // ← custom hook nên return something
}

export default useGetCurrentUser; // ← sửa tên
