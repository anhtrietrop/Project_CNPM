import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ message: "User is not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User is not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json(`getCurrentUser error ${error}`);
  }
};

// Xóa user và tất cả dữ liệu liên quan (CASCADE DELETE)
export const deleteUser = async (req, res) => {
  try {
    const userId = req.userId;
    
    // 1. Tìm tất cả shops của user
    const shops = await Shop.find({ owner: userId });
    
    // 2. Xóa tất cả items của các shops
    for (const shop of shops) {
      await Item.deleteMany({ shop: shop._id });
    }
    
    // 3. Xóa tất cả shops của user
    await Shop.deleteMany({ owner: userId });
    
    // 4. Xóa user
    await User.findByIdAndDelete(userId);
    
    return res.status(200).json({ 
      message: "User and all related data (shops, items) deleted successfully" 
    });
  } catch (error) {
    return res.status(500).json({ message: `delete user error ${error}` });
  }
};
