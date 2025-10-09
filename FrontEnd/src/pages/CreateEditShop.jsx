import React, { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";
import { serverURL } from "../App.jsx";
import { ClipLoader } from "react-spinners";

function CreateEditShop() {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const { currentCity, currentState, currentAddress } = useSelector(
    (state) => state.user
  );
  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAddress] = useState(myShopData?.address || currentAddress);
  const [city, setCity] = useState(myShopData?.city || currentCity);
  const [state, setState] = useState(myShopData?.state || currentState);
  const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);
  const dispatch = useDispatch();
  const [backendImage, setBackendImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("address", address);
      if (backendImage) {
        formData.append("image", backendImage);
      }
      const result = await axios.post(
        `${serverURL}/api/shop/create-edit`,
        formData,
        {
          withCredentials: true,
        }
      );
      dispatch(setMyShopData(result.data));
      setLoading(false);
      navigate("/"); // Navigate back to home after successful creation
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center flex-col items-center p-6 bg-gradient-to-br from-blue-50 relative to-white  min-h-screen">
      <div
        className="absolute top-[20px] left-[20px] z-[10] mb-[10px]"
        onClick={() => navigate("/")}
      >
        <IoMdArrowRoundBack size={25} className="" />
      </div>
      <div className="max-w-lg w-full bg-white shadow-lg rounded-2xl p-8 border border-blue-100 ">
        <div className=" flex flex-col items-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-[#00BFFF] w-16 h-16" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {myShopData ? "Edit Shop" : "Add Shop"}
          </div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter Shop Name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setName(e.target.value)}
              value={name}
            ></input>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Image
            </label>

            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleImage}
            />

            {/* 👉 thêm margin-top để ảnh cách input */}
            {frontendImage && (
              <div className="mt-3">
                <img
                  src={frontendImage}
                  alt="Shop Preview"
                  className="w-full h-48 object-cover rounded-lg border shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ward
              </label>
              <input
                type="text"
                placeholder="Enter Shop Ward"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setState(e.target.value)}
                value={state}
              ></input>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="Enter Shop City"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setCity(e.target.value)}
                value={city}
              ></input>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              placeholder="Enter Shop Address"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
            ></input>
          </div>
          <button
            className="w-full bg-[#00BFFF] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200 cursor-pointer"
            disabled={loading}
          >
            {loading ? <ClipLoader color="white" size={20} /> : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEditShop;
