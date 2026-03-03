'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/supabase/queries';

export default function LoginPage() {
  const [idCard, setIdCard] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState<{ top: string; left: string; delay: string }[]>([]);
  const router = useRouter();

  // สร้างดาวเฉพาะ Client Side (แก้ Hydration Error)
  useEffect(() => {
    setStars(
      Array.from({ length: 30 }, () => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
      }))
    );
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (idCard.length !== 13) {
      setError('เลขบัตรประชาชนต้อง 13 หลัก');
      setLoading(false);
      return;
    }

    if (password.length !== 10) {
      setError('รหัสผ่านต้องเป็นรูปแบบ DD-MM-YYYY (10 หลัก)');
      setLoading(false);
      return;
    }

    try {
      const user = await login(idCard, password);

      if (user) {
        localStorage.setItem('user_id', user.id);
        localStorage.setItem('user_data', JSON.stringify(user));
        localStorage.setItem('login_time', new Date().toISOString());
        router.push('/home');
      } else {
        setError('เลขบัตรประชาชน หรือ รหัสผ่าน ไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50 relative overflow-hidden">
      {/* Sparkle Background Effect (Client Side Only) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              animationDelay: star.delay,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img
            src="/images/logo-full.png"
            alt="DeMi+ Logo"
            className="h-24 w-auto mx-auto mb-2"
          />
          <p className="text-sm text-gray-600">Development for Mind & health</p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md space-y-4">
          {/* ID Card Input */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  เลขบัตรประชาชน
                </label>
                <p className="text-xs text-gray-500">หมายเลขบัตรประจำตัวประชาชน</p>
              </div>
            </div>
            <input
              type="text"
              value={idCard}
              onChange={(e) => setIdCard(e.target.value.replace(/\D/g, ''))}
              placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
              maxLength={13}
              className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          {/* Password Input */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  รหัสผ่าน
                </label>
                <p className="text-xs text-gray-500">กรุณากรอกรหัสผ่าน</p>
              </div>
            </div>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="DD-MM-YYYY (วัน-เดือน-ปีเกิด)"
              maxLength={10}
              className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
            />
            <p className="text-xs text-gray-400 mt-2">ตัวอย่าง: 01-01-2500</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </div>

        {/* Mascot */}
        <div className="mt-8 mb-4">
          <img
            src="/images/mascot-main.png"
            alt="DeMi+ Mascot"
            className="w-48 h-48 object-contain"
          />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>สำหรับผู้ใช้งานใหม่ ติดต่อเจ้าหน้าที่</p>
        </div>
      </div>
    </div>
  );
}