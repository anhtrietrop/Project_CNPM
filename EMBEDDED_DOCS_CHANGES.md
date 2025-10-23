# Thay đổi Embedded Documents

## Tổng quan
Đã chuyển từ sử dụng references sang embedded documents cho Cart và Order để cải thiện performance và giảm số lượng database queries.

## Backend Changes

### 1. Models
- **Order Model**: Chuyển từ references sang embedded documents cho OrderItems
- **Cart Model**: Chuyển từ references sang embedded documents cho CartItems
- Thêm middleware để tính subtotal và totalAmount tự động

### 2. Controllers
- **Order Controller**: Cập nhật để xử lý embedded documents, không cần populate
- **Cart Controller**: Cập nhật để xử lý embedded documents, không cần populate

### 3. Routes
- Kích hoạt lại cart routes trong index.js
- Cập nhật cart routes để phù hợp với frontend

## Frontend Changes

### 1. useCart Hook
- Thêm API calls để tương tác với backend
- Thêm function `getTotalPrice()` để tính tổng giá trị
- Cập nhật để sử dụng embedded documents từ backend

### 2. Redux Cart Slice
- Thêm action `setCart` để cập nhật cart từ backend
- Giữ lại local actions để tương thích ngược

### 3. Cart Component
- Cập nhật để hiển thị shop name từ embedded document
- Cập nhật để hiển thị subtotal từ embedded document

### 4. Checkout Component
- Cập nhật để sử dụng embedded documents
- Cập nhật API call để tạo order với embedded documents

## Lợi ích của Embedded Documents

### 1. Performance
- Giảm số lượng database queries
- Không cần populate để lấy thông tin items
- Truy vấn nhanh hơn

### 2. Data Consistency
- Thông tin items được lưu trữ cùng với cart/order
- Không bị mất dữ liệu khi items bị xóa
- Dễ dàng backup và restore

### 3. Scalability
- Giảm tải cho database
- Tối ưu cho read-heavy operations
- Phù hợp với microservices architecture

## Cấu trúc Embedded Documents

### Cart Item Structure
```javascript
{
  item: {
    _id: ObjectId,
    name: String,
    image: String,
    category: String,
    foodType: String,
    rating: Number,
    ratingCount: Number
  },
  quantity: Number,
  price: Number,
  subtotal: Number,
  shop: {
    _id: ObjectId,
    name: String,
    city: String,
    state: String,
    address: String
  }
}
```

### Order Item Structure
```javascript
{
  item: {
    _id: ObjectId,
    name: String,
    image: String,
    category: String,
    foodType: String,
    rating: Number,
    ratingCount: Number
  },
  quantity: Number,
  price: Number,
  subtotal: Number,
  shop: {
    _id: ObjectId,
    name: String,
    city: String,
    state: String,
    address: String
  }
}
```

## API Endpoints

### Cart Endpoints
- `GET /api/cart/my-cart` - Lấy cart của user
- `POST /api/cart/add` - Thêm item vào cart
- `PUT /api/cart/update/:itemId` - Cập nhật quantity
- `DELETE /api/cart/remove/:itemId` - Xóa item khỏi cart
- `DELETE /api/cart/clear` - Xóa toàn bộ cart

### Order Endpoints
- `POST /api/order/create` - Tạo order mới
- `GET /api/order/my-orders` - Lấy orders của user
- `GET /api/order/:orderId` - Lấy chi tiết order

## Testing

Đã tạo test file để kiểm tra embedded documents hoạt động đúng:
- Test tạo cart với embedded items
- Test tạo order với embedded items
- Test query performance
- Test data integrity

## Migration Notes

1. **Backward Compatibility**: Frontend vẫn hoạt động với cấu trúc cũ
2. **Data Migration**: Không cần migration data vì đây là thay đổi cấu trúc mới
3. **Performance**: Cải thiện đáng kể performance cho cart và order operations
4. **Maintenance**: Dễ dàng maintain và debug hơn

## Next Steps

1. Test tích hợp frontend với backend
2. Monitor performance improvements
3. Optimize queries nếu cần
4. Consider caching strategies
