import React, { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";
import { serverURL } from "../App.jsx";
import { ClipLoader } from "react-spinners";
import { useToast } from "../hooks/useToast";

function CreateEditShop() {
  const toast = useToast();
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
  const [categories, setCategories] = useState(myShopData?.categories || []);
  const [newCategory, setNewCategory] = useState("");

  // Thông tin mới
  const [contactPhone, setContactPhone] = useState(
    myShopData?.contactPhone || ""
  );
  const [contactEmail, setContactEmail] = useState(
    myShopData?.contactEmail || ""
  );
  const [representativeName, setRepresentativeName] = useState(
    myShopData?.representativeName || ""
  );
  const [idCardImage, setIdCardImage] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(
    myShopData?.representativeIdCard || null
  );
  const [bankAccountNumber, setBankAccountNumber] = useState(
    myShopData?.bankAccountNumber || ""
  );
  const [bankAccountName, setBankAccountName] = useState(
    myShopData?.bankAccountName || ""
  );
  const [bankName, setBankName] = useState(myShopData?.bankName || "");
  const [operatingHours, setOperatingHours] = useState(
    myShopData?.operatingHours || ""
  );
  const [menuImages, setMenuImages] = useState([]);
  const [menuPreviews, setMenuPreviews] = useState(
    myShopData?.menuImages || []
  );
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const getLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setGettingLocation(false);
          toast.success("Đã lấy vị trí GPS thành công!");
        },
        (error) => {
          console.error(error);
          setGettingLocation(false);
          toast.error("Không thể lấy vị trí. Vui lòng bật GPS!");
        }
      );
    } else {
      setGettingLocation(false);
      toast.error("Trình duyệt không hỗ trợ GPS!");
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleIdCardImage = (e) => {
    const file = e.target.files[0];
    setIdCardImage(file);
    setIdCardPreview(URL.createObjectURL(file));
  };

  const handleMenuImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + menuPreviews.length > 5) {
      toast.error("Tối đa 5 ảnh menu");
      return;
    }
    setMenuImages([...menuImages, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setMenuPreviews([...menuPreviews, ...previews]);
  };

  const handleRemoveMenuImage = (index) => {
    setMenuImages(menuImages.filter((_, i) => i !== index));
    setMenuPreviews(menuPreviews.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!contactPhone) {
      toast.error("Vui lòng nhập số điện thoại liên hệ");
      return;
    }
    if (!representativeName) {
      toast.error("Vui lòng nhập tên người đại diện");
      return;
    }
    if (!idCardImage && !myShopData?.representativeIdCard) {
      toast.error("Vui lòng tải lên ảnh CCCD/CMND");
      return;
    }
    if (!bankAccountNumber) {
      toast.error("Vui lòng nhập số tài khoản");
      return;
    }
    if (!bankAccountName) {
      toast.error("Vui lòng nhập tên chủ tài khoản");
      return;
    }
    if (!latitude || !longitude) {
      toast.error("Vui lòng lấy vị trí GPS của nhà hàng!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("address", address);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("categories", JSON.stringify(categories));

      // Thông tin mới
      formData.append("contactPhone", contactPhone);
      formData.append("contactEmail", contactEmail);
      formData.append("representativeName", representativeName);
      formData.append("bankAccountNumber", bankAccountNumber);
      formData.append("bankAccountName", bankAccountName);
      formData.append("bankName", bankName);
      formData.append("operatingHours", operatingHours);

      // Images
      if (backendImage) {
        formData.append("image", backendImage);
      }
      if (idCardImage) {
        formData.append("representativeIdCard", idCardImage);
      }
      if (menuImages.length > 0) {
        menuImages.forEach((img) => {
          formData.append("menuImages", img);
        });
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
      toast.success("Gửi form đăng ký thành công! Vui lòng chờ admin duyệt.");
      navigate("/"); // Navigate back to home after successful creation
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra");
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
            {myShopData ? "Chỉnh sửa nhà hàng" : "Đăng ký nhà hàng"}
          </div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên nhà hàng
            </label>
            <input
              type="text"
              placeholder="Nhập tên nhà hàng"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setName(e.target.value)}
              value={name}
            ></input>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo nhà hàng
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
                Phường/Xã
              </label>
              <input
                type="text"
                placeholder="Nhập phường/xã"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setState(e.target.value)}
                value={state}
              ></input>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thành phố
              </label>
              <input
                type="text"
                placeholder="Nhập thành phố"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setCity(e.target.value)}
                value={city}
              ></input>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ
            </label>
            <input
              type="text"
              placeholder="Nhập địa chỉ cụ thể"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
            ></input>
          </div>

          {/* VỊ TRÍ GPS */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Vị trí GPS nhà hàng <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={getLocation}
                disabled={gettingLocation}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 text-sm font-medium"
              >
                {gettingLocation ? "Đang lấy..." : "Lấy vị trí GPS"}
              </button>
            </div>
            {latitude && longitude ? (
              <div className="text-sm text-green-600 font-medium">
                ✓ Đã lấy GPS: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                Chưa có tọa độ GPS. Vui lòng bấm "Lấy vị trí GPS"
              </div>
            )}
          </div>

          {/* ========== THÔNG TIN BỔ SUNG ========== */}
          <div className="border-t pt-5 mt-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin liên hệ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại liên hệ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="0xxx-xxx-xxx"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setContactPhone(e.target.value)}
                  value={contactPhone}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  placeholder="shop@example.com"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setContactEmail(e.target.value)}
                  value={contactEmail}
                />
              </div>
            </div>
          </div>

          {/* THÔNG TIN NGƯỜI ĐẠI DIỆN */}
          <div className="border-t pt-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin người đại diện
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên người đại diện <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setRepresentativeName(e.target.value)}
                value={representativeName}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ảnh CCCD/CMND <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleIdCardImage}
              />
              {idCardPreview && (
                <div className="mt-3">
                  <img
                    src={idCardPreview}
                    alt="ID Card Preview"
                    className="w-full h-48 object-contain rounded-lg border shadow-sm bg-gray-50"
                  />
                </div>
              )}
            </div>
          </div>

          {/* THÔNG TIN TẢI KHOẢN NGÂN HÀNG */}
          <div className="border-t pt-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin tài khoản ngân hàng
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tài khoản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="0123456789"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  value={bankAccountNumber}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên chủ tài khoản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="NGUYEN VAN A"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setBankAccountName(e.target.value)}
                  value={bankAccountName}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên ngân hàng
                </label>
                <input
                  type="text"
                  placeholder="Vietcombank, Techcombank..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setBankName(e.target.value)}
                  value={bankName}
                />
              </div>
            </div>
          </div>

          {/* ẢNH MENU & MẶT TIỀN CỬA HÀNG */}
          <div className="border-t pt-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Hình ảnh cửa hàng
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ảnh menu (tối đa 5 ảnh)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleMenuImages}
              />
              {menuPreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {menuPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Menu ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMenuImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Categories Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục món ăn (Categories)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Ví dụ: Burgers, Pizza, Drinks..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Thêm
                </button>
              </div>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Thêm các danh mục món ăn của nhà hàng (sẽ được admin duyệt)
              </p>
            </div>
          </div>

          {/* GIỜ HOẠT ĐỘNG */}
          <div className="border-t pt-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin hoạt động
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ hoạt động
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 8:00 AM - 10:00 PM"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setOperatingHours(e.target.value)}
                value={operatingHours}
              />
            </div>
          </div>

          <button
            className="w-full bg-[#00BFFF] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200 cursor-pointer"
            disabled={loading}
          >
            {loading ? <ClipLoader color="white" size={20} /> : "Gửi đăng ký"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEditShop;
