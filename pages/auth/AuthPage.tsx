
"use client";

import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../../types.ts';
import { getUsers, saveUser } from '../../services/storage.ts';
import { 
  Briefcase, 
  Loader2, 
  User as UserIcon, 
  Building, 
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';

interface AuthPageProps {
  initialMode: 'LOGIN' | 'REGISTER';
  onAuthSuccess: (user: UserProfile) => void;
}

type SignupStep = 'ROLE' | 'CREDENTIALS';

// Custom Google Icon SVG
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AuthPage: React.FC<AuthPageProps> = ({ initialMode, onAuthSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  const [signupStep, setSignupStep] = useState<SignupStep>(initialMode === 'REGISTER' ? 'ROLE' : 'CREDENTIALS');
  const [role, setRole] = useState<UserRole>(UserRole.SEEKER);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const savedRole = localStorage.getItem('matchNG_temp_role');
    if (savedRole) setRole(savedRole as UserRole);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    localStorage.setItem('matchNG_temp_role', selectedRole);
    if (mode === 'REGISTER') {
      setSignupStep('CREDENTIALS');
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    
    // Simulate Google Auth Delay
    await new Promise(r => setTimeout(r, 1500));
    
    try {
      const users = await getUsers();
      // Try to find an existing user for this role or create a new one since presets are removed
      let googleUser = users.find(u => u.role === role);
      
      if (!googleUser) {
        // Create a new profile for the Google Login action
        googleUser = {
          id: `goog-${Date.now()}`,
          fullName: 'Google User',
          role: role,
          skills: [],
          location: { state: 'Lagos', city: '', lga: '', lat: 0, lon: 0 },
          remotePreference: true,
          relocatePreference: false,
          savedJobIds: [],
          appliedJobIds: []
        };
        await saveUser(googleUser);
      }
      
      onAuthSuccess(googleUser);
    } catch (err) {
      setError("Google Login failed. Please try traditional sign in.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    await new Promise(r => setTimeout(r, 1000));

    try {
      const users = await getUsers();

      if (mode === 'REGISTER') {
        const exists = users.find(u => u.fullName.toLowerCase() === formData.fullName.toLowerCase());
        if (exists) {
          setError('An account with this name already exists.');
          setIsLoading(false);
          return;
        }

        const newUser: UserProfile = {
          id: `u-${Date.now()}`,
          fullName: formData.fullName,
          role: role,
          skills: [],
          location: { 
            state: 'Lagos', 
            city: '', 
            lga: '', 
            lat: 0, 
            lon: 0 
          },
          remotePreference: true,
          relocatePreference: false,
          savedJobIds: [],
          appliedJobIds: []
        };
        
        await saveUser(newUser);
        onAuthSuccess(newUser);
      } else {
        const user = users.find(u => 
          u.fullName.toLowerCase() === formData.fullName.toLowerCase() && u.role === role
        );

        if (user) {
          onAuthSuccess(user);
        } else {
          setError(`Invalid credentials for ${role.toLowerCase()}.`);
        }
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleToggle = () => (
    <div className="bg-gray-100 p-1 rounded-2xl flex mb-6 relative select-none">
      <button 
        type="button"
        onClick={() => handleRoleSelect(UserRole.SEEKER)}
        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${role === UserRole.SEEKER ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <UserIcon className="w-3.5 h-3.5" /> Seeker
      </button>
      <button 
        type="button"
        onClick={() => handleRoleSelect(UserRole.EMPLOYER)}
        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${role === UserRole.EMPLOYER ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <Building className="w-3.5 h-3.5" /> Employer
      </button>
      <div 
        className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out border border-gray-100 ${role === UserRole.EMPLOYER ? 'translate-x-[calc(100%+0.125rem)]' : 'translate-x-0'}`}
      />
    </div>
  );

  const renderRoleSelector = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Choose Your Path</h2>
        <p className="text-gray-500 text-sm font-medium">Select your role to unlock specialized tools.</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {[
          { id: UserRole.SEEKER, label: 'Job Seeker', icon: UserIcon, desc: 'Find high-match career opportunities.' },
          { id: UserRole.EMPLOYER, label: 'Employer', icon: Building, desc: 'Recruit vetted talent with data-matching.' }
        ].map(r => (
          <button 
            key={r.id}
            onClick={() => handleRoleSelect(r.id)}
            className={`p-5 md:p-6 rounded-[2rem] border-2 text-left transition-all flex items-center gap-5 md:gap-6 group active:scale-[0.98] ${role === r.id ? 'border-emerald-600 bg-emerald-50 shadow-xl shadow-emerald-100' : 'border-gray-100 bg-white hover:border-emerald-200'}`}
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-colors ${role === r.id ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}>
              <r.icon className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div className="flex-grow">
              <h4 className="font-black text-gray-900 text-base md:text-lg">{r.label}</h4>
              <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest">{r.desc}</p>
            </div>
            <ArrowRight className={`w-5 h-5 transition-transform ${role === r.id ? 'text-emerald-600 translate-x-1' : 'text-gray-200 group-hover:translate-x-1'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  const renderCredentialsForm = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
          {mode === 'LOGIN' ? 'Welcome Back' : 'Security Details'}
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mt-2">
          {mode === 'LOGIN' ? 'Identify your role to continue' : `Securing your ${role.toLowerCase()} account`}
        </p>
      </div>

      {mode === 'LOGIN' && renderRoleToggle()}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input 
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 h-14 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-gray-900 text-base"
              placeholder="e.g. Amina Garba"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Security Key (Password)</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input 
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-12 pr-12 h-14 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-gray-900 text-base"
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 p-2"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button 
          type="submit"
          disabled={isLoading || isGoogleLoading || formData.fullName.length < 2 || formData.password.length < 4}
          className="w-full h-16 bg-emerald-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.97]"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'LOGIN' ? `Sign In` : 'Join matchNG'}
        </button>

        <div className="relative flex items-center justify-center py-2">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">Or</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        <button 
          type="button"
          disabled={isLoading || isGoogleLoading}
          onClick={handleGoogleLogin}
          className="w-full h-16 bg-white border border-gray-100 text-gray-900 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.15em] shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.97]"
        >
          {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : <GoogleIcon />}
          {isGoogleLoading ? 'Verifying...' : 'Continue with Google'}
        </button>
      </div>
      
      {mode === 'REGISTER' && (
        <button 
          onClick={() => setSignupStep('ROLE')}
          className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Change Role
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gray-50/50">
      <div className="w-full max-w-[480px] bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-emerald-900/10 border border-gray-100 overflow-hidden relative">
        
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-600 to-teal-400"></div>

        <div className="p-6 md:p-10 pb-0 flex flex-col items-center">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-100 mb-4 animate-in zoom-in duration-500">
            <Briefcase className="text-white w-7 h-7" />
          </div>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.5em] ml-[0.5em]">Auth Service</p>
        </div>

        <div className="p-6 md:p-10 pt-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-in shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {mode === 'LOGIN' ? renderCredentialsForm() : (
              <>
                {signupStep === 'ROLE' && renderRoleSelector()}
                {signupStep === 'CREDENTIALS' && renderCredentialsForm()}
              </>
            )}
          </form>

          <div className="mt-8 text-center">
             <button 
              onClick={() => {
                const nextMode = mode === 'LOGIN' ? 'REGISTER' : 'LOGIN';
                setMode(nextMode);
                setSignupStep(nextMode === 'REGISTER' ? 'ROLE' : 'CREDENTIALS');
                setError('');
              }}
              className="text-[11px] font-black text-gray-400 hover:text-emerald-600 transition-colors uppercase tracking-widest p-2"
             >
               {mode === 'LOGIN' ? (
                 <>New to matchNG? <span className="text-emerald-600 underline underline-offset-4 decoration-2">Join Now</span></>
               ) : (
                 <>Member? <span className="text-emerald-600 underline underline-offset-4 decoration-2">Sign In</span></>
               )}
             </button>
          </div>
        </div>

        <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-100 text-center select-none">
           <div className="flex items-center justify-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              End-to-End Encryption Active
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
