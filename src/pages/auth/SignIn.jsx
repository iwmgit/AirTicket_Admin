import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getBackgroundImage } from "../../config/api";
import Logo from "../../assets/Logo.png";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [bgImage, setBgImage] = useState("");
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getBackgroundImage()
      .then((data) => {
        if (data?.image_url) setBgImage(data.image_url);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success } = await login(email, password);
    if (success) {
      const from = location.state?.from?.pathname || "/admin/bookings";
      navigate(from, { replace: true });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative px-4 py-10"
      style={{
        backgroundImage: bgImage
          ? `linear-gradient(rgba(20, 40, 100, 0.72), rgba(20, 40, 100, 0.65)), url('${bgImage}')`
          : "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Top — Logo & Name */}
      <div className="flex flex-col items-center mb-8">
        <img src={Logo} alt="AirTicket" className="h-16 mb-3 drop-shadow-lg" />
        <h1 className="text-3xl font-bold text-white drop-shadow tracking-wide">AirTicket Admin</h1>
        <p className="text-blue-200 text-sm mt-1">Management Portal</p>
      </div>

      {/* Sign-in card */}
      <div className="w-full max-w-sm bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl px-8 py-8">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to your admin account</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.938 6.938A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-1.457 2.598M6.938 6.938L3 3m3.938 3.938l10.124 10.124M3 3l18 18"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg text-sm font-semibold transition"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>

    </div>
  );
}
