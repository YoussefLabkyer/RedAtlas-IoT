import { useState } from 'react';
import { User, UserRole } from '../types';
import { Users, UserPlus, Edit2, Trash2, Mail, Phone, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { TechnicianModal } from '../components/TechnicianModal';
import { ConfirmModal } from '../components/ConfirmModal';

interface TechniciansViewProps {
  technicians: User[];
  userRole: UserRole;
  onCreateTechnician: (data: {
    nom: string;
    email: string;
    password: string;
    specialite?: string;
    telephone?: string;
  }) => Promise<void>;
  onUpdateTechnician: (id: string, data: Partial<User & { password?: string }>) => Promise<void>;
  onDeleteTechnician: (id: string) => Promise<void>;
}

export function TechniciansView({
  technicians,
  userRole,
  onCreateTechnician,
  onUpdateTechnician,
  onDeleteTechnician,
}: TechniciansViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTech, setEditingTech] = useState<User | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-red-800" />
            <span>Gestion des Comptes Techniciens (MySQL)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Liste des techniciens habilités à surveiller le parc IoT
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nouveau Technicien</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-xl text-xs font-semibold border border-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Accès Technicien : Consultation Seule</span>
          </div>
        )}
      </div>

      {/* Technicians Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Technicien</th>
                <th className="py-3.5 px-4">Spécialité / Expertise</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Créé le</th>
                <th className="py-3.5 px-4">Statut Compte</th>
                {isAdmin && <th className="py-3.5 px-4 text-right">Actions CRUD</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {technicians.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    Aucun compte technicien enregistré dans la base de données.
                  </td>
                </tr>
              ) : (
                technicians.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{t.nom}</div>
                      <div className="text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{t.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {t.specialite || 'Technicien IoT Généralist'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {t.telephone ? (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{t.telephone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-italic">Non renseigné</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {t.dateCreation}
                    </td>

                    <td className="py-3.5 px-4">
                      {t.actif ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>Actif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200 text-slate-600">
                          <XCircle className="w-3 h-3 text-slate-500" />
                          <span>Désactivé</span>
                        </span>
                      )}
                    </td>

                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setEditingTech(t)}
                            title="Modifier"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(t.id)}
                            title="Supprimer"
                            className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Technician Modal */}
      {showAddModal && (
        <TechnicianModal
          onSave={async (data) => {
            await onCreateTechnician(data as any);
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Technician Modal */}
      {editingTech && (
        <TechnicianModal
          technician={editingTech}
          onSave={async (data) => {
            await onUpdateTechnician(editingTech.id, data);
            setEditingTech(null);
          }}
          onClose={() => setEditingTech(null)}
        />
      )}

      {/* Confirm Delete Modal */}
      {deleteTargetId && (
        <ConfirmModal
          title="Supprimer le compte technicien"
          message="Êtes-vous sûr de vouloir supprimer définitivement ce compte technicien de la base de données MySQL ?"
          confirmLabel="Supprimer"
          onConfirm={async () => {
            await onDeleteTechnician(deleteTargetId);
            setDeleteTargetId(null);
          }}
          onClose={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}
