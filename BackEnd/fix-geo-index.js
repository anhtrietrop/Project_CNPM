import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const fixGeoIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("locations");

    // Lấy danh sách index hiện tại
    const indexes = await collection.indexes();
    console.log("\n📋 Current indexes:");
    indexes.forEach((idx) => {
      console.log(`   - ${idx.name}:`, JSON.stringify(idx.key));
    });

    // Drop tất cả index có liên quan đến geo/2dsphere
    for (const idx of indexes) {
      if (
        idx.name.includes("2dsphere") ||
        idx.name.includes("geo") ||
        (idx.key.latitude && idx.key.latitude === "2dsphere") ||
        (idx.key.longitude && idx.key.longitude === "2dsphere")
      ) {
        console.log(`\n🗑️  Dropping index: ${idx.name}`);
        await collection.dropIndex(idx.name);
        console.log(`   ✅ Dropped successfully`);
      }
    }

    // Tạo index đúng (normal index, không phải geospatial)
    console.log("\n🔧 Creating correct indexes...");
    await collection.createIndex({ latitude: 1, longitude: 1 });
    console.log("   ✅ Created index: { latitude: 1, longitude: 1 }");

    console.log("\n✅ All done! Geo index fixed.\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixGeoIndex();
