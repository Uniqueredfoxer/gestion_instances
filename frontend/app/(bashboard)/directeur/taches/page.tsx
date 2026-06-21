'use client'

import { useState, useEffect } from "react";
import { getMyTasks, updateTask } from "@/lib/api";
import { Tache } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { 
  CheckCircle, 
  Clock, 
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  FolderKanban,
  Check,
  Loader2
} from "lucide-react";


export default function MesTaches() {
  const [mesTaches, setMesTaches] = useState<Tache[]>([]);
  const [filteredTaches, setFilteredTaches] = useState<Tache[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'tout' | 'en_cours' | 'terminee'>('tout');
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [confirmState, setConfirmState] = useState<{
    taskId: number;
    action: 'complete' | 'reopen';
  } | null>(null);

  const applyFilters = (
    tasks: Tache[], 
    searchTerm: string, 
    statusFilter: 'tout' | 'en_cours' | 'terminee'
  ) => {
    let filtered = [...tasks];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.libelle?.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.titre_dossier?.toLowerCase().includes(searchLower)
      );
    }


    if (statusFilter === 'en_cours') {
      filtered = filtered.filter(task => task.statut !== 'termine');
    } else if (statusFilter === 'terminee') {
      filtered = filtered.filter(task => task.statut === 'termine');
    }

    setFilteredTaches(filtered);
  };
  useEffect(() => {
      const fetchTasks = async () => {
        try {
          setLoading(true);
          const response = await getMyTasks();
          const tasks = response.data;
          setMesTaches(tasks);
          applyFilters(tasks, search, filterStatus);
        } catch (err) {
          console.error("erreur serveur", err);
          setError('Une erreur est survenue lors du chargement des tâches');
        } finally {
          setLoading(false);
        }
      };
    fetchTasks();
  }, []);



  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    applyFilters(mesTaches, value, filterStatus);
  };

  const handleFilterChange = (status: 'tout' | 'en_cours' | 'terminee') => {
    setFilterStatus(status);
    applyFilters(mesTaches, search, status);
  };

  const toggleExpand = (taskId: number) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const handleMarkAsCompleted = async (taskId: number) => {
    setConfirmState({ taskId, action: 'complete' });
  };

  const handleMarkAsPending = async (taskId: number) => {
    setConfirmState({ taskId, action: 'reopen' });
  };

  const handleConfirmAction = async () => {
    if (!confirmState) return;
    const { taskId, action } = confirmState;
    try {
      setUpdatingTaskId(taskId);
      if (action === 'complete') {
        await updateTask(taskId, { statut: 'termine' });
        const updatedTasks = mesTaches.map(task =>
          task.id === taskId ? { ...task, statut: 'termine' as const } : task
        );
        setMesTaches(updatedTasks);
        applyFilters(updatedTasks, search, filterStatus);
      } else {
        await updateTask(taskId, { statut: 'en_cours' });
        const updatedTasks = mesTaches.map(task =>
          task.id === taskId ? { ...task, statut: 'en_cours' as const, avancement: 50 } : task
        );
        setMesTaches(updatedTasks);
        applyFilters(updatedTasks, search, filterStatus);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTaskId(null);
      setConfirmState(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'en_attente': 'bg-yellow-100 text-yellow-800',
      'en_cours': 'bg-blue-100 text-blue-800',
      'termine': 'bg-green-100 text-green-800',
      'annule': 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'termine': 'Terminé',
      'annule': 'Annulé'
    };
    return labels[status as keyof typeof labels] || status;
  };


  const pendingCount = mesTaches.filter(t => t.statut !== 'termine').length;
  const completedCount = mesTaches.filter(t => t.statut === 'termine').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Chargement de vos tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Mes Tâches
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {pendingCount} en attente
            </span>
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Gérez toutes les tâches qui vous sont assignées
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            {pendingCount} en attente
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {completedCount} terminées
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FolderKanban className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total des tâches</p>
              <p className="text-2xl font-bold text-gray-900">{mesTaches.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Terminées</p>
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={filterStatus === 'tout' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('tout')}
              className="text-sm"
            >
              Toutes
            </Button>
            <Button
              variant={filterStatus === 'en_cours' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('en_cours')}
              className="text-sm"
            >
              <Clock className="w-3 h-3 mr-1" />
              En attente
            </Button>
            <Button
              variant={filterStatus === 'terminee' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('terminee')}
              className="text-sm"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Terminées
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          {filteredTaches.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Aucune tâche trouvée</p>
              <p className="text-gray-400 text-sm mt-1">
                {search ? 'Essayez de modifier votre recherche' : 'Vous n\'avez pas encore de tâches assignées'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTaches.map((task) => (
                <div 
                  key={task.id} 
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    task.statut === 'termine' ? 'bg-gray-50/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-medium text-gray-900 ${
                          task.statut === 'termine' ? 'line-through text-gray-500' : ''
                        }`}>
                          {task.libelle}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(task.statut)}`}>
                          {getStatusLabel(task.statut)}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className={`text-sm text-gray-600 mt-1 ${
                          task.statut === 'termine' ? 'line-through text-gray-400' : ''
                        }`}>
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                        {task.titre_dossier && (
                          <span className="flex items-center gap-1">
                            <FolderKanban className="w-3 h-3" />
                            {task.titre_dossier}
                          </span>
                        )}
                        {task.date_fin && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Échéance: {new Date(task.date_fin).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.statut !== 'termine' ? (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleMarkAsCompleted(task.id)}
                          disabled={updatingTaskId === task.id}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                        >
                          {updatingTaskId === task.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Terminer
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsPending(task.id)}
                          disabled={updatingTaskId === task.id}
                          className="flex items-center gap-1"
                        >
                          {updatingTaskId === task.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          Reprendre
                        </Button>
                      )}
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleExpand(task.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedTask === task.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {expandedTask === task.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Détails de la tâche</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          {task.description && (
                            <p><span className="font-medium">Description:</span> {task.description}</p>
                          )}
                          <p><span className="font-medium">Statut:</span> {getStatusLabel(task.statut)}</p>
                          {task.avancement !== undefined && (
                            <p><span className="font-medium">Avancement:</span> {task.avancement}%</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Informations du dossier</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          {task.titre_dossier && (
                            <>
                              <p><span className="font-medium">Dossier:</span> {task.titre_dossier}</p>
                            </>
                          )}
                          {task.date_debut && (
                            <p><span className="font-medium">Date de début:</span> {new Date(task.date_debut).toLocaleDateString()}</p>
                          )}
                          {task.date_fin && (
                            <p><span className="font-medium">Date d&apos;échéance:</span> {new Date(task.date_fin).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={confirmState !== null}
        onClose={() => setConfirmState(null)}
        onConfirm={handleConfirmAction}
        isLoading={updatingTaskId !== null}
        title={confirmState?.action === 'complete' ? 'Marquer comme terminée' : 'Reprendre la tâche'}
        description={
          confirmState?.action === 'complete'
            ? 'Voulez-vous marquer cette tâche comme terminée ? Cette action peut être annulée en la reprenant.'
            : 'Voulez-vous remettre cette tâche en cours ?'
        }
        confirmLabel={confirmState?.action === 'complete' ? 'Terminer' : 'Reprendre'}
      />
    </div>
  );
}