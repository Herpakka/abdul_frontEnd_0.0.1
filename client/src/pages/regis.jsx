import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, EnvelopeIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        console.log('Registration data:', formData);
    };

    const handleLoginClick = () => {
        navigate('/login');
    }

    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-orange-900 text-purple-100">
            <section className="w-full max-w-md mx-4 p-8 rounded-3xl border border-purple-600/40 bg-purple-800/40 backdrop-blur-xl shadow-xl shadow-orange-700/20">
                {/* Header */}
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-orange-400 drop-shadow-md">
                        Create Account
                    </h1>
                    <p className="mt-2 text-sm text-purple-300">
                        Join us to get started
                    </p>
                </header>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username */}
                    <div className="relative">
                        <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                        <input
                            type="text"
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Username"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-purple-900/60 border border-purple-600/40 focus:border-orange-400 text-sm placeholder-purple-400 outline-none focus:ring-2 focus:ring-orange-400/40 transition"
                        />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email address"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-purple-900/60 border border-purple-600/40 focus:border-orange-400 text-sm placeholder-purple-400 outline-none focus:ring-2 focus:ring-orange-400/40 transition"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-purple-900/60 border border-purple-600/40 focus:border-orange-400 text-sm placeholder-purple-400 outline-none focus:ring-2 focus:ring-orange-400/40 transition"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <ShieldCheckIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm password"
                            className={`w-full pl-10 pr-4 py-3 rounded-xl bg-purple-900/60 border transition text-sm placeholder-purple-400 outline-none focus:ring-2 ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                    ? 'border-red-500/60 focus:border-red-400 focus:ring-red-400/40'
                                    : 'border-purple-600/40 focus:border-orange-400 focus:ring-orange-400/40'
                                }`}
                        />
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-600/40 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-700/50 font-semibold tracking-wide transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
                    >
                        Create Account
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-purple-300">
                        Already have an account?{' '}
                        <button
                            onClick={handleLoginClick}
                            className="text-orange-400 hover:underline"
                        >
                            Log In
                        </button>
                    </p>
                </div>
            </section>
        </main>
    );
}
