
"use client";

import React, { useState } from 'react';
import { UserRole, UserProfile } from '../../types.ts';
import { getUsers, saveUser } from '../../services/storage.ts';
import { Briefcase, Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthPageProps {
  initialMode: 'LOGIN' | 'REGISTER';
  onAuthSuccess: (user: UserProfile) => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const AuthPage: React.FC<AuthPageProps> = ({ initialMode, onAuthSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  const [role, setRole] = useState<UserRole>(UserRole.SEEKER);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isSimulatingGoogle, setIsSimulatingGoogle] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const users = await getUsers();

    if (mode === 'REGISTER') {
      if (users.some(u => u.fullName.toLowerCase() === fullName.toLowerCase())) {
        setError('A user with this name already exists.');
        return;
      }

      const newUser: UserProfile = {
        id: `u-${Date.now()}`,
        fullName: fullName || 'New User',
        role: role,
        skills: [],
        location: { state: 'Lagos', lga: 'Ikeja', city: '', lat: 6.5965, lon: 3.3421 },
        remotePreference: role === UserRole.SEEKER,
        relocatePreference: false,
        savedJobIds: [],
        appliedJobIds: [],
        education: [],
        experience: []
      };
      
      await saveUser(newUser);
      onAuthSuccess(newUser);
    } else {
      const user = users.find(u => 
        (u.fullName.toLowerCase() === fullName.toLowerCase()) || 
        (u.fullName.toLowerCase().includes(fullName.toLowerCase()) && fullName.length > 3)
      );

      if (user) {
        onAuthSuccess(user);
      } else {
        setError('User not found. Try registering first.');
      }
    }
  };

  const handleGoogleLogin = () => {
    setIsSimulatingGoogle(true);
    setError('');
    setTimeout(async () => {
      setIsSimulatingGoogle(false);
      const googleUser: UserProfile = {
        id: `g-${Date.now()}`,
        fullName: 'Google User',
        role: role,
        skills: [],
        location: { state: 'Lagos', lga: 'Ikeja', city: '', lat: 6.5965, lon: 3.3421 },
        remotePreference: role === UserRole.SEEKER,
        relocatePreference: false,
        savedJobIds: [],
        appliedJobIds: [],
        education: [],
        experience: []
      };
      await saveUser(googleUser);
      onAuthSuccess(googleUser);
    }, 1200);
  };

  return (
    <div className="fade-in max-w-md mx-auto my-12 px-4">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl relative overflow-hidden">
        {isSimulatingGoogle && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6 text-emerald-600">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Connecting to Google</h3>
            <p className="text-sm text-gray-500">Please wait while we verify your identity...</p>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <Briefcase className="text-white w-7 h-7" />
            </div>
            <span className="text-gray-900 tracking-tighter">match<span className="text-emerald-600">NG</span></span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {mode === 'LOGIN' ? 'Welcome Back' : 'Get Started'}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSimulatingGoogle}
            className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98] focus:ring-2 focus:ring-emerald-500/20 outline-none"
          >
            <GoogleIcon />
            {mode === 'LOGIN' ? 'Sign in with Google' : 'Sign up with Google'}
          </button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Or continue with email</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Chidi Okeke"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition outline-none text-gray-900"
                />
              </div>
            </div>

            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.SEEKER)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                      role === UserRole.SEEKER 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100' 
                      : 'bg-white border-gray-200 text-gray-500 hover:border-emerald-200'
                    }`}
                  >
                    Job Seeker
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.EMPLOYER)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                      role === UserRole.EMPLOYER 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100' 
                      : 'bg-white border-gray-200 text-gray-500 hover:border-emerald-200'
                    }`}
                  >
                    Employer
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition transform active:scale-95"
            >
              {mode === 'LOGIN' ? 'Sign In' : 'Create Account'}
            </button>
            
            <p className="text-center text-xs text-gray-400 font-bold mt-4">
              {mode === 'LOGIN' ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button"
                onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                className="ml-1 text-emerald-600 hover:underline focus:outline-none"
              >
                {mode === 'LOGIN' ? 'Register' : 'Login'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
