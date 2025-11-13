import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import ShopManagement from "./pages/ShopManagement";
import ReportRevenue from "./pages/ReportRevenue";
import useCheckAdminAuth from "./hooks/useCheckAdminAuth";
import ToastContainer from "./components/ToastContainer";

export const serverURL = "http://localhost:8000";

function App() {
  useCheckAdminAuth(); // Check authentication on mount
  const { isAuthenticated } = useSelector((state) => state.admin);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route
          path="/signin"
          element={!isAuthenticated ? <SignIn /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" />}
        />
        <Route
          path="/users"
          element={
            isAuthenticated ? <UserManagement /> : <Navigate to="/signin" />
          }
        />
        <Route
          path="/shops"
          element={
            isAuthenticated ? <ShopManagement /> : <Navigate to="/signin" />
          }
        />
        <Route
          path="/reports"
          element={
            isAuthenticated ? <ReportRevenue /> : <Navigate to="/signin" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
