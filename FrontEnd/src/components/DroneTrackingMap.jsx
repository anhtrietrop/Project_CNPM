import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom drone icon
const droneIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234F46E5'%3E%3Cpath d='M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 18.5c-3.86-1.06-6.5-4.76-6.5-8.91V6.41l6.5-2.44 6.5 2.44v5.68c0 4.15-2.64 7.85-6.5 8.91z'/%3E%3C/svg%3E",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Custom destination icon
const destinationIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23EF4444'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Custom shop icon
const shopIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310B981'%3E%3Cpath d='M18.36 9l.6 3H5.04l.6-3h12.72M20 4H4v2h16V4zm0 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zM6 18v-4h6v4H6z'/%3E%3C/svg%3E",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Component to update map view when markers change
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

function DroneTrackingMap({ orderId, deliveryAddress, shopCoordinates }) {
  const [droneLocation, setDroneLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);

  // Initialize socket and listen for drone location updates
  useEffect(() => {
    if (!orderId) return;

    const newSocket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Map socket connected:", newSocket.id);
      newSocket.emit("join-order", orderId);
      console.log("Joined order room for tracking:", orderId);
    });

    newSocket.on("drone-location", (data) => {
      console.log("Received drone location:", data);
      if (data.orderId === orderId && data.location) {
        setDroneLocation(data.location);
        setLocationHistory((prev) => [...prev, data.location]);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Map socket disconnected");
    });

    return () => {
      if (newSocket) {
        newSocket.emit("leave-order", orderId);
        newSocket.close();
      }
    };
  }, [orderId]);

  // Calculate center point for map
  const mapCenter = useMemo(() => {
    if (droneLocation) {
      return [droneLocation.lat, droneLocation.lng];
    }
    if (deliveryAddress?.coordinates) {
      return [deliveryAddress.coordinates.lat, deliveryAddress.coordinates.lng];
    }
    if (shopCoordinates) {
      return [shopCoordinates.lat, shopCoordinates.lng];
    }
    return [10.8231, 106.6297]; // Default to Ho Chi Minh City
  }, [droneLocation, deliveryAddress, shopCoordinates]);

  // Prepare polyline coordinates (shop -> drone path -> destination)
  const pathCoordinates = useMemo(() => {
    const coords = [];
    if (shopCoordinates) {
      coords.push([shopCoordinates.lat, shopCoordinates.lng]);
    }
    if (locationHistory.length > 0) {
      coords.push(...locationHistory.map((loc) => [loc.lat, loc.lng]));
    }
    return coords;
  }, [shopCoordinates, locationHistory]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg border-2 border-gray-200">
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <ChangeView center={mapCenter} zoom={droneLocation ? 15 : 14} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Shop marker */}
        {shopCoordinates && (
          <Marker
            position={[shopCoordinates.lat, shopCoordinates.lng]}
            icon={shopIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold text-green-600">🏪 Nhà hàng</p>
                <p className="text-xs">Điểm xuất phát</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {deliveryAddress?.coordinates && (
          <Marker
            position={[
              deliveryAddress.coordinates.lat,
              deliveryAddress.coordinates.lng,
            ]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold text-red-600">📍 Điểm giao hàng</p>
                <p className="text-xs">{deliveryAddress.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Drone marker */}
        {droneLocation && (
          <Marker
            position={[droneLocation.lat, droneLocation.lng]}
            icon={droneIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold text-blue-600">🚁 Drone</p>
                <p className="text-xs">Vị trí hiện tại</p>
                {droneLocation.accuracy && (
                  <p className="text-xs text-gray-500">
                    Độ chính xác: ±{Math.round(droneLocation.accuracy)}m
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Flight path */}
        {pathCoordinates.length > 1 && (
          <Polyline
            positions={pathCoordinates}
            pathOptions={{
              color: "#4F46E5",
              weight: 3,
              opacity: 0.7,
              dashArray: "10, 10",
            }}
          />
        )}
      </MapContainer>

      {/* Status info */}
      <div className="bg-white px-4 py-2 border-t-2 border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            {droneLocation ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Đang theo dõi real-time
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Chờ drone bắt đầu giao hàng...
              </span>
            )}
          </span>
          {droneLocation && (
            <span className="text-gray-500 font-mono text-xs">
              {droneLocation.lat.toFixed(6)}, {droneLocation.lng.toFixed(6)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default DroneTrackingMap;
