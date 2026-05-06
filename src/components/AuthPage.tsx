import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Github, Chrome, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { signUpWithEmail, signInWithEmail, signIn, updateUserProfile, ensureUserStats } from '../lib/firebase';
import Logo from './Logo';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        const result = await signUpWithEmail(email, password);
        if (name) {
          await updateUserProfile(name);
        }
        // Initialize user stats for email sign-up
        if (result.user) {
          await ensureUserStats(result.user);
        }
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden italic selection:bg-primary/30">
      {/* Left Branding Side */}
      <div className="hidden md:flex md:w-1/2 bg-surface-container border-r border-outline-variant flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <Logo className="w-12 h-12" />
          <h1 className="font-display text-3xl font-bold tracking-tighter">
            <span className="text-[#0056b3]">Prep</span>
            <span className="text-[#ff9800]">Zify</span>
          </h1>
        </Link>

        <div className="relative z-10 space-y-6">
          <h2 className="text-6xl font-black tracking-tighter leading-[0.9] text-on-surface">
            Accelerate your <br />
            <span className="text-primary">engineering</span> <br />
            trajectory.
          </h2>
          <p className="text-on-surface-variant text-lg max-w-sm leading-relaxed">
            The elite platform for technical assessment and career growth. Trusted by top software engineers globally.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-12 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
           <div className="flex flex-col gap-2">
              <span className="text-primary text-2xl font-black">40k+</span>
              <span>Global Users</span>
           </div>
           <div className="flex flex-col gap-2">
              <span className="text-primary text-2xl font-black">94%</span>
              <span>Success Rate</span>
           </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-10">
           <div className="space-y-3 text-center md:text-left">
              <div className="flex justify-center md:justify-start lg:hidden mb-6">
                 <Logo className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black tracking-tighter text-on-surface">
                {isLogin ? 'Welcome back' : 'Join the Elite'}
              </h3>
              <p className="text-on-surface-variant text-sm">
                {isLogin 
                  ? 'Access your personalized dashboard and track your progress.' 
                  : 'Start your journey towards mastering technical assessments.'}
              </p>
           </div>

           <form onSubmit={handleAuth} className="space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-error-container/10 border border-error/20 rounded-xl flex items-center gap-3 text-error text-xs font-bold"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant pl-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe" 
                        className="w-full bg-surface-container border border-outline-variant rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant pl-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@prepzify.ai" 
                      className="w-full bg-surface-container border border-outline-variant rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant pl-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-surface-container border border-outline-variant rounded-2xl pl-12 pr-12 py-4 text-sm focus:outline-none focus:border-primary transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {isLogin && (
                <div className="flex justify-end">
                   <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline underline-offset-4 decoration-primary/30">
                      Forgot Password?
                   </button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-on-primary py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 active:brightness-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
              >
                {loading ? 'Authenticating...' : (isLogin ? 'Login' : 'Create Account')}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
           </form>

           <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant"></div></div>
              <div className="relative flex justify-center uppercase"><span className="bg-background px-4 text-[9px] font-bold text-on-surface-variant tracking-[0.2em]">Or Continue With</span></div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-3 p-4 bg-surface-container border border-outline-variant rounded-2xl hover:bg-surface-container-high transition-all group"
              >
                 <Chrome className="w-5 h-5 text-on-surface-variant group-hover:text-[#4285F4] transition-colors" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 p-4 bg-surface-container border border-outline-variant rounded-2xl hover:bg-surface-container-high transition-all group opacity-50 cursor-not-allowed">
                 <Github className="w-5 h-5 text-on-surface-variant group-hover:text-on-surface transition-colors" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">GitHub</span>
              </button>
           </div>

           <div className="text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="text-primary font-bold hover:underline underline-offset-4 decoration-primary/30">
                  {isLogin ? 'Sign Up' : 'Log In'}
                </span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
