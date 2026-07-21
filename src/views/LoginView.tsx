import { useState, FormEvent } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Cpu, ShieldCheck, UserCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user, res.token);
    } catch (err: any) {
      setError(
        err.message || 'Identifiants incorrects. Veuillez vérifier votre adresse e-mail et votre mot de passe.'
      );
    } finally {
      setLoading(false);
    }
  };

  const setAdminDemo = () => {
    setEmail('admin@redatlas.fr');
    setPassword('admin123');
    setError(null);
  };

  const setTechDemo = () => {
    setEmail('tech@redatlas.fr');
    setPassword('tech123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-red-800 text-white rounded-2xl shadow-lg mb-3">
            <Cpu className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Red<span className="text-red-700">Atlas</span> IoT
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Supervision & Détection d'Anomalies de Capteurs
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Connexion à la Plateforme</h2>
          <p className="text-xs text-slate-500 mb-6">
            Saisissez vos identifiants pour accéder à la supervision des machines.
          </p>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@redatlas.fr"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-800 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-800 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-red-800 hover:bg-red-900 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Vérification...' : 'Se Connecter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
              Comptes Démo Pré-configurés
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={setAdminDemo}
                className="p-3 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 group-hover:text-red-900">
                  <ShieldCheck className="w-4 h-4 text-red-700" />
                  <span>Administrateur</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">CRUD complet + Python</p>
              </button>

              <button
                type="button"
                onClick={setTechDemo}
                className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 group-hover:text-blue-900">
                  <UserCheck className="w-4 h-4 text-blue-700" />
                  <span>Technicien</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Accès Lecture Seule</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6 font-medium">
          RedAtlas IoT v2.4 • Architecture MVC & Intelligence Artificielle Isolation Forest
        </p>
      </div>
    </div>
  );
}
