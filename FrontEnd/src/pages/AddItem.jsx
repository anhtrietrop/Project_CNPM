import React, { useState, useEffect } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";
import { serverURL } from "../App.jsx";
import { ClipLoader } from "react-spinners";
import { useToast } from "../hooks/useToast.jsx";
// import { set } from "mongoose";
function AddItem() {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(100);
  const [frontendImage, setFrontendImage] = useState(null);
  const dispatch = useDispatch();
  const [backendImage, setBackendImage] = useState(null);
  const [catetory, setCatetory] = useState("");
  const toast = useToast();

  // Kiểm tra shop đã được duyệt chưa
  useEffect(() => {
    if (!myShopData) {
      toast.error("Bạn chưa có nhà hàng!");
      navigate("/");
      return;
    }
    
    if (!myShopData.isApproved) {
      toast.error("Nhà hàng của bạn chưa được Admin duyệt. Vui lòng chờ!");
      navigate("/");
      return;
    }
  }, [myShopData, navigate, toast]);

  const categories = [
    "Burgers",
    "Sandwiches",
    "Fried",
    "Desserts",
    "Drinks",
    "Tacos",
    "Others",
  ];
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
      formData.append("category", catetory);
      formData.append("price", price);
      formData.append("stock", stock);

      if (backendImage) {
        formData.append("image", backendImage);
      }
      const result = await axios.post(
        `${serverURL}/api/item/add-item`,
        formData,
        {
          withCredentials: true,
        }
      );
      dispatch(setMyShopData(result.data));
      setLoading(false);
      toast.success("Thêm món ăn thành công!");
      navigate("/"); // Navigate back to home after successful creation
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error.response?.data?.message || "Lỗi khi thêm món ăn!");
      navigate("/"); // Navigate back to home even if there's an error
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
          <div className="text-3xl font-extrabold text-gray-900">Add Food</div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter Food Name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setName(e.target.value)}
              value={name}
            ></input>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Food Image
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
            ></input>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng
            </label>
            <input
              type="number"
              placeholder="0"
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setStock(e.target.value)}
              value={stock}
            ></input>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Category
            </label>
            <select
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setCatetory(e.target.value)}
              value={catetory}
            >
              <option value="">select Category</option>
              {categories.map((cate, index) => (
                <option value={cate} key={index}>
                  {cate}
                </option>
              ))}
            </select>
          </div>

          <button
            className="w-full bg-[#00BFFF] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200 cursor-pointer"
            disabled={loading}
          >
            {loading ? <ClipLoader color="white" size={20} /> : "Add Food"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddItem;
