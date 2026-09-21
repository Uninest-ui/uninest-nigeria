import React, { useState } from 'react';
import { Smartphone, Bell, BellRing, Sparkles, Filter, CheckCircle2, Share2, MessageSquare, Volume2, VolumeX, Send, Mail, ShieldCheck } from 'lucide-react';
import { PhoneNotificationItem, UniNestUser } from '../types';

interface CampusPhoneNotificationsProps {
  notifications: PhoneNotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onSendNotification?: (notif: Omit<PhoneNotificationItem, 'id' | 'timeAgo' | 'date' | 'isRead'>) => void;
  onSendBroadcast?: (notif: Omit<PhoneNotificationItem, 'id' | 'timeAgo' | 'date' | 'isRead'>) => void;
  user?: UniNestUser;
  currentUserSchool?: string;
  subscribers?: string[];
}

export const CampusPhoneNotifications: React.FC<CampusPhoneNotificationsProps> = ({
  notifications,
  onMarkAsRead,
  onSendNotification,
  onSendBroadcast,
  user,
  currentUserSchool = 'All Campuses',
  subscribers = []
}) => {
  const [selectedCampus, setSelectedCampus] = useState<string>('All');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [subscribedSms, setSubscribedSms] = useState<boolean>(false);
  const [studentPhone, setStudentPhone] = useState<string>('');

  // New broadcast fields
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newCampus, setNewCampus] = useState('All Campuses');
  const [newCategory, setNewCategory] = useState<PhoneNotificationItem['category']>('Scholarship Alert');
  const [newPriority, setNewPriority] = useState<'normal' | 'high'>('normal');
  const [deliverToEmail, setDeliverToEmail] = useState<boolean>(true);

  // Campuses list - Student Gifting is strictly exempt from campus filters
  const campuses = ['All', 'NDU Amassoma', 'BMU Yenagoa', 'FUOTUOKE', 'UNIPORT', 'DELSU'];

  const playNotificationChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // ignore audio context restrictions
    }
  };

  // Strictly exempt student gifting from campus news push notifications
  const filteredNotifs = notifications
    .filter((item) => item.category !== 'Student Gifting' && !item.title.toLowerCase().includes('student gift'))
    .filter((item) => {
      if (selectedCampus === 'All') return true;
      return item.campusTag.toLowerCase().includes(selectedCampus.toLowerCase());
    });

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    // Student gifting is exempt from broadcast push notifications
    if (newCategory === ('Student Gifting' as any)) {
      alert('Student Gifting is private and exempt from campus news push notifications. Gifting alerts are delivered directly to student emails.');
      return;
    }

    const payload: Omit<PhoneNotificationItem, 'id' | 'timeAgo' | 'date' | 'isRead'> = {
      title: newTitle.trim(),
      message: newMessage.trim(),
      campusTag: newCampus,
      category: newCategory,
      priority: newPriority,
      sentToEmail: deliverToEmail,
      emailRecipientCount: subscribers.length > 0 ? subscribers.length : 1250
    };

    if (onSendBroadcast) {
      onSendBroadcast(payload);
    } else if (onSendNotification) {
      onSendNotification(payload);
    }

    playNotificationChime();
    setShowBroadcastModal(false);
    setNewTitle('');
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1c2a4a] via-[#101b33] to-[#0f172a] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-extrabold border border-cyan-500/30">
              <Smartphone className="w-3.5 h-3.5 animate-pulse" />
              <span>Campus Phone Push Alerts &amp; News</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Instant Smartphone Notifications For Nigerian Students
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Real-time push alerts for bilateral scholarships, strike updates, hostel vacancies, and exam clearance memos. Push notifications are automatically synchronized and delivered to student emails.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playNotificationChime();
              }}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
              title="Toggle notification chime sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
              <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
            </button>

            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <BellRing className="w-4 h-4" />
              <span>Post Campus Alert</span>
            </button>
          </div>
        </div>

        {/* SMS / WhatsApp & Email Notification Status Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-300 flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>Campus news push notifications are dispatched to registered student emails:</span>
          </div>
          {subscribedSms ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Alerts active for {studentPhone || 'your device & email'}!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input 
                type="tel" 
                placeholder="Phone or Email for alerts"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                onClick={() => {
                  if (studentPhone) setSubscribedSms(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition whitespace-nowrap cursor-pointer"
              >
                Connect Device
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Notice: Gifting is exempt from campus push notifications */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Privacy Exemption Policy:</strong> Student Gifting transactions are confidential and strictly <em>exempt</em> from public campus news push feeds. Gifting receipts and personal notes are sent directly to student email addresses.
          </span>
        </div>
      </div>

      {/* Campus Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-gray-500 shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Campus Filter:
        </span>
        {campuses.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCampus(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCampus === c
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Smartphone Notification Cards Layout */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-gray-400 text-xs">
            No active campus push notifications found for {selectedCampus}. Check back soon!
          </div>
        ) : (
          filteredNotifs.map((n) => {
            const isScholarship = n.category === 'Scholarship Alert';
            const isHostel = n.category === 'Hostel Release';
            const isCalendar = n.category === 'Academic Calendar';
            const isClearance = n.category === 'Exam Clearance';

            return (
              <div
                key={n.id}
                onClick={() => onMarkAsRead && onMarkAsRead(n.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition relative flex items-start gap-3.5 sm:gap-4 group ${
                  n.isRead 
                    ? 'bg-white border-slate-200 opacity-90' 
                    : 'bg-gradient-to-r from-orange-50/50 via-white to-white border-orange-200 shadow-xs'
                }`}
              >
                {/* Phone Notification Icon */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  isScholarship 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : isHostel 
                    ? 'bg-blue-100 text-blue-700' 
                    : isCalendar
                    ? 'bg-indigo-100 text-indigo-700'
                    : isClearance
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {n.campusTag}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        n.priority === 'high' 
                          ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {n.category}
                      </span>
                      {/* Email Delivery Badge */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">
                        <Mail className="w-3 h-3 text-cyan-600" />
                        <span>Sent to Student Emails</span>
                      </span>
                    </div>

                    <span className="text-[10px] text-gray-400 font-medium">
                      {n.timeAgo} • {n.date}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    {n.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Broadcast Campus Phone Notification
                </h3>
                <p className="text-xs text-gray-500">
                  Post verified campus news, scholarship updates, or clearance memos to students and their emails.
                </p>
              </div>
              <button 
                onClick={() => setShowBroadcastModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notification Headline
                </label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ⚡ Faculty of Engineering Lab Clearance Notice"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Campus / Tag
                  </label>
                  <select
                    value={newCampus}
                    onChange={(e) => setNewCampus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  >
                    <option value="All Campuses">All Campuses</option>
                    <option value="NDU Amassoma">NDU Amassoma</option>
                    <option value="BMU Yenagoa">BMU Yenagoa</option>
                    <option value="FUOTUOKE">FUOTUOKE</option>
                    <option value="UNIPORT">UNIPORT Choba</option>
                    <option value="DELSU">DELSU Abraka</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category (Gifting Exempt)
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as PhoneNotificationItem['category'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  >
                    <option value="Scholarship Alert">Scholarship Alert</option>
                    <option value="Hostel Release">Hostel Release</option>
                    <option value="Academic Calendar">Academic Calendar</option>
                    <option value="Exam Clearance">Exam Clearance</option>
                    <option value="Campus Safety">Campus Safety</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alert Message &amp; Instructions
                </label>
                <textarea 
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Provide concise details for students..."
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Email Delivery Option */}
              <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-cyan-950 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deliverToEmail}
                    onChange={(e) => setDeliverToEmail(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Send copy to student emails ({subscribers.length > 0 ? subscribers.length : 1250} subscribers)</span>
                </label>
                <Mail className="w-4 h-4 text-cyan-600" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Urgency Level
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="priority" 
                      checked={newPriority === 'normal'} 
                      onChange={() => setNewPriority('normal')} 
                    />
                    <span>Normal Alert</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-rose-600 cursor-pointer">
                    <input 
                      type="radio" 
                      name="priority" 
                      checked={newPriority === 'high'} 
                      onChange={() => setNewPriority('high')} 
                    />
                    <span>High Urgency / Flash Push</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast &amp; Send to Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

