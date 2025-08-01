import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserIcon, EnvelopeIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear any previous errors
        setErrors({});

        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: 'Passwords do not match!' });
            return;
        }

        setLoading(true);

        try {

            const payload = {
                username: formData.username.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            };

            // Use environment variable with proper fallback
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

            const response = await axios.post(
                `${apiUrl}/api/register`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000, // 30 second timeout
                    withCredentials: true // Include cookies for CORS
                }
            );

            // Handle successful registration
            if (response.data.success) {
                await Swal.fire({
                    title: 'สร้างบัญชีผู้ใช้สำเร็จ!',
                    text: 'คุณได้สร้างบัญชีผู้ใช้ใหม่เรียบร้อยแล้ว กรุณาเข้าสู่ระบบเพื่อเริ่มใช้งาน',
                    icon: 'success',
                    confirmButtonText: 'ไปที่หน้าเข้าสู่ระบบ',
                    allowOutsideClick: false,
                    customClass: {
                        confirmButton: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 px-6 py-2 rounded-lg font-medium',
                        title: 'text-2xl font-bold text-orange-600',
                        content: 'text-lg text-purple-700',
                        popup: 'bg-purple-50 border border-purple-200 shadow-xl'
                    }
                });

                // Clear form data after successful registration
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });

                // Navigate to login page
                navigate('/login');
            }

        } catch (error) {
            console.error('Registration error:', error);

            // Handle different types of errors
            if (error.response) {
                const { status, data } = error.response;

                switch (status) {
                    case 400:
                        // Validation errors
                        if (data.details && Array.isArray(data.details)) {
                            const errorObj = {};
                            data.details.forEach(detail => {
                                if (detail.includes('Username')) {
                                    errorObj.username = detail;
                                } else if (detail.includes('Email') || detail.includes('email')) {
                                    errorObj.email = detail;
                                } else if (detail.includes('Password')) {
                                    errorObj.password = detail;
                                } else if (detail.includes('Image')) {
                                    errorObj.image = detail;
                                } else {
                                    errorObj.general = detail;
                                }
                            });
                            setErrors(errorObj);

                            // Show validation errors in SweetAlert
                            await Swal.fire({
                                icon: 'warning',
                                title: 'ข้อมูลไม่ถูกต้อง',
                                html: `<ul class="text-left">${data.details.map(detail => `<li>• ${detail}</li>`).join('')}</ul>`,
                                confirmButtonText: 'แก้ไขข้อมูล',
                                customClass: {
                                    confirmButton: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-4 focus:ring-orange-300',
                                    popup: 'text-sm'
                                }
                            });
                        } else {
                            setErrors({ general: data.error || 'ข้อมูลที่กรอกไม่ถูกต้อง' });
                            await Swal.fire({
                                icon: 'error',
                                title: 'ข้อมูลไม่ถูกต้อง',
                                text: data.error || 'กรุณาตรวจสอบข้อมูลที่กรอก',
                                confirmButtonText: 'ลองอีกครั้ง'
                            });
                        }
                        break;

                    case 409:
                        // Conflict - user already exists
                        setErrors({
                            email: 'อีเมลหรือชื่อผู้ใช้นี้ถูกใช้แล้ว',
                            username: 'อีเมลหรือชื่อผู้ใช้นี้ถูกใช้แล้ว'
                        });
                        await Swal.fire({
                            icon: 'error',
                            title: 'ไม่สามารถสร้างบัญชีได้',
                            text: 'อีเมลหรือชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาใช้ข้อมูลอื่น',
                            confirmButtonText: 'ลองอีกครั้ง',
                            customClass: {
                                confirmButton: 'bg-red-500 text-white hover:bg-red-600'
                            }
                        });
                        break;

                    case 429:
                        // Rate limit exceeded
                        const retryAfter = error.response.headers['retry-after'] || 900; // 15 minutes default
                        await Swal.fire({
                            icon: 'warning',
                            title: 'พยายามมากเกินไป',
                            text: `กรุณารอ ${Math.ceil(retryAfter / 60)} นาที ก่อนลองอีกครั้ง`,
                            confirmButtonText: 'เข้าใจแล้ว',
                            allowOutsideClick: false,
                            customClass: {
                                confirmButton: 'bg-yellow-500 text-white hover:bg-yellow-600'
                            }
                        });
                        break;

                    case 500:
                        // Server error
                        await Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาดของระบบ',
                            text: 'ระบบขัดข้องชั่วคราว กรุณาลองอีกครั้งในภายหลัง',
                            confirmButtonText: 'เข้าใจแล้ว',
                            customClass: {
                                confirmButton: 'bg-gray-500 text-white hover:bg-gray-600'
                            }
                        });
                        break;

                    default:
                        await Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: data.error || 'ไม่สามารถสร้างบัญชีได้ กรุณาลองอีกครั้ง',
                            confirmButtonText: 'ลองอีกครั้ง'
                        });
                }
            } else if (error.request) {
                // Network error
                setErrors({ network: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้' });
                await Swal.fire({
                    icon: 'error',
                    title: 'ปัญหาการเชื่อมต่อ',
                    text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
                    confirmButtonText: 'ลองอีกครั้ง',
                    customClass: {
                        confirmButton: 'bg-blue-500 text-white hover:bg-blue-600'
                    }
                });
            } else {
                // Other errors
                setErrors({ general: 'เกิดข้อผิดพลาดที่ไม่คาดคิด' });
                await Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองอีกครั้ง',
                    confirmButtonText: 'ลองอีกครั้ง'
                });
            }
        } finally {
            setLoading(false);
        }
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
                            onKeyDown={(e) => {
                                // Prevent Thai characters (Unicode range U+0E00-U+0E7F)
                                if (e.key.match(/[\u0E00-\u0E7F]/)) {
                                    e.preventDefault();
                                }
                            }}
                            onPaste={(e) => {
                                // Prevent pasting Thai characters
                                const paste = (e.clipboardData || window.clipboardData).getData('text');
                                if (paste.match(/[\u0E00-\u0E7F]/)) {
                                    e.preventDefault();
                                }
                            }}
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
                            onKeyDown={(e) => {
                                // Prevent Thai characters (Unicode range U+0E00-U+0E7F)
                                if (e.key.match(/[\u0E00-\u0E7F]/)) {
                                    e.preventDefault();
                                }
                            }}
                            onPaste={(e) => {
                                // Prevent pasting Thai characters
                                const paste = (e.clipboardData || window.clipboardData).getData('text');
                                if (paste.match(/[\u0E00-\u0E7F]/)) {
                                    e.preventDefault();
                                }
                            }}
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
                            onKeyDown={(e) => {
                                // Prevent Thai characters (Unicode range U+0E00-U+0E7F)
                                if (e.key.match(/[\u0E00-\u0E7F]/)) {
                                    e.preventDefault();
                                }
                            }}
                            onPaste={(e) => {
                                // Prevent pasting Thai characters
                                const paste = (e.clipboardData || window.clipboardData).getData('text');
                                if (paste.match(/[\u0E00-\u0E7F]/)) {
                                    e.preventDefault();
                                }
                            }}
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
