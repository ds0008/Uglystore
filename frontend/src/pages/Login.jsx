import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import FormInput from "../components/FormInput";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 11) {
      toast.error("Enter a valid phone number");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/otp/send", { phone });
      setOtpSent(true);
      toast.success("OTP sent to your phone");
    } catch (err) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/otp/verify", { phone, code: otp });
      localStorage.setItem("token", res.data.token);
      toast.success("Welcome!");
      window.location.href = "/";
    } catch (err) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 pb-20 sm:pb-0">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Welcome back</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Sign in to your account</p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center"><span className="bg-white px-3 text-sm text-gray-400">or</span></div>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
          <button
            onClick={() => setMode("email")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === "email" ? "bg-white text-black shadow-sm" : "text-gray-500"}`}
          >
            Email
          </button>
          <button
            onClick={() => setMode("phone")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === "phone" ? "bg-white text-black shadow-sm" : "text-gray-500"}`}
          >
            Phone (OTP)
          </button>
        </div>

        {mode === "email" ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <FormInput label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <FormInput label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  disabled={otpSent}
                  className="flex-1 border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || otpSent}
                  className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 transition-colors whitespace-nowrap"
                >
                  {otpSent ? "Sent" : "Send OTP"}
                </button>
              </div>
            </div>
            {otpSent && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <button type="submit" disabled={loading || otp.length < 4} className="w-full py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400">
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <button type="button" onClick={() => { setOtpSent(false); setOtp(""); }} className="w-full text-sm text-gray-500 hover:text-gray-700">
                  Change phone number
                </button>
              </>
            )}
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-5">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-black font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
