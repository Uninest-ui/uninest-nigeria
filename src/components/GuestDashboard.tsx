import React, { useState, useRef } from 'react';
import { 
  Home, 
  BookOpen, 
  Building, 
  MessageSquare, 
  LogIn, 
  Search, 
  Sparkles, 
  Send, 
  Mail,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  Maximize2,
  X,
  HelpCircle,
  Bot,
  ShoppingBag,
  Tag,
  Check,
  Copy,
  ExternalLink,
  Phone,
  AlertCircle,
  MapPin,
  Clock
} from 'lucide-react';
import { NewsItem, ChatMessage, MarketplaceItem } from '../types';
import { UniNestLogo } from './UniNestLogo';
import { CampusTickerMarquee } from './CampusTickerMarquee';
import { UNINEST_OFFICIAL_BANK } from '../utils/paymentConfig';

interface GuestDashboardProps {
  news: NewsItem[];
  marketplaceItems?: MarketplaceItem[];
  onInitiateEscrow?: (item: MarketplaceItem, guestDetails?: { name: string; phone: string; email?: string; address?: string }) => void;
  onBackToAuth: () => void;
  onSubscribeNewsletter: (email: string) => void;
  isSubscribedNewsletter: boolean;
}

export const GuestDashboard: React.FC<GuestDashboardProps> = ({
  news,
  marketplaceItems = [],
  onInitiateEscrow,
  onBackToAuth,
  onSubscribeNewsletter,
  isSubscribedNewsletter,
}) => {
  const [activeTab, setActiveTab] = useState<'news' | 'lodges' | 'marketplace' | 'chat'>('news');
  const [newsFilter, setNewsFilter] = useState<'all' | 'scholarship' | 'strike' | 'school'>('all');
  const [newsSearch, setNewsSearch] = useState('');

  // Marketplace state for guests
  const [marketplaceCategory, setMarketplaceCategory] = useState<string>('all');
  const [marketplaceSearch, setMarketplaceSearch] = useState<string>('');
  const [selectedItemForGuestBuy, setSelectedItemForGuestBuy] = useState<MarketplaceItem | null>(null);
  const [guestBuyerName, setGuestBuyerName] = useState('');
  const [guestBuyerPhone, setGuestBuyerPhone] = useState('');
  const [guestBuyerEmail, setGuestBuyerEmail] = useState('');
  const [guestBuyerAddress, setGuestBuyerAddress] = useState('');
  const [guestEscrowSuccess, setGuestEscrowSuccess] = useState<string | null>(null);
  const [guestEscrowRef, setGuestEscrowRef] = useState<string | null>(null);
  const [copiedEscrowAccount, setCopiedEscrowAccount] = useState(false);
  
  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'g1',
      sender: 'agent',
      text: 'Hello Guest Student! Welcome to UniNest. Looking for Nigerian campus accommodation, marketplace items, or scholarship alerts? Ask away!',
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<{ url: string; name: string; type: string; size: string } | null>(null);
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);
  const [quickFaqOpen, setQuickFaqOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 6 * 1024 * 1024) {
      alert('File exceeds 6MB. Please choose a smaller photo or document.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAttachment({
        url: reader.result as string,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: formatFileSize(file.size)
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setSelectedAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredNews = news.filter(item => {
    const matchType = newsFilter === 'all' || item.type === newsFilter;
    const matchSearch = item.title.toLowerCase().includes(newsSearch.toLowerCase()) || 
                        item.description.toLowerCase().includes(newsSearch.toLowerCase());
    return matchType && matchSearch;
  });

  const filteredMarketplaceItems = marketplaceItems.filter(item => {
    const matchCategory = marketplaceCategory === 'all' || item.category.toLowerCase().includes(marketplaceCategory.toLowerCase());
    const matchSearch = item.title.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
                        item.description.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
                        item.campus.toLowerCase().includes(marketplaceSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleGuestBuySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForGuestBuy) return;

    const escrowFee = Math.round(selectedItemForGuestBuy.price * 0.05);
    const totalAmount = selectedItemForGuestBuy.price + escrowFee;
    const refCode = `ESC-GST-${Math.floor(100000 + Math.random() * 900000)}`;

    onInitiateEscrow?.(selectedItemForGuestBuy, {
      name: guestBuyerName.trim() || 'Guest Student Buyer',
      phone: guestBuyerPhone.trim() || '08000000000',
      email: guestBuyerEmail.trim() || 'guest@uninest.ng',
      address: guestBuyerAddress.trim() || 'Campus Delivery Address'
    });

    setGuestEscrowRef(refCode);
    setGuestEscrowSuccess(
      `Escrow Order Initiated for "${selectedItemForGuestBuy.title}"! Total ₦${totalAmount.toLocaleString()} safely secured with 100% UniNest Buyer Protection.`
    );

    const waMsg = `🛡️ *UNINEST GUEST ESCROW PURCHASE ORDER*\n` +
      `----------------------------------------\n` +
      `• Order Ref: ${refCode}\n` +
      `• Item: ${selectedItemForGuestBuy.title}\n` +
      `• Item Price: ₦${selectedItemForGuestBuy.price.toLocaleString()}\n` +
      `• 5% Escrow Protection Fee: ₦${escrowFee.toLocaleString()}\n` +
      `• Total Amount: ₦${totalAmount.toLocaleString()}\n` +
      `• Official Escrow Bank: ${UNINEST_OFFICIAL_BANK.bankName}\n` +
      `• Escrow Account Number: ${UNINEST_OFFICIAL_BANK.accountNumber}\n` +
      `• Buyer Name: ${guestBuyerName || 'Guest Buyer'}\n` +
      `• Buyer Phone: ${guestBuyerPhone}\n` +
      `• Delivery Address: ${guestBuyerAddress}\n` +
      `• Campus: ${selectedItemForGuestBuy.campus}\n` +
      `• Seller: ${selectedItemForGuestBuy.sellerName}\n` +
      `----------------------------------------\n` +
      `I am transferring payment to the UniNest Escrow Account. Please confirm my order!`;

    window.open(`https://wa.me/2349039847154?text=${encodeURIComponent(waMsg)}`, '_blank');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    onSubscribeNewsletter(newsletterEmail.trim());
    setNewsletterSuccess("Subscribed! You'll receive scholarship, strike & school news");
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSuccess(null), 5000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !selectedAttachment) return;

    const userMsg: ChatMessage = {
      id: `gm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      sender: 'user',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachmentUrl: selectedAttachment?.url,
      attachmentName: selectedAttachment?.name,
      attachmentType: selectedAttachment?.type,
      attachmentSize: selectedAttachment?.size
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    handleRemoveAttachment();

    // Automatic customer care reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `gr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        sender: 'agent',
        text: 'We are connecting you to our UniNest customer care. For quick answers, check the FAQ or explore our verified campus marketplace.',
        time: 'Just now',
        isAutoReply: true
      }]);
    }, 450);
  };

  return (
    <div id="guest-dashboard" className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* Top Banner for Guests */}
      <div className="bg-[#0f172a] text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold text-[10px] uppercase">
            Guest Mode
          </span>
          <span className="text-slate-300 font-medium">
            Sign in to save for your final year and unlock gifts items.
          </span>
        </div>
        <button
          onClick={onBackToAuth}
          className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5 text-slate-950" />
          <span className="text-slate-950 font-black">Login / Sign In</span>
        </button>
      </div>

      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs gap-3">
        <UniNestLogo size="md" className="shrink-0" />
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('news')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'news' ? 'bg-[#0f172a] text-white' : 'text-gray-600 hover:bg-slate-100'
            }`}
          >
            News &amp; Scholarships
          </button>
          <button
            onClick={() => setActiveTab('lodges')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'lodges' ? 'bg-[#0f172a] text-white' : 'text-gray-600 hover:bg-slate-100'
            }`}
          >
            Campus Lodges
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'marketplace' ? 'bg-[#0f172a] text-white' : 'text-gray-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Marketplace &amp; Deals</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'chat' ? 'bg-[#0f172a] text-white' : 'text-gray-600 hover:bg-slate-100'
            }`}
          >
            Support Desk
          </button>
        </div>
      </header>

      {/* Animated Marquee with Adverts & Critical Safety Disclosure */}
      <CampusTickerMarquee />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Newsletter Promo Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold">Get Scholarship &amp; ASUU Strike Bulletins</h3>
            <p className="text-xs text-slate-900/80 mt-0.5">Stay up to date with federal grants and academic calendar notices.</p>
          </div>
          
          <form onSubmit={handleSubscribe} className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="px-3 h-10 rounded-xl bg-white text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none w-full sm:w-56"
            />
            <button
              type="submit"
              className="px-4 h-10 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>

        {newsletterSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
            {newsletterSuccess}
          </div>
        )}

        {/* ================= TAB 1: NEWS ================= */}
        {activeTab === 'news' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Campus News &amp; Scholarship Alerts</h2>
                <p className="text-xs text-gray-500">Verified bulletins for all 36 Nigerian states and institutions.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNewsFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    newsFilter === 'all' ? 'bg-[#0f172a] text-white' : 'bg-white border border-slate-200 text-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setNewsFilter('scholarship')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    newsFilter === 'scholarship' ? 'bg-emerald-700 text-white' : 'bg-white border border-slate-200 text-gray-700'
                  }`}
                >
                  Scholarships
                </button>
                <button
                  onClick={() => setNewsFilter('strike')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    newsFilter === 'strike' ? 'bg-amber-700 text-white' : 'bg-white border border-slate-200 text-gray-700'
                  }`}
                >
                  Strike Alerts
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNews.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      item.type === 'scholarship' ? 'bg-emerald-100 text-emerald-800' :
                      item.type === 'strike' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-gray-400 font-mono text-[11px]">{item.date}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: LODGES ================= */}
        {activeTab === 'lodges' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Student Hostels &amp; Off-Campus Lodges</h2>
              <p className="text-xs text-gray-500">Preview lodges in Nigerian campus hubs.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  name: 'Emerald Court Private Lodge',
                  school: 'UNILAG (Akoka)',
                  price: '₦220,000 / session',
                  type: 'Self-Contain with Inverter',
                },
                {
                  name: 'Ivory Heights Student Flats',
                  school: 'University of Ibadan (UI Agbowo)',
                  price: '₦140,000 / session',
                  type: 'Single Room En-Suite',
                },
                {
                  name: 'Mayfair Scholars Haven',
                  school: 'OAU (Ile-Ife Campus Gate)',
                  price: '₦180,000 / session',
                  type: '2-Bedroom Shared Flat',
                }
              ].map((h, i) => (
                <div key={i} className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                        {h.school}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Verified Lodge
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{h.name}</h4>
                    <p className="text-xs text-gray-500">{h.type}</p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Rent Price</span>
                      <span className="text-xs font-extrabold text-emerald-700">{h.price}</span>
                    </div>
                    <button 
                      onClick={onBackToAuth}
                      className="px-2.5 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 text-white text-[11px] font-bold transition"
                    >
                      Register to Rent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: MARKETPLACE (GUEST BUYING) ================= */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Escrow Guarantee Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-black">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      Guest Escrow Protection Active
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                      100% Safe Checkout
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Guests can buy any campus item with full escrow security. Your payment is held safely in the official UniNest vault (<strong>{UNINEST_OFFICIAL_BANK.accountNumber} - {UNINEST_OFFICIAL_BANK.bankName}</strong>) and only released to the seller after you inspect and verify the item or within 3 working days.
                  </p>
                </div>
              </div>

              <button
                onClick={onBackToAuth}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Want to Sell? Sign In</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'handout', label: 'Books & Handouts' },
                  { id: 'laptop', label: 'Laptops & Phones' },
                  { id: 'electronics', label: 'Gadgets' },
                  { id: 'kitchen', label: 'Hostel Essentials' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setMarketplaceCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      marketplaceCategory === cat.id
                        ? 'bg-[#0f172a] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search campus items, phones, textbooks..."
                  value={marketplaceSearch}
                  onChange={(e) => setMarketplaceSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
                />
              </div>
            </div>

            {/* Items Grid */}
            {filteredMarketplaceItems.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">No marketplace listings match your query</h4>
                <p className="text-xs text-slate-500">Try searching for different keywords or view all categories.</p>
                <button
                  onClick={() => {
                    setMarketplaceCategory('all');
                    setMarketplaceSearch('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMarketplaceItems.map(item => {
                  const escrowFee = Math.round(item.price * 0.05);
                  const isAvailable = item.status === 'active' || !item.status;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col group"
                    >
                      {/* Item Image */}
                      <div className="relative h-48 bg-slate-100 overflow-hidden">
                        <img
                          src={(item as any).imageUrl || item.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80'}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white font-bold text-[11px] shadow-sm">
                            {item.category}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-xs text-slate-950 font-black text-[11px] shadow-sm">
                            {item.condition}
                          </span>
                        </div>

                        {item.isVerifiedVendor && (
                          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-md">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified Seller</span>
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-baseline justify-between gap-2">
                            <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                              {item.title}
                            </h4>
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Price</span>
                              <p className="text-base font-black text-slate-950">
                                ₦{(item.price || 0).toLocaleString()}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 flex items-center gap-0.5 justify-end">
                                <ShieldCheck className="w-3 h-3" /> +5% Escrow
                              </span>
                              <p className="text-xs font-bold text-slate-600">
                                ₦{((item.price || 0) + (escrowFee || 0)).toLocaleString()} total
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 truncate max-w-[150px]">
                              <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                              {item.campus}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              Seller: {item.sellerName.split(' ')[0]}
                            </span>
                          </div>

                          {/* Action Button: Guest Purchase via Escrow */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedItemForGuestBuy(item);
                              setGuestEscrowSuccess(null);
                              setGuestEscrowRef(null);
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.98]"
                          >
                            <ShieldCheck className="w-4 h-4 text-slate-950" />
                            <span>Buy with Safe Escrow</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: CHAT ================= */}
        {activeTab === 'chat' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">UniNest Student Desk</h3>
                  <p className="text-[11px] text-emerald-600 font-semibold">● Online for Nigerian Campuses</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickFaqOpen(!quickFaqOpen)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-orange-500 bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
                <span>{quickFaqOpen ? 'Hide FAQ' : 'Check FAQ'}</span>
              </button>
            </div>

            {/* Quick FAQ Accordion / Box */}
            {quickFaqOpen && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2.5 text-xs animate-fadeIn">
                <div className="flex items-center justify-between font-bold text-amber-950">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    Frequently Asked Questions (FAQ)
                  </span>
                  <button onClick={() => setQuickFaqOpen(false)} className="text-amber-800 hover:text-black">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white border border-amber-100">
                    <p className="font-bold text-slate-900">Q: What is 1/1 STS Temporary Stay?</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">A: STS provides pre-verified short-term campus housing for matriculation, exams, strikes, or roommate transitions.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-amber-100">
                    <p className="font-bold text-slate-900">Q: How do I contact lodge landlords?</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">A: Register or sign in with your student email to unlock direct WhatsApp and phone contacts of verified landlords.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-amber-100">
                    <p className="font-bold text-slate-900">Q: What is the official payment escrow account?</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">A: Official UniNest Escrow Account is 2150445461 (United Bank for Africa - UBA).</p>
                  </div>
                </div>
              </div>
            )}

            <div className="h-80 bg-white border border-slate-200 rounded-2xl p-4 overflow-y-auto space-y-3">
              {messages.map((m, idx) => {
                const isUser = m.sender === 'user';
                const isImage = m.attachmentType?.startsWith('image/') || 
                  (m.attachmentName && /\.(jpg|jpeg|png|webp|gif)$/i.test(m.attachmentName));

                return (
                  <div 
                    key={`${m.id || 'gm'}-${idx}`}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-2 ${
                      isUser 
                        ? 'bg-[#0f172a] text-white rounded-br-none' 
                        : m.isAutoReply
                        ? 'bg-amber-50 text-slate-900 border border-amber-300 rounded-bl-none shadow-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}>
                      {m.isAutoReply && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-orange-600 pb-1 border-b border-amber-200">
                          <Bot className="w-3.5 h-3.5" />
                          <span>UniNest Customer Care Bot</span>
                        </div>
                      )}

                      {m.text && <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>}

                      {/* Attached File/Image */}
                      {m.attachmentUrl && m.attachmentUrl.trim() !== '' && (
                        <div className="pt-2 border-t border-black/10 dark:border-white/10">
                          {isImage ? (
                            <div className="space-y-1">
                              <img
                                src={m.attachmentUrl}
                                alt={m.attachmentName || 'Attachment'}
                                referrerPolicy="no-referrer"
                                onClick={() => setActiveImageModal(m.attachmentUrl!)}
                                className="max-h-40 rounded-xl object-contain cursor-pointer border border-black/10 hover:opacity-95"
                              />
                              <div className="flex items-center justify-between text-[10px] opacity-75">
                                <span className="truncate max-w-[150px]">{m.attachmentName}</span>
                                {m.attachmentSize && <span>{m.attachmentSize}</span>}
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 rounded-xl bg-black/5 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 truncate">
                                <FileText className="w-4 h-4 shrink-0" />
                                <span className="truncate text-[11px] font-bold">{m.attachmentName || 'Document'}</span>
                              </div>
                              <a
                                href={m.attachmentUrl}
                                download={m.attachmentName || 'document'}
                                className="text-[10px] font-bold text-orange-600 underline shrink-0"
                              >
                                Download
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Auto-reply FAQ shortcut */}
                      {m.isAutoReply && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setQuickFaqOpen(true)}
                            className="w-full py-1.5 px-3 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
                            <span>Check FAQ / Quick Answers</span>
                          </button>
                        </div>
                      )}

                      <span className="text-[9px] opacity-70 block text-right font-mono">{m.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Attachment Pre-Send Banner */}
            {selectedAttachment && (
              <div className="p-2 px-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Paperclip className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="font-bold truncate text-slate-800">{selectedAttachment.name}</span>
                  <span className="text-orange-600 text-[10px]">({selectedAttachment.size})</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="p-1 rounded-md hover:bg-orange-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-11 px-3 rounded-xl bg-white border border-slate-200 hover:border-orange-500 text-slate-600 hover:text-orange-600 transition flex items-center justify-center cursor-pointer shrink-0"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = 'image/*';
                    fileInputRef.current.click();
                  }
                }}
                className="h-11 px-3 rounded-xl bg-white border border-slate-200 hover:border-orange-500 text-slate-600 hover:text-orange-600 transition flex items-center justify-center cursor-pointer shrink-0"
                title="Attach photo"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder={selectedAttachment ? "Add a message or send..." : "Ask about accommodation or campus life..."}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 h-11 px-4 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() && !selectedAttachment}
                className="h-11 px-5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Full-Size Image Lightbox Modal */}
      {activeImageModal && activeImageModal.trim() !== '' && (
        <div 
          onClick={() => setActiveImageModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-white/20 p-4 space-y-3"
          >
            <div className="flex items-center justify-between text-white">
              <span className="text-xs font-bold">Image Preview</span>
              <div className="flex items-center gap-2">
                <a
                  href={activeImageModal}
                  download="guest-attachment"
                  className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/20"
                >
                  Download
                </a>
                <button
                  onClick={() => setActiveImageModal(null)}
                  className="p-1 rounded-lg bg-white/10 text-white hover:bg-rose-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <img
              src={activeImageModal}
              alt="Preview"
              className="max-h-[70vh] w-auto mx-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}

      {/* Guest Escrow Checkout Modal */}
      {selectedItemForGuestBuy && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setSelectedItemForGuestBuy(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Guest Escrow Purchase
                  </h3>
                  <p className="text-[11px] text-emerald-600 font-bold">
                    100% Buyer Protection Guaranteed
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForGuestBuy(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {guestEscrowSuccess ? (
              /* Success State */
              <div className="space-y-4 text-center py-2 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900">Escrow Order Created!</h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                    {guestEscrowSuccess}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-amber-200/70">
                    <span className="font-bold text-amber-950">Escrow Order Ref:</span>
                    <span className="font-mono font-black text-slate-900 text-sm">{guestEscrowRef}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Official Vault Account:</span>
                    <span className="font-mono font-bold text-slate-900">{UNINEST_OFFICIAL_BANK.accountNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Bank Name:</span>
                    <span className="font-bold text-slate-900">{UNINEST_OFFICIAL_BANK.bankName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Account Name:</span>
                    <span className="font-bold text-slate-900">{UNINEST_OFFICIAL_BANK.accountName}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <a
                    href={`https://wa.me/2349039847154?text=${encodeURIComponent(
                      `Hello UniNest Escrow Officer, I just placed guest order ${guestEscrowRef} for ${selectedItemForGuestBuy.title} (₦${(selectedItemForGuestBuy.price * 1.05).toLocaleString()}). Please confirm vault deposit.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Open WhatsApp Escrow Dispatch</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItemForGuestBuy(null);
                      setGuestEscrowSuccess(null);
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
                  >
                    Back to Marketplace
                  </button>
                </div>
              </div>
            ) : (
              /* Checkout Form */
              <form onSubmit={handleGuestBuySubmit} className="space-y-4">
                {/* Product Summary Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3 items-center">
                  <img
                    src={(selectedItemForGuestBuy as any).imageUrl || selectedItemForGuestBuy.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80'}
                    alt={selectedItemForGuestBuy.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">
                      {selectedItemForGuestBuy.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Seller: {selectedItemForGuestBuy.sellerName} • {selectedItemForGuestBuy.campus}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-black text-xs text-slate-900">
                        ₦{(selectedItemForGuestBuy.price || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        +5% Escrow Protection (₦{Math.round((selectedItemForGuestBuy.price || 0) * 0.05).toLocaleString()})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bank Escrow Details Pill */}
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs space-y-2">
                  <div className="flex items-center justify-between text-amber-400 font-bold text-[11px]">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Official Escrow Vault
                    </span>
                    <span className="text-[10px] text-slate-300 font-normal">Funds held safely</span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Account Number</p>
                      <p className="font-mono text-base font-black text-white tracking-wider">
                        {UNINEST_OFFICIAL_BANK.accountNumber}
                      </p>
                      <p className="text-[10px] text-slate-300">
                        {UNINEST_OFFICIAL_BANK.bankName} • {UNINEST_OFFICIAL_BANK.accountName}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(UNINEST_OFFICIAL_BANK.accountNumber);
                        setCopiedEscrowAccount(true);
                        setTimeout(() => setCopiedEscrowAccount(false), 2500);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] transition flex items-center gap-1 shrink-0"
                    >
                      {copiedEscrowAccount ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedEscrowAccount ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    *Transfer the total deposit to this account. Your money is protected and only disbursed after delivery verification or within 3 working days.
                  </p>
                </div>

                {/* Guest Buyer Details Inputs */}
                <div className="space-y-2.5 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ibrahim Chukwuma"
                      value={guestBuyerName}
                      onChange={(e) => setGuestBuyerName(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 08012345678"
                        value={guestBuyerPhone}
                        onChange={(e) => setGuestBuyerPhone(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Email Address (for receipt)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. student@gmail.com"
                        value={guestBuyerEmail}
                        onChange={(e) => setGuestBuyerEmail(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Campus &amp; Delivery / Lodge Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Room 14, Block B, Main Campus / UNILAG"
                      value={guestBuyerAddress}
                      onChange={(e) => setGuestBuyerAddress(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
                    />
                  </div>
                </div>

                {/* Total and Submit */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Total Deposit</span>
                    <p className="text-base font-black text-slate-950">
                      ₦{Math.round((selectedItemForGuestBuy.price || 0) * 1.05).toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                    <span>Confirm &amp; Open WhatsApp Escrow</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
