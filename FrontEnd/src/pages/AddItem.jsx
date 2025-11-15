import React, { useState, useEffect } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaPlus, FaTimes } from "react-icons/fa";
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
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
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

    // Load categories from shop
    if (myShopData.categories) {
      setCategories(myShopData.categories);
    } else {
      setCategories([
        "Burgers",
        "Sandwiches",
        "Fried",
        "Desserts",
        "Drinks",
        "Tacos",
        "Others",
      ]);
    }
  }, [myShopData, navigate, toast]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Vui lòng nhập tên danh mục!");
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast.error("Danh muc nay da ton tai!");
      return;
    }

    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);
    setNewCategory("");

    // Lưu vào database ngay lập tức
    try {
      const result = await axios.put(
        `${serverURL}/api/shop/update-categories`,
        { categories: updatedCategories },
        {
          withCredentials: true,
        }
      );
      dispatch(setMyShopData(result.data.shop));
      toast.success("Đã thêm danh mục mới!");
    } catch (error) {
      console.log(error);
      // Rollback nếu lỗi
      setCategories(categories);
      toast.error(
        error.response?.data?.message || "Lỗi khi thêm danh mục!"
      );
    }
  };

  const handleRemoveCategory = async (categoryToRemove) => {
    const updatedCategories = categories.filter(
      (cat) => cat !== categoryToRemove
    );
    setCategories(updatedCategories);

    // Lưu vào database ngay lập tức
    try {
      const result = await axios.put(
        `${serverURL}/api/shop/update-categories`,
        { categories: updatedCategories },
        {
          withCredentials: true,
        }
      );
      dispatch(setMyShopData(result.data.shop));
      toast.success("Đã xóa danh mục!");
    } catch (error) {
      console.log(error);
      // Rollback nếu lỗi
      setCategories(categories);
      toast.error(
        error.response?.data?.message || "Lỗi khi xóa danh mục!"
      );
    }
  };

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
          <div className="text-3xl font-extrabold text-gray-900">
            Thêm món ăn
          </div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên món ăn
            </label>
            <input
              type="text"
              placeholder="Nhập tên món ăn"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setName(e.target.value)}
              value={name}
            ></input>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hình ảnh món ăn
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
              Giá (VNĐ)
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Danh mục
              </label>
              <button
                type="button"
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                {showAddCategory ? (
                  <>
                    <FaTimes /> Đóng
                  </>
                ) : (
                  <>
                    <FaPlus /> Quản lý danh mục
                  </>
                )}
              </button>
            </div>

            {showAddCategory && (
              <div className="mb-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Thêm danh mục mới
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tên danh mục..."
                      className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCategory();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Danh mục hiện tại ({categories.length})
                  </label>
                  <div className="space-y-1 max-h-[150px] overflow-y-auto">
                    {categories.map((cat, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50"
                      >
                        <span className="text-sm">{cat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <select
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setCatetory(e.target.value)}
              value={catetory}
            >
              <option value="">Chọn danh mục</option>
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
            {loading ? <ClipLoader color="white" size={20} /> : "Thêm món ăn"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddItem;
