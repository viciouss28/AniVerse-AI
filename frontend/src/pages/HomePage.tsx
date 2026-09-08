import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Compass, ArrowRight } from 'lucide-react';

interface HomePageProps {
  onGetStarted: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-dark-900 bg-grid-pattern">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-ambient-glow pointer-events-none rounded-full blur-3xl opacity-80" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-brand-purple/10 pointer-events-none rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-brand-cyan/10 pointer-events-none rounded-full blur-3xl" />

      {/* Hero Section */}
      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 flex-1 flex flex-col items-center text-center">
        
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-surface-900/80 border border-brand-violet/30 text-brand-violet text-xs font-semibold uppercase tracking-widest mb-6 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
          <span>YOUR AI ANIME COMPANION</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-appText-main tracking-tight max-w-4xl leading-[1.15]"
        >
          Your next Favorite Anime is waiting in the{' '}
          <span className="text-gradient">Universe</span>
        </motion.h1>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-appText-muted max-w-2xl font-normal leading-relaxed"
        >
          Explore it with <span className="text-appText-main font-semibold">AniVerse</span>.
        </motion.p>

        {/* Prominent CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10"
        >
          <button
            onClick={onGetStarted}
            className="group relative inline-flex items-center space-x-3 px-8 py-4 rounded-xl text-base font-semibold text-white bg-purple-cyan-gradient btn-glow shadow-glow-button focus:outline-none"
          >
            <span>Get Started</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Feature Cards Grid (EXACTLY THREE CARDS) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
        >
          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl bg-surface-900/90 border border-surface-border hover:border-brand-violet/40 transition-all shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-surface-800 border border-surface-border flex items-center justify-center text-brand-violet group-hover:text-brand-cyan group-hover:border-brand-violet/40 transition-colors mb-5">
                <MessageSquare size={22} />
              </div>
              <h3 className="text-lg font-bold text-appText-main mb-2">
                Natural Conversation
              </h3>
              <p className="text-sm text-appText-muted leading-relaxed">
                Just describe what you feel or loved. No rigid filters or keywords needed—talk naturally about your taste.
              </p>
            </div>
            <div className="mt-6 flex items-center space-x-1.5 text-xs font-semibold text-brand-violet group-hover:text-brand-cyan transition-colors">
              <span>Adaptive Dialogue</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl bg-surface-900/90 border border-surface-border hover:border-brand-violet/40 transition-all shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-surface-800 border border-surface-border flex items-center justify-center text-brand-cyan group-hover:text-brand-violet group-hover:border-brand-cyan/40 transition-colors mb-5">
                <Sparkles size={22} />
              </div>
              <h3 className="text-lg font-bold text-appText-main mb-2">
                Thoughtful Recommendations
              </h3>
              <p className="text-sm text-appText-muted leading-relaxed">
                Get anime recommendations based on what you're actually looking for, with useful details to help you choose.
              </p>
            </div>
            <div className="mt-6 flex items-center space-x-1.5 text-xs font-semibold text-brand-cyan group-hover:text-brand-violet transition-colors">
              <span>Context-Aware Matching</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl bg-surface-900/90 border border-surface-border hover:border-brand-violet/40 transition-all shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-surface-800 border border-surface-border flex items-center justify-center text-brand-lightViolet group-hover:text-brand-cyan group-hover:border-brand-violet/40 transition-colors mb-5">
                <Compass size={22} />
              </div>
              <h3 className="text-lg font-bold text-appText-main mb-2">
                Continuous Discovery
              </h3>
              <p className="text-sm text-appText-muted leading-relaxed">
                Refine your request naturally and discover something new whenever you're ready.
              </p>
            </div>
            <div className="mt-6 flex items-center space-x-1.5 text-xs font-semibold text-brand-violet group-hover:text-brand-cyan transition-colors">
              <span>Explore More</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

        </motion.div>

      </main>

      {/* Footer minimal info */}
      <footer className="w-full border-t border-surface-border/40 py-6 text-center text-xs text-appText-dim">
        <p>AniVerse AI &copy; {new Date().getFullYear()} — Powered by AI Recommendation Engine</p>
      </footer>
    </div>
  );
};
