'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plane, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        toast.success('Authentication successful. Welcome back.');
        router.push('/dashboard');
      } else {
        toast.error(result.message || 'Access Denied');
      }
    } catch (err) {
      toast.error('Connection timed out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="premium-glass p-10 lg:p-12 rounded-[3.5rem] border-white/5 relative z-10">

          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20 group-hover:scale-105 transition-transform">
                <Plane className="w-5 h-5 rotate-45" />
              </div>
              <span className="text-white font-black text-xl tracking-tighter uppercase">Skyway <span className="text-blue-400">AI</span></span>
            </Link>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Access Portal</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Initialize Identity Sequence</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="form-label">Email Access Code</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@nexus.com"
                  className="input-field pl-16 py-5 rounded-[2rem]"
                />
              </div>
              {errors.email && <p className="text-red-400 text-[10px] font-black uppercase ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="form-label">Security Cipher</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="input-field pl-16 py-5 rounded-[2rem]"
                />
              </div>
              {errors.password && <p className="text-red-400 text-[10px] font-black uppercase ml-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-4 shadow-xl shadow-blue-900/20 mt-8"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Verify Identity</>}
            </button>
          </form>

          <p className="text-center mt-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            New Explorer? <Link href="/register" className="text-blue-400 hover:underline underline-offset-4 ml-1">Create Record</Link>
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">AES-256 Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">AI Core Verified</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
