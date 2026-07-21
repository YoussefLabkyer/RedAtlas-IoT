import { useState, FormEvent } from 'react';
import { User } from '../types';
import { X, UserPlus, Key } from 'lucide-react';

interface TechnicianModalProps {
  technician?: User | null;
  onSave: (data: {
    nom: string;
    email: string;
    password?: string;
    specialite?: string;
    telephone?: string;
    actif?: boolean;
  }) => Promise<void>;
  onClose: () => void;
}

export function TechnicianModal({ technician, onSave, onClose }: TechnicianModalProps) {
  const isEditing = !!technician;

  const [nom, setNom] = useState(technician?.nom || '');
  const [email, setEmail] = useState(technician?.email || '');
  const [password, setPassword] = useState('');
  const [specialite, setSpecialite] = useState(technician?.specialite || '');
  const [telephone, setTelephone] = useState(technician?.telephone || '');
  const [actif, setActif] = useState(technician?.actif ?? true);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!nom.trim() || !email.trim()) {
      setError('Le nom et l\'adresse email sont obligatoires.');
      return;
    }

    if (!isEditing && !password.trim()) {
      setError('Un mot de passe initial est requis pour la création.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave({
        nom: nom.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
        specialite: specialite.trim(),
        telephone: telephone.trim(),
        actif,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement du compte technicien.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-red-800 text-white rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isEditing ? 'Modifier le Technicien' : 'Créer un Compte Technicien'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? `ID: ${technician.id}` : 'Accès restreint en lecture seule sur le parc IoT'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nom complet *
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Jean Dupont"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-800 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Adresse e-mail (Identifiant de connexion) *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dupont@redatlas.fr"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-800 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Mot de passe {isEditing ? '(Optionnel - Laisser vide pour conserver)' : '*'}</span>
              <Key className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <input
              type="password"
              required={!isEditing}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditing ? '••••••••' : 'Saisir le mot de passe'}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-800 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Spécialité / Domaine d'expertise
            </label>
            <input
              type="text"
              value={specialite}
              onChange={(e) => setSpecialite(e.target.value)}
              placeholder="Ex: Analyse Vibratoire, Capteurs Thermiques..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-800 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Téléphone professionnel
            </label>
            <input
              type="text"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-800 transition-all"
            />
          </div>

          {isEditing && (
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="actifCheck"
                checked={actif}
                onChange={(e) => setActif(e.target.checked)}
                className="w-4 h-4 rounded text-red-800 focus:ring-red-800"
              />
              <label htmlFor="actifCheck" className="text-xs font-semibold text-slate-800">
                Compte actif (autorisé à se connecter)
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer le Compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
