import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { serverURL } from "../App";
import { setUserData } from "../redux/userSlice";
import { FaPlus } from "react-icons/fa6";
import { TbReceipt2 } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import Cart from "./Cart.jsx";
import useCart from "../hooks/useCart.jsx";
import Search from "./Search.jsx";
import NotificationDropdown from "./NotificationDropdown.jsx";
function Nav() {
  const { userData, currentCity } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navigation = useNavigate();
  const dispatch = useDispatch();
  const { cart } = useCart();
  const handleLogOut = async () => {
    try {
      await axios.get(`${serverURL}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] bg-[#fff9f6] overflow-visible">
      {/* Mobile search bar - hiện cho cả guest và user */}
      {showSearch && (!userData || userData?.role === "user") && (
        <div className="w-[90%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] flex fixed top-[80px] left-[5%] ">
          <div className="flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400">
            <FaLocationDot size={25} className=" text-[#3399df]" />{" "}
            <div className="w-[80%] truncate text-gray-600">
              {currentCity || "Đang tải..."}
            </div>
          </div>
          <div className="w-[80%] flex items-center gap-[10px]">
            <IoIosSearch size={25} className="text-[#3399df]" />
            <input
              type="text"
              placeholder={"What are you in the mood to eat? "}
              className="px-[10px] text-gray-700 outline-0 w-full"
            />
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-2 text-[#3399df]">Snake</h1>
      {/* Hiển thị search cho cả guest và user (không cho owner) */}
      {(!userData || userData?.role === "user") && (
        <div className="md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] hidden md:flex">
          <div className="flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400">
            <FaLocationDot size={25} className=" text-[#3399df]" />{" "}
            <div className="w-[80%] truncate text-gray-600">
              {currentCity || "Đang tải..."}
            </div>
          </div>
          <div className="w-[80%] flex items-center gap-[10px]">
            <IoIosSearch size={25} className="text-[#3399df]" />
            <input
              type="text"
              placeholder={"What are you in the mood to eat? "}
              className="px-[10px] text-gray-700 outline-0 w-full"
              onClick={() => setShowSearchModal(true)}
              readOnly
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Icon search cho mobile - hiện cho cả guest và user */}
        {(!userData || userData?.role === "user") &&
          (showSearch ? (
            <RxCross2
              size={25}
              className="text-[#3399df] md:hidden  "
              onClick={() => setShowSearch(false)}
            />
          ) : (
            <IoIosSearch
              size={25}
              className="text-[#3399df] md:hidden  "
              onClick={() => setShowSearchModal(true)}
            />
          ))}
        {userData?.role == "owner" ? (
          <>
            {myShopData && (
              <>
                <button
                  className="hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#3399df]/10 text-[#3399df] hover:bg-[#3399df]/20 transition-colors"
                  onClick={() => navigation("/add-item")}
                >
                  <FaPlus size={20} />
                  <span>Add Food Item</span>
                </button>
                <button
                  className="md:hidden flex items-center p-2 cursor-pointer rounded-full bg-[#3399df]/10 text-[#3399df]"
                  onClick={() => navigation("/add-item")}
                >
                  <FaPlus size={20} />
                </button>
              </>
            )}
            <div className="hidden  md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#3399df]/10 text-[#3399df] font-medium">
              <TbReceipt2 size={20} />
              <span> My Orders</span>
              <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#3399df] rounded-full px-[6px] py-[1px]">
                0
              </span>
            </div>
            <div className="md:hidden  flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#3399df]/10 text-[#3399df] font-medium">
              <TbReceipt2 size={20} />

              <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#3399df] rounded-full px-[6px] py-[1px]">
                0
              </span>
            </div>
          </>
        ) : userData ? (
          <>
            <div
              className="relative cursor-pointer"
              onClick={() => setShowCart(true)}
            >
              <FiShoppingCart size={25} className="text-[#3399df]" />
              <span className="absolute right-[-9px] top-[-12px] text-[#3399df] bg-white rounded-full px-1 text-xs font-bold">
                {cart?.cartItems?.length || 0}
              </span>
            </div>

            {/* Notification Dropdown */}
            <NotificationDropdown />

            <button className="hidden md:block px-3 py-1 rounded-lg bg-[#3399df]/10 text-[#3399df] text-sm font-medium ">
              My Orders
            </button>
          </>
        ) : (
          <>
            {/* Chưa đăng nhập - Hiển thị nút Sign In */}
            <button
              className="px-4 py-2 rounded-lg bg-[#3399df] text-white text-sm font-medium hover:bg-blue-600 transition-colors"
              onClick={() => navigation("/signin")}
            >
              Đăng nhập
            </button>
          </>
        )}

        {userData && (
          <>
            <div
              className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#3399df] text-white text-[18px] shadow-lg font-semibold cursor-pointer "
              onClick={() => setShowInfo((prev) => !prev)}
            >
              <div>{userData?.fullName?.slice(0, 1) || ""}</div>
            </div>
            {showInfo && (
              <div className=" fixed top-[80px] right-[10px] md:right-[10px] lg:right-[25%] w-[180px] bg-white shadow-2xl rounded-xl p-[20px] flex flex-col gap-[10px] z-[9999]">
                <div className=" text-[17px] font-semibold">
                  {userData?.fullName}
                </div>
                {userData?.role == "user" && (
                  <div className=" md:hidden text-[#3399df] font-semibold cursor-pointer">
                    Đơn hàng của tôi
                  </div>
                )}

                <div
                  className="text-[#3399df] font-semibold cursor-pointer"
                  onClick={handleLogOut}
                >
                  Đăng xuất
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cart Modal */}
      <Cart
        key={cart?.cartItems?.length || 0}
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
      />

      {/* Search Modal */}
      <Search
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </div>
  );
}

export default Nav;
