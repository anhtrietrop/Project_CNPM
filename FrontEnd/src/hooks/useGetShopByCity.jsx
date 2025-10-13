import { useEffect } from "react";
import axios from "axios";
import { serverURL } from "../App.jsx";
import { useDispatch } from "react-redux";
import { setShopInMyCity } from "../redux/userSlice.js"; // ← sửa đường dẫn
import { useSelector } from "react-redux";
function useGetShopByCity() {
  const dispatch = useDispatch(); // ← sửa chính tả
  const { currentCity, userData } = useSelector((state) => state.user);
  
  useEffect(() => {
    // Chỉ fetch khi có userData và currentCity
    if (!userData || !currentCity) return;
    
    const fetchShops = async () => {
      try {
        const result = await axios.get(
          `${serverURL}/api/shop/get-by-city/${currentCity}`,
          {
            withCredentials: true,
          }
        );
        dispatch(setShopInMyCity(result.data));
        console.log("Shops in my city:", result.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchShops();
  }, [currentCity, userData, dispatch]); // ← thêm userData dependency
}

export default useGetShopByCity; // ← sửa tên
