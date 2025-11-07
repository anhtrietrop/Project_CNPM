import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
} from "../redux/userSlice.js";

function useGetCity() {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    // Không cần đăng nhập để lấy location
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
      );

      const props = result?.data?.results?.[0] || {};

      // city: ưu tiên city, nếu null thì lấy state
      const city = props.city || props.state || null;

      // county: quận / huyện
      const county = props.county || null;

      // address: gộp address_line1 và address_line2
      const address_line1 = props.address_line1 || "";
      const address_line2 = props.address_line2 || "";

      // Ưu tiên dùng formatted address (địa chỉ đầy đủ)
      let address = props.formatted || "";

      // Nếu không có formatted, thì gộp address_line1 và address_line2
      if (!address) {
        if (address_line1 && address_line2) {
          address = `${address_line1}, ${address_line2}`;
        } else if (address_line1) {
          address = address_line1;
        } else if (address_line2) {
          address = address_line2;
        }
      }

      // Dispatch vào redux
      dispatch(setCurrentCity(city));
      dispatch(setCurrentState(county)); // state ở Redux của bạn thực chất đang giữ county
      dispatch(setCurrentAddress(address));
    });
  }, [apiKey, dispatch]); // Bỏ userData dependency
}

export default useGetCity;
