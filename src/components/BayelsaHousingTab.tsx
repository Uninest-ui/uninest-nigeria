import React, { useState } from 'react';
import { 
  Users, 
  Home, 
  MapPin, 
  Sparkles, 
  Phone, 
  CheckCircle2, 
  Search, 
  Filter, 
  Heart, 
  Clock, 
  ShieldCheck, 
  Flame, 
  PlusCircle, 
  ExternalLink,
  ChevronRight,
  UserCheck,
  Building2,
  Camera,
  Upload,
  AlertCircle,
  MessageCircle,
  Eye,
  X,
  Bell,
  BellRing,
  Check
} from 'lucide-react';
import { BayelsaRoommateProfile, AccommodationListing, UniNestUser, MatchingState } from '../types';
import { 
  ROOMMATE_COVERED_STATES, 
  STATE_UNIVERSITIES_MAP, 
  BAYELSA_UNIVERSITIES 
} from '../data/uninestData';
import { NIGERIA_CAMPUS_REGIONS, getUniversitiesByState } from '../data/nigeriaUniversities';

export interface RoommateMatchNotification {
  id: string;
  candidateName: string;
  matchScore: number;
  institution: string;
  department: string;
  level: string;
  roomType: string;
  budget: string;
  avatarUrl: string;
  matchedHabits: string[];
  phone: string;
  timestamp: string;
  isRead: boolean;
}

const INITIAL_ROOMMATE_NOTIFICATIONS: RoommateMatchNotification[] = [
  {
    id: 'rm-notif-1',
    candidateName: 'Tariere Keme',
    matchScore: 98,
    institution: 'Niger Delta University (NDU)',
    department: 'Medical Lab Science',
    level: '300L',
    roomType: 'Self-Contain Shared (1 Roommate)',
    budget: '₦70,000 - ₦90,000',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    matchedHabits: ['Quiet / Serious Study', 'Cook Daily', 'Very Strict & Tidy'],
    phone: '08039847154',
    timestamp: '15 mins ago',
    isRead: false
  },
  {
    id: 'rm-notif-2',
    candidateName: 'Ebiere Preye',
    matchScore: 94,
    institution: 'Federal University Otuoke (FUOTUOKE)',
    department: 'Computer Science',
    level: '200L',
    roomType: '1-Bedroom Flat Share',
    budget: '₦60,000 - ₦80,000',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&auto=format&fit=crop&q=80',
    matchedHabits: ['Night Owl Coder', 'Respects Privacy', 'Weekend Guests Only'],
    phone: '08123456789',
    timestamp: '2 hours ago',
    isRead: false
  },
  {
    id: 'rm-notif-3',
    candidateName: 'Chukwuma Eze',
    matchScore: 91,
    institution: 'University of Port Harcourt (UNIPORT)',
    department: 'Mechanical Engineering',
    level: '400L',
    roomType: 'Shared Lodge Room',
    budget: '₦90,000 - ₦110,000',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    matchedHabits: ['Early Bird', 'Serious Academic', 'Clean Environment'],
    phone: '08098765432',
    timestamp: 'Yesterday',
    isRead: true
  }
];

interface BayelsaHousingTabProps {
  user: UniNestUser;
  roommates: BayelsaRoommateProfile[];
  accommodations: AccommodationListing[];
  onRequestRoommate: (profile: Omit<BayelsaRoommateProfile, 'id'>) => void;
}

export const BayelsaHousingTab: React.FC<BayelsaHousingTabProps> = ({
  user,
  roommates,
  accommodations,
  onRequestRoommate,
}) => {
  const [subView, setSubView] = useState<'roommates' | 'accommodations'>('roommates');

  // Roommate Match Notifications State
  const [notifications, setNotifications] = useState<RoommateMatchNotification[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_roommate_notifs');
      return saved ? JSON.parse(saved) : INITIAL_ROOMMATE_NOTIFICATIONS;
    } catch {
      return INITIAL_ROOMMATE_NOTIFICATIONS;
    }
  });
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [pushAlertsEnabled, setPushAlertsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('uninest_roommate_push_alerts') !== 'false';
  });
  const [liveToast, setLiveToast] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const saveNotifications = (newList: RoommateMatchNotification[]) => {
    setNotifications(newList);
    try {
      localStorage.setItem('uninest_roommate_notifs', JSON.stringify(newList));
    } catch (e) {
      console.warn('Failed to persist notifications', e);
    }
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updated);
  };

  const handleDismissNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  const handleTogglePushAlerts = () => {
    const nextVal = !pushAlertsEnabled;
    setPushAlertsEnabled(nextVal);
    localStorage.setItem('uninest_roommate_push_alerts', String(nextVal));
    setLiveToast(nextVal ? '🔔 Roommate Match Push & WhatsApp Alerts enabled!' : '🔕 Roommate alerts muted.');
    setTimeout(() => setLiveToast(null), 4000);
  };

  // Simulate new real-time match notification
  const handleSimulateNewMatch = () => {
    const candidateNames = ['Preye Biobarakuma', 'Blessing Omokri', 'Kester Tamuno', 'Ebuka Okonkwo', 'Diepreye Alagoa'];
    const randomName = candidateNames[Math.floor(Math.random() * candidateNames.length)];
    const score = Math.floor(Math.random() * 8) + 92; // 92 - 99%

    const newNotif: RoommateMatchNotification = {
      id: `rm-notif-${Date.now()}`,
      candidateName: randomName,
      matchScore: score,
      institution: user.university || 'Niger Delta University (NDU)',
      department: user.department || 'Applied Sciences',
      level: '300L',
      roomType: 'Self-Contain Shared',
      budget: '₦75,000 - ₦95,000',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(randomName)}`,
      matchedHabits: ['Quiet Study Schedule', 'Shares Cleaning Chores', 'Respects Personal Space'],
      phone: '08090346486',
      timestamp: 'Just now',
      isRead: false
    };

    saveNotifications([newNotif, ...notifications]);
    setLiveToast(`🎉 New ${score}% Compatibility Match found with ${randomName}!`);
    setTimeout(() => setLiveToast(null), 6000);
  };

  // Roommate Filters: State & University Click-Through
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedUni, setSelectedUni] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
  const [lifestyleFilter, setLifestyleFilter] = useState<'all' | 'night_owl' | 'early_bird' | 'quiet' | 'cook'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Safety Disclosure Modal when contacting
  const [contactingRoommate, setContactingRoommate] = useState<BayelsaRoommateProfile | null>(null);

  // Request Roommate Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqState, setReqState] = useState<string>('Bayelsa');
  const [reqUni, setReqUni] = useState(getUniversitiesByState('Bayelsa')[0] || 'Niger Delta University (NDU)');
  const [reqDept, setReqDept] = useState(user.department || 'Computer Science');
  const [reqLevel, setReqLevel] = useState('200L');
  const [reqArea, setReqArea] = useState('Amassoma (Near NDU Main Gate)');
  const [reqBudget, setReqBudget] = useState('₦80,000 - ₦120,000');
  const [reqRoomType, setReqRoomType] = useState('Self-Contain Shared (1 Roommate)');
  const [reqSleep, setReqSleep] = useState<'Early Bird' | 'Night Owl' | 'Balanced'>('Balanced');
  const [reqStudy, setReqStudy] = useState<'Quiet / Serious' | 'Group Study' | 'Music in background'>('Quiet / Serious');
  const [reqClean, setReqClean] = useState<'Very Strict & Tidy' | 'Moderate' | 'Relaxed'>('Very Strict & Tidy');
  const [reqCooking, setReqCooking] = useState<'Cook Daily' | 'Buy food mostly' | 'Share cooking'>('Cook Daily');
  const [reqGuest, setReqGuest] = useState<'No overnight guests' | 'Weekends only' | 'Flexible / Allowed'>('Weekends only');
  const [reqReligion, setReqReligion] = useState<'Christian' | 'Muslim' | 'Open-minded / Any'>('Christian');
  const [reqAbout, setReqAbout] = useState('Calm and studious student, respectful of personal space and keeps the room clean.');
  const [reqLookingFor, setReqLookingFor] = useState('Looking for a hygienic, easy-going roommate to split lodge rent and electricity bills.');
  const [reqFacePhoto, setReqFacePhoto] = useState<string>(user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80');
  const [reqFaceConfirmed, setReqFaceConfirmed] = useState(false);
  const [reqSuccess, setReqSuccess] = useState<string | null>(null);

  // Available Accommodations State (Community uploaded & nationwide - generated lodges removed)
  const [localAccommodations, setLocalAccommodations] = useState<AccommodationListing[]>(() => {
    try {
      const saved = localStorage.getItem('uninest_community_accommodations');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = Array.isArray(parsed) ? parsed.filter((a: any) => a && a.id && !a.id.startsWith('acc-0')) : [];
        localStorage.setItem('uninest_community_accommodations', JSON.stringify(filtered));
        return filtered;
      }
    } catch (e) {
      console.error(e);
    }
    const filteredAcc = accommodations.filter(a => a && a.id && !a.id.startsWith('acc-0'));
    return filteredAcc.map(a => ({
      ...a,
      isAvailable: a.isAvailable !== undefined ? a.isAvailable : true,
      availabilityComments: a.availabilityComments || []
    }));
  });

  const [showUploadHouseModal, setShowUploadHouseModal] = useState(false);
  const [newHouseTitle, setNewHouseTitle] = useState('');
  const [newHouseInstitution, setNewHouseInstitution] = useState(user.university || 'Niger Delta University (NDU)');
  const [newHouseLocation, setNewHouseLocation] = useState('');
  const [newHousePrice, setNewHousePrice] = useState('120000');
  const [newHouseRoomType, setNewHouseRoomType] = useState('Self-Contain (Tiled)');
  const [newHousePhone, setNewHousePhone] = useState(user.phone || '08039847154');
  const [newHouseElectricity, setNewHouseElectricity] = useState<'24/7 Solar/Gen' | 'Good' | 'Fair'>('Good');
  const [newHouseWater, setNewHouseWater] = useState<'Constant Borehole' | 'Well & Tap'>('Constant Borehole');
  const [newHouseImage, setNewHouseImage] = useState('');
  const [newHouseAmenities, setNewHouseAmenities] = useState<string[]>(['Constant Borehole', 'Fenced & Security Gate', 'Tiled Floor']);
  
  const [accCommentInput, setAccCommentInput] = useState<Record<string, string>>({});
  const [accCommentStatus, setAccCommentStatus] = useState<Record<string, boolean>>({});
  const [accFilterStatus, setAccFilterStatus] = useState<'all' | 'available' | 'taken'>('all');
  const [accSearchQuery, setAccSearchQuery] = useState('');

  const persistAccommodations = (updated: AccommodationListing[]) => {
    setLocalAccommodations(updated);
    try {
      localStorage.setItem('uninest_community_accommodations', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save accommodations to localStorage', e);
    }
  };

  const handleToggleHouseAvailability = (houseId: string) => {
    const updated = localAccommodations.map(item => {
      if (item.id === houseId) {
        return {
          ...item,
          isAvailable: !item.isAvailable
        };
      }
      return item;
    });
    persistAccommodations(updated);
  };

  const handleAddAvailabilityComment = (houseId: string) => {
    const text = (accCommentInput[houseId] || '').trim();
    if (!text) return;
    const isAvail = accCommentStatus[houseId] !== undefined ? accCommentStatus[houseId] : true;

    const newComment = {
      id: `comm-${Date.now()}`,
      authorName: user.name || 'Campus Student',
      authorEmail: user.email || 'student@uninest.ng',
      university: user.university || 'Nigerian University',
      text,
      date: 'Just now',
      isAvailableReport: isAvail
    };

    const updated = localAccommodations.map(item => {
      if (item.id === houseId) {
        return {
          ...item,
          isAvailable: isAvail,
          availabilityComments: [newComment, ...(item.availabilityComments || [])]
        };
      }
      return item;
    });

    persistAccommodations(updated);
    setAccCommentInput(prev => ({ ...prev, [houseId]: '' }));
    setReqSuccess(`Availability feedback submitted for this lodge! Reported status: ${isAvail ? 'Available' : 'Taken'}.`);
    setTimeout(() => setReqSuccess(null), 5000);
  };

  const handleUploadHouseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHouseTitle.trim() || !newHouseLocation.trim()) return;

    const newLodge: AccommodationListing = {
      id: `lodge-${Date.now()}`,
      title: newHouseTitle.trim(),
      institution: newHouseInstitution,
      location: newHouseLocation.trim(),
      pricePerSession: Number(newHousePrice) || 120000,
      roomType: newHouseRoomType,
      amenities: newHouseAmenities,
      images: newHouseImage.trim() ? [newHouseImage.trim()] : [],
      contactPhone: newHousePhone.trim(),
      landlordVerified: true,
      electricityRating: newHouseElectricity,
      waterSupply: newHouseWater,
      isAvailable: true,
      uploadedBy: user.email,
      availabilityComments: [
        {
          id: `comm-init-${Date.now()}`,
          authorName: user.name || 'Listing Publisher',
          authorEmail: user.email,
          university: user.university || 'Campus Hostels',
          text: 'Newly listed house available for student rent. Contact caretaker directly or inspect in person.',
          date: 'Just now',
          isAvailableReport: true
        }
      ]
    };

    const updated = [newLodge, ...localAccommodations];
    persistAccommodations(updated);
    setShowUploadHouseModal(false);
    setNewHouseTitle('');
    setNewHouseLocation('');
    setReqSuccess(`🎉 House "${newLodge.title}" uploaded successfully and available for all students to rent!`);
    setTimeout(() => setReqSuccess(null), 6000);
  };

  // Available universities list based on selected state for filters
  const currentAvailableUnis = selectedState === 'all' 
    ? NIGERIA_CAMPUS_REGIONS.flatMap((r) => r.universities)
    : getUniversitiesByState(selectedState);

  // When state filter changes, reset selectedUni if not valid
  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedUni('all');
  };

  // When creating request, when reqState changes, update reqUni
  const handleReqStateChange = (state: string) => {
    setReqState(state);
    const unis = getUniversitiesByState(state);
    if (unis.length > 0) {
      setReqUni(unis[0]);
    }
  };

  // Filtered roommates based on state, uni, gender, search, lifestyle
  const filteredRoommates = roommates.filter(r => {
    // State matching
    let roommateState = r.state;
    if (!roommateState) {
      if (r.institution.includes('ABSU') || r.institution.includes('Abia') || r.institution.includes('Uturu') || r.institution.includes('MOUAU')) {
        roommateState = 'Abia';
      } else if (r.institution.includes('UNIPORT') || r.institution.includes('Rivers') || r.institution.includes('IAUE') || r.institution.includes('Elechi') || r.institution.includes('PAMO')) {
        roommateState = 'Rivers';
      } else if (r.institution.includes('DELSU') || r.institution.includes('FUPRE') || r.institution.includes('Delta') || r.institution.includes('DOU') || r.institution.includes('Ogwashi')) {
        roommateState = 'Delta';
      } else {
        roommateState = 'Bayelsa';
      }
    }

    const matchState = selectedState === 'all' || 
      roommateState.toLowerCase() === selectedState.toLowerCase() ||
      r.institution.toLowerCase().includes(selectedState.toLowerCase());

    const matchUni = selectedUni === 'all' || r.institution.toLowerCase().includes(selectedUni.toLowerCase());
    const matchGender = selectedGender === 'all' || r.gender === selectedGender;
    const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.campusArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.aboutMe.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchLifestyle = true;
    if (lifestyleFilter === 'night_owl') matchLifestyle = r.lifestyle.sleepSchedule === 'Night Owl';
    if (lifestyleFilter === 'early_bird') matchLifestyle = r.lifestyle.sleepSchedule === 'Early Bird';
    if (lifestyleFilter === 'quiet') matchLifestyle = r.lifestyle.studyHabit === 'Quiet / Serious';
    if (lifestyleFilter === 'cook') matchLifestyle = r.lifestyle.cooking === 'Cook Daily';

    return matchState && matchUni && matchGender && matchSearch && matchLifestyle;
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setReqFacePhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqFaceConfirmed) {
      alert('Please confirm that your face is clearly seen in the photo for trust and safety.');
      return;
    }

    onRequestRoommate({
      name: user.name || 'UniNest Student',
      state: reqState,
      gender: 'any',
      institution: reqUni,
      department: reqDept,
      level: reqLevel,
      campusArea: reqArea,
      budgetRange: reqBudget,
      roomTypeNeeded: reqRoomType,
      lifestyle: {
        sleepSchedule: reqSleep,
        studyHabit: reqStudy,
        cleanliness: reqClean,
        cooking: reqCooking,
        guestPolicy: reqGuest,
        religionValues: reqReligion,
      },
      aboutMe: reqAbout,
      lookingFor: reqLookingFor,
      contactPhone: user.phone || '08000000000',
      verifiedStudent: true,
      avatarUrl: reqFacePhoto,
      facePhotoUrl: reqFacePhoto,
      faceVerified: true
    });

    setReqSuccess(`Your Roommate Match Request for ${reqUni} (${reqState} State) has been published! Verified students can now connect with you on WhatsApp.`);
    setShowRequestModal(false);
    setTimeout(() => setReqSuccess(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {reqSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{reqSuccess}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Roommates &amp; Available Accommodations • Open to Everyone</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Roommate Matching &amp; Available Accommodations
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Find compatible student roommates and browse available student accommodations across Nigerian universities. Students and caretakers can upload houses available for rent and comment on whether rooms are still vacant. Applicable to everyone!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowUploadHouseModal(true)}
              id="btn-upload-house-header"
              className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Available House</span>
            </button>
            <button
              onClick={() => setShowNotifModal(true)}
              id="btn-roommate-match-alerts"
              className="relative px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer backdrop-blur-xs"
              title="View Roommate Compatibility Match Alerts"
            >
              <BellRing className="w-4 h-4 text-amber-300" />
              <span>Match Alerts</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black animate-pulse">
                  {unreadCount} New
                </span>
              )}
            </button>

            <button
              onClick={() => setShowRequestModal(true)}
              id="btn-post-roommate-request"
              className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Roommate Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Match Alert Toast */}
      {liveToast && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs sm:text-sm font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-200 shrink-0" />
            <span>{liveToast}</span>
          </div>
          <button
            onClick={() => setShowNotifModal(true)}
            className="px-3 py-1 rounded-xl bg-white text-orange-950 text-xs font-black hover:bg-orange-50 cursor-pointer shrink-0"
          >
            Review Match
          </button>
        </div>
      )}

      {/* Unread Roommate Match Callout Banner */}
      {unreadCount > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200">
                🔔 {unreadCount} High-Compatibility Roommate {unreadCount === 1 ? 'Match' : 'Matches'} Found!
              </h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                Students matching your lifestyle habits, campus area, and budget range are active right now.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotifModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs cursor-pointer transition"
            >
              View Matches ({unreadCount})
            </button>
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-2 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/50 cursor-pointer"
            >
              Mark Read
            </button>
          </div>
        </div>
      )}

      {/* Sub-view Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setSubView('roommates')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
            subView === 'roommates'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-orange-400" />
          <span>Roommate Matching ({filteredRoommates.length})</span>
        </button>

        <button
          onClick={() => setSubView('accommodations')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
            subView === 'accommodations'
              ? 'bg-[#0f172a] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Home className="w-4 h-4 text-orange-400" />
          <span>Available Accommodations ({localAccommodations.length})</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold ml-1">Open to Everyone</span>
        </button>
      </div>

      {/* ================= VIEW 1: 3-STATE ROOMMATES MATCHING ================= */}
      {subView === 'roommates' && (
        <div className="space-y-6">
          {/* STEP 1: STATE CLICK-THROUGH SELECTOR */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>Step 1: Choose Your State Region</span>
              </span>
              <span className="text-[11px] text-gray-500">
                All Nigerian states &amp; regional university clusters
              </span>
            </div>

            {/* Quick Popular State Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* All States Option */}
              <button
                type="button"
                onClick={() => handleStateChange('all')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-1 ${
                  selectedState === 'all'
                    ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-md ring-2 ring-orange-500/50'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">All States</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    selectedState === 'all' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {roommates.length}
                  </span>
                </div>
                <p className={`text-[10px] ${selectedState === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Nationwide
                </p>
              </button>

              {/* State Cards */}
              {ROOMMATE_COVERED_STATES.map((st) => {
                const count = roommates.filter(r => {
                  let rState = r.state;
                  if (!rState) {
                    if (r.institution.includes('ABSU') || r.institution.includes('Abia') || r.institution.includes('Uturu') || r.institution.includes('MOUAU')) rState = 'Abia';
                    else if (r.institution.includes('UNIPORT') || r.institution.includes('Rivers') || r.institution.includes('IAUE')) rState = 'Rivers';
                    else if (r.institution.includes('DELSU') || r.institution.includes('FUPRE') || r.institution.includes('Delta')) rState = 'Delta';
                    else rState = 'Bayelsa';
                  }
                  return rState === st.id;
                }).length;

                const isSelected = selectedState === st.id;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleStateChange(st.id)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-1 ${
                      isSelected
                        ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-md ring-2 ring-orange-500/50'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs">{st.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}>
                        {count}
                      </span>
                    </div>
                    <p className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {st.slogan}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Nationwide All 36 States Dropdown */}
            <div className="flex items-center gap-2 pt-1">
              <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Or select any Nigerian state:</label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-orange-500 cursor-pointer"
              >
                <option value="all">-- Browse All Nigerian States --</option>
                {NIGERIA_CAMPUS_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} State ({r.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP 2: UNIVERSITY SELECTION & DETAILED FILTERS */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Step 2: Filter by University &amp; Lifestyle</span>
              </span>

              {/* Quick Lifestyle Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
                <button
                  onClick={() => setLifestyleFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${lifestyleFilter === 'all' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}
                >
                  All Habits
                </button>
                <button
                  onClick={() => setLifestyleFilter('night_owl')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${lifestyleFilter === 'night_owl' ? 'bg-orange-600 text-white font-bold' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}
                >
                  🌙 Night Owl
                </button>
                <button
                  onClick={() => setLifestyleFilter('early_bird')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${lifestyleFilter === 'early_bird' ? 'bg-orange-600 text-white font-bold' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}
                >
                  ☀️ Early Bird
                </button>
                <button
                  onClick={() => setLifestyleFilter('quiet')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${lifestyleFilter === 'quiet' ? 'bg-orange-600 text-white font-bold' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}
                >
                  📚 Quiet Study
                </button>
                <button
                  onClick={() => setLifestyleFilter('cook')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${lifestyleFilter === 'cook' ? 'bg-orange-600 text-white font-bold' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}
                >
                  🍳 Cook Daily
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* University Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Select University</label>
                <select
                  value={selectedUni}
                  onChange={(e) => setSelectedUni(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">
                    {selectedState === 'all' ? 'All Universities in 3 States' : `All Universities in ${selectedState} State`}
                  </option>
                  {currentAvailableUnis.map((uni, idx) => (
                    <option key={idx} value={uni}>{uni}</option>
                  ))}
                </select>
              </div>

              {/* Gender Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Roommate Gender</label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">Any Gender (Male or Female)</option>
                  <option value="female">Female Roommates Only</option>
                  <option value="male">Male Roommates Only</option>
                </select>
              </div>

              {/* Search Keywords */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Search by Name or Area</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Amassoma, Choba, Abraka, Nursing..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ROOMMATE CARDS GRID */}
          {filteredRoommates.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 mx-auto flex items-center justify-center font-bold text-xl">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">No roommate requests posted yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                No students have posted roommate requests for this selection yet. Be the first to post your preferences or reset your filters.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(true)}
                  className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition cursor-pointer shadow-xs"
                >
                  Post Roommate Request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedState('all');
                    setSelectedUni('all');
                    setSearchQuery('');
                    setLifestyleFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredRoommates.map((p) => {
                // WhatsApp prefilled message
                const prefilledMsg = encodeURIComponent(
                  `Hello ${p.name}, I saw your roommate profile for ${p.institution} (${p.state || 'UniNest'}) on UniNest! I would love to connect with you to discuss sharing accommodation.`
                );
                const whatsappUrl = `https://wa.me/234${p.contactPhone.replace(/^0/, '')}?text=${prefilledMsg}`;

                return (
                  <div 
                    key={p.id} 
                    className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Top Profile Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="relative shrink-0">
                            <img 
                              src={p.facePhotoUrl || p.avatarUrl} 
                              alt={p.name} 
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-400 bg-slate-100 shadow-sm"
                            />
                            <span 
                              className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-white border-2 border-white shadow-xs" 
                              title="Clear Face Verified Student"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-extrabold text-slate-900 text-sm">{p.name}</h3>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold border border-slate-200">
                                {p.state || 'Bayelsa'} State
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">{p.department} • {p.level}</p>
                            <span className="text-[11px] text-orange-600 font-bold block truncate max-w-[220px]">{p.institution}</span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-[11px] font-extrabold whitespace-nowrap shrink-0">
                          {p.budgetRange}
                        </span>
                      </div>

                      {/* Location & Room Type */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-center justify-between">
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <strong className="truncate">{p.campusArea}</strong>
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono shrink-0">{p.roomTypeNeeded}</span>
                      </div>

                      {/* Lifestyle Badges */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-gray-400">Lifestyle Profile:</span>
                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                            {p.lifestyle.sleepSchedule === 'Night Owl' ? '🌙 Night Owl' : '☀️ Early Bird'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                            📖 {p.lifestyle.studyHabit}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium border border-purple-100">
                            ✨ {p.lifestyle.cleanliness}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium border border-amber-100">
                            🍳 {p.lifestyle.cooking}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                            🚪 {p.lifestyle.guestPolicy}
                          </span>
                        </div>
                      </div>

                      {/* About Me / Looking For */}
                      <p className="text-xs text-gray-600 line-clamp-2 italic">
                        "{p.aboutMe}"
                      </p>
                    </div>

                    {/* Footer Action: Connect via WhatsApp */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Face Verified Student</span>
                      </div>
                      <button
                        onClick={() => setContactingRoommate(p)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Connect on WhatsApp</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 2: AVAILABLE ACCOMMODATIONS (OPEN TO ALL) ================= */}
      {subView === 'accommodations' && (
        <div className="space-y-6">
          {/* Community Housing Notice */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-orange-400 font-extrabold text-xs">
                <Home className="w-4 h-4" />
                <span>NATIONWIDE STUDENT HOUSING &amp; LODGE DIRECTORY</span>
              </div>
              <h3 className="text-base font-black text-white">
                Available Student Accommodations &amp; Community Verified Vacancies
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Students and caretakers can upload available houses, self-contains, and lodges across all campuses. Use the <strong>community comment box</strong> under any lodge to confirm if rooms are still available for rent.
              </p>
            </div>

            <button
              onClick={() => setShowUploadHouseModal(true)}
              id="btn-upload-house-community"
              className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload Available House</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by house title, university, or location..."
                value={accSearchQuery}
                onChange={(e) => setAccSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-500">Status:</span>
              <button
                onClick={() => setAccFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  accFilterStatus === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({localAccommodations.length})
              </button>
              <button
                onClick={() => setAccFilterStatus('available')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  accFilterStatus === 'available'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                Available Only ({localAccommodations.filter(a => a.isAvailable !== false).length})
              </button>
              <button
                onClick={() => setAccFilterStatus('taken')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  accFilterStatus === 'taken'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                Taken ({localAccommodations.filter(a => a.isAvailable === false).length})
              </button>
            </div>
          </div>

          {/* Accommodation Cards Grid */}
          {(() => {
            const filteredAccommodations = localAccommodations.filter(acc => {
              const matchesSearch = !accSearchQuery || 
                acc.title.toLowerCase().includes(accSearchQuery.toLowerCase()) ||
                acc.location.toLowerCase().includes(accSearchQuery.toLowerCase()) ||
                acc.institution.toLowerCase().includes(accSearchQuery.toLowerCase());

              const matchesStatus = accFilterStatus === 'all' || 
                (accFilterStatus === 'available' && acc.isAvailable !== false) ||
                (accFilterStatus === 'taken' && acc.isAvailable === false);

              return matchesSearch && matchesStatus;
            });

            if (filteredAccommodations.length === 0) {
              return (
                <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 text-slate-300">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                    <Home className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="text-base font-bold text-white">No Accommodations Listed Yet</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      There are currently no lodges listed. Students and caretakers can upload vacant rooms or self-contains to help peers find off-campus housing.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUploadHouseModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition cursor-pointer shadow-md inline-flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Upload First Available House</span>
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAccommodations.map((acc) => {
                  const isAvail = acc.isAvailable !== false;
                  const comments = acc.availabilityComments || [];

                  return (
                    <div 
                      key={acc.id} 
                      className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Image & Header Tags */}
                      <div className={`relative ${acc.images && acc.images[0] ? 'h-48 bg-slate-200' : 'h-24 bg-gradient-to-r from-slate-900 to-slate-800'}`}>
                        {acc.images && acc.images[0] ? (
                          <img 
                            src={acc.images[0]} 
                            alt={acc.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center px-4">
                            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-orange-400" />
                              <span>Campus Lodge Listing</span>
                            </span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold">
                          {acc.institution}
                        </div>
                        
                        {/* Availability Status Badge */}
                        <div className="absolute top-3 right-3">
                          {isAvail ? (
                            <span className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-md border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Status: Available for Rent</span>
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-md border border-rose-300">
                              <X className="w-3.5 h-3.5" />
                              <span>Status: Taken / Occupied</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Main Details */}
                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide flex items-center gap-1 ${
                                isAvail 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isAvail ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                Status: {isAvail ? 'Available' : 'Occupied'}
                              </span>
                            </div>
                            <h3 className="font-extrabold text-slate-900 text-base">{acc.title}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                              <span>{acc.location}</span>
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-black text-slate-900 text-base">₦{(acc.pricePerSession || 0).toLocaleString()}</span>
                            <span className="text-[10px] text-gray-400 block font-normal">/ session</span>
                          </div>
                        </div>

                        {/* Quick Specs */}
                        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                          <div>
                            <span className="text-[10px] text-gray-400 block">Room Type</span>
                            <span className="font-bold text-slate-900">{acc.roomType}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block">Light</span>
                            <span className="font-bold text-slate-900">{acc.electricityRating}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block">Water</span>
                            <span className="font-bold text-slate-900">{acc.waterSupply}</span>
                          </div>
                        </div>

                        {/* Amenities Tags */}
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          {acc.amenities.map((a, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                              ✓ {a}
                            </span>
                          ))}
                        </div>

                        {/* Action Buttons: Call & Toggle */}
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`tel:${acc.contactPhone}`}
                            className="flex-1 py-2.5 rounded-xl bg-[#062343] hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                          >
                            <Phone className="w-3.5 h-3.5 text-orange-400" />
                            <span>Call Caretaker ({acc.contactPhone})</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleToggleHouseAvailability(acc.id)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                              isAvail
                                ? 'border-rose-300 text-rose-700 hover:bg-rose-50'
                                : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title="Quickly change availability status"
                          >
                            {isAvail ? 'Mark as Taken' : 'Mark as Available'}
                          </button>
                        </div>

                        {/* Community Comments Box: Is this house still available? */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                              <MessageCircle className="w-3.5 h-3.5 text-orange-500" />
                              <span>Availability Comments ({comments.length})</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Open to all students
                            </span>
                          </div>

                          {/* Existing Comments List */}
                          {comments.length > 0 && (
                            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                              {comments.map((comm) => (
                                <div key={comm.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900 text-[11px]">{comm.authorName}</span>
                                      <span className="text-[10px] text-slate-400">• {comm.university}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                      comm.isAvailableReport 
                                        ? 'bg-emerald-100 text-emerald-800' 
                                        : 'bg-rose-100 text-rose-800'
                                    }`}>
                                      {comm.isAvailableReport ? 'Reported: Available' : 'Reported: Taken'}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 text-[11px] leading-relaxed">{comm.text}</p>
                                  <span className="text-[9px] text-slate-400 block">{comm.date}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Comment Input Form */}
                          <div className="space-y-2 pt-2 border-t border-slate-200">
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="font-bold text-slate-700">Your Report:</span>
                              <button
                                type="button"
                                onClick={() => setAccCommentStatus(prev => ({ ...prev, [acc.id]: true }))}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                                  (accCommentStatus[acc.id] ?? true)
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                ✓ Still Available
                              </button>
                              <button
                                type="button"
                                onClick={() => setAccCommentStatus(prev => ({ ...prev, [acc.id]: false }))}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                                  accCommentStatus[acc.id] === false
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                ✗ Already Taken
                              </button>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-slate-700 block">
                                Comment on whether this property is still available:
                              </label>
                              <textarea
                                rows={2}
                                placeholder="Write a comment on whether this house is still available (e.g. 'Inspected yesterday, 2 self-contains still vacant' or 'Called caretaker, rent has been paid by another student')..."
                                value={accCommentInput[acc.id] || ''}
                                onChange={(e) => setAccCommentInput(prev => ({ ...prev, [acc.id]: e.target.value }))}
                                className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
                              />
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] text-slate-500">
                                  Press submit to update availability status
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAddAvailabilityComment(acc.id)}
                                  disabled={!accCommentInput[acc.id]?.trim()}
                                  className="px-4 py-2 rounded-xl bg-[#E75D14] hover:bg-[#D14F0F] disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                                >
                                  <span>Submit Availability Comment</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
      )}

      {/* ================= MODAL: UPLOAD AVAILABLE HOUSE / LODGE ================= */}
      {showUploadHouseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Home className="w-5 h-5 text-orange-500" />
                  <span>Upload Available House / Lodge</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Post vacant student accommodation. Applicable to any campus nationwide.
                </p>
              </div>
              <button
                onClick={() => setShowUploadHouseModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadHouseSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">House / Lodge Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peace Haven Lodge (New Self-Contain)"
                  value={newHouseTitle}
                  onChange={(e) => setNewHouseTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">University / Campus *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Niger Delta University (NDU)"
                    value={newHouseInstitution}
                    onChange={(e) => setNewHouseInstitution(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Location / Landmark *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amassoma Gate 2, Behind Bank"
                    value={newHouseLocation}
                    onChange={(e) => setNewHouseLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Price / Session (₦) *</label>
                  <input
                    type="number"
                    required
                    min="10000"
                    step="5000"
                    value={newHousePrice}
                    onChange={(e) => setNewHousePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Room Type</label>
                  <select
                    value={newHouseRoomType}
                    onChange={(e) => setNewHouseRoomType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Self-Contain (Tiled)">Self-Contain (Tiled)</option>
                    <option value="Single Room Shared Bath">Single Room Shared Bath</option>
                    <option value="1-Bedroom Flat">1-Bedroom Flat</option>
                    <option value="2-Bedroom Flat">2-Bedroom Flat</option>
                    <option value="Hostel Bedspace">Hostel Bedspace</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Caretaker / Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="0803XXXXXXX"
                    value={newHousePhone}
                    onChange={(e) => setNewHousePhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Electricity / Light</label>
                  <select
                    value={newHouseElectricity}
                    onChange={(e: any) => setNewHouseElectricity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="24/7 Solar/Gen">24/7 Solar / Generator backup</option>
                    <option value="Good">Good (Regular campus power)</option>
                    <option value="Fair">Fair (Standard supply)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Water Supply</label>
                  <select
                    value={newHouseWater}
                    onChange={(e: any) => setNewHouseWater(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Constant Borehole">Constant Borehole (24/7)</option>
                    <option value="Well &amp; Tap">Well &amp; Pumping Tap</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Photo URL</label>
                <input
                  type="url"
                  value={newHouseImage}
                  onChange={(e) => setNewHouseImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadHouseModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Publish House for Rent</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REQUEST A ROOMMATE (WITH CLEAR FACE VERIFICATION) ================= */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  <span>Request a Roommate (Bayelsa, ABSU, Rivers &amp; Delta)</span>
                </h3>
                <p className="text-xs text-gray-500">Publish your profile for Bayelsa, ABSU (Abia), Rivers, or Delta matching.</p>
              </div>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* FACE VERIFICATION PHOTO SECTION (MANDATORY REQUIREMENT) */}
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <label className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-orange-600" />
                      <span>Face Photo Verification (Required)</span>
                    </label>
                    <p className="text-[11px] text-orange-800 leading-snug mt-0.5">
                      You must provide a photograph where your <strong>face is clearly seen</strong> (no sunglasses or face masks) for security when students connect via WhatsApp.
                    </p>
                  </div>
                  <img 
                    src={reqFacePhoto} 
                    alt="Face preview" 
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500 bg-white shadow-xs shrink-0"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Clear Face Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-orange-950 cursor-pointer pt-1">
                  <input 
                    type="checkbox" 
                    required 
                    checked={reqFaceConfirmed}
                    onChange={(e) => setReqFaceConfirmed(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
                  />
                  <span>I confirm that my face is clearly visible in this photo.</span>
                </label>
              </div>

              {/* State & University Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select State Region</label>
                  <select
                    value={reqState}
                    onChange={(e) => handleReqStateChange(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 cursor-pointer"
                  >
                    {NIGERIA_CAMPUS_REGIONS.map((r) => (
                      <option key={r.id} value={r.id}>{r.name} State</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">University / Campus in this Region</label>
                  <select
                    value={reqUni}
                    onChange={(e) => setReqUni(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 cursor-pointer"
                  >
                    {getUniversitiesByState(reqState).map((u, i) => (
                      <option key={i} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={reqDept}
                    onChange={(e) => setReqDept(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs"
                    placeholder="e.g. Nursing, Law, Mech Eng"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Level</label>
                  <select
                    value={reqLevel}
                    onChange={(e) => setReqLevel(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs"
                  >
                    <option value="100L">100 Level</option>
                    <option value="200L">200 Level</option>
                    <option value="300L">300 Level</option>
                    <option value="400L">400 Level</option>
                    <option value="500L">500 Level</option>
                    <option value="HND1">HND 1</option>
                    <option value="HND2">HND 2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Area / Town</label>
                  <input
                    type="text"
                    required
                    value={reqArea}
                    onChange={(e) => setReqArea(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs"
                    placeholder="e.g. Amassoma, Choba Gate, Abraka Site 3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rent Budget Range</label>
                  <input
                    type="text"
                    required
                    value={reqBudget}
                    onChange={(e) => setReqBudget(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs"
                    placeholder="e.g. ₦80,000 - ₦120,000"
                  />
                </div>
              </div>

              {/* Lifestyle Inputs */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-extrabold text-slate-900 block">Your Lifestyle Preferences:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block">Sleep Schedule</label>
                    <select
                      value={reqSleep}
                      onChange={(e) => setReqSleep(e.target.value as any)}
                      className="w-full h-9 px-2 rounded-lg bg-white border border-slate-300 text-xs"
                    >
                      <option value="Early Bird">☀️ Early Bird</option>
                      <option value="Night Owl">🌙 Night Owl</option>
                      <option value="Balanced">⚖️ Balanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block">Study Style</label>
                    <select
                      value={reqStudy}
                      onChange={(e) => setReqStudy(e.target.value as any)}
                      className="w-full h-9 px-2 rounded-lg bg-white border border-slate-300 text-xs"
                    >
                      <option value="Quiet / Serious">Quiet / Serious</option>
                      <option value="Group Study">Group Study</option>
                      <option value="Music in background">Music / Low Noise</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block">Cleanliness</label>
                    <select
                      value={reqClean}
                      onChange={(e) => setReqClean(e.target.value as any)}
                      className="w-full h-9 px-2 rounded-lg bg-white border border-slate-300 text-xs"
                    >
                      <option value="Very Strict & Tidy">Very Strict & Tidy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Relaxed">Relaxed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block">Cooking</label>
                    <select
                      value={reqCooking}
                      onChange={(e) => setReqCooking(e.target.value as any)}
                      className="w-full h-9 px-2 rounded-lg bg-white border border-slate-300 text-xs"
                    >
                      <option value="Cook Daily">Cook Daily</option>
                      <option value="Buy food mostly">Buy food mostly</option>
                      <option value="Share cooking">Share cooking</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brief Description of Yourself</label>
                <textarea
                  rows={2}
                  required
                  value={reqAbout}
                  onChange={(e) => setReqAbout(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs"
                  placeholder="e.g. 300L student, very quiet, tidy, focused on studies..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">What kind of roommate are you looking for?</label>
                <textarea
                  rows={2}
                  required
                  value={reqLookingFor}
                  onChange={(e) => setReqLookingFor(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs"
                  placeholder="e.g. Non-smoker, pays bills on time, hygienic..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Publish Roommate Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Roommate Direct Modal */}
      {contactingRoommate && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-600">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Contact Potential Roommate</h3>
                  <p className="text-[11px] text-slate-500">{contactingRoommate.name} • {contactingRoommate.institution}</p>
                </div>
              </div>
              <button
                onClick={() => setContactingRoommate(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Roommate Profile Overview</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Budget: <strong>{contactingRoommate.budgetRange || (typeof (contactingRoommate as any).budget === 'number' ? `₦${((contactingRoommate as any).budget || 0).toLocaleString()}/yr` : (contactingRoommate as any).budget) || 'Flexible / Inquire'}</strong> • Department: <strong>{contactingRoommate.department}</strong> ({contactingRoommate.level})
              </p>
              <p className="text-slate-500 text-[10.5px]">
                Preferred lodge location: {contactingRoommate.campusArea || (contactingRoommate as any).preferredLodgeLocation || 'Campus lodge area'}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setContactingRoommate(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Go Back
              </button>

              <a
                href={`https://wa.me/234${contactingRoommate.contactPhone.replace(/^0/, '')}?text=${encodeURIComponent(
                  `Hello ${contactingRoommate.name}, I saw your roommate profile on UniNest (${contactingRoommate.institution}). I would like to discuss room sharing on campus.`
                )}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setContactingRoommate(null)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Chat on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ROOMMATE MATCH NOTIFICATIONS CENTER ================= */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Roommate Match Alerts</span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-xs font-bold">
                      {notifications.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    Real-time habit compatibility &amp; lodge budget matching
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateNewMatch}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Test an incoming match notification"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Simulate Match</span>
                </button>

                <button 
                  onClick={() => setShowNotifModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification Control & Preferences */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Push &amp; WhatsApp Alerts:</span>
                <button
                  onClick={handleTogglePushAlerts}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                    pushAlertsEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {pushAlertsEnabled ? 'Enabled ✓' : 'Muted'}
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-[55vh] overflow-y-auto space-y-3 pr-1">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 dark:text-slate-500 space-y-2">
                  <Bell className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">No match notifications yet.</p>
                  <p>When students matching your habits submit a request, you will receive an alert here.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-2xl border transition space-y-3 ${
                      notif.isRead
                        ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                        : 'bg-orange-50/50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={notif.avatarUrl} 
                          alt={notif.candidateName} 
                          className="w-12 h-12 rounded-2xl object-cover border border-orange-300 shrink-0" 
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                              {notif.candidateName}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                              {notif.matchScore}% Match
                            </span>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-orange-500" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400">
                            {notif.department} ({notif.level}) • {notif.institution}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-gray-400 text-[10px]">
                        <span>{notif.timestamp}</span>
                        <button
                          onClick={() => handleDismissNotification(notif.id)}
                          className="p-1 hover:text-rose-500 text-gray-400 rounded-lg"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Habits and budget */}
                    <div className="flex flex-wrap gap-1.5">
                      {notif.matchedHabits.map((habit, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-[10px] font-semibold"
                        >
                          ✓ {habit}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[10px] font-bold">
                        Budget: {notif.budget}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                      <span className="text-[11px] text-gray-400">Lodge: {notif.roomType}</span>
                      <a
                        href={`https://wa.me/234${notif.phone.replace(/^0/, '')}?text=${encodeURIComponent(
                          `Hello ${notif.candidateName}, I received a ${notif.matchScore}% Roommate Compatibility alert on UniNest for ${notif.institution}. Let's discuss roommate lodge pairing!`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          const updated = notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n);
                          saveNotifications(updated);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

