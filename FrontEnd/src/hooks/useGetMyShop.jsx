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
        dispatch(setMyShopData(result.data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchShop();
  }, []); // ← thêm dependency array

  return null; // ← custom hook nên return something
}

export default useGetMyShop; // ← sửa tên
