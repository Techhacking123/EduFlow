import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi } from '../../api/auth.api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await registerApi({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        phone: phone.trim() || null,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="max-w-md w-full text-center relative z-10 animate-slide-up mx-4">
          <div className="bg-white border border-slate-100 p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col items-center">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
              <svg className="w-12 h-12 text-green-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Welcome Aboard!</h2>
            <p className="text-slate-500 mb-8 font-medium">Your account has been successfully created.</p>
            <div className="flex items-center gap-3 text-sm font-semibold text-indigo-600">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Redirecting to login...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row-reverse bg-white rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 animate-slide-up">
        
        {/* Right Side: Form (visually on the right) */}
        <div className="w-full md:w-1/2 p-6 sm:p-12 lg:p-16 flex flex-col justify-center bg-white overflow-y-auto md:max-h-[90vh] custom-scrollbar">
          <div className="max-w-md w-full mx-auto animate-fade-in delay-200 py-4">
            
            {/* Logo / Brand */}
            <div className="flex items-center gap-2 mb-10">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">EduFlow</span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Create an account
              </h2>
              <p className="text-slate-500 font-medium text-sm">
                Join our community and unlock your learning potential.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-r-xl mb-6 animate-slide-up flex items-start gap-3">
                <svg className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-medium text-sm">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {/* Role Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 ml-1">I am a...</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { id: 'student', label: 'Student', icon: '🎓' },
                    { id: 'faculty', label: 'Faculty', icon: '👨‍🏫' },
                    { id: 'parent', label: 'Parent', icon: '👪' },
                  ].map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`cursor-pointer border-2 rounded-xl p-3 flex items-center justify-center gap-2.5 transition-all duration-200 font-bold ${
                        role === r.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl">{r.icon}</span>
                      <span>{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm font-medium bg-slate-50 focus:bg-white hover:border-slate-300"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 ml-1">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm font-medium bg-slate-50 focus:bg-white hover:border-slate-300"
                    placeholder="(Optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 ml-1">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm font-medium bg-slate-50 focus:bg-white hover:border-slate-300"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5 group">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 ml-1">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="block w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm font-medium bg-slate-50 focus:bg-white hover:border-slate-300"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.71-1.58c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l3.29 3.29" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 group">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 ml-1">Confirm</label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className="block w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm font-medium bg-slate-50 focus:bg-white hover:border-slate-300"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.71-1.58c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l3.29 3.29" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-200 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : 'Create Account'}
                </button>
              </div>

              <p className="text-center text-sm font-medium text-slate-500 mt-6 pb-2">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Sign in here
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Left Side: Visual Showcase */}
        <div className="hidden md:flex w-1/2 relative items-center justify-center p-12 bg-slate-900 overflow-hidden">
          {/* Professional abstract gradients */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/40 via-slate-900 to-indigo-900/40"></div>
            <div className="absolute top-0 left-0 -ml-20 -mt-20 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-lg flex flex-col items-center animate-fade-in delay-300">
            <div className="relative w-full aspect-square mb-8">
              <img 
                src="/images/register_3d.png" 
                alt="3D Education Registration" 
                className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-float-slow"
              />
            </div>
            <div className="text-center px-8">
              <h3 className="text-3xl font-extrabold tracking-tight text-white mb-4">Shape Your Future</h3>
              <p className="text-violet-100/80 font-medium text-base leading-relaxed">
                Connect with world-class educators, interactive lessons, and build the skills you need for tomorrow.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
