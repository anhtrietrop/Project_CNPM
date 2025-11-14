import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from "../models/shop.model.js"; // ✅ thêm import model
import Location from "../models/location.model.js";
import fs from "fs";

export const createEditShop = async (req, res) => {
  try {
    const {
      name,
      city,
      state,
      address,
      latitude,
      longitude,
      categories,
      contactPhone,
      contactEmail,
      representativeName,
      bankAccountNumber,
      bankAccountName,
      bankName,
      operatingHours,
    } = req.body;

    // Upload các loại ảnh
    let imageUrl = null;
    let idCardUrl = null;
    let menuImagesUrls = [];

    // Logo shop
    if (req.files?.image?.[0]) {
      imageUrl = await uploadOnCloudinary(req.files.image[0].path);
    }

    // CCCD
    if (req.files?.representativeIdCard?.[0]) {
      idCardUrl = await uploadOnCloudinary(
        req.files.representativeIdCard[0].path
      );
    }

    // Menu images
    if (req.files?.menuImages) {
      for (const file of req.files.menuImages) {
        const url = await uploadOnCloudinary(file.path);
        menuImagesUrls.push(url);
      }
    }

    // Parse categories nếu gửi dưới dạng JSON string
    let parsedCategories = [];
    if (categories) {
      parsedCategories =
        typeof categories === "string" ? JSON.parse(categories) : categories;
    }

    // ✅ tìm shop của user
    let shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
      // Tạo Location mới cho shop
      const location = await Location.create({
        address,
        city,
        state,
        latitude: latitude || 0,
        longitude: longitude || 0,
        type: "shop",
        refModel: "Shop",
      });

      // ✅ tạo shop mới - mặc định chờ duyệt
      const shopData = {
        name,
        location: location._id,
        owner: req.userId,
        isApproved: false, // Chờ admin duyệt
        categories: parsedCategories || [],
        contactPhone,
        contactEmail,
        representativeName,
        bankAccountNumber,
        bankAccountName,
        bankName,
        operatingHours,
      };
      if (imageUrl) shopData.image = imageUrl;
      if (idCardUrl) shopData.representativeIdCard = idCardUrl;
      if (menuImagesUrls.length > 0) shopData.menuImages = menuImagesUrls;

      shop = await Shop.create(shopData);

      // Cập nhật refId cho location
      location.refId = shop._id;
      await location.save();
    } else {
      // Cập nhật location
      await Location.findByIdAndUpdate(shop.location, {
        address,
        city,
        state,
        latitude: latitude || 0,
        longitude: longitude || 0,
      });

      // ✅ cập nhật shop cũ
      const updateData = {
        name,
        contactPhone,
        contactEmail,
        representativeName,
        bankAccountNumber,
        bankAccountName,
        bankName,
        operatingHours,
      };
      if (imageUrl) updateData.image = imageUrl;
      if (idCardUrl) updateData.representativeIdCard = idCardUrl;
      if (menuImagesUrls.length > 0) updateData.menuImages = menuImagesUrls;
      if (parsedCategories && parsedCategories.length > 0) {
        updateData.categories = parsedCategories;
      }
      shop = await Shop.findByIdAndUpdate(shop._id, updateData, { new: true });
    }

    await shop.populate("owner items location");
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
      .populate("location")
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

    // Tìm locations theo city
    let locationQuery = { type: "shop" };
    if (
      city.toLowerCase().includes("ho chi minh") ||
      city.toLowerCase().includes("hcm")
    ) {
      locationQuery.$or = [
        { city: { $regex: /ho chi minh/i } },
        { city: { $regex: /hcm/i } },
      ];
    } else {
      locationQuery.city = { $regex: new RegExp(city, "i") };
    }

    const locations = await Location.find(locationQuery);
    const locationIds = locations.map((loc) => loc._id);

    // Tìm shops với locations đó và đã được duyệt
    const shops = await Shop.find({
      location: { $in: locationIds },
      isApproved: true,
    })
      .populate("items")
      .populate("location");

    if (!shops || shops.length === 0) {
      return res.status(404).json({ message: "No shops found in this city" });
    }
    return res.status(200).json(shops);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get shop by city error  ${error}` });
  }
};

export const updateCategories = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ message: "Categories must be an array" });
    }

    const shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    shop.categories = categories;
    await shop.save();
    await shop.populate("owner items");

    return res
      .status(200)
      .json({ message: "Categories updated successfully", shop });
  } catch (error) {
    console.error("Update categories error:", error);
    return res
      .status(500)
      .json({ message: `Update categories error: ${error.message}` });
  }
};
