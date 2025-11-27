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

  // NOTA: Se vuoi usare questa app localmente senza window.storage,
  // sostituisci le funzioni di storage con localStorage:
  // 
  // const loadActivities = async () => {
  //   setLoading(true);
  //   try {
  //     const data = localStorage.getItem('univda-research-activities');
  //     if (data) {
  //       setActivities(JSON.parse(data));
  //     }
  //   } catch (error) {
  //     console.log('Nessuna attività salvata');
  //     setActivities([]);
  //   }
  //   setLoading(false);
  // };
  //
  // const saveActivities = async (newActivities) => {
  //   setSyncing(true);
  //   try {
  //     localStorage.setItem('univda-research-activities', JSON.stringify(newActivities));
  //     setActivities(newActivities);
  //   } catch (error) {
  //     console.error('Errore nel salvataggio:', error);
  //     alert('Errore nel salvataggio. Riprova.');
  //   }
  //   setSyncing(false);
  // };

  const loadActivities = async () => {
    setLoading(true);
    try {
      // Usa window.storage se disponibile (Claude.ai), altrimenti localStorage
      if (window.storage && window.storage.get) {
        const result = await window.storage.get('univda-research-activities', true);
        if (result && result.value) {
          setActivities(JSON.parse(result.value));
        }
      } else {
        const data = localStorage.getItem('univda-research-activities');
        if (data) {
          setActivities(JSON.parse(data));
        }
      }
    } catch (error) {
      console.log('Nessuna attività condivisa ancora');
      setActivities([]);
    }
    setLoading(false);
  };

  const loadEmailSettings = async () => {
    try {
      if (window.storage && window.storage.get) {
        const result = await window.storage.get('univda-email-settings', true);
        if (result && result.value) {
          setEmailSettings(JSON.parse(result.value));
        }
      } else {
        const data = localStorage.getItem('univda-email-settings');
        if (data) {
          setEmailSettings(JSON.parse(data));
        }
      }
    } catch (error) {
      console.log('Impostazioni email non trovate');
    }
  };

  const saveEmailSettings = async (settings) => {
    try {
      if (window.storage && window.storage.set) {
        await window.storage.set('univda-email-settings', JSON.stringify(settings), true);
      } else {
        localStorage.setItem('univda-email-settings', JSON.stringify(settings));
      }
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
      if (window.storage && window.storage.set) {
        await window.storage.set('univda-research-activities', JSON.stringify(newActivities), true);
      } else {
        localStorage.setItem('univda-research-activities', JSON.stringify(newActivities));
      }
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
    if (window.confirm('Sei sicuro di voler eliminare questa attività? Verrà rimossa per tutti gli utenti.')) {
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
          <p className="text-gray-600">Caricamento scadenziario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - resto del componente uguale all'artifact */}
      {/* ... */}
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
