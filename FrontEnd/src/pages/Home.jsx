import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import UserDashboard from "../components/userDashboard";
import OwnerDashboard from "../components/OwnerDashboard.jsx";
import Nav from "../components/Nav.jsx";
import Loading from "../components/Loading.jsx";

function Home() {
  const { userData } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Loading khi chuyển trang về home
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Loading 1 giây

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-[#fff9f6] relative">
      {/* Background mờ */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-orange-50 opacity-30 z-0"></div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <Nav />
        {!userData ? (
          <UserDashboard />
        ) : userData.role == "user" ? (
          <UserDashboard />
        ) : userData.role == "owner" ? (
          <OwnerDashboard />
        ) : null}
      </div>
    </div>
  );
}

export default Home;
