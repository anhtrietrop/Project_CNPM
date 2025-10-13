import { useEffect } from "react";
import axios from "axios";
import { serverURL } from "../App.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setSuggestedItems } from "../redux/userSlice.js";

function useGetSuggestedItems() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    // Chỉ fetch khi có userData
    if (!userData) return;
    
    const fetchSuggestedItems = async () => {
      try {
        const result = await axios.get(
          `${serverURL}/api/item/suggested`,
          {
            withCredentials: true,
          }
        );
        dispatch(setSuggestedItems(result.data));
        console.log("Suggested items:", result.data);
      } catch (error) {
        console.log("Error fetching suggested items:", error);
      }
    };
    fetchSuggestedItems();
  }, [userData, dispatch]);

  return null;
}

export default useGetSuggestedItems;
