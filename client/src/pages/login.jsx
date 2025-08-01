import { useState } from 'react';
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/login', formData);
      if (response.data.success){
        Swal.fire({
          title: 'Login Successful',
          text: 'Welcome back!',
          icon: 'success',
          confirmButtonText: 'Continue',
          didClose: () => {
            navigate('/home'); // Redirect to home after successful login
          }
        });
      } else {
        Swal.fire({
          title: 'Login Failed',
          text: response.data.error || 'Please check your credentials.',
          icon: 'error',
          confirmButtonText: 'Try Again'
        });
        return;
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
      navigate('/home'); // Redirect to home after login
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-600/40 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-700/50 font-semibold tracking-wide transition active:scale-95"
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
  );
}
