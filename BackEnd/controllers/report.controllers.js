import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import mongoose from "mongoose";

// Lấy báo cáo doanh thu theo từng nhà hàng
export const getRevenueByRestaurant = async (req, res) => {
  try {
    const { period = "day", startDate, endDate } = req.query;

    // Tạo query filter theo thời gian
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else {
      // Mặc định lấy dữ liệu 30 ngày gần nhất
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = {
        createdAt: { $gte: thirtyDaysAgo },
      };
    }

    // Aggregate doanh thu theo shop
    const revenueData = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          orderStatus: { $in: ["completed"] }, // Chỉ tính đơn hoàn thành
        },
      },
      {
        $unwind: "$orderItems",
      },
      {
        $group: {
          _id: "$orderItems.shopId",
          totalRevenue: { $sum: "$orderItems.subtotal" },
          totalOrders: { $sum: 1 },
          shopName: { $first: "$orderItems.shopName" },
          shopCity: { $first: "$orderItems.shopCity" },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
    ]);

    // Populate thêm thông tin shop
    const enrichedData = await Promise.all(
      revenueData.map(async (item) => {
        const shop = await Shop.findById(item._id).populate("location");
        return {
          shopId: item._id,
          shopName: item.shopName,
          shopCity: item.shopCity,
          totalRevenue: item.totalRevenue,
          totalOrders: item.totalOrders,
          averageOrderValue: item.totalRevenue / item.totalOrders,
          shop: shop
            ? {
                image: shop.image,
                contactPhone: shop.contactPhone,
                location: shop.location,
              }
            : null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: enrichedData,
      period,
      startDate: dateFilter.createdAt?.$gte || null,
      endDate: dateFilter.createdAt?.$lte || null,
    });
  } catch (error) {
    console.error("Error getting revenue by restaurant:", error);
    return res.status(500).json({
      success: false,
      message: `Error getting revenue report: ${error.message}`,
    });
  }
};

// Lấy báo cáo doanh thu theo ngày/tuần/tháng cho một nhà hàng
export const getRevenueByPeriod = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { period = "day", startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = {
        createdAt: { $gte: thirtyDaysAgo },
      };
    }

    // Xác định group format theo period
    let groupFormat;
    switch (period) {
      case "week":
        groupFormat = { $week: "$createdAt" };
        break;
      case "month":
        groupFormat = { $month: "$createdAt" };
        break;
      case "day":
      default:
        groupFormat = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
        break;
    }

    const revenueByPeriod = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          orderStatus: "completed",
        },
      },
      {
        $unwind: "$orderItems",
      },
      {
        $match: {
          "orderItems.shopId": shopId
            ? mongoose.Types.ObjectId(shopId)
            : { $exists: true },
        },
      },
      {
        $group: {
          _id: groupFormat,
          totalRevenue: { $sum: "$orderItems.subtotal" },
          totalOrders: { $sum: 1 },
          date: { $first: "$createdAt" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: revenueByPeriod,
      period,
    });
  } catch (error) {
    console.error("Error getting revenue by period:", error);
    return res.status(500).json({
      success: false,
      message: `Error getting revenue report: ${error.message}`,
    });
  }
};

// Lấy danh sách nhà hàng để chọn
export const getRestaurantList = async (req, res) => {
  try {
    const restaurants = await Shop.find({ isApproved: true })
      .select("name image contactPhone")
      .populate("location")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    console.error("Error getting restaurant list:", error);
    return res.status(500).json({
      success: false,
      message: `Error getting restaurant list: ${error.message}`,
    });
  }
};
