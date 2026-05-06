import { useState } from 'react';

export default function Support() {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Simulate API call
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 lg:space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
        <div className="max-w-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface">Support Center</h2>
          <p className="text-on-surface-variant mt-2 text-sm md:text-base">Get help with your interview sessions, technical path issues, or account billing.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 md:mt-10">
            <div className="p-6 bg-surface-container border border-outline-variant rounded-xl hover:border-primary/40 transition-colors cursor-pointer group">
                <span className="material-symbols-outlined text-primary mb-3 text-3xl group-hover:scale-110 transition-transform">book</span>
                <h4 className="font-bold text-sm">Documentation</h4>
                <p className="text-xs text-on-surface-variant mt-1">Full guide on our AI assessment logic.</p>
            </div>
            <div className="p-6 bg-surface-container border border-outline-variant rounded-xl hover:border-primary/40 transition-colors cursor-pointer group">
                <span className="material-symbols-outlined text-primary mb-3 text-3xl group-hover:scale-110 transition-transform">forum</span>
                <h4 className="font-bold text-sm">Community</h4>
                <p className="text-xs text-on-surface-variant mt-1">Join the elite architect Discord space.</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 bg-surface-container border border-outline-variant rounded-2xl p-6 md:p-8 custom-glow">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="h-16 w-16 bg-emerald-400/10 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-emerald-400 text-3xl">check_circle</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Ticket Created</h3>
              <p className="text-sm text-on-surface-variant">We've received your request and will respond within 12 hours.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-6 text-primary text-[10px] font-bold uppercase tracking-widest hover:underline"
              >
                Create another ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/30 pb-4">Open Support Ticket</h3>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Subject</label>
                <select 
                  required
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary outline-none appearance-none"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                >
                  <option value="">Select category...</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing & Subscription</option>
                  <option value="feedback">Feature Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Message</label>
                <textarea 
                  required
                  rows={5}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary outline-none resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                Dispatch Ticket
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="pt-10 lg:pt-20">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-6 text-center">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[
            { q: "Is the AI interview realistic?", a: "Yes, we use advanced RAG over real FAANG interview transcripts to provide realistic behavior and edge-case questions." },
            { q: "Can I use my own code editor?", a: "We provide an integrated IDE, but you can paste code from external editors easily. We support auto-sync for most common formats." },
            { q: "How is the rank calculated?", a: "Rank is a weighted combination of problems solved, interview scores, and consistency (streak)." },
            { q: "Is there a student discount?", a: "Students with a valid .edu email get 50% off the Pro Tier yearly subscription." }
          ].map((faq, i) => (
            <div key={i} className="p-6 border border-outline-variant rounded-xl hover:bg-surface-container-high transition-colors">
              <h4 className="font-bold text-on-surface text-sm">{faq.q}</h4>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
