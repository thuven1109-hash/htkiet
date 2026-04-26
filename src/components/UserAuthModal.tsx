import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { createUserProfile } from '../lib/firebaseService';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = React.useState(true);
  const [showEmailForm, setShowEmailForm] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await createUserProfile(result.user.uid, result.user.email || '');
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError('Không thể đăng nhập bằng Google. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(cred.user.uid, email);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold font-sans text-gray-900 dark:text-white">
                    Đồng bộ dữ liệu
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Lưu trữ lịch sử chat và API Key của bạn
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  )}
                  Tiếp tục với Google
                </button>

                {!showEmailForm ? (
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="w-full py-3 text-gray-400 hover:text-pink-500 text-sm font-medium transition-colors"
                  >
                    Hoặc sử dụng Email
                  </button>
                ) : (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={handleSubmit}
                    className="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-800"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-pink-300 rounded-2xl outline-none transition-all text-sm"
                          placeholder="example@gmail.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mật khẩu</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-pink-300 rounded-2xl outline-none transition-all text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-pink-100 dark:shadow-none hover:bg-pink-600 transition-all disabled:opacity-50"
                    >
                      {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="w-full text-center text-gray-400 hover:text-pink-500 text-xs font-medium"
                    >
                      {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
                    </button>
                  </motion.form>
                )}
              </div>

              <div className="mt-8 text-center">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
                  Bằng cách đăng nhập, dữ liệu của bạn sẽ được mã hoá và lưu trữ an toàn trên hệ thống đám mây.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

