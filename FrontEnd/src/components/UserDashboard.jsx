import React, { useRef, useEffect, useState } from "react";
import Nav from "./Nav";
import { categories } from "../category"; // Đã sửa đường dẫn
import CategoryCard from "./CategoryCard";
import ShopCard from "./ShopCard";
import FoodItemCard from "./FoodItemCard";
import UserOrders from "./UserOrders";
import { useSelector } from "react-redux";
import { IoIosArrowDropleftCircle, IoIosNotifications } from "react-icons/io";
import { FaCircleChevronRight } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";
import useGetShopByCity from "../hooks/useGetShopByCity";
import useGetSuggestedItems from "../hooks/useGetSuggestedItems";
import useGetCity from "../hooks/useGetCity";

function UserDashboard() {
  const { currentCity, shopInMyCity, suggestedItems } = useSelector(
    (state) => state.user
  );
  const [activeTab, setActiveTab] = useState("home"); // "home" or "orders"
  const cateScrollRef = useRef();
  const shopScrollRef = useRef();
  const foodScrollRef = useRef();

  // Fetch user location first
  useGetCity();
  // Fetch shops by city
  useGetShopByCity();
  // Fetch suggested items
  useGetSuggestedItems();
  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightCateButton, setShowRightCateButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [showLeftFoodButton, setShowLeftFoodButton] = useState(false);
  const [showRightFoodButton, setShowRightFoodButton] = useState(false);

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if (element) {
      setLeftButton(element.scrollLeft > 0);
      setRightButton(
        element.scrollLeft < element.scrollWidth - element.clientWidth
      );
    }
  };

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const scrollElement = cateScrollRef.current;
    const handleScroll = () => {
      updateButton(
        cateScrollRef,
        setShowLeftCateButton,
        setShowRightCateButton
      );
    };

    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      // Kiểm tra trạng thái ban đầu
      updateButton(
        cateScrollRef,
        setShowLeftCateButton,
        setShowRightCateButton
      );
    }

    // Cleanup
    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    const shopScrollElement = shopScrollRef.current;
    const handleShopScroll = () => {
      updateButton(
        shopScrollRef,
        setShowLeftShopButton,
        setShowRightShopButton
      );
    };

    if (shopScrollElement) {
      shopScrollElement.addEventListener("scroll", handleShopScroll);
      // Kiểm tra trạng thái ban đầu
      updateButton(
        shopScrollRef,
        setShowLeftShopButton,
        setShowRightShopButton
      );
    }

    // Cleanup
    return () => {
      if (shopScrollElement) {
        shopScrollElement.removeEventListener("scroll", handleShopScroll);
      }
    };
  }, []);

  useEffect(() => {
    const foodScrollElement = foodScrollRef.current;
    const handleFoodScroll = () => {
      updateButton(
        foodScrollRef,
        setShowLeftFoodButton,
        setShowRightFoodButton
      );
    };

    if (foodScrollElement) {
      foodScrollElement.addEventListener("scroll", handleFoodScroll);
      // Kiểm tra trạng thái ban đầu
      updateButton(
        foodScrollRef,
        setShowLeftFoodButton,
        setShowRightFoodButton
      );
    }

    // Cleanup
    return () => {
      if (foodScrollElement) {
        foodScrollElement.removeEventListener("scroll", handleFoodScroll);
      }
    };
  }, []);

  return (
    <div className=" w-screen min-h-screen flex flex-col items-center bg-[#fff9f6] overflow-y-auto">
      <Nav />

      {/* Tabs */}
      <div className="w-full max-w-6xl px-4 mt-6">
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${
              activeTab === "home"
                ? "text-[#3399df] border-b-2 border-[#3399df]"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <FaHome />
            Trang chủ
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${
              activeTab === "orders"
                ? "text-[#3399df] border-b-2 border-[#3399df]"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Đơn hàng của tôi
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "orders" ? (
        <UserOrders />
      ) : (
        <>
          <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
            <h1 className="text-gray-800 text-2xl sm:text-3xl">
              Inspiration for you first order
            </h1>
            <div className="w-full relative">
              {showLeftCateButton && (
                <button
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#3399df] text-white p-2 rounded-full shadow-lg hover:bg-[#3399df] z-10"
                  onClick={() => scrollHandler(cateScrollRef, "left")}
                >
                  <IoIosArrowDropleftCircle />
                </button>
              )}
              <div
                className="w-full flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-[#3399df] scrollbar-track-gray-200"
                ref={cateScrollRef}
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#3399df #e5e7eb",
                }}
              >
                {categories.map((cate, index) => (
                  <CategoryCard data={cate} key={index} />
                ))}
              </div>
              {showRightCateButton && (
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#3399df] text-white p-2 rounded-full shadow-lg hover:bg-[#3399df] z-10"
                  onClick={() => scrollHandler(cateScrollRef, "right")}
                >
                  <FaCircleChevronRight />
                </button>
              )}
            </div>
          </div>
          <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
            <h1 className="text-gray-800 text-2xl sm:text-3xl">
              Best Shop in {currentCity}
            </h1>
            <div className="w-full relative">
              {showLeftShopButton && (
                <button
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#3399df] text-white p-2 rounded-full shadow-lg hover:bg-[#3399df] z-10"
                  onClick={() => scrollHandler(shopScrollRef, "left")}
                >
                  <IoIosArrowDropleftCircle />
                </button>
              )}
              <div
                className="w-full flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-[#3399df] scrollbar-track-gray-200"
                ref={shopScrollRef}
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#3399df #e5e7eb",
                }}
              >
                {shopInMyCity?.map((shop, index) => (
                  <ShopCard data={shop} key={index} />
                ))}
              </div>
              {showRightShopButton && (
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#3399df] text-white p-2 rounded-full shadow-lg hover:bg-[#3399df] z-10"
                  onClick={() => scrollHandler(shopScrollRef, "right")}
                >
                  <FaCircleChevronRight />
                </button>
              )}
            </div>
          </div>
          <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
            <h1 className="text-gray-800 text-2xl sm:text-3xl">
              Suggested Food Items
            </h1>
            <div className="w-full relative">
              {showLeftFoodButton && (
                <button
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#3399df] text-white p-2 rounded-full shadow-lg hover:bg-[#3399df] z-10"
                  onClick={() => scrollHandler(foodScrollRef, "left")}
                >
                  <IoIosArrowDropleftCircle />
                </button>
              )}
              <div
                className="w-full flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-[#3399df] scrollbar-track-gray-200"
                ref={foodScrollRef}
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#3399df #e5e7eb",
                }}
              >
                {suggestedItems?.map((item, index) => (
                  <FoodItemCard data={item} key={index} />
                ))}
              </div>
              {showRightFoodButton && (
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#3399df] text-white p-2 rounded-full shadow-lg hover:bg-[#3399df] z-10"
                  onClick={() => scrollHandler(foodScrollRef, "right")}
                >
                  <FaCircleChevronRight />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserDashboard;
