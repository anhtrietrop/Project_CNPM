import mongoose from "mongoose";
import Drone from "./models/drone.model.js";
import dotenv from "dotenv";

dotenv.config();

const deleteDronesBySerialNumber = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected to MongoDB");

    // Hiển thị drone trước khi xóa
    const dronesToDelete = await Drone.find({
      serialNumber: { $in: ["2", "001"] },
    });

    console.log("\n📋 Drone sẽ bị xóa:");
    dronesToDelete.forEach((drone) => {
      console.log(
        `  - ${drone.model} (SN: ${drone.serialNumber}) - Status: ${drone.status}`
      );
    });

    // Xóa drone có serialNumber là "2" và "001" (hard delete, bỏ qua status)
    const result = await Drone.deleteMany({
      serialNumber: { $in: ["2", "001"] },
    });

    console.log(`\n✅ Đã xóa ${result.deletedCount} drone(s)`);

    // Hiển thị danh sách drone còn lại
    const remainingDrones = await Drone.find({});
    console.log("\n📋 Danh sách drone còn lại:");
    if (remainingDrones.length === 0) {
      console.log("  (Không còn drone nào)");
    } else {
      remainingDrones.forEach((drone) => {
        console.log(
          `  - ${drone.model} (SN: ${drone.serialNumber}) - Status: ${drone.status}`
        );
      });
    }

    await mongoose.disconnect();
    console.log("\n✅ Đã ngắt kết nối MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

deleteDronesBySerialNumber();
