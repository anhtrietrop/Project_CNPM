import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";

export const addItem = async (req, res) => {
  try {
    const { name, category, foodType, price, stock } = req.body;

    // Validation
    if (!name || !category || !price) {
      return res.status(400).json({
        message: "All fields (name, category, price) are required",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        message: "Price must be a positive number",
      });
    }

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
      if (!image) {
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const item = await Item.create({
      name,
      category,
      foodType: foodType || "veg", // Default to veg if not provided
      price,
      image,
      shop: shop._id,
      stock:
        stock !== undefined && stock !== null && stock !== ""
          ? Number(stock)
          : 100,
    });

    shop.items.push(item._id);
    await shop.save();
    await shop.populate("owner");
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });

    return res.status(201).json(shop);
  } catch (error) {
    console.error("Add item error:", error);
    return res
      .status(500)
      .json({ message: `Add item error: ${error.message}` });
  }
};

export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, category, foodType, price, stock } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
      if (!image) {
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    const updateData = {
      name,
      category,
      foodType,
      price,
    };

    if (image) {
      updateData.image = image;
    }

    if (stock !== undefined && stock !== null && stock !== "") {
      updateData.stock = Number(stock);
    }

    const item = await Item.findByIdAndUpdate(itemId, updateData, {
      new: true,
    });
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `edit item error ${error}` });
  }
};

export const getItemsById = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: `get item error ${error}` });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    const shop = await Shop.findOne({ owner: req.userId });
    shop.items = shop.items.filter(
      (i) => i._id.toString() !== item._id.toString()
    );

    await shop.save();
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `delete item error ${error}` });
  }
};

export const getSuggestedItems = async (req, res) => {
  try {
    // Lấy 10 items mới nhất từ tất cả shops
    const items = await Item.find()
      .populate("shop", "name city")
      .sort({ createdAt: -1 })
      .limit(10);

    if (!items || items.length === 0) {
      return res.status(404).json({ message: "No items found" });
    }

    // Xóa foodType và thêm tên nhà hàng
    const itemsWithShopName = items.map((item) => {
      const { foodType, ...itemWithoutFoodType } = item.toObject();
      return {
        ...itemWithoutFoodType,
        shopName: item.shop?.name || "Unknown Shop",
      };
    });

    return res.status(200).json(itemsWithShopName);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get suggested items error ${error}` });
  }
};

// Tìm kiếm items
export const searchItems = async (req, res) => {
  try {
    const { q, category, foodType, minPrice, maxPrice, city } = req.query;

    let query = {};

    // Tìm kiếm theo tên
    if (q) {
      query.name = { $regex: q, $options: "i" };
    }

    // Lọc theo category
    if (category) {
      query.category = category;
    }

    // Lọc theo foodType
    if (foodType) {
      query.foodType = foodType;
    }

    // Lọc theo giá
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let items = await Item.find(query)
      .populate({
        path: "shop",
        select: "name city state address",
      })
      .sort({ createdAt: -1 });

    // Lọc theo thành phố nếu có
    if (city) {
      items = items.filter(
        (item) =>
          item.shop && item.shop.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    return res.status(200).json(items);
  } catch (error) {
    console.error("Search items error:", error);
    return res
      .status(500)
      .json({ message: `Search items error: ${error.message}` });
  }
};

// Lấy items theo category
export const getItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const items = await Item.find({ category })
      .populate("shop", "name city")
      .sort({ createdAt: -1 });

    return res.status(200).json(items);
  } catch (error) {
    console.error("Get items by category error:", error);
    return res
      .status(500)
      .json({ message: `Get items by category error: ${error.message}` });
  }
};

// Cập nhật stock của item
export const updateItemStock = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ message: "Invalid stock value" });
    }

    const item = await Item.findByIdAndUpdate(itemId, { stock }, { new: true });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });

    return res.status(200).json(shop);
  } catch (error) {
    console.error("Update item stock error:", error);
    return res
      .status(500)
      .json({ message: `Update item stock error: ${error.message}` });
  }
};
