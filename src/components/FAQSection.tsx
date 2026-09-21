import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Sparkles, MessageCircle } from 'lucide-react';
import { FAQItem } from '../types';

interface FAQSectionProps {
  faqs: FAQItem[];
  whatsappNumber?: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  faqs,
  whatsappNumber = '2349039847154'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [openIds, setOpenIds] = useState<string[]>(['faq-01', 'faq-03']);

  const categories = ['All', 'Gifting & STS', 'Housing & Roommates', 'Verified Agents & Sellers', 'Earn as Scout & Assistant', 'Academic Assist'];

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#162238] to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Center &amp; Frequently Asked Questions</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Got Questions? We’ve Got Quick Answers.
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Learn how student gifting works, how to save for graduation clearance, find verified lodge agents in Bayelsa, Rivers &amp; Delta, and earn as a campus scout.
          </p>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search answers (e.g. gifting, verified agents, STS clearance, scouting)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-xs transition"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeCategory === cat
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-gray-400 text-xs sm:text-sm">
            No questions matching your search. Have a specific inquiry? Chat with our campus support desk below!
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition hover:border-slate-300"
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600">
                      {faq.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="p-1 rounded-lg bg-slate-50 text-slate-500 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still Need Help WhatsApp CTA */}
      <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
            Still have a question or need personalized campus assistance?
          </h4>
          <p className="text-xs text-gray-600">
            Our student liaison desk is available 24/7 on WhatsApp for immediate support.
          </p>
        </div>

        <a
          href={`https://wa.me/${whatsappNumber}?text=Hello%20UniNest,%20I%20have%20an%20inquiry%20regarding%20campus%20services.`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
