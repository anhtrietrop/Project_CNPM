import { useEffect } from "react";
import axios from "axios";
import { serverURL } from "../App.jsx";
import { useDispatch } from "react-redux";
import { setShopInMyCity } from "../redux/userSlice.js"; // ← sửa đường dẫn
import { useSelector } from "react-redux";
function useGetShopByCity() {
  const dispatch = useDispatch(); // ← sửa chính tả
  const { currentCity } = useSelector((state) => state.user);

  useEffect(() => {
    // Chỉ cần currentCity để fetch shops (không cần đăng nhập)
    if (!currentCity) return;

    const fetchShops = async () => {
      try {
        const result = await axios.get(
          `${serverURL}/api/shop/get-by-city/${currentCity}`,
          {
            withCredentials: true,
            validateStatus: (status) => status < 500, // Chấp nhận 400-499 để tự xử lý
          }
        );

        // Nếu không có lỗi, dispatch data
        if (result.status === 200) {
          dispatch(setShopInMyCity(result.data));
        } else {
          // 400-499: không có shops hoặc lỗi khác
          dispatch(setShopInMyCity([]));
        }
      } catch {
        // Chỉ catch lỗi 500+ hoặc network error
        dispatch(setShopInMyCity([]));
      }
    };
    fetchShops();
  }, [currentCity, dispatch]); // Bỏ userData dependency
}

export default useGetShopByCity; // ← sửa tên
