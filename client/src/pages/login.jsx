import { useState } from 'react';
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    // Input validation
    if (!formData.email || !formData.password) {
      setErrors({ general: 'Email and password are required' });
      return;
    }

    try {
      // Fixed: Pass the entire formData object as expected by authContext
      const result = await login(formData);

      if (result.success) {
        const from = location.state?.from || '/home';
        navigate(from, { replace: true });
      } else {
        // Fixed: Ensure error is always a string
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : 'Login failed. Please try again.';

        setErrors({ general: errorMessage });

        // Show error with SweetAlert2
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: errorMessage,
          confirmButtonColor: '#dc2626'
        });
      }
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error.message || 'An unexpected error occurred';
      setErrors({ general: errorMessage });

      console.error('Login error:', error);

      Swal.fire({
        icon: 'error',
        title: 'Login Error',
        text: errorMessage,
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="text-white">Loading...</div>
        </div>
      )}
      <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-orange-900 text-purple-100">
        <section className="w-full max-w-md mx-4 p-8 rounded-3xl border border-purple-600/40 bg-purple-800/40 backdrop-blur-xl shadow-xl shadow-orange-700/20">
          {/* Header */}
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-orange-400 drop-shadow-md">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-purple-300">
              Sign in to continue
            </p>
          </header>

          {/* Form */}
          <form className="space-y-6">
            {/* Email */}
            <div className="relative">
              <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
              <input
                type="email"
                //   required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-purple-900/60 border border-purple-600/40 focus:border-orange-400 text-sm placeholder-purple-400 outline-none focus:ring-2 focus:ring-orange-400/40 transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
              <input
                type="password"
                //   required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-purple-900/60 border border-purple-600/40 focus:border-orange-400 text-sm placeholder-purple-400 outline-none focus:ring-2 focus:ring-orange-400/40 transition"
                onKeyDown={(e) => {
                  // Prevent Thai characters (Unicode range U+0E00-U+0E7F)
                  if (e.key.match(/[\u0E00-\u0E7F]/)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-600/40 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-700/50 font-semibold tracking-wide transition active:scale-95"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              Log In
            </button>
          </form>
          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-purple-300">
              Don't have an account?{' '}
              <button
                onClick={handleRegisterClick}
                className="text-orange-400 hover:underline"
              >
                Register
              </button>
            </p>
          </div>
        </section>
      </main>
      {errors.general && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {errors.general}
        </div>
      )}
    </>
  );
}
