// ========================================
// SCADENZIARIO DIGITALE - UFFICIO RICERCA UNIVDA
// ========================================
// File: ResearchScheduler.jsx
// 
// ISTRUZIONI PER L'INSTALLAZIONE:
// 
// 1. Crea un nuovo progetto React:
//    npx create-react-app scadenziario-univda
//    cd scadenziario-univda
// 
// 2. Installa le dipendenze necessarie:
//    npm install lucide-react
// 
// 3. Sostituisci il contenuto di src/App.js con questo codice
// 
// 4. Configura Tailwind CSS:
//    npm install -D tailwindcss postcss autoprefixer
//    npx tailwindcss init -p
// 
// 5. Configura tailwind.config.js:
//    module.exports = {
//      content: ["./src/**/*.{js,jsx,ts,tsx}"],
//      theme: { extend: {} },
//      plugins: [],
//    }
// 
// 6. In src/index.css aggiungi:
//    @tailwind base;
//    @tailwind components;
//    @tailwind utilities;
// 
// 7. Avvia l'applicazione:
//    npm start
// 
// ========================================

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Bell, Search, CheckCircle, Clock, AlertCircle, Trash2, Edit2, Save, X, Users, RefreshCw, Mail, ChevronLeft, ChevronRight } from 'lucide-react';

const ResearchScheduler = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterMacro, setFilterMacro] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState([]);
  const [emailSettings, setEmailSettings] = useState({
    enabled: false,
    weeklyDigest: true,
    email: '',
    digestDay: 'monday'
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const macrofunctions = [
    { id: 'rendicontazione', name: 'Rendicontazione', color: 'bg-blue-500' },
    { id: 'progetto', name: 'Progetto', color: 'bg-green-500' },
    { id: 'bando', name: 'Bando', color: 'bg-purple-500' },
    { id: 'audit', name: 'Audit', color: 'bg-orange-500' },
    { id: 'reclutamento', name: 'Reclutamento', color: 'bg-red-500' },
    { id: 'acquisto', name: 'Acquisto', color: 'bg-pink-500' },
    { id: 'organi', name: 'Organi', color: 'bg-indigo-500' },
    { id: 'convenzioni', name: 'Convenzioni', color: 'bg-teal-500' },
    { id: 'contoterzi', name: 'Conto Terzi', color: 'bg-cyan-500' },
    { id: 'centri', name: 'Centri di Ricerca', color: 'bg-amber-500' },
    { id: 'bilancio', name: 'Bilancio', color: 'bg-lime-500' },
    { id: 'ufficio', name: 'Ufficio', color: 'bg-emerald-500' },
    { id: 'regolamenti', name: 'Regolamenti', color: 'bg-rose-500' },
    { id: 'privacy', name: 'Privacy', color: 'bg-violet-500' },
    { id: 'pagamenti', name: 'Pagamenti', color: 'bg-fuchsia-500' }
  ];

  const notificationOptions = [
    { value: 1, label: '1 giorno prima' },
    { value: 3, label: '3 giorni prima' },
    { value: 7, label: '1 settimana prima' },
    { value: 15, label: '15 giorni prima' },
    { value: 30, label: '1 mese prima' }
  ];

  const [formData, setFormData] = useState({
    macrofunction: '',
    title: '',
    description: '',
    deadline: '',
    recurring: false,
    recurringType: 'yearly',
    responsible: '',
    notifyDays: 7,
    notifyEmail: true,
    notifyPush: false,
    subactivities: []
  });

  useEffect(() => {
    loadActivities();
    loadEmailSettings();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const result = await window.storage.get('univda-research-activities', true);
      if (result && result.value) {
        setActivities(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('Nessuna attività condivisa ancora');
      setActivities([]);
    }
    setLoading(false);
  };

  const loadEmailSettings = async () => {
    try {
      const result = await window.storage.get('univda-email-settings', true);
      if (result && result.value) {
        setEmailSettings(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('Impostazioni email non trovate');
    }
  };

  const saveEmailSettings = async (settings) => {
    try {
      await window.storage.set('univda-email-settings', JSON.stringify(settings), true);
      setEmailSettings(settings);
      alert('Impostazioni email salvate! Le notifiche verranno inviate secondo le tue preferenze.');
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      alert('Errore nel salvataggio delle impostazioni email');
    }
  };

  const saveActivities = async (newActivities) => {
    setSyncing(true);
    try {
      await window.storage.set('univda-research-activities', JSON.stringify(newActivities), true);
      setActivities(newActivities);
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      alert('Errore nel salvataggio. Riprova.');
    }
    setSyncing(false);
  };

  const refreshData = async () => {
    setSyncing(true);
    await loadActivities();
    setSyncing(false);
  };

  const addActivity = () => {
    if (!formData.title || !formData.deadline || !formData.macrofunction) {
      alert('Compila almeno titolo, scadenza e macrofunzione');
      return;
    }

    const newActivity = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      createdBy: formData.responsible || 'Utente',
      status: 'pending'
    };

    saveActivities([...activities, newActivity]);
    resetForm();
    setShowAddModal(false);
  };

  const updateActivity = () => {
    const updated = activities.map(a => 
      a.id === editingItem.id ? { 
        ...formData, 
        id: a.id, 
        createdAt: a.createdAt,
        createdBy: a.createdBy,
        lastModified: new Date().toISOString(),
        lastModifiedBy: formData.responsible || 'Utente'
      } : a
    );
    saveActivities(updated);
    setEditingItem(null);
    resetForm();
  };

  const deleteActivity = (id) => {
    if (confirm('Sei sicuro di voler eliminare questa attività? Verrà rimossa per tutti gli utenti.')) {
      saveActivities(activities.filter(a => a.id !== id));
    }
  };

  const toggleStatus = (id) => {
    const updated = activities.map(a => 
      a.id === id ? { 
        ...a, 
        status: a.status === 'pending' ? 'completed' : 'pending',
        completedAt: a.status === 'pending' ? new Date().toISOString() : null
      } : a
    );
    saveActivities(updated);
  };

  const resetForm = () => {
    setFormData({
      macrofunction: '',
      title: '',
      description: '',
      deadline: '',
      recurring: false,
      recurringType: 'yearly',
      responsible: '',
      notifyDays: 7,
      notifyEmail: true,
      notifyPush: false,
      subactivities: []
    });
  };

  const startEdit = (activity) => {
    setEditingItem(activity);
    setFormData({ ...activity });
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineStatus = (deadline) => {
    const days = getDaysUntilDeadline(deadline);
    if (days < 0) return { status: 'scaduta', color: 'text-red-600', bg: 'bg-red-50', priority: 4 };
    if (days <= 7) return { status: 'urgente', color: 'text-orange-600', bg: 'bg-orange-50', priority: 1 };
    if (days <= 30) return { status: 'prossima', color: 'text-yellow-600', bg: 'bg-yellow-50', priority: 2 };
    return { status: 'futura', color: 'text-green-600', bg: 'bg-green-50', priority: 3 };
  };

  const filteredActivities = activities.filter(activity => {
    const matchesMacro = filterMacro === 'all' || activity.macrofunction === filterMacro;
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMacro && matchesStatus && matchesSearch;
  });

  const groupDeadlinesByMonth = (deadlines) => {
    const grouped = {};
    deadlines.forEach(activity => {
      const date = new Date(activity.deadline);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[monthYear]) {
        grouped[monthYear] = {
          month: date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
          activities: []
        };
      }
      grouped[monthYear].activities.push(activity);
    });
    return grouped;
  };

  const upcomingDeadlines = [...activities]
    .filter(a => a.status === 'pending')
    .sort((a, b) => {
      const statusA = getDeadlineStatus(a.deadline);
      const statusB = getDeadlineStatus(b.deadline);
      if (statusA.priority !== statusB.priority) {
        return statusA.priority - statusB.priority;
      }
      return new Date(a.deadline) - new Date(b.deadline);
    });

  const groupedDeadlines = groupDeadlinesByMonth(upcomingDeadlines);

  const stats = {
    total: activities.length,
    pending: activities.filter(a => a.status === 'pending').length,
    completed: activities.filter(a => a.status === 'completed').length,
    urgent: activities.filter(a => {
      const days = getDaysUntilDeadline(a.deadline);
      return days >= 0 && days <= 7 && a.status === 'pending';
    }).length
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const getActivitiesForDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return activities.filter(a => a.deadline === dateStr && a.status === 'pending');
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const monthName = currentMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayActivities = getActivitiesForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`h-24 border p-2 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'} hover:bg-gray-50 transition`}
        >
          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayActivities.slice(0, 2).map(activity => {
              const status = getDeadlineStatus(activity.deadline);
              return (
                <div
                  key={activity.id}
                  className={`text-xs p-1 rounded truncate ${status.bg} ${status.color} cursor-pointer`}
                  title={activity.title}
                  onClick={() => startEdit(activity)}
                >
                  {activity.title}
                </div>
              );
            })}
            {dayActivities.length > 2 && (
              <div className="text-xs text-gray-500">+{dayActivities.length - 2} altre</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex items-center justify-between">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold capitalize">{monthName}</h2>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Caricamento scadenziario condiviso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Calendar className="w-8 h-8" />
                Scadenziario Ricerca UniVdA
              </h1>
              <p className="text-blue-100 mt-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Database condiviso - Tutte le modifiche sono visibili a tutto il team
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowEmailModal(true)}
                className="bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-800 transition flex items-center gap-2"
                title="Impostazioni email"
              >
                <Mail className="w-5 h-5" />
                <span className="hidden sm:inline">Email</span>
              </button>
              <button
                onClick={refreshData}
                disabled={syncing}
                className="bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-800 transition flex items-center gap-2"
                title="Aggiorna dati"
              >
                <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Aggiorna</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nuova Attività
              </button>
            </div>
          </div>
        </div>
      </div>

      {syncing && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-yellow-800">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Sincronizzazione in corso...</span>
          </div>
        </div>
      )}

      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8 overflow-x-auto">
            {['dashboard', 'calendario', 'attivita'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium transition whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Totale Attività</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">In Corso</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Urgenti</p>
                    <p className="text-3xl font-bold text-red-600">{stats.urgent}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Completate</p>
                    <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Prossime Scadenze
                </h2>
                <p className="text-sm text-gray-600 mt-1">Ordinate per urgenza e raggruppate per mese</p>
              </div>
              <div className="divide-y">
                {Object.keys(groupedDeadlines).length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Nessuna scadenza in programma
                  </div>
                ) : (
                  Object.entries(groupedDeadlines).map(([monthKey, monthData]) => (
                    <div key={monthKey} className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-3 capitalize">
                        {monthData.month}
                      </h3>
                      <div className="space-y-3">
                        {monthData.activities.map(activity => {
                          const deadlineInfo = getDeadlineStatus(activity.deadline);
                          const macro = macrofunctions.find(m => m.id === activity.macrofunction);
                          return (
                            <div key={activity.id} className="pl-4 hover:bg-gray-50 p-3 rounded-lg transition">
                              <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex-1 flex items-start gap-3 min-w-0">
                                  <button
                                    onClick={() => toggleStatus(activity.id)}
                                    className="text-gray-300 hover:text-green-500 mt-1 flex-shrink-0"
                                    title="Segna come completata"
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                      <span className={`${macro?.color} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                                        {macro?.name}
                                      </span>
                                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                      {activity.responsible && <span>👤 {activity.responsible}</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <div className={`text-right ${deadlineInfo.bg} px-4 py-2 rounded-lg`}>
                                    <p className={`text-sm font-semibold ${deadlineInfo.color}`}>
                                      {new Date(activity.deadline).toLocaleDateString('it-IT')}
                                    </p>
                                    <p className={`text-xs ${deadlineInfo.color}`}>
                                      {getDaysUntilDeadline(activity.deadline)} giorni
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => startEdit(activity)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="Modifica"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendario' && (
          <div className="space-y-6">
            {renderCalendar()}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Suggerimento:</strong> Clicca su una scadenza nel calendario per modificarla rapidamente.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'attivita' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cerca attività..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterMacro}
                  onChange={(e) => setFilterMacro(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tutte le macrofunzioni</option>
                  {macrofunctions.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="pending">In corso</option>
                  <option value="completed">Completate</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredActivities.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow text-center text-gray-500">
                  Nessuna attività trovata
                </div>
              ) : (
                filteredActivities.map(activity => {
                  const deadlineInfo = getDeadlineStatus(activity.deadline);
                  const macro = macrofunctions.find(m => m.id === activity.macrofunction);
                  return (
                    <div key={activity.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <button
                            onClick={() => toggleStatus(activity.id)}
                            className={`mt-1 ${activity.status === 'completed' ? 'text-green-500' : 'text-gray-300'} hover:text-green-600 transition flex-shrink-0`}
                            title={activity.status === 'completed' ? 'Riapri attività' : 'Segna come completata'}
                          >
                            <CheckCircle className="w-6 h-6" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className={`${macro?.color} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                                {macro?.name}
                              </span>
                              {activity.recurring && (
                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                                  Ricorrente
                                </span>
                              )}
                              {activity.status === 'completed' ? (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                                  Completata
                                </span>
                              ) : (
                                <span className={`${deadlineInfo.bg} ${deadlineInfo.color} px-2 py-1 rounded text-xs font-semibold`}>
                                  {deadlineInfo.status}
                                </span>
                              )}
                            </div>
                            <h3 className={`text-lg font-semibold ${activity.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {activity.title}
                            </h3>
                            <p className="text-gray-600 mt-2">{activity.description}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                              <span>📅 Scadenza: {new Date(activity.deadline).toLocaleDateString('it-IT')}</span>
                              {activity.responsible && <span>👤 {activity.responsible}</span>}
                              <span>🔔 Notifica {activity.notifyDays} giorni prima</span>
                              {activity.createdBy && <span className="text-xs">Creata da: {activity.createdBy}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => startEdit(activity)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteActivity(activity.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Mail className="w-6 h-6" />
                Impostazioni Email
              </h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  ℹ️ Configura le notifiche email per ricevere promemoria sulle scadenze.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email destinatario
                </label>
                <input
                  type="email"
                  value={emailSettings.email}
                  onChange={(e) => setEmailSettings({ ...emailSettings, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="tuo@email.com"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enableEmail"
                  checked={emailSettings.enabled}
                  onChange={(e) => setEmailSettings({ ...emailSettings, enabled: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="enableEmail" className="text-sm font-semibold text-gray-700">
                  Abilita notifiche email
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="weeklyDigest"
                  checked={emailSettings.weeklyDigest}
                  onChange={(e) => setEmailSettings({ ...emailSettings, weeklyDigest: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="weeklyDigest" className="text-sm font-semibold text-gray-700">
                  Riepilogo settimanale (ogni lunedì)
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Nota:</strong> Questa è una simulazione. Per attivare realmente l'invio email, sarà necessario integrare un servizio di invio email (es. SendGrid, AWS SES) sul server.
                </p>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  saveEmailSettings(emailSettings);
                  setShowEmailModal(false);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Salva Impostazioni
              </button>
            </div>
          </div>
        </div>
      )}

      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingItem ? 'Modifica Attività' : 'Nuova Attività'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Questa attività sarà visibile a tutto il team dell'ufficio ricerca.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Macrofunzione *
                </label>
                <select
                  value={formData.macrofunction}
                  onChange={(e) => setFormData({ ...formData, macrofunction: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleziona macrofunzione</option>
                  {macrofunctions.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Titolo Attività *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Es: Presentazione bando PRIN 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrizione
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Descrizione dettagliata dell'attività..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Scadenza *
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Responsabile
                </label>
                <input
                  type="text"
                  value={formData.responsible}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome del responsabile"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="recurring" className="text-sm font-semibold text-gray-700">
                  Scadenza ricorrente
                </label>
              </div>

              {formData.recurring && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo di ricorrenza
                  </label>
                  <select
                    value={formData.recurringType}
                    onChange={(e) => setFormData({ ...formData, recurringType: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weekly">Settimanale</option>
                    <option value="monthly">Mensile</option>
                    <option value="quarterly">Trimestrale</option>
                    <option value="yearly">Annuale</option>
                  </select>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Impostazioni Notifiche</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preavviso notifica
                  </label>
                  <select
                    value={formData.notifyDays}
                    onChange={(e) => setFormData({ ...formData, notifyDays: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {notificationOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="notifyEmail"
                      checked={formData.notifyEmail}
                      onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="notifyEmail" className="text-sm text-gray-700">
                      Notifica via Email
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="notifyPush"
                      checked={formData.notifyPush}
                      onChange={(e) => setFormData({ ...formData, notifyPush: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="notifyPush" className="text-sm text-gray-700">
                      Notifica Push
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Annulla
              </button>
              <button
                onClick={editingItem ? updateActivity : addActivity}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {editingItem ? 'Salva Modifiche' : 'Crea Attività'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchScheduler;

// ========================================
// FINE DEL CODICE SORGENTE
// ========================================

// Per pubblicare su Vercel:
// 1. Crea un account su vercel.com
// 2. Installa Vercel CLI: npm i -g vercel
// 3. Nella cartella del progetto: vercel
// 4. Segui le istruzioni per il deploy
// 
// Per protezione password su Vercel:
// - Vai su vercel.com > Settings > Password Protection
// - Abilita la protezione e imposta la password
