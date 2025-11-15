import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { serverURL } from "../App";
import { FaUsers, FaTrash, FaSearch, FaLock, FaLockOpen } from "react-icons/fa";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [filter, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverURL}/api/admin/users`, {
        params: { role: filter, search },
        withCredentials: true,
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;

    try {
      await axios.delete(`${serverURL}/api/admin/users/${userId}`, {
        withCredentials: true,
      });
      alert("Xóa người dùng thành công");
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi xóa người dùng");
    }
  };

  const handleToggleBlock = async (userId, isBlocked) => {
    const action = isBlocked ? "mở khóa" : "khóa";
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;

    try {
      const response = await axios.put(
        `${serverURL}/api/admin/users/${userId}/toggle-block`,
        {},
        { withCredentials: true }
      );
      alert(response.data.message);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || `Lỗi khi ${action} tài khoản`);
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      user: "bg-blue-100 text-blue-800",
      owner: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
    };
    return styles[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaUsers className="text-[#3399df]" />
          Quản lý Người dùng
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            {["all", "user", "owner", "admin"].map((role) => (
              <button
                key={role}
                onClick={() => setFilter(role)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === role
                    ? "bg-[#3399df] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {role === "all"
                  ? "Tất cả"
                  : role === "user"
                  ? "User"
                  : role === "owner"
                  ? "Owner"
                  : "Admin"}
              </button>
            ))}
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3399df] focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số điện thoại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Đang tải...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Không tìm thấy người dùng
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#3399df] rounded-full flex items-center justify-center text-white font-bold">
                        {user.fullName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.mobile || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isBlocked
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.isBlocked ? "Đã khóa" : "Hoạt động"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.role !== "admin" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                          className={`${
                            user.isBlocked
                              ? "text-green-600 hover:text-green-900"
                              : "text-yellow-600 hover:text-yellow-900"
                          }`}
                          title={user.isBlocked ? "Mở khóa" : "Khóa tài khoản"}
                        >
                          {user.isBlocked ? <FaLockOpen /> : <FaLock />}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa người dùng"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default UserManagement;
