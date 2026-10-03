'use client';

import { useState } from 'react';
import { Send, Mail, MapPin, Phone, User, MessageSquare, Building2, Clock, CheckCircle2 } from 'lucide-react';
import FadeIn from '@/components/shared/FadeIn';
import Icon from '@/components/shared/Icon';
import { ContactBlockData } from '@/types/cms';

interface ContactModuleProps {
  id?: string;
  data: ContactBlockData;
  settings?: {
    theme?: 'light' | 'dark';
  };
}

type ContactTab = 'address' | 'map';

export default function ContactModule({ id, data, settings }: ContactModuleProps) {
  const { title, subtitle } = data;
  const isDark = settings?.theme === 'dark';

  const [activeTab, setActiveTab] = useState<ContactTab>('address');
  const [form, setForm] = useState({ name: '', email: '', phone: '', organization: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 4000);
      setForm({ name: '', email: '', phone: '', organization: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <section
      id={id}
      className={`py-24 relative overflow-hidden transition-colors ${
        isDark
          ? 'bg-gradient-to-b from-[var(--dark-surface)] to-[var(--midnight-navy)] text-white'
          : 'bg-white text-[var(--midnight-navy)]'
      }`}
    >
      <div className="section-container relative z-10">
        
        {/* Content & Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Contact info cards */}
          <div className="lg:col-span-5 space-y-8">
            <FadeIn variant="left" delay={0}>
              <div className="text-xs font-semibold tracking-widest uppercase mb-3 text-[var(--secondary)]">
                Get in Touch
              </div>
              <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                {title || 'Need Help?'}
              </h2>
              {subtitle && (
                <p className={`mb-8 text-sm ${isDark ? 'text-white/70' : 'text-slate-500'}`}>
                  {subtitle}
                </p>
              )}

              {/* Department contact card */}
              <div className="bg-[#F6F8FB] dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--royal-blue), var(--secondary))' }}
                  >
                    <User size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--midnight-navy)] dark:text-white">Convocation Secretariat</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ganpat University Convocation Cell</div>
                  </div>
                </div>
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <MapPin size={15} className="shrink-0 mt-0.5 text-[var(--secondary)]" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      Ganpat Vidyanagar, Mehsana-Gozaria Highway,<br />
                      North Gujarat PO – 384012, INDIA.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={15} className="shrink-0 text-[var(--secondary)]" />
                    <a href="mailto:convocation@ganpatuniversity.ac.in" className="text-xs text-slate-600 dark:text-slate-400 font-medium hover:text-[var(--royal-blue)] transition-colors">
                      convocation@ganpatuniversity.ac.in
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={15} className="shrink-0 text-[var(--secondary)]" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">+91 9265018153</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={15} className="shrink-0 text-[var(--secondary)]" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">+91-2762-226000</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={15} className="shrink-0 text-[var(--secondary)]" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Toll Free: 1800 233 12345</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={15} className="shrink-0 text-[var(--secondary)]" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Mon – Sat: 9:00 AM – 4:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Tabs: Reach Us / Map */}
              <div className="rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-900/50">
                <div className="flex bg-[#F6F8FB] dark:bg-slate-900 p-1 border-b border-slate-200/50 dark:border-slate-800/80">
                  <button
                    onClick={() => setActiveTab('address')}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      activeTab === 'address'
                        ? 'bg-white dark:bg-slate-800 text-[var(--royal-blue)] dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Reach Us
                  </button>
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      activeTab === 'map'
                        ? 'bg-white dark:bg-slate-800 text-[var(--royal-blue)] dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Map Location
                  </button>
                </div>
                <div className="min-h-[220px] bg-white dark:bg-[var(--dark-surface)]">
                  {activeTab === 'address' ? (
                    <div className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <Building2 size={16} className="shrink-0 mt-0.5 text-[var(--royal-blue)]" />
                        <div>
                          <div className="text-sm font-semibold mb-1 text-[var(--midnight-navy)] dark:text-white">
                            Centre Address
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Convocation Cell / Central Office<br />
                            Ganpat University<br />
                            Ganpat Vidyanagar<br />
                            Mehsana-Gozaria Highway<br />
                            PO - 384012, North Gujarat<br />
                            INDIA
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { label: 'Research Inquiries', color: 'var(--royal-blue)' },
                          { label: 'Industry Partnerships', color: 'var(--secondary)' },
                          { label: 'Admissions', color: 'var(--royal-blue)' }
                        ].map((tag) => (
                          <span
                            key={tag.label}
                            className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                            style={{
                              background: tag.color === 'var(--royal-blue)' ? 'rgba(21,86,178,0.08)' : 'rgba(21,177,216,0.08)',
                              color: tag.color
                            }}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-[220px]">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3672.4066437!2d72.7050!3d23.4400!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395c44f983cd35c7%3A0x9d61f31d2f9e8b77!2sGanpat%20University!5e0!3m2!1sen!2sin!4v1688000000000!5m2!1sen!2sin"
                        width="100%"
                        height="220"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Ganpat University Map"
                      />
                    </div>
                  )}
                </div>
              </div>

            </FadeIn>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <FadeIn
              variant="right"
              delay={0}
              className="bg-[#F6F8FB] dark:bg-slate-900/40 p-8 rounded-xl border border-slate-200/50 dark:border-slate-800/80 transition-all duration-300"
            >
              <div className="text-xs font-semibold tracking-widest uppercase mb-2 text-[var(--secondary)]">
                Inquiry Form
              </div>
              <h3 className="text-2xl font-bold mb-6 text-[var(--midnight-navy)] dark:text-white font-heading">
                Send a Message
              </h3>

              {sent ? (
                <div
                  className="rounded-2xl p-10 flex flex-col items-center text-center bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5"
                >
                  <CheckCircle2 size={48} className="mb-4 text-[var(--royal-blue)]" />
                  <h4 className="text-lg font-bold mb-2 text-[var(--midnight-navy)] dark:text-white">Message Sent!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                    Thank you for reaching out. Our team will respond within 1–2 working days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: 'name', label: 'Full Name', placeholder: 'Your full name', icon: User, type: 'text', required: true },
                      { key: 'email', label: 'Email Address', placeholder: 'your@email.com', icon: Mail, type: 'email', required: true },
                      { key: 'phone', label: 'Phone Number', placeholder: '+91 XXXXXXXXXX', icon: Phone, type: 'tel', required: false },
                      { key: 'organization', label: 'Organization', placeholder: 'Company / University', icon: Building2, type: 'text', required: false },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs font-semibold mb-2 text-[var(--midnight-navy)] dark:text-white">
                          {field.label} {field.required && <span className="text-[var(--royal-blue)]">*</span>}
                        </label>
                        <div className="relative">
                          <field.icon
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type={field.type}
                            required={field.required}
                            placeholder={field.placeholder}
                            value={(form as Record<string, string>)[field.key]}
                            onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm transition-all outline-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[var(--midnight-navy)] dark:text-white focus:border-[var(--royal-blue)] focus:ring-1 focus:ring-[var(--royal-blue)]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-2 text-[var(--midnight-navy)] dark:text-white">
                      Subject <span className="text-[var(--royal-blue)]">*</span>
                    </label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-md text-sm transition-all outline-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[var(--midnight-navy)] dark:text-white focus:border-[var(--royal-blue)] focus:ring-1 focus:ring-[var(--royal-blue)]"
                    >
                      <option value="" disabled>Select inquiry type</option>
                      <option value="admission">Admission Inquiry</option>
                      <option value="research">Research Collaboration</option>
                      <option value="industry">Industry Partnership</option>
                      <option value="certification">Certification Course</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-2 text-[var(--midnight-navy)] dark:text-white">
                      Message <span className="text-[var(--royal-blue)]">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquare
                        size={15}
                        className="absolute left-3.5 top-3.5 text-slate-400"
                      />
                      <textarea
                        required
                        rows={4}
                        placeholder="Describe your inquiry in detail..."
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm transition-all outline-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[var(--midnight-navy)] dark:text-white resize-none focus:border-[var(--royal-blue)] focus:ring-1 focus:ring-[var(--royal-blue)]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all bg-gradient-to-r from-[var(--royal-blue)] to-[var(--secondary)] hover:opacity-95 active:scale-[0.99] disabled:opacity-75 shadow-md"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Sending…</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} /> <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </FadeIn>
          </div>

        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20">
          {[
            { icon: Phone, title: 'Call Us', info: '+91-2762-226000', sub: 'Mon–Sat, 9AM–4PM', color: 'var(--royal-blue)' },
            { icon: Mail, title: 'Email Us', info: 'convocation@ganpatuniversity.ac.in', sub: 'Response within 1–2 days', color: 'var(--secondary)' },
            { icon: MapPin, title: 'Visit Us', info: 'Ganpat Vidyanagar, Gujarat', sub: 'Campus tours available', color: 'var(--royal-blue)' },
          ].map((item, idx) => (
            <FadeIn
              key={item.title}
              variant="up"
              delay={idx * 100}
              className="bg-[#F6F8FB] dark:bg-slate-900/40 rounded-xl p-6 text-center border border-slate-200/50 dark:border-slate-800/80 hover:border-[var(--royal-blue)]/30 dark:hover:border-[var(--royal-blue)]/40 transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                style={{
                  background: item.color === 'var(--royal-blue)' ? 'rgba(21,86,178,0.06)' : 'rgba(21,177,216,0.06)'
                }}
              >
                <item.icon size={20} style={{ color: item.color }} />
              </div>
              <h4 className="text-sm font-bold mb-1 text-[var(--midnight-navy)] dark:text-white">{item.title}</h4>
              <p className="text-sm font-semibold mb-1" style={{ color: item.color }}>{item.info}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{item.sub}</p>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}
