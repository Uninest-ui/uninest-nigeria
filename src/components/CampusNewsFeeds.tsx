import React, { useState } from 'react';
import { 
  Newspaper, 
  ExternalLink, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  Share2, 
  Bookmark, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Globe
} from 'lucide-react';
import { NewsItem } from '../types';

interface CampusNewsFeedsProps {
  news: NewsItem[];
}

export const CampusNewsFeeds: React.FC<CampusNewsFeedsProps> = ({ news }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSource, setActiveSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedNewsIds, setSavedNewsIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique legit sources
  const publishers = [
    { id: 'all', name: 'All Legit Feeds' },
    { id: 'punch', name: 'Punch Nigeria' },
    { id: 'premium_times', name: 'Premium Times' },
    { id: 'vanguard', name: 'Vanguard' },
    { id: 'the_cable', name: 'The Cable' },
    { id: 'daily_post', name: 'Daily Post' },
    { id: 'ptdf', name: 'PTDF & FG' }
  ];

  const categories = [
    { id: 'all', label: 'All Updates' },
    { id: 'scholarship', label: 'Scholarships & Grants 🎓' },
    { id: 'strike', label: 'ASUU & Strike Alerts 🛑' },
    { id: 'school', label: 'Admissions & Cut-Offs 🏫' },
    { id: 'service', label: 'Campus Services & STS 💡' }
  ];

  const filteredNews = news.filter((item) => {
    // Type/Category filter
    const matchCat = activeCategory === 'all' || item.type === activeCategory;

    // Source filter
    let matchSource = true;
    if (activeSource === 'punch') {
      matchSource = (item.sourceName || '').toLowerCase().includes('punch') || item.title.toLowerCase().includes('punch');
    } else if (activeSource === 'premium_times') {
      matchSource = (item.sourceName || '').toLowerCase().includes('premium') || item.title.toLowerCase().includes('premium');
    } else if (activeSource === 'vanguard') {
      matchSource = (item.sourceName || '').toLowerCase().includes('vanguard') || item.title.toLowerCase().includes('vanguard');
    } else if (activeSource === 'the_cable') {
      matchSource = (item.sourceName || '').toLowerCase().includes('cable') || item.title.toLowerCase().includes('cable');
    } else if (activeSource === 'daily_post') {
      matchSource = (item.sourceName || '').toLowerCase().includes('daily') || item.title.toLowerCase().includes('daily');
    } else if (activeSource === 'ptdf') {
      matchSource = (item.sourceName || '').toLowerCase().includes('ptdf') || item.title.toLowerCase().includes('ptdf') || item.title.toLowerCase().includes('fg');
    }

    // Search query
    const matchSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.school || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sourceName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchCat && matchSource && matchSearch;
  });

  const toggleSave = (id: string) => {
    setSavedNewsIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleShare = (item: NewsItem) => {
    const text = `${item.title} - Read live verified news on ${item.sourceName || 'UniNest'}: ${item.link || item.sourceUrl || window.location.href}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-black uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Verified Journalistic News Wire</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Campus News &amp; Legit Educational Feeds</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                Live Online Feeds
              </span>
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl">
              Connected directly to official Nigerian national dailies (Punch, Premium Times, Vanguard, The Cable, Daily Post) and Federal Scholarship boards. Filter by topic or media house.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search news, cut-offs, ASUU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Filter 1: Topic / Category */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 shrink-0">Topic:</span>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-[#0f172a] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Filter 2: Legit Media House Feeds */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-500 shrink-0">Official Source:</span>
          {publishers.map((pub) => (
            <button
              key={pub.id}
              onClick={() => setActiveSource(pub.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold whitespace-nowrap transition cursor-pointer border ${
                activeSource === pub.id
                  ? 'bg-orange-500 border-orange-600 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {pub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Copy notification */}
      {copiedId && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Article link copied to clipboard! Share with classmates.</span>
        </div>
      )}

      {/* News Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.length === 0 ? (
          <div className="col-span-2 py-12 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Newspaper className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No news articles match your filter</h4>
            <p className="text-xs text-slate-500">Try resetting the topic or source filter above.</p>
            <button
              onClick={() => { setActiveCategory('all'); setActiveSource('all'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredNews.map((item) => {
            const isSaved = savedNewsIds.includes(item.id);
            const sourceUrl = item.sourceUrl || item.link || 'https://punchng.com/topics/education/';
            const sourceName = item.sourceName || (
              item.type === 'scholarship' ? 'Federal Scholarship Board / PTDF' :
              item.type === 'strike' ? 'ASUU NEC Official Wire' :
              item.type === 'school' ? 'National Universities Commission' : 'UniNest News'
            );

            return (
              <div
                key={item.id}
                className="group rounded-3xl bg-white border border-slate-200 hover:border-orange-300 p-5 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Metadata Badge row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-black">
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                        <span>{sourceName}</span>
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        item.type === 'scholarship' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.type === 'strike' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        item.type === 'school' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.category || item.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-400">
                      <button
                        onClick={() => toggleSave(item.id)}
                        className={`p-1.5 rounded-lg hover:bg-slate-100 transition ${isSaved ? 'text-orange-600' : 'text-slate-400'}`}
                        title={isSaved ? 'Bookmarked' : 'Save article'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-orange-500' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleShare(item)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-slate-700"
                        title="Share article"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug group-hover:text-orange-600 transition">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Footer and Online Feed Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] truncate">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.date}</span>
                    <span>•</span>
                    <span className="truncate max-w-[120px]">{item.school || 'Campus'}</span>
                  </div>

                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white font-black text-xs transition shrink-0 group/link border border-orange-200 hover:border-orange-600"
                  >
                    <span>Read on Official Feed</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
