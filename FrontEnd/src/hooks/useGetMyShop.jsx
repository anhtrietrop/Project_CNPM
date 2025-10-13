import { useEffect } from "react";
import axios from "axios";
import { serverURL } from "../App.jsx";
import { useDispatch } from "react-redux";

import { setMyShopData } from "../redux/ownerSlice.js";

function useGetMyShop() {
  const dispatch = useDispatch(); // ← sửa chính tả

  useEffect(() => {
    // ← sửa chính tả
    const fetchShop = async () => {
      try {
        const result = await axios.get(`${serverURL}/api/shop/get-my`, {
          withCredentials: true,
        });
        dispatch(setMyShopData(result.data)); // result.data có thể là null nếu chưa có shop
      } catch (error) {
        console.log("Error fetching shop:", error);
        // Nếu lỗi 404, set shop data là null để hiển thị form tạo shop
        if (error.response?.status === 404) {
          dispatch(setMyShopData(null));
        }
      }
    };
    fetchShop();
  }, []); // ← thêm dependency array

  return null; // ← custom hook nên return something
}

export default useGetMyShop; // ← sửa tên
