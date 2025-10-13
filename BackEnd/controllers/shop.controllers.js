import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from "../models/shop.model.js"; // ✅ thêm import model
import fs from "fs";

export const createEditShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;
    let image = null;

    // ✅ upload ảnh nếu có
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
      // Không cần xóa file ở đây vì uploadOnCloudinary đã xóa rồi
    }

    // ✅ tìm shop của user
    let shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
      // ✅ tạo shop mới
      const shopData = {
        name,
        city,
        state,
        address,
        owner: req.userId,
      };
      if (image) {
        shopData.image = image;
      }
      shop = await Shop.create(shopData);
    } else {
      // ✅ cập nhật shop cũ
      const updateData = { name, city, state, address };
      if (image) {
        updateData.image = image;
      }
      shop = await Shop.findByIdAndUpdate(shop._id, updateData, { new: true });
    }

    await shop.populate("owner items");
    return res.status(201).json(shop);
  } catch (error) {
    console.error("Create/Edit shop error:", error); // ✅ log lỗi thật
    return res
      .status(500)
      .json({ message: `create shop error: ${error.message}` });
  }
};

export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId })
      .populate("owner")
      .populate({
        path: "items",
        options: { sort: { updatedAt: -1 } },
      });
    if (!shop) {
      return res.status(200).json(null); // Trả về null thay vì 404
    }
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `get my shop error  ${error}` });
  }
};

export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const shops = await Shop.find({
      city: { $regex: new RegExp(city, "i") },
    }).populate("items");
    if (!shops) {
      return res.status(404).json({ message: "No shops found in this city" });
    }
    return res.status(200).json(shops);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get shop by city error  ${error}` });
  }
};
