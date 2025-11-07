import { useEffect } from "react";
import axios from "axios";
import { serverURL } from "../App.jsx";
import { useDispatch } from "react-redux";
import { setSuggestedItems } from "../redux/userSlice.js";

function useGetSuggestedItems() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Không cần đăng nhập để xem suggested items
    const fetchSuggestedItems = async () => {
      try {
        const result = await axios.get(`${serverURL}/api/item/suggested`, {
          withCredentials: true,
        });
        dispatch(setSuggestedItems(result.data));
        console.log("Suggested items:", result.data);
      } catch (error) {
        console.log("Error fetching suggested items:", error);
      }
    };
    fetchSuggestedItems();
  }, [dispatch]); // Bỏ userData dependency

  return null;
}

export default useGetSuggestedItems;
