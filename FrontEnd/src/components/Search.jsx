import React, { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import axios from "axios";
import { serverURL } from "../App.jsx";
import FoodItemCard from "./FoodItemCard.jsx";

function Search({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchQuery) params.append("q", searchQuery);

      const response = await axios.get(
        `${serverURL}/api/item/search?${params.toString()}`
      );

      setResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setResults([]);
  };

  useEffect(() => {
    if (isOpen) {
      // Auto search when query changes
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#fff9f6] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaSearch />
            Tìm kiếm món ăn
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm món ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3399df]"
              />
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            >
              Xóa
            </button>
          </div>
        </div>



        {/* Results */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3399df]"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8">
              <FaSearch className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500">Không tìm thấy món ăn</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {results.map((item) => (
                <FoodItemCard key={item._id} data={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Tìm thấy {results.length} món ăn
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#3399df] text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
