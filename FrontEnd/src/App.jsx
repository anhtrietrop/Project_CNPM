import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import Home from "./pages/Home.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Checkout from "./pages/Checkout.jsx";
import PaymentReturn from "./pages/PaymentReturn.jsx";
import useGetCurrentUser from "./hooks/useGetCurrentUser.jsx";
import { useSelector } from "react-redux";
import useGetCity from "./hooks/useGetCity.jsx";
import useGetMyShop from "./hooks/useGetMyShop.jsx";
import CreateEditShop from "./pages/CreateEditShop.jsx";
import AddItem from "./pages/AddItem.jsx";
import EditItem from "./pages/EditItem.jsx";
import useGetShopByCity from "./hooks/useGetShopByCity.jsx";
import Loading from "./components/Loading.jsx";
import ToastContainer from "./components/ToastContainer.jsx";
export const serverURL = "http://localhost:8000";

function App() {
  useGetCurrentUser();
  const { userData } = useSelector((state) => state.user);

  // Gọi tất cả hooks ở top level
  useGetCity();
  useGetMyShop();
  useGetShopByCity();
  return (
    <>
      <ToastContainer />
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
        <Route path="/" element={<Home />} />
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
        <Route
          path="/checkout"
          element={userData ? <Checkout /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/payment-return"
          element={userData ? <PaymentReturn /> : <Navigate to={"/signin"} />}
        />
      </Routes>
    </>
  );
}

export default App;
