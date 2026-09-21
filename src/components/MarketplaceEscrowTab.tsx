import React, { useState, useRef, useMemo } from 'react';
import { 
  ShoppingBag, 
  ShieldCheck, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Lock, 
  Clock,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  Info,
  Tag,
  Building,
  Check,
  Store,
  X,
  Filter,
  Camera,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { MarketplaceItem, EscrowTransaction, UniNestUser } from '../types';
import { OfficialBankPaymentCard } from './OfficialBankPaymentCard';
import { UNINEST_OFFICIAL_BANK } from '../utils/paymentConfig';
import { VendorDashboardView } from './VendorDashboardView';

interface MarketplaceEscrowTabProps {
  user: UniNestUser;
  items: MarketplaceItem[];
  escrows: EscrowTransaction[];
  onPostItem: (item: Omit<MarketplaceItem, 'id' | 'postedAt'>) => void;
  onInitiateEscrow: (item: MarketplaceItem) => void;
  onReleaseEscrow: (escrowId: string) => void;
  onRelistItem?: (itemId: string) => void;
}

const CAMPUS_ITEM_PRESETS = [
  { name: 'Laptop / Tech', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=80' },
  { name: 'Hostel Fridge', url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&auto=format&fit=crop&q=80' },
  { name: 'Standing Fan', url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500&auto=format&fit=crop&q=80' },
  { name: 'Gas Cooker', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80' },
  { name: 'Desk / Chair', url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=80' },
  { name: 'Textbooks', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80' }
];

export const MarketplaceEscrowTab: React.FC<MarketplaceEscrowTabProps> = ({
  user,
  items,
  escrows,
  onPostItem,
  onInitiateEscrow,
  onReleaseEscrow,
  onRelistItem
}) => {
  const safeUser = user || {
    name: 'Student',
    email: 'student@uninest.ng',
    university: 'Niger Delta University (NDU)',
    department: 'Campus',
    phone: '08000000000',
    vendorVerifiedByHead: false,
    hasSTSVendorAccount: false
  };

  const [activeSubTab, setActiveSubTab] = useState<'browse' | 'escrow' | 'my_listings' | 'vendor_dashboard'>('browse');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState<'active' | 'all' | 'expired'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [vendorFilter, setVendorFilter] = useState<'all' | 'verified_only' | 'students_only'>('all');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  // Cart State & Logic
  const [cart, setCart] = useState<{ item: MarketplaceItem; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartSuccessMsg, setCartSuccessMsg] = useState<string | null>(null);
  const [previewVendorTicker, setPreviewVendorTicker] = useState(false);

  const isVerifiedVendorUser = Boolean(
    safeUser.vendorVerifiedByHead || 
    safeUser.isVerifiedVendor || 
    safeUser.role === 'vendor' ||
    previewVendorTicker
  );

  const handleAddToCart = (item: MarketplaceItem) => {
    setCart(prev => {
      const existing = prev.find(p => p.item.id === item.id);
      if (existing) {
        return prev.map(p => p.item.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { item, quantity: 1 }];
    });
    setCartSuccessMsg(`"${item.title}" added to your Cart!`);
    setTimeout(() => setCartSuccessMsg(null), 3500);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => prev.filter(p => p.item.id !== itemId));
  };

  const handleUpdateCartQuantity = (itemId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(p => {
          if (p.item.id === itemId) {
            const nextQty = p.quantity + delta;
            return nextQty > 0 ? { ...p, quantity: nextQty } : null;
          }
          return p;
        })
        .filter(Boolean) as { item: MarketplaceItem; quantity: number }[]
    );
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, c) => acc + (c.item.price || 0) * c.quantity, 0);
  }, [cart]);

  const cartEscrowFee = useMemo(() => Math.round(cartTotal * 0.05), [cartTotal]);
  const cartGrandTotal = cartTotal + cartEscrowFee;

  const handleCartPayAndConfirm = () => {
    if (cart.length === 0) return;

    // 1. Log each cart item in escrow transactions
    cart.forEach(c => {
      onInitiateEscrow(c.item);
    });

    // 2. Dispatch comprehensive WhatsApp order notification to vendor
    const firstSeller = cart[0]?.item;
    const vendorPhone = firstSeller?.sellerPhone || '09039847154';
    const cleanPhone = vendorPhone.startsWith('+') ? vendorPhone.replace('+', '') : vendorPhone.startsWith('0') ? `234${vendorPhone.slice(1)}` : vendorPhone;

    const itemsSummary = cart
      .map((c, i) => `${i + 1}. ${c.item.title} (Qty: ${c.quantity}) - ₦${((c.item.price || 0) * c.quantity).toLocaleString()}`)
      .join('\n');

    const cartOrderMsg = `🛍️ *NEW UNINEST CART ESCROW ORDER*\n` +
      `----------------------------------------\n` +
      `• Buyer: ${safeUser.name || 'Student Buyer'} (${safeUser.email})\n` +
      `• Buyer Phone: ${safeUser.phone || '08000000000'}\n` +
      `• Campus: ${safeUser.university || 'Niger Delta University'}\n` +
      `• Items Ordered:\n${itemsSummary}\n` +
      `----------------------------------------\n` +
      `• Subtotal: ₦${cartTotal.toLocaleString()}\n` +
      `• 5% Escrow Protection Charge: ₦${cartEscrowFee.toLocaleString()}\n` +
      `• Total Escrow Deposit: ₦${cartGrandTotal.toLocaleString()}\n` +
      `• Official Escrow Account: ${UNINEST_OFFICIAL_BANK.accountNumber} (${UNINEST_OFFICIAL_BANK.bankName})\n` +
      `• Status: PENDING (Held in Escrow Vault)\n` +
      `----------------------------------------\n` +
      `Payment are sent to escrow account number and are released after confirmation or within three working days.`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(cartOrderMsg)}`, '_blank');

    setEscrowSuccess(`Order dispatched! Payment confirmation sent to WhatsApp vendor. Order shows as PENDING for both seller and buyer in escrow.`);
    setCart([]);
    setIsCartOpen(false);
    setActiveSubTab('escrow');
    setTimeout(() => setEscrowSuccess(null), 9000);
  };

  // Derive unique sellers/vendors from the items list for instant directory search & filtering
  const uniqueVendors = useMemo(() => {
    const map = new Map<string, { name: string; isVerified: boolean; count: number; campus: string }>();
    items.forEach((item) => {
      const isVerified = Boolean(item.hasVerifiedVendorTick || item.sellerRole === 'vendor');
      const key = (item.sellerName || 'Student Seller').trim();
      if (!map.has(key)) {
        map.set(key, { name: key, isVerified, count: 1, campus: item.campus });
      } else {
        const entry = map.get(key)!;
        entry.count += 1;
        if (isVerified) entry.isVerified = true;
      }
    });
    return Array.from(map.values());
  }, [items]);

  // Post Item Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemCategory, setItemCategory] = useState<MarketplaceItem['category']>('Laptops & Tech');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCondition, setItemCondition] = useState<MarketplaceItem['condition']>('Gently Used (Like New)');
  const [itemCampus, setItemCampus] = useState(safeUser.university || 'Niger Delta University (NDU)');
  const [itemDesc, setItemDesc] = useState('');
  const [itemImage, setItemImage] = useState(CAMPUS_ITEM_PRESETS[0].url);
  const [listingSellerType, setListingSellerType] = useState<'student' | 'vendor'>(
    safeUser.vendorVerifiedByHead ? 'vendor' : 'student'
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Escrow checkout modal
  const [selectedItemForEscrow, setSelectedItemForEscrow] = useState<MarketplaceItem | null>(null);
  const [escrowPaymentMethod, setEscrowPaymentMethod] = useState<'bank' | 'wallet'>('bank');
  const [escrowSuccess, setEscrowSuccess] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState<string | null>(null);
  const [autoConfirmSuccess, setAutoConfirmSuccess] = useState<string | null>(null);

  // Helper: check expiry status & remaining days
  const getDaysRemaining = (item: MarketplaceItem): { days: number; isExpired: boolean; label: string } => {
    if (!item.expiresAt) {
      return { days: 30, isExpired: item.status === 'expired', label: '30 days left' };
    }
    const today = new Date();
    const expiry = new Date(item.expiresAt);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0 || item.status === 'expired') {
      return { days: 0, isExpired: true, label: 'Expired' };
    }
    if (diffDays === 1) {
      return { days: 1, isExpired: false, label: 'Expires tomorrow' };
    }
    return { days: diffDays, isExpired: false, label: `${diffDays} days left` };
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    const isVerifiedVendor = Boolean(item.hasVerifiedVendorTick || item.sellerRole === 'vendor');

    // Vendor verification filter
    let matchVendorType = true;
    if (vendorFilter === 'verified_only') matchVendorType = isVerifiedVendor;
    if (vendorFilter === 'students_only') matchVendorType = !isVerifiedVendor;

    // Selected specific vendor
    let matchSelectedVendor = true;
    if (selectedVendor) {
      matchSelectedVendor = (item.sellerName || '').toLowerCase().trim() === selectedVendor.toLowerCase().trim();
    }

    // Vendor search query
    let matchVendorSearch = true;
    if (vendorSearchQuery.trim()) {
      const vq = vendorSearchQuery.toLowerCase().trim();
      matchVendorSearch = (item.sellerName || '').toLowerCase().includes(vq);
    }

    // General search query
    let matchSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      matchSearch = item.title.toLowerCase().includes(q) ||
                    item.description.toLowerCase().includes(q) ||
                    item.campus.toLowerCase().includes(q) ||
                    (item.sellerName || '').toLowerCase().includes(q) ||
                    item.category.toLowerCase().includes(q);
    }
    
    const expiryInfo = getDaysRemaining(item);
    let matchExpiry = true;
    if (expiryFilter === 'active') {
      matchExpiry = !expiryInfo.isExpired && item.status !== 'expired';
    } else if (expiryFilter === 'expired') {
      matchExpiry = expiryInfo.isExpired || item.status === 'expired';
    }

    return matchCat && matchVendorType && matchSelectedVendor && matchVendorSearch && matchSearch && matchExpiry;
  });

  const myListings = items.filter(i => i.sellerEmail.toLowerCase() === safeUser.email.toLowerCase());
  const myEscrows = escrows.filter(
    e => e.buyerEmail.toLowerCase() === safeUser.email.toLowerCase() || 
         e.sellerEmail.toLowerCase() === safeUser.email.toLowerCase()
  );

  const processImageFile = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      alert('Photo is too large. Please upload an image under 8MB.');
      return;
    }
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setItemImage(uploadEvent.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(itemPrice);
    if (!itemTitle.trim() || priceNum <= 0) return;

    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const isVerifiedVendor = Boolean(safeUser.vendorVerifiedByHead && listingSellerType === 'vendor');

    onPostItem({
      sellerEmail: safeUser.email,
      sellerName: safeUser.name || 'Campus Member',
      sellerPhone: safeUser.phone || '08000000000',
      title: itemTitle.trim(),
      category: itemCategory,
      price: priceNum,
      condition: itemCondition,
      campus: itemCampus,
      description: itemDesc.trim(),
      image: itemImage || CAMPUS_ITEM_PRESETS[0].url,
      isEscrowProtected: true,
      status: 'available',
      expiresAt: expires.toISOString().split('T')[0],
      sellerRole: listingSellerType,
      hasVerifiedVendorTick: isVerifiedVendor,
      isVendorListing: isVerifiedVendor
    });

    // DIRECT PLATFORM POSTING (Strict Requirement: Post directly to platform, NOT WhatsApp)
    setPostSuccess(`Your ${listingSellerType === 'vendor' ? 'Vendor' : 'Student'} listing "${itemTitle.trim()}" has been posted directly to the UniNest Platform! No WhatsApp redirect required. Escrow protection is active.`);
    setShowPostModal(false);
    setItemTitle('');
    setItemPrice('');
    setItemDesc('');
    setUploadedFileName(null);
    setTimeout(() => setPostSuccess(null), 8000);
  };

  const handleOpenEscrowCheckout = (item: MarketplaceItem) => {
    setSelectedItemForEscrow(item);
  };

  const handleConfirmEscrowVaultDeposit = () => {
    if (!selectedItemForEscrow) return;
    const item = selectedItemForEscrow;
    onInitiateEscrow(item);

    const safePrice = item.price || 0;
    const escrowFee = Math.round(safePrice * 0.05);
    const totalDeposit = safePrice + escrowFee;

    const escrowMsg = `🛡️ *UNINEST SAFE ESCROW TRANSACTION ORDER*\n` +
      `----------------------------------------\n` +
      `• Item Title: ${item.title}\n` +
      `• Item Price: ₦${safePrice.toLocaleString()}\n` +
      `• Total Escrow Deposit: ₦${totalDeposit.toLocaleString()}\n` +
      `• Escrow Account Number: ${UNINEST_OFFICIAL_BANK.accountNumber} (${UNINEST_OFFICIAL_BANK.bankName})\n` +
      `• Release Policy: Payment are sent to escrow account number and released after confirmation or within three working days.\n` +
      `• Buyer: ${safeUser.name || 'Student Buyer'} (${safeUser.email})\n` +
      `• Seller: ${item.sellerName}\n` +
      `----------------------------------------`;

    window.open(`https://wa.me/2349039847154?text=${encodeURIComponent(escrowMsg)}`, '_blank');

    setEscrowSuccess(`Escrow Vault Funded! ₦${totalDeposit.toLocaleString()} safely secured in escrow account (${UNINEST_OFFICIAL_BANK.accountNumber}). Released after confirmation or within three working days.`);
    setSelectedItemForEscrow(null);
    setActiveSubTab('escrow');
    setTimeout(() => setEscrowSuccess(null), 8000);
  };

  const handleSimulateAutoConfirm = (escrowId: string, itemTitle: string, amount: number) => {
    onReleaseEscrow(escrowId);
    setAutoConfirmSuccess(`Escrow Payment Released! 3 working days window cleared with zero disputes. ₦${amount.toLocaleString()} disbursed to seller's account.`);
    setTimeout(() => setAutoConfirmSuccess(null), 8000);
  };

  return (
    <div className="space-y-6 text-[#0A1931]">
      {/* Top Banner: Strictly #0A1931, #FF6A00, #FFFFFF */}
      <div className="p-6 rounded-3xl bg-[#0A1931] text-white shadow-lg relative border-2 border-[#0A1931] overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#FF6A00] text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                Official Escrow Account
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold border border-white/20">
                3 Working Days Release Policy
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Campus Marketplace &amp; Escrow
            </h2>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              Payment are sent to escrow account number (<strong>{UNINEST_OFFICIAL_BANK.accountNumber}</strong>) and are released after confirmation or within three working days. Students and vendors can list products, but only vendors confirmed by the Head of Marketplace display the verified tick.
            </p>
          </div>

          <button
            onClick={() => setShowPostModal(true)}
            id="btn-post-marketplace-item"
            className="px-6 py-3.5 rounded-2xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Post an Item on Campus</span>
          </button>
        </div>
      </div>

      {/* Strict Escrow Information Highlight Card */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] border-2 border-[#0A1931]/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A1931] text-[#FF6A00] flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-[#0A1931] block">
              Official Escrow Vault: {UNINEST_OFFICIAL_BANK.accountNumber} ({UNINEST_OFFICIAL_BANK.bankName})
            </span>
            <span className="text-[#0A1931]/70 block">
              Payment are sent to escrow account number and released after confirmation or within 3 working days.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full bg-[#0A1931]/5 text-[#0A1931] font-black border border-[#0A1931]/20 text-[11px]">
            Tick Policy: Head of Marketplace Verified Only
          </span>
        </div>
      </div>

      {/* Success Notifications */}
      {postSuccess && (
        <div className="p-4 rounded-2xl bg-[#0A1931] text-white text-xs font-bold flex items-center gap-2 shadow-sm border border-[#FF6A00]">
          <CheckCircle2 className="w-4 h-4 text-[#FF6A00] shrink-0" />
          <span>{postSuccess}</span>
        </div>
      )}

      {escrowSuccess && (
        <div className="p-4 rounded-2xl bg-[#0A1931] text-white text-xs font-bold flex items-center gap-2 shadow-sm border border-[#FF6A00]">
          <ShieldCheck className="w-4 h-4 text-[#FF6A00] shrink-0" />
          <span>{escrowSuccess}</span>
        </div>
      )}

      {autoConfirmSuccess && (
        <div className="p-4 rounded-2xl bg-[#0A1931] text-white text-xs font-bold flex items-center gap-2 shadow-sm border border-[#FF6A00]">
          <Check className="w-4 h-4 text-[#FF6A00] shrink-0" />
          <span>{autoConfirmSuccess}</span>
        </div>
      )}

      {/* Sub Tabs: Browse | Active Escrow Deals | My Listings */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0A1931]/15 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('browse')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'browse'
                ? 'bg-[#0A1931] text-white shadow-xs'
                : 'bg-[#FFFFFF] text-[#0A1931] hover:bg-[#0A1931]/5 border border-[#0A1931]/20'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Browse Deals ({filteredItems.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('escrow')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'escrow'
                ? 'bg-[#0A1931] text-white shadow-xs'
                : 'bg-[#FFFFFF] text-[#0A1931] hover:bg-[#0A1931]/5 border border-[#0A1931]/20'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Escrow Vaults ({myEscrows.length})</span>
            {myEscrows.some(e => e.status !== 'Payment Released to Seller') && (
              <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('my_listings')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'my_listings'
                ? 'bg-[#0A1931] text-white shadow-xs'
                : 'bg-[#FFFFFF] text-[#0A1931] hover:bg-[#0A1931]/5 border border-[#0A1931]/20'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>My Listings ({myListings.length})</span>
          </button>

          {/* Specialized Vendor Dashboard (Only for users with verified vendor ticker) */}
          {isVerifiedVendorUser && (
            <button
              onClick={() => setActiveSubTab('vendor_dashboard')}
              id="btn-subtab-vendor-dashboard"
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'vendor_dashboard'
                  ? 'bg-[#0A1931] text-white shadow-xs border-2 border-[#FF6A00]'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Vendor Dashboard</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6A00]" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cart Button with Counter */}
          <button
            onClick={() => setIsCartOpen(true)}
            id="btn-open-shopping-cart"
            className="px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer bg-[#FF6A00] hover:bg-[#E55E00] text-white shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Cart ({cart.reduce((a, c) => a + c.quantity, 0)})</span>
            {cartTotal > 0 && (
              <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-md font-mono">
                ₦{cartTotal.toLocaleString()}
              </span>
            )}
          </button>

          {/* Testing Switcher: Toggle Verified Vendor Ticker */}
          <button
            type="button"
            onClick={() => {
              setPreviewVendorTicker(!previewVendorTicker);
              if (!previewVendorTicker) setActiveSubTab('vendor_dashboard');
            }}
            id="btn-toggle-vendor-ticker-preview"
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
              isVerifiedVendorUser
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Toggle vendor verification to test Vendor Dashboard view"
          >
            <Store className="w-3 h-3 text-[#FF6A00]" />
            <span>{isVerifiedVendorUser ? 'Vendor Ticker: Active ✔' : 'Preview Vendor View'}</span>
          </button>
        </div>

        {/* Search Inputs */}
        {activeSubTab === 'browse' && (
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
            {/* Product / Campus Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#0A1931]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products or campus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#0A1931]/20 text-xs bg-[#FFFFFF] text-[#0A1931] focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            {/* Dedicated Vendor Search */}
            <div className="relative w-full sm:w-56">
              <Store className="w-3.5 h-3.5 text-[#FF6A00] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search for vendor..."
                value={vendorSearchQuery}
                onChange={(e) => setVendorSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#FF6A00]/40 text-xs bg-[#FFFFFF] text-[#0A1931] focus:outline-none focus:border-[#FF6A00]"
              />
              {vendorSearchQuery && (
                <button
                  type="button"
                  onClick={() => setVendorSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0A1931]/50 hover:text-[#0A1931] cursor-pointer"
                  title="Clear vendor search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= VIEW 1: BROWSE CAMPUS LISTINGS ================= */}
      {activeSubTab === 'browse' && (
        <div className="space-y-4">
          {/* Vendor & Seller Filter Strip */}
          <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#0A1931]/15 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#FF6A00]" />
                <span className="text-xs font-black text-[#0A1931]">Vendor &amp; Seller Filters:</span>
              </div>

              {/* Vendor Type Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setVendorFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    vendorFilter === 'all'
                      ? 'bg-[#0A1931] text-white shadow-xs'
                      : 'bg-[#0A1931]/5 text-[#0A1931] hover:bg-[#0A1931]/10 border border-[#0A1931]/10'
                  }`}
                >
                  All Sellers ({items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setVendorFilter('verified_only')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                    vendorFilter === 'verified_only'
                      ? 'bg-[#FF6A00] text-white shadow-xs'
                      : 'bg-[#FFFFFF] text-[#FF6A00] hover:bg-[#FF6A00]/10 border border-[#FF6A00]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Vendors Only ✔ ({items.filter(i => i.hasVerifiedVendorTick || i.sellerRole === 'vendor').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVendorFilter('students_only')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    vendorFilter === 'students_only'
                      ? 'bg-[#0A1931] text-white shadow-xs'
                      : 'bg-[#0A1931]/5 text-[#0A1931] hover:bg-[#0A1931]/10 border border-[#0A1931]/10'
                  }`}
                >
                  Student Sellers ({items.filter(i => !i.hasVerifiedVendorTick && i.sellerRole !== 'vendor').length})
                </button>
              </div>
            </div>

            {/* Quick Campus Vendors Directory Chips */}
            {uniqueVendors.length > 0 && (
              <div className="pt-2 border-t border-[#0A1931]/10 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#0A1931]/70 mr-1 flex items-center gap-1">
                  <span>Campus Vendors:</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedVendor(null)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    selectedVendor === null
                      ? 'bg-[#0A1931] text-white'
                      : 'bg-[#0A1931]/5 text-[#0A1931] hover:bg-[#0A1931]/10'
                  }`}
                >
                  All Vendors
                </button>

                {uniqueVendors.map((vendor) => (
                  <button
                    key={vendor.name}
                    type="button"
                    onClick={() => setSelectedVendor(selectedVendor === vendor.name ? null : vendor.name)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border ${
                      selectedVendor === vendor.name
                        ? 'bg-[#FF6A00] text-white border-[#FF6A00] shadow-xs'
                        : vendor.isVerified
                        ? 'bg-white text-[#0A1931] border-[#FF6A00]/40 hover:border-[#FF6A00]'
                        : 'bg-white text-[#0A1931] border-[#0A1931]/15 hover:border-[#0A1931]/30'
                    }`}
                  >
                    <span>{vendor.name}</span>
                    {vendor.isVerified && (
                      <span className="inline-flex items-center text-[#FF6A00] font-black group-hover:text-white">
                        {selectedVendor === vendor.name ? '✔' : '✔'}
                      </span>
                    )}
                    <span className="opacity-70 text-[10px]">({vendor.count})</span>
                  </button>
                ))}
              </div>
            )}

            {/* Active Vendor Filter Feedback Banner */}
            {(selectedVendor || vendorSearchQuery || vendorFilter !== 'all') && (
              <div className="p-2.5 rounded-xl bg-[#0A1931] text-white text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#FF6A00]">Active Filter:</span>
                  {selectedVendor && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FF6A00] text-white font-bold text-[11px]">
                      Vendor: {selectedVendor}
                    </span>
                  )}
                  {vendorSearchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 text-white font-bold text-[11px]">
                      Vendor Search: &ldquo;{vendorSearchQuery}&rdquo;
                    </span>
                  )}
                  {vendorFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-white font-bold text-[11px]">
                      {vendorFilter === 'verified_only' ? 'Verified Vendors Only ✔' : 'Student Sellers Only'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVendor(null);
                    setVendorSearchQuery('');
                    setVendorFilter('all');
                  }}
                  className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-black transition cursor-pointer shrink-0"
                >
                  Clear All Filters ✕
                </button>
              </div>
            )}
          </div>
          {filteredItems.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#0A1931] border border-slate-800 text-center space-y-4 text-slate-300">
              <div className="w-14 h-14 rounded-2xl bg-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h4 className="text-base font-bold text-white">No Marketplace Items Listed Yet</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All demo goods have been cleared. Be the first student or verified campus vendor to post items with 100% Escrow Protection.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPostModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs transition cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Your First Item</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map(item => {
                const expiryInfo = getDaysRemaining(item);
                const isMyItem = item.sellerEmail.toLowerCase() === safeUser.email.toLowerCase();
                const escrowFee = Math.round((item.price || 0) * 0.05);
                const totalWithEscrow = (item.price || 0) + escrowFee;
                const isVendorWithTick = item.hasVerifiedVendorTick || item.sellerRole === 'vendor';

                return (
                  <div
                    key={item.id}
                    className="rounded-3xl bg-[#FFFFFF] border-2 border-[#0A1931]/15 overflow-hidden shadow-xs hover:border-[#FF6A00] transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative h-48 bg-[#0A1931]/5 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-[#0A1931] text-white text-[10px] font-black">
                            {item.campus}
                          </span>
                        </div>

                        {/* Verified Vendor Tick or Student Badge */}
                        <div className="absolute top-3 right-3">
                          {isVendorWithTick ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF6A00] text-white text-[10px] font-black shadow-md">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>Verified Vendor ✔</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0A1931]/80 text-white text-[10px] font-semibold backdrop-blur-xs">
                              <span>Student Seller</span>
                            </span>
                          )}
                        </div>

                        {/* Escrow Banner */}
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-[#0A1931]/90 text-white text-[10px] font-bold flex items-center gap-1 border border-white/20">
                          <ShieldCheck className="w-3 h-3 text-[#FF6A00]" />
                          <span>3-Day Escrow Protected</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2 text-[#0A1931]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#FF6A00]">{item.category}</span>
                          <span className="text-[11px] text-[#0A1931]/60 font-medium">{item.condition}</span>
                        </div>

                        <h3 className="font-black text-sm text-[#0A1931] line-clamp-1">
                          {item.title}
                        </h3>

                        <p className="text-xs text-[#0A1931]/75 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Price & Seller */}
                        <div className="pt-2 border-t border-[#0A1931]/10 flex items-baseline justify-between">
                          <div>
                            <span className="text-lg font-black text-[#0A1931]">
                              ₦{(item.price || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-[#0A1931]/60 block font-medium">
                              Total w/ Escrow: <strong className="text-[#FF6A00]">₦{totalWithEscrow.toLocaleString()}</strong>
                            </span>
                          </div>
                          <div className="text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVendor(item.sellerName || null);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-[10px] text-[#0A1931] hover:text-[#FF6A00] block font-bold cursor-pointer transition hover:underline"
                              title={`Filter listings by ${item.sellerName || 'this seller'}`}
                            >
                              {item.sellerName || 'Student'}
                            </button>
                            {isVendorWithTick && (
                              <span className="text-[9px] text-[#FF6A00] font-black flex items-center justify-end gap-0.5">
                                <span>STS Vendor Account</span>
                                <CheckCircle2 className="w-2.5 h-2.5 inline text-[#FF6A00]" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Add to Cart & Buy with Safe Escrow */}
                    <div className="p-4 pt-0">
                      {isMyItem ? (
                        <div className="py-2.5 rounded-xl bg-[#0A1931]/5 text-[#0A1931] text-xs font-bold text-center border border-[#0A1931]/10">
                          Your Listing ({expiryInfo.label})
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item)}
                            id={`btn-add-to-cart-${item.id}`}
                            className="py-2.5 px-2.5 rounded-xl bg-[#0A1931] hover:bg-[#152847] text-white font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 text-[#FF6A00]" />
                            <span>Add to Cart</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEscrowCheckout(item)}
                            id={`btn-buy-escrow-${item.id}`}
                            className="py-2.5 px-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-white" />
                            <span>Buy with Escrow</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 2: ACTIVE ESCROW VAULTS ================= */}
      {activeSubTab === 'escrow' && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#0A1931]/15 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0A1931]/10 pb-4">
            <div>
              <h3 className="text-base font-black text-[#0A1931] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#FF6A00]" />
                <span>Active Escrow Protection Vaults ({myEscrows.length})</span>
              </h3>
              <p className="text-xs text-[#0A1931]/70">
                Payment are sent to escrow account number (<strong>{UNINEST_OFFICIAL_BANK.accountNumber}</strong>) and are released after confirmation or within three working days.
              </p>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-[#0A1931] text-white text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>3 Working Days Policy</span>
            </div>
          </div>

          {myEscrows.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#0A1931]/60 space-y-2">
              <ShieldCheck className="w-12 h-12 text-[#0A1931]/30 mx-auto" />
              <p className="font-bold text-[#0A1931]">No active escrow transactions.</p>
              <p>Browse campus items and click &quot;Buy with Safe Escrow&quot; to test the protection.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myEscrows.map((esc) => {
                const isBuyer = esc.buyerEmail.toLowerCase() === safeUser.email.toLowerCase();
                const escrowFee = esc.escrowFee || Math.round(esc.amount * 0.05);
                const totalAmount = esc.totalAmount || (esc.amount + escrowFee);
                const isCompleted = esc.status === 'Payment Released to Seller';

                return (
                  <div 
                    key={esc.id} 
                    className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#0A1931]/15 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#0A1931] text-white text-[11px] font-bold">
                          {isBuyer ? 'You are Buyer' : 'You are Seller'}
                        </span>
                        <span className="text-xs text-[#0A1931]/50 font-mono">Deal #{esc.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                          isCompleted 
                            ? 'bg-[#0A1931] text-white' 
                            : 'bg-[#FF6A00] text-white'
                        }`}>
                          🔒 {esc.status}
                        </span>
                      </div>

                      <h4 className="font-black text-sm sm:text-base text-[#0A1931]">
                        {esc.itemTitle}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#0A1931]/80">
                        <span>Campus: <strong>{esc.campus}</strong></span>
                        <span>•</span>
                        <span>Price: <strong>₦{(esc.amount || 0).toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Escrow Fee: <strong>₦{(escrowFee || 0).toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Total Deposit: <strong className="text-[#FF6A00]">₦{(totalAmount || 0).toLocaleString()}</strong></span>
                      </div>

                      <div className="text-[11px] text-[#0A1931]/70 flex items-center gap-2">
                        <span>Escrow Account: <strong>{UNINEST_OFFICIAL_BANK.accountNumber}</strong> ({UNINEST_OFFICIAL_BANK.bankName})</span>
                        <span>•</span>
                        <span>Auto-Release: 3 Working Days Rule</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {!isCompleted && (
                        <>
                          {isBuyer ? (
                            <button
                              onClick={() => handleSimulateAutoConfirm(esc.id, esc.itemTitle, esc.amount)}
                              className="px-4 py-2.5 rounded-xl bg-[#0A1931] hover:bg-[#0A1931]/90 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-4 h-4 text-[#FF6A00]" />
                              <span>Confirm Item &amp; Release Payment</span>
                            </button>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-[#0A1931]/5 text-[#0A1931] text-xs font-bold border border-[#0A1931]/15">
                              ⏳ Awaiting buyer inspection (or 3 working days auto-release)
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 3: MY LISTINGS ================= */}
      {activeSubTab === 'my_listings' && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#0A1931]/15 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#0A1931]/10 pb-3">
            <h3 className="text-base font-black text-[#0A1931]">My Product Listings ({myListings.length})</h3>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-4 py-2 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Listing</span>
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#0A1931]/60">
              You haven&apos;t listed any items yet. Both students and verified vendors can list products!
            </div>
          ) : (
            <div className="space-y-3">
              {myListings.map(item => (
                <div 
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#0A1931]/15 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-[#0A1931]">{item.title}</h4>
                      <p className="text-[#0A1931]/60">₦{(item.price || 0).toLocaleString()} • {item.campus}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.hasVerifiedVendorTick ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#FF6A00] text-white text-[10px] font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Vendor Tick
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-[#0A1931]/10 text-[#0A1931] text-[10px] font-bold">
                        Student Listing
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 4: SPECIALIZED VENDOR DASHBOARD ================= */}
      {activeSubTab === 'vendor_dashboard' && (
        <div className="pt-2">
          <VendorDashboardView
            user={safeUser}
            pendingOrders={myEscrows}
            onConfirmOrderHandover={(orderId) => {
              onReleaseEscrow(orderId);
            }}
          />
        </div>
      )}

      {/* ================= SHOPPING CART DRAWER / MODAL ================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/80 backdrop-blur-xs flex items-center justify-center sm:justify-end p-0 sm:p-4">
          <div className="bg-white text-[#0A1931] w-full max-w-md h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl shadow-2xl border-2 border-[#0A1931] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Cart Header */}
            <div className="p-5 bg-[#0A1931] text-white flex items-center justify-between border-b border-[#0A1931]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF6A00] flex items-center justify-center font-bold text-white shadow-xs">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    Campus Shopping Cart
                  </h3>
                  <p className="text-[11px] text-white/75">
                    {cart.reduce((a, c) => a + c.quantity, 0)} item(s) selected
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-3">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-[#0A1931] text-sm">Your Cart is Empty</p>
                  <p className="max-w-xs mx-auto">
                    Browse campus items and tap &quot;Add to Cart&quot; to shop from verified vendors and campus students.
                  </p>
                </div>
              ) : (
                cart.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-[#0A1931] truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        Seller: {item.sellerName} • {item.campus}
                      </p>
                      <div className="text-xs font-black text-[#FF6A00] mt-0.5">
                        ₦{(item.price || 0).toLocaleString()}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateCartQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-black font-mono w-4 text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateCartQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center transition ml-1 cursor-pointer"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer & Checkout */}
            {cart.length > 0 && (
              <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal:</span>
                    <span className="font-bold text-[#0A1931]">₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#FF6A00] font-bold">
                    <span>5% Escrow Protection Charge:</span>
                    <span>+₦{cartEscrowFee.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-slate-200 my-1" />
                  <div className="flex justify-between text-base font-black text-[#0A1931]">
                    <span>Total Deposit:</span>
                    <span className="text-[#FF6A00]">₦{cartGrandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[10.5px] text-amber-900 leading-tight">
                  🛡️ <strong>Escrow &amp; WhatsApp Flow:</strong> When you tap Pay, order confirmation is sent to the WhatsApp vendor. The order is recorded as <strong>PENDING</strong> in escrow for both buyer and seller until delivery handover is confirmed.
                </div>

                <button
                  type="button"
                  onClick={handleCartPayAndConfirm}
                  id="btn-cart-pay-and-confirm"
                  className="w-full py-3.5 rounded-2xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md shadow-[#FF6A00]/25 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Tap Pay &amp; Confirm (Send to WhatsApp Vendor)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: POST ITEM ON CAMPUS ================= */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] text-[#0A1931] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border-2 border-[#0A1931] my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#0A1931]/10 pb-3">
              <div>
                <h3 className="font-black text-base text-[#0A1931]">List Product on Campus</h3>
                <p className="text-[11px] text-[#0A1931]/70">Students and vendors can list items</p>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-[#0A1931]/50 hover:text-[#0A1931] font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Essential Directive Notice */}
            <div className="p-3.5 rounded-2xl bg-[#0A1931] text-white space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#FF6A00]">
                <Info className="w-4 h-4" />
                <span>Direct Platform Posting &amp; Vendor Tick Rules:</span>
              </div>
              <p className="text-white/85 text-[11px] leading-relaxed">
                <strong>Posted Directly to Platform:</strong> All student and vendor listings are published directly into the UniNest Platform feed (no WhatsApp redirect). Both students and vendors can list items; only verified vendors receive the official verification tick once confirmed by the Head of Marketplace.
              </p>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-3 text-xs">
              {/* Seller Type Selector */}
              <div>
                <label className="block text-[11px] font-bold text-[#0A1931] mb-1">Listing Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setListingSellerType('student')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                      listingSellerType === 'student'
                        ? 'bg-[#0A1931] text-white border-[#0A1931]'
                        : 'bg-white text-[#0A1931] border-[#0A1931]/20 hover:bg-[#0A1931]/5'
                    }`}
                  >
                    Student Listing
                  </button>
                  <button
                    type="button"
                    onClick={() => setListingSellerType('vendor')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer flex items-center justify-center gap-1 ${
                      listingSellerType === 'vendor'
                        ? 'bg-[#FF6A00] text-white border-[#FF6A00]'
                        : 'bg-white text-[#0A1931] border-[#0A1931]/20 hover:bg-[#0A1931]/5'
                    }`}
                  >
                    <span>Vendor Listing</span>
                    {safeUser.vendorVerifiedByHead && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {listingSellerType === 'vendor' && !safeUser.vendorVerifiedByHead && (
                  <p className="text-[10px] text-[#FF6A00] font-bold mt-1">
                    Notice: The Verified Vendor Tick will be activated once your verification is approved by the Head of Marketplace.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0A1931] mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HP ProBook 450 G6 (Core i5, 16GB RAM)"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#0A1931]/20 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0A1931] mb-1">Category *</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#0A1931]/20 focus:outline-none focus:border-[#FF6A00]"
                  >
                    <option value="Laptops & Tech">Laptops &amp; Tech</option>
                    <option value="Hostel Gadgets">Hostel Gadgets</option>
                    <option value="Textbooks & Notes">Textbooks &amp; Notes</option>
                    <option value="Cooking & Gas">Cooking &amp; Gas</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Fashion & Shoes">Fashion &amp; Shoes</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0A1931] mb-1">Asking Price (₦) *</label>
                  <input
                    type="number"
                    required
                    min="500"
                    placeholder="e.g. 85000"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#0A1931]/20 focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0A1931] mb-1">Campus Location *</label>
                <input
                  type="text"
                  required
                  value={itemCampus}
                  onChange={(e) => setItemCampus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#0A1931]/20 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0A1931] mb-1">Description &amp; Condition Details</label>
                <textarea
                  rows={2}
                  placeholder="Details about working condition, charger, accessories..."
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#0A1931]/20 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              {/* Space to Load Picture of Item they want to sell */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-[#0A1931]/5 border-2 border-dashed border-[#0A1931]/20">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-[#0A1931] flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#FF6A00]" />
                    <span>Item Picture / Photo *</span>
                  </label>
                  <span className="text-[10px] text-[#0A1931]/60 font-medium">Max 8MB (JPG, PNG, WEBP)</span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                {/* Loaded Picture Preview or Drag & Drop Zone */}
                {itemImage ? (
                  <div className="space-y-2">
                    <div className="relative h-40 rounded-xl overflow-hidden border-2 border-[#FF6A00] bg-black/10">
                      <img
                        src={itemImage}
                        alt="Loaded Item"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-[#0A1931] text-white text-[10px] font-black flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3 h-3 text-[#FF6A00]" />
                        <span>Picture Loaded</span>
                      </div>
                      {uploadedFileName && (
                        <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-md bg-[#0A1931]/90 text-white text-[10px] font-medium truncate backdrop-blur-xs">
                          {uploadedFileName}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-1.5 rounded-xl bg-[#0A1931] text-white text-[11px] font-bold hover:bg-[#0A1931]/80 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#FF6A00]" />
                        <span>Replace Picture</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setItemImage('');
                          setUploadedFileName(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white text-[#0A1931] border border-[#0A1931]/20 text-[11px] font-bold hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 rounded-xl border-2 border-dashed text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-[#FF6A00] bg-[#FF6A00]/10'
                        : 'border-[#0A1931]/30 hover:border-[#FF6A00] bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0A1931]/5 text-[#FF6A00] flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#0A1931] block">
                        Click to load picture from device or drag &amp; drop
                      </span>
                      <span className="text-[10px] text-[#0A1931]/60 block mt-0.5">
                        Snap a photo with your phone camera or select from gallery
                      </span>
                    </div>
                  </div>
                )}

                {/* Campus Item Presets */}
                <div className="pt-2 border-t border-[#0A1931]/10 space-y-1.5">
                  <span className="text-[10px] font-black text-[#0A1931]/70 block">
                    Or choose quick campus item photo preset:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {CAMPUS_ITEM_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setItemImage(preset.url);
                          setUploadedFileName(`Preset: ${preset.name}`);
                        }}
                        className={`p-1.5 rounded-xl border text-[10px] font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                          itemImage === preset.url
                            ? 'bg-[#FF6A00] text-white border-[#FF6A00] shadow-xs'
                            : 'bg-white text-[#0A1931] border-[#0A1931]/15 hover:border-[#FF6A00]'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-8 object-cover rounded-md"
                        />
                        <span className="truncate w-full text-center text-[9px]">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Image URL Option */}
                <div className="pt-1">
                  <div className="relative">
                    <ImageIcon className="w-3 h-3 text-[#0A1931]/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="Or paste direct image URL (https://...)"
                      value={itemImage.startsWith('data:') ? '' : itemImage}
                      onChange={(e) => {
                        setItemImage(e.target.value);
                        setUploadedFileName(e.target.value ? 'Direct Image URL' : null);
                      }}
                      className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-[#0A1931]/15 text-[11px] bg-white text-[#0A1931] focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#0A1931]/10">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1931]/60 hover:text-[#0A1931] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#E55E00] text-white font-black text-xs shadow-md transition cursor-pointer"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ESCROW CHECKOUT ================= */}
      {selectedItemForEscrow && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#FFFFFF] text-[#0A1931] rounded-3xl p-6 space-y-4 shadow-2xl border-2 border-[#0A1931] my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#0A1931]/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#0A1931] text-[#FF6A00] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0A1931]">Safe Escrow Checkout</h3>
                  <p className="text-[11px] text-[#0A1931]/70">Escrow Vault: {UNINEST_OFFICIAL_BANK.accountNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedItemForEscrow(null)}
                className="text-[#0A1931]/50 hover:text-[#0A1931] font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Directive Reminder */}
            <div className="p-3.5 rounded-2xl bg-[#0A1931] text-white text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#FF6A00]">
                <Clock className="w-4 h-4 text-[#FF6A00]" />
                <span>Escrow Release Terms</span>
              </div>
              <p className="text-white/90 text-[11px] leading-relaxed">
                Payment are sent to escrow account number (<strong>{UNINEST_OFFICIAL_BANK.accountNumber}</strong>) and are released after confirmation or within three working days.
              </p>
            </div>

            {/* Price breakdown */}
            <div className="p-3.5 rounded-2xl bg-[#0A1931]/5 border border-[#0A1931]/15 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>Item Price:</span>
                <span className="font-bold">₦{(selectedItemForEscrow.price || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#FF6A00] font-bold">
                <span>5% Escrow Protection Charge:</span>
                <span>+₦{Math.round((selectedItemForEscrow.price || 0) * 0.05).toLocaleString()}</span>
              </div>
              <div className="h-px bg-[#0A1931]/10 my-1" />
              <div className="flex justify-between text-sm font-black text-[#0A1931]">
                <span>Total Escrow Deposit:</span>
                <span className="text-[#FF6A00]">
                  ₦{((selectedItemForEscrow.price || 0) + Math.round((selectedItemForEscrow.price || 0) * 0.05)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment card with proof of payment upload and go-back option */}
            <div className="pt-1">
              <OfficialBankPaymentCard
                amount={(selectedItemForEscrow.price || 0) + Math.round((selectedItemForEscrow.price || 0) * 0.05)}
                purpose={`Escrow Vault: ${selectedItemForEscrow.title}`}
                studentName={safeUser.name}
                studentEmail={safeUser.email}
                studentPhone={safeUser.phone}
                university={safeUser.university}
                showCardTitle={false}
                isEscrowPayment={true}
                paymentCategory="marketplace_escrow"
                onCancel={() => setSelectedItemForEscrow(null)}
                cancelButtonLabel="Decide Not to Pay / Return to Marketplace"
                onPaymentSubmitted={handleConfirmEscrowVaultDeposit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
