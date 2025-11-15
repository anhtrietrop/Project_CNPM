import Cart from "../models/cart.model.js";
import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import mongoose from "mongoose";

// Lấy giỏ hàng của user
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(200).json({
        cartItems: [],
        totalAmount: 0,
      });
    }

    // Nếu cart có cấu trúc cũ (items), migrate sang cấu trúc mới
    if (
      cart.items &&
      cart.items.length > 0 &&
      (!cart.cartItems || cart.cartItems.length === 0)
    ) {
      console.log("Migrating cart from old structure to new structure");

      // Migrate items to cartItems
      cart.cartItems = cart.items.map((item) => ({
        cartItemId: new mongoose.Types.ObjectId(),
        itemId: item.itemId || item.item._id,
        quantity: item.quantity,
        note: item.note || "",
        addedAt: item.addedAt || new Date(),
        itemName: item.itemName || item.item.name,
        itemImage: item.itemImage || item.item.image,
        itemCategory: item.itemCategory || item.item.category,
        itemFoodType: item.itemFoodType || item.item.foodType,
        price: item.price,
        subtotal: item.subtotal || item.price * item.quantity,
        shopId: item.shopId || item.shop._id,
        shopName: item.shopName || item.shop.name,
        shopCity: item.shopCity || item.shop.city,
        shopState: item.shopState || item.shop.state,
        shopAddress: item.shopAddress || item.shop.address,
      }));

      // Remove old items field
      cart.items = undefined;
      await cart.save();
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    return res
      .status(500)
      .json({ message: `Get cart error: ${error.message}` });
  }
};

// Thêm item vào giỏ hàng
export const addToCart = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    console.log("Add to cart request:", {
      itemId,
      quantity,
      userId: req.userId,
    });

    if (!req.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Kiểm tra item có tồn tại không và lấy thông tin shop
    const item = await Item.findById(itemId).populate({
      path: "shop",
      populate: { path: "location" }
    });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (!item.shop) {
      return res.status(404).json({ message: "Shop not found for item" });
    }

    // Validate and provide defaults for required fields
    if (!item.name || !item.image || !item.category || !item.foodType) {
      console.error("Item missing required fields:", {
        itemId: item._id,
        name: item.name,
        image: item.image,
        category: item.category,
        foodType: item.foodType,
      });
    }

    if (
      !item.shop.name ||
      !item.shop.city ||
      !item.shop.state ||
      !item.shop.address
    ) {
      console.error("Shop missing required fields:", {
        shopId: item.shop._id,
        name: item.shop.name,
        city: item.shop.city,
        state: item.shop.state,
        address: item.shop.address,
      });
    }

    // Tìm hoặc tạo cart cho user
    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      cart = await Cart.create({
        user: req.userId,
        cartItems: [],
      });
    }

    // Kiểm tra xem giỏ hàng đã có sản phẩm từ shop khác chưa
    if (cart.cartItems.length > 0) {
      const existingShopId = cart.cartItems[0].shopId.toString();
      const newShopId = item.shop._id.toString();
      
      if (existingShopId !== newShopId) {
        const existingShopName = cart.cartItems[0].shopName;
        return res.status(400).json({ 
          message: `Giỏ hàng đang có sản phẩm từ "${existingShopName}". Vui lòng thanh toán hoặc xóa giỏ hàng trước khi thêm sản phẩm từ nhà hàng khác.`,
          needClearCart: true,
          currentShop: existingShopName,
          newShop: item.shop.name
        });
      }
    }

    // Kiểm tra item đã có trong cart chưa
    const existingItemIndex = cart.cartItems.findIndex(
      (cartItem) => cartItem.itemId.toString() === itemId.toString()
    );

    if (existingItemIndex > -1) {
      // Nếu đã có, tăng quantity
      cart.cartItems[existingItemIndex].quantity += quantity;
      cart.cartItems[existingItemIndex].subtotal =
        cart.cartItems[existingItemIndex].price *
        cart.cartItems[existingItemIndex].quantity;
    } else {
      // Nếu chưa có, thêm mới với embedded document
      try {
        const newCartItem = {
          cartItemId: new mongoose.Types.ObjectId(),
          itemId: item._id,
          quantity: quantity,
          note: "",
          addedAt: new Date(),
          // Embedded item data
          itemName: item.name || "Unknown Item",
          itemImage:
            item.image || "https://via.placeholder.com/64x64?text=No+Image",
          itemCategory: item.category || "Unknown",
          itemFoodType: item.foodType || "Unknown",
          price: item.price || 0,
          subtotal: (item.price || 0) * quantity,
          // Embedded shop data - Ưu tiên lấy từ location
          shopId: item.shop._id,
          shopName: item.shop.name || "Unknown Shop",
          shopCity: item.shop.location?.city || item.shop.city || "Unknown City",
          shopState: item.shop.location?.state || item.shop.state || "Unknown State",
          shopAddress: item.shop.location?.address || item.shop.address || "Unknown Address",
        };

        console.log("New cart item:", newCartItem);
        cart.cartItems.push(newCartItem);
      } catch (itemError) {
        console.error("Error creating cart item:", itemError);
        return res.status(500).json({
          message: "Error creating cart item",
          error: itemError.message,
        });
      }
    }

    try {
      await cart.save();
      console.log("Cart saved successfully:", cart);
    } catch (saveError) {
      console.error("Error saving cart:", saveError);
      return res
        .status(500)
        .json({ message: "Error saving cart", error: saveError.message });
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.error("Add to cart error:", error);
    return res
      .status(500)
      .json({ message: `Add to cart error: ${error.message}` });
  }
};

// Cập nhật quantity của item trong cart
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.cartItems.findIndex(
      (cartItem) => cartItem.itemId.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.cartItems[itemIndex].quantity = quantity;
    cart.cartItems[itemIndex].subtotal =
      cart.cartItems[itemIndex].price * quantity;
    await cart.save();

    return res.status(200).json(cart);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Update cart item error: ${error.message}` });
  }
};

// Xóa item khỏi cart
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.cartItems = cart.cartItems.filter(
      (cartItem) => cartItem.itemId.toString() !== itemId
    );

    await cart.save();

    return res.status(200).json(cart);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Remove from cart error: ${error.message}` });
  }
};

// Xóa toàn bộ cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.cartItems = [];
    cart.totalAmount = 0;
    await cart.save();

    return res.status(200).json({
      message: "Cart cleared successfully",
      cartItems: [],
      totalAmount: 0,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Clear cart error: ${error.message}` });
  }
};
