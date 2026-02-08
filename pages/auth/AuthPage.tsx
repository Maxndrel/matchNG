"use client";

import React, { useState } from 'react';
import { UserRole, UserProfile } from '../../types';
import { getUsers, saveUser } from '../../services/storage';
import { Briefcase, Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthPageProps {
  initialMode: 'LOGIN' | 'REGISTER';
  onAuthSuccess: (user: UserProfile) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ initialMode, onAuthSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  const [role, setRole] = useState<UserRole>(UserRole.SEEKER);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isSimulatingGoogle, setIsSimulatingGoogle] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const users = getUsers();

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
      
      saveUser(newUser);
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
    setTimeout(() => {
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
      saveUser(googleUser);
      onAuthSuccess(googleUser);
    }, 1200);
  };

  return (
    <div className="fade-in max-w-md mx-auto my-12 px-4">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl relative overflow-hidden">
        {isSimulatingGoogle && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
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
            className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" className="w-5 h-5 mr-3" alt="Google" />
            {mode === 'LOGIN' ? 'Sign in with Google' : 'Sign up with Google'}
          </button>

          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
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
                className="ml-1 text-emerald-600 hover:underline"
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