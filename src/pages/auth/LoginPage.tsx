import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Gauge } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { loginSchema, type LoginFormData } from '../../validations/auth.schema.js';
import { authService } from '../../services/auth.service.js';
import { setAuth, setLoading } from '../../store/slices/authSlice.js';
import { handleFormError } from '../../utils/handleFormError.js';
import Input from '../../components/ui/Input.js';
import Button from '../../components/ui/Button.js';
import { showSuccess } from '../../utils/toast.js';
import ThemeToggle from '../../components/ui/ThemeToggle.js';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.login(data);
      dispatch(setAuth(response.data.user));
      showSuccess('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      handleFormError(error, setError, {
        'Email': 'email',
        'Password': 'password'
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black p-4 sm:p-6 font-sans selection:bg-blue-500/30 transition-colors duration-300 relative">
      {/* Absolute positioned toggle */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-6 sm:space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="text-blue-500">
              <Gauge size={32} className="sm:w-9 sm:h-9" strokeWidth={2.5} />
            </div>
            <span className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic bg-linear-to-r from-black to-gray-500 dark:from-white dark:to-gray-500 bg-clip-text text-transparent inline-block">
              Speedo
            </span>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">Access your enterprise dashboard</p>
        </div>

        <div className="bg-gray-50 dark:bg-[#0c0c0c] border border-black/5 dark:border-white/5 p-6 sm:p-8 shadow-2xl shadow-blue-500/5 transition-colors">
          {errors.root && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-center">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            <Input
              label="Account Email"
              type="email"
              placeholder="ENTER EMAIL"
              icon={<Mail size={14} className="text-gray-500" />}
              error={errors.email?.message}
              className="bg-white dark:bg-[#151515] border-black/10 dark:border-white/10 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-black/20 dark:focus:border-white/20 rounded-none h-10 text-[10px] tracking-widest"
              {...register('email')}
            />

            <Input
              label="Secure Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={14} className="text-gray-500" />}
              error={errors.password?.message}
              className="bg-white dark:bg-[#151515] border-black/10 dark:border-white/10 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-black/20 dark:focus:border-white/20 rounded-none h-10 uppercase text-[10px] tracking-widest"
              {...register('password')}
            />

            <Button 
              type="submit" 
              className="w-full h-11 text-[10px] font-black uppercase tracking-[0.3em] bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-none rounded-none transition-all duration-300 shadow-lg shadow-blue-500/10" 
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 flex flex-col items-center">
            <Link to="/signup" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black dark:hover:text-white transition-all">
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
