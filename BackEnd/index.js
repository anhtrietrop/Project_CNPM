import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";
import cartRouter from "./routes/cart.routes.js";
import roleRouter from "./routes/role.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";
import droneRouter from "./routes/drone.routes.js";
import locationRouter from "./routes/location.routes.js";
import adminRouter from "./routes/admin.routes.js";
import reportRouter from "./routes/report.routes.js";
import cors from "cors";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true, // Allow all origins for development
    credentials: true,
  },
});

const PORT = process.env.PORT || 8000;

// Make io accessible to routes
app.set("io", io);

app.use(
  cors({
    origin: true, // Allow all origins for development
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);
app.use("/api/cart", cartRouter);
app.use("/api/role", roleRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/delivery", deliveryRouter);
app.use("/api/drone", droneRouter);
app.use("/api/location", locationRouter);
app.use("/api/admin", adminRouter);
app.use("/api/report", reportRouter);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join room for specific order tracking
  socket.on("join-order", (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`Socket ${socket.id} joined order-${orderId}`);
  });

  // Leave order room
  socket.on("leave-order", (orderId) => {
    socket.leave(`order-${orderId}`);
    console.log(`Socket ${socket.id} left order-${orderId}`);
  });

  // Drone location update from simulator
  socket.on("drone-location-update", (data) => {
    const { orderId, location } = data;
    // Broadcast to all clients tracking this order
    io.to(`order-${orderId}`).emit("drone-location", {
      orderId,
      location,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.io server ready`);
});
