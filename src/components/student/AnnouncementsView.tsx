import React, { useEffect, useState } from 'react';
import { Announcement } from '../../types';
import { api } from '../../services/api';
import { Card } from '../common/Card';
import { ScrollReveal } from '../common/ScrollReveal';
import { Bell, AlertTriangle, Calendar, User, Sparkles } from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState<'all' | 'urgent'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.announcements.list();
        setAnnouncements(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered =
    filter === 'urgent'
      ? announcements.filter((a) => a.priority === 'urgent')
      : announcements;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Official Institute Communications
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Academic Circulars & Notices</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Classroom batch notifications, test schedules, and syllabus revisions
            </p>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 self-start shadow-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`btn-tactile px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              All Notices ({announcements.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('urgent')}
              className={`btn-tactile px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === 'urgent'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-red-600'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Urgent Only
            </button>
          </div>
        </div>
      </ScrollReveal>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-7 h-7 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <Card variant="glass" padded="lg" className="text-center">
          <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">No announcements match the selected filter.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((item, index) => (
            <ScrollReveal key={item.id} delay={index * 0.05}>
              <Card
                variant="glass"
                padded="md"
                className={`transition-all ${
                  item.priority === 'urgent'
                    ? 'border-red-200/90 shadow-xs shadow-red-500/5 bg-red-50/20'
                    : item.priority === 'highlight'
                    ? 'border-purple-200/90 shadow-xs bg-purple-50/20'
                    : 'border-slate-200/80 shadow-2xs'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        item.priority === 'urgent'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : item.priority === 'highlight'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-xs font-bold text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200/60">
                      {item.course_title || 'Institute-Wide'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    <span>
                      Published by <strong className="text-slate-700 font-bold">{item.author_name}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-700">ChemPoint Faculty</span>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
};
