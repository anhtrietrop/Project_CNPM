import Cart from "../models/cart.model.js";
import Item from "../models/item.model.js";

// Lấy giỏ hàng của user
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId })
      .populate({
        path: "items.item",
        populate: {
          path: "shop",
          select: "name city",
        },
      });

    if (!cart) {
      return res.status(200).json({
        items: [],
        totalAmount: 0,
      });
    }

    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ message: `Get cart error: ${error.message}` });
  }
};

// Thêm item vào giỏ hàng
export const addToCart = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;

    // Kiểm tra item có tồn tại không
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Tìm hoặc tạo cart cho user
    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      cart = await Cart.create({
        user: req.userId,
        items: [],
      });
    }

    // Kiểm tra item đã có trong cart chưa
    const existingItemIndex = cart.items.findIndex(
      (cartItem) => cartItem.item.toString() === itemId
    );

    if (existingItemIndex > -1) {
      // Nếu đã có, tăng quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Nếu chưa có, thêm mới
      cart.items.push({
        item: itemId,
        quantity,
        price: item.price,
      });
    }

    await cart.save();
    await cart.populate({
      path: "items.item",
      populate: {
        path: "shop",
        select: "name city",
      },
    });

    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ message: `Add to cart error: ${error.message}` });
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

    const itemIndex = cart.items.findIndex(
      (cartItem) => cartItem.item.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate({
      path: "items.item",
      populate: {
        path: "shop",
        select: "name city",
      },
    });

    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ message: `Update cart item error: ${error.message}` });
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

    cart.items = cart.items.filter(
      (cartItem) => cartItem.item.toString() !== itemId
    );

    await cart.save();
    await cart.populate({
      path: "items.item",
      populate: {
        path: "shop",
        select: "name city",
      },
    });

    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ message: `Remove from cart error: ${error.message}` });
  }
};

// Xóa toàn bộ cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    return res.status(200).json({
      message: "Cart cleared successfully",
      items: [],
      totalAmount: 0,
    });
  } catch (error) {
    return res.status(500).json({ message: `Clear cart error: ${error.message}` });
  }
};
