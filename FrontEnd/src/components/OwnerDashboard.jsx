import React from "react";
import Nav from "./Nav.jsx";
import { FaUtensils } from "react-icons/fa";
import { useSelector } from "react-redux";
function OwnerDashboard() {
  const { myShopData } = useSelector((state) => state.owner);
  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
      <Nav />
      {!myShopData && (
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-x1 transition-shadow duration-300">
            <div className="flex flex-col items-center text-center">
              <FaUtensils className="text-[#3399df] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 ">
                {" "}
                Add Your Restaurant
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Join our fastfood delivery platform and reach thousands of
                hungry customers every day
              </p>
              <button className="bg-[#3399df] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-blue-600 transition-colors duration-200">
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
