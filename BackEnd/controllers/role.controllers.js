import Role from "../models/role.model.js";

// Tạo role mới
export const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Kiểm tra role đã tồn tại
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: "Role đã tồn tại",
      });
    }

    const role = new Role({
      name,
      description,
      permissions,
    });

    await role.save();

    res.status(201).json({
      success: true,
      message: "Role được tạo thành công",
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy tất cả roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true }).select("-__v");
    
    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy role theo ID
export const getRoleById = async (req, res) => {
  try {
    const { roleId } = req.params;
    
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy role",
      });
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Cập nhật role
export const updateRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { name, description, permissions, isActive } = req.body;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy role",
      });
    }

    // Kiểm tra tên role trùng lặp (nếu có thay đổi)
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ name, _id: { $ne: roleId } });
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: "Tên role đã tồn tại",
        });
      }
    }

    const updatedRole = await Role.findByIdAndUpdate(
      roleId,
      { name, description, permissions, isActive },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Role được cập nhật thành công",
      data: updatedRole,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Xóa role (soft delete)
export const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy role",
      });
    }

    // Soft delete - chỉ đánh dấu isActive = false
    await Role.findByIdAndUpdate(roleId, { isActive: false });

    res.status(200).json({
      success: true,
      message: "Role đã được xóa thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

