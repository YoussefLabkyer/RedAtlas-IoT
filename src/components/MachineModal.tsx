import { useState, FormEvent } from 'react';
import { Machine } from '../types';
import { X, HardDrive, AlertTriangle } from 'lucide-react';

interface MachineModalProps {
  machine?: Machine | null;
  totalMachinesCount: number;
  onSave: (data: { nom: string; emplacement: string; typeCapteur: string }) => Promise<void>;
  onClose: () => void;
}

export function MachineModal({ machine, totalMachinesCount, onSave, onClose }: MachineModalProps) {
  const isEditing = !!machine;
  const isMaxReached = !isEditing && totalMachinesCount >= 10;

  const [nom, setNom] = useState(machine?.nom || '');
  const [emplacement, setEmplacement] = useState(machine?.emplacement || '');
  const [typeCapteur, setTypeCapteur] = useState(
    machine?.typeCapteur || 'Température, Pression, Vibration'
  );

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isMaxReached) {
      setError('Impossible d\'ajouter plus de 10 machines.');
      return;
    }

    if (!nom.trim() || !emplacement.trim()) {
      setError('Le nom et l\'emplacement sont obligatoires.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave({
        nom: nom.trim(),
        emplacement: emplacement.trim(),
        typeCapteur: typeCapteur.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement de la machine.');
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
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isEditing ? 'Modifier la Machine' : 'Ajouter une Machine'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? `Code Machine: ${machine.id}` : `Gestion du parc (${totalMachinesCount}/10 machines)`}
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
          {isMaxReached && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>
                <strong>Limite maximale atteinte :</strong> L'application est configurée pour gérer un maximum de 10 machines IoT simultanément.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nom de la machine *
            </label>
            <input
              type="text"
              required
              disabled={isMaxReached}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Compresseur Haute Pression C-12"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-800 transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Emplacement / Zone *
            </label>
            <input
              type="text"
              required
              disabled={isMaxReached}
              value={emplacement}
              onChange={(e) => setEmplacement(e.target.value)}
              placeholder="Ex: Atelier 3 - Secteur Ouest"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-800 transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Type de capteurs installés
            </label>
            <input
              type="text"
              disabled={isMaxReached}
              value={typeCapteur}
              onChange={(e) => setTypeCapteur(e.target.value)}
              placeholder="Température, Pression, Vibration"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-800 transition-all disabled:opacity-50"
            />
          </div>

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
              disabled={loading || isMaxReached}
              className="px-5 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer la Machine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
