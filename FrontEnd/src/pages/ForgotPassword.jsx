import React, { use } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
function ForgotPassword() {
  const [step, setStep] = React.useState(1);
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  return (
    <div className="flex w-full items-center justify-center min-h-screen pg-4 bg-[#fff9f6]">
      <div className="bg-white rounded-x1 shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-4 mb-4">
          <IoMdArrowRoundBack
            size={30}
            className=" cursor-pointer"
            style={{ color: "#00BFFF" }}
            onClick={() => navigate("/signin")}
          />
          <h1
            className="text-3xl font-bold text-center "
            style={{ color: "#00BFFF" }}
          >
            Forgot Password
          </h1>
        </div>
        {step === 1 && (
          <div>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email
              </label>
              <input
                type="email"
                className="w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Enter your Email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <button
              className={
                "w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#00BFFF] text-white hover:bg-[#00BFFF] cursor-pointer"
              }
            >
              Send OTP
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                OTP
              </label>
              <input
                type="email"
                className="w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Enter your OTP"
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
              />
            </div>
            <button
              className={
                "w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#00BFFF] text-white hover:bg-[#00BFFF] cursor-pointer"
              }
            >
              Verify
            </button>
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <label
                htmlFor="newPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                Enter Your New Password
              </label>
              <input
                type="newPassword"
                className="w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Enter your New Password"
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                Confirm Your New Password
              </label>
              <input
                type="confirmPassword"
                className="w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Confirm your Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
              />
            </div>
            <button
              className={
                "w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#00BFFF] text-white hover:bg-[#00BFFF] cursor-pointer"
              }
            >
              Reset Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
