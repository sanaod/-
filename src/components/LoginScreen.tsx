import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  UserPlus, 
  ExternalLink,
  ArrowRight,
  User
} from 'lucide-react';
import { UserRole } from '../types/roleDashboards';

interface LoginScreenProps {
  onLoginSuccess: (role: UserRole, username: string) => void;
}

// Pre-registered accounts database simulation for email-based login
const REGISTERED_ACCOUNTS = [
  { email: 'teacher@moe.edu.ps', password: '123', role: 'teacher' as UserRole, name: 'أ. أحمد المعلم' },
  { email: 'supervisor@moe.edu.ps', password: '123', role: 'supervisor' as UserRole, name: 'د. إياد طهبوب' },
  { email: 'principal@moe.edu.ps', password: '123', role: 'principal' as UserRole, name: 'أ. محمد المدير' },
  { email: 'demo@abaqoor.ps', password: '123', role: 'teacher' as UserRole, name: 'معلم تجريبي' }
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('teacher@moe.edu.ps');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState<{ text: string; type: 'unregistered' | 'wrong_password' | 'general' } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals for Forgot Password / New Account
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccPassword, setNewAccPassword] = useState('');
  const [newAccConfirm, setNewAccConfirm] = useState('');
  const [newAccError, setNewAccError] = useState<string | null>(null);
  const [newAccSuccess, setNewAccSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail || !password) {
        setErrorMessage({ text: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.', type: 'general' });
        return;
      }

      // 1. Search account using email only as identifier
      const foundAccount = REGISTERED_ACCOUNTS.find(acc => acc.email.toLowerCase() === cleanEmail);

      if (!foundAccount) {
        // البريد الإلكتروني غير مسجل
        setErrorMessage({
          text: 'البريد الإلكتروني غير مسجل في المنظومة.',
          type: 'unregistered'
        });
        return;
      }

      // 2. Check password
      if (foundAccount.password !== password) {
        // كلمة المرور غير صحيحة
        setErrorMessage({
          text: 'كلمة المرور غير صحيحة.',
          type: 'wrong_password'
        });
        return;
      }

      // Success
      setSuccessMessage('تم الدخول بنجاح — جاري الانتقال للصفحة الرئيسية...');
      setTimeout(() => {
        onLoginSuccess(foundAccount.role, foundAccount.name);
      }, 900);
    }, 700);
  };

  const handleQuickLogin = (accEmail: string) => {
    setEmail(accEmail);
    setPassword('123');
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const foundAccount = REGISTERED_ACCOUNTS.find(acc => acc.email.toLowerCase() === accEmail.toLowerCase());
      if (foundAccount) {
        setSuccessMessage('تم الدخول بنجاح — جاري الانتقال للصفحة الرئيسية...');
        setTimeout(() => {
          onLoginSuccess(foundAccount.role, foundAccount.name);
        }, 800);
      }
    }, 500);
  };

  const handleNewAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewAccError(null);

    if (!newAccName.trim() || !newAccEmail.trim() || !newAccPassword.trim()) {
      setNewAccError('يرجى تعبئة جميع الحقول المطلوبة.');
      return;
    }

    if (newAccPassword !== newAccConfirm) {
      setNewAccError('كلمتا المرور غير متطابقتين.');
      return;
    }

    // Check if email already registered
    const exists = REGISTERED_ACCOUNTS.some(acc => acc.email.toLowerCase() === newAccEmail.trim().toLowerCase());
    if (exists) {
      setNewAccError('هذا البريد الإلكتروني مسجل مسبقاً.');
      return;
    }

    // Add to registered accounts
    REGISTERED_ACCOUNTS.push({
      email: newAccEmail.trim().toLowerCase(),
      password: newAccPassword,
      role: 'teacher',
      name: newAccName.trim()
    });

    setNewAccSuccess(true);
    setTimeout(() => {
      setIsNewAccountModalOpen(false);
      setNewAccSuccess(false);
      setEmail(newAccEmail.trim());
      setPassword(newAccPassword);
      setNewAccName('');
      setNewAccEmail('');
      setNewAccPassword('');
      setNewAccConfirm('');
      setSuccessMessage('✅ تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
    }, 1500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSent(true);
    setTimeout(() => {
      setIsForgotPasswordModalOpen(false);
      setForgotSent(false);
      setForgotEmail('');
      setSuccessMessage('تم إرسال تعليمات استعادة كلمة المرور إلى بريدك الإلكتروني.');
      setTimeout(() => setSuccessMessage(null), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-6 select-none" dir="rtl">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden relative z-10 transition-all duration-300">
        {/* Header Title & Logo */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-6 md:p-8 text-center border-b border-emerald-500/20 relative">
          <div className="absolute top-4 left-4 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>منهاج فلسطيني PS</span>
          </div>

          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-400 via-emerald-500 to-teal-400 p-1 shadow-xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center border-2 border-white/20">
              <span className="text-2xl md:text-3xl font-black text-amber-400">عبقور</span>
              <span className="text-[10px] text-emerald-300 font-semibold">OER PS</span>
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight">
            منظومة عبقور للتخطيط التربوي وتحضير الدروس
          </h1>
          <p className="text-xs md:text-sm text-emerald-200/90 font-medium max-w-md mx-auto leading-relaxed">
            التعليم المستند إلى مصادر التعليم المفتوحة — فلسطين
          </p>
        </div>

        {/* Login Form Body */}
        <div className="p-6 md:p-8">
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 rounded-xl text-sm font-bold flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/40 text-rose-200 rounded-xl text-sm font-bold flex flex-col gap-2 animate-fade-in">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorMessage.text}</span>
              </div>
              
              {errorMessage.type === 'unregistered' && (
                <div className="pt-2 border-t border-rose-500/30 flex items-center justify-between">
                  <span className="text-xs text-rose-300 font-normal">لا تمتلك حساباً مسجلاً بهذا البريد؟</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewAccEmail(email);
                      setIsNewAccountModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>هل تريد إنشاء حساب جديد؟</span>
                  </button>
                </div>
              )}

              {errorMessage.type === 'wrong_password' && (
                <div className="pt-2 border-t border-rose-500/30 flex items-center justify-between">
                  <span className="text-xs text-rose-300 font-normal">هل نسيت كلمة المرور الخاصة بك؟</span>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setIsForgotPasswordModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-lg transition-all flex items-center gap-1 border border-slate-700"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                    <span>استعادة كلمة المرور</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Field 1: Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                📧 البريد الإلكتروني:
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@moe.edu.ps أو البريد الشخصي"
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/70 focus:border-emerald-500 rounded-xl pr-10 pl-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>🔒 كلمة المرور:</span>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setIsForgotPasswordModalOpen(true);
                  }}
                  className="text-xs text-emerald-400 hover:underline font-normal"
                >
                  نسيت كلمة المرور؟
                </button>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/70 focus:border-emerald-500 rounded-xl pr-10 pl-11 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Main Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-[0.99] disabled:opacity-50 text-sm md:text-base"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>✅ تسجيل الدخول</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register Prompt & Divider */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">لا تمتلك حساباً؟</span>
            <button
              type="button"
              onClick={() => setIsNewAccountModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>سجّل الآن</span>
            </button>
          </div>

          {/* Quick Demo Accounts for Evaluation */}
          <div className="mt-6 p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
            <span className="block text-[11px] text-slate-400 mb-2.5 font-semibold">
              ⚡ تجربة سريعة (انقر للدخول المباشر):
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('teacher@moe.edu.ps')}
                className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 text-[11px] font-bold rounded-lg transition-all"
              >
                👨‍🏫 معلم مادة
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('supervisor@moe.edu.ps')}
                className="px-2.5 py-1 bg-blue-950/80 border border-blue-500/30 hover:border-blue-400 text-blue-300 text-[11px] font-bold rounded-lg transition-all"
              >
                🔍 مشرف تربوي
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('principal@moe.edu.ps')}
                className="px-2.5 py-1 bg-amber-950/80 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-[11px] font-bold rounded-lg transition-all"
              >
                🏫 مدير مدرسة
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950/80 px-6 py-3.5 text-center border-t border-slate-800 text-[11px] text-slate-400">
          وزارة التربية والتعليم العالي — دولة فلسطين © ٢٠٢٦
        </div>
      </div>

      {/* New Account Modal */}
      {isNewAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              <span>إنشاء حساب جديد في منظومة عبقور</span>
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              يرجى إدخال البيانات التالية للتسجيل باستخدام البريد الإلكتروني كمعرّف أساسي.
            </p>

            {newAccSuccess ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs font-bold text-center">
                ✅ تم إنشاء الحساب بنجاح! جارٍ تحويلك لتسجيل الدخول...
              </div>
            ) : (
              <form onSubmit={handleNewAccountSubmit} className="space-y-4">
                {newAccError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 rounded-xl text-xs font-bold">
                    {newAccError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم الكامل:</label>
                  <input
                    type="text"
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    placeholder="مثال: أ. فاطمة أحمد"
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    value={newAccEmail}
                    onChange={(e) => setNewAccEmail(e.target.value)}
                    placeholder="name@moe.edu.ps"
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمة مرور جديدة:</label>
                  <input
                    type="password"
                    value={newAccPassword}
                    onChange={(e) => setNewAccPassword(e.target.value)}
                    placeholder="أدخل كلمة مرور قوية"
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">تأكيد كلمة المرور:</label>
                  <input
                    type="password"
                    value={newAccConfirm}
                    onChange={(e) => setNewAccConfirm(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور للتأكيد"
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewAccountModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <span>✅ إنشاء حساب جديد والبدء</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {isForgotPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-teal-400" />
              <span>استعادة كلمة المرور</span>
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              أدخل بريدك الإلكتروني المسجل لتلقي رابط إعادة تعيين كلمة المرور.
            </p>

            {forgotSent ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs font-bold text-center">
                تم إرسال رابط الاستعادة إلى بريدك الإلكتروني بنجاح.
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@moe.edu.ps"
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    إرسال رابط الاستعادة
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
