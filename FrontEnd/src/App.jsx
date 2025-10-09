import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import Home from "./pages/Home.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import useGetCurrentUser from "./hooks/useGetCurrentUser.jsx";
import { useSelector } from "react-redux";
import useGetCity from "./hooks/useGetCity.jsx";
import useGetMyShop from "./hooks/useGetMyShop.jsx";
import CreateEditShop from "./pages/CreateEditShop.jsx";
import AddItem from "./pages/AddItem.jsx";
import EditItem from "./pages/EditItem.jsx"; // ✅ đường dẫn tương đối

export const serverURL = "http://localhost:8000";

function App() {
  useGetCurrentUser();
  const { userData } = useSelector((state) => state.user);
  useGetCity();
  useGetMyShop();
  return (
    <Routes>
      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to={"/"} />}
      />
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to={"/"} />}
      />
      <Route
        path="/forgot-password"
        element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
      />
      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/create-edit-shop"
        element={userData ? <CreateEditShop /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/add-item"
        element={userData ? <AddItem /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/edit-item/:itemId"
        element={userData ? <EditItem /> : <Navigate to={"/signin"} />}
      />
    </Routes>
  );
}

export default App;
