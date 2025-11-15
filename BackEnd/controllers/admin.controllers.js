import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import Order from "../models/order.model.js";
import Drone from "../models/drone.model.js";

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalOwners = await User.countDocuments({ role: "owner" });
    const totalShops = await Shop.countDocuments();
    const pendingShops = await Shop.countDocuments({ isApproved: false });
    const approvedShops = await Shop.countDocuments({ isApproved: true });
    const totalOrders = await Order.countDocuments();
    const todayOrders = await Order.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });
    const totalDrones = await Drone.countDocuments();
    const activeDrones = await Drone.countDocuments({ status: "busy" });

    // Revenue today
    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
          orderStatus: "completed",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOwners,
        totalShops,
        pendingShops,
        approvedShops,
        totalOrders,
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        totalDrones,
        activeDrones,
        idleDrones: totalDrones - activeDrones,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search } = req.query;

    const query = {};
    if (role && role !== "all") {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Don't allow deleting admin
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Không thể xóa tài khoản admin",
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Block/Unblock user
export const toggleBlockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Don't allow blocking admin
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Không thể khóa tài khoản admin",
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBlocked ? "Khóa tài khoản thành công" : "Mở khóa tài khoản thành công",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Get all shops
export const getAllShops = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    const query = {};
    if (status === "pending") {
      query.isApproved = false;
    } else if (status === "approved") {
      query.isApproved = true;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    const shops = await Shop.find(query)
      .populate("owner", "fullName email mobile")
      .populate("approvedBy", "fullName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Shop.countDocuments(query);

    res.status(200).json({
      success: true,
      data: shops,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Approve shop
export const approveShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    shop.isApproved = true;
    shop.approvedBy = req.userId;
    shop.approvedAt = new Date();
    await shop.save();

    res.status(200).json({
      success: true,
      message: "Duyệt nhà hàng thành công",
      data: shop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Reject shop
export const rejectShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { reason } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    shop.isApproved = false;
    shop.rejectedReason = reason || "Không đạt yêu cầu";
    await shop.save();

    res.status(200).json({
      success: true,
      message: "Từ chối nhà hàng thành công",
      data: shop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Delete shop
export const deleteShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    await Shop.findByIdAndDelete(shopId);

    res.status(200).json({
      success: true,
      message: "Xóa nhà hàng thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
