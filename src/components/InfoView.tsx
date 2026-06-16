import { Clock, Phone, Mail, MapPin, Sparkles, Instagram, Facebook, Send, Flame, Award, Heart, Utensils, Zap, Music } from "lucide-react";
import { motion } from "motion/react";
// @ts-ignore
import wowBurgerLogo from "../assets/images/wow_burger_logo_1781154696795.png";

const bannerImage = "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80";

interface InfoViewProps {
  isVisible: boolean;
}

export default function InfoView({ isVisible }: InfoViewProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="absolute inset-0 bg-neutral-950 flex flex-col overflow-y-auto scrollbar-none z-20 pb-20 select-none"
      id="restaurant_info_page"
    >
      {/* 1. RESTAURANT BANNER & LOGO (Removed overflow-hidden to prevent logo clipping) */}
      <div className="relative h-44 sm:h-48 w-full shrink-0">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={bannerImage}
            alt="WOW Burger Banner"
            className="w-full h-full object-cover brightness-50"
            referrerPolicy="no-referrer"
          />
          {/* Sleek shadow gradient overlay on the banner */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/50" />
        </div>

        {/* Brand Circle Overlapping Banner Bottom (Elevated from negative position so it's fully readable) */}
        <div className="absolute -bottom-2 left-6 flex items-end gap-3.5 z-35">
          <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-brand-yellow bg-zinc-950 shadow-[0_8px_24px_rgba(255,193,7,0.6)]">
            <img
              src={wowBurgerLogo}
              alt="WOW Burger Brand Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="mb-2">
            <span className="text-[9px] bg-brand-yellow text-black font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-md shadow-lg">
              EST. 2022
            </span>
          </div>
        </div>
      </div>

      {/* 2. PROFILE TITLES */}
      <div className="px-6 pt-10 pb-4 space-y-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
          <span className="text-[10px] text-brand-red font-black tracking-widest uppercase">Addis Ababa, ET</span>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight uppercase font-sans">
          WOW BURGER
        </h2>
        <p className="text-xs text-brand-yellow font-extrabold tracking-widest uppercase font-mono">
          Handcrafted Burgers & Wood-Fired Pizza
        </p>
      </div>

      {/* 3. CORE PROFILE CONTENT (Sensory experience visual storyboards) */}
      <div className="px-6 py-2 grid grid-cols-1 md:grid-cols-2 gap-8 md:space-y-0 select-none">
        
        {/* Left Hand Column: About us/Mission & Our Journey */}
        <div className="space-y-8">
          {/* About Us */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-yellow" />
              <h3 className="text-xs font-black tracking-widest text-white uppercase font-mono">
                The Mission
              </h3>
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed font-light bg-gradient-to-br from-zinc-900 to-black border border-brand-yellow/15 rounded-2xl p-4 shadow-md animate-fade-in">
              WOW Burger represents Addis Ababa's premier culinary destination, serving up freshly handcrafted certified black angus beef burgers, high-heat wood-fired artisanal pizzas, and refreshing natural botanical juices crafted entirely in-house.
            </p>
          </div>

          {/* Our Journey styled with premium card layout, corner neon gradients and gorgeous highlight accents */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pl-1">
              <Award className="w-4 h-4 text-brand-yellow animate-pulse" />
              <h3 className="text-xs font-black tracking-widest text-white uppercase font-mono">
                Our Journey
              </h3>
            </div>
            
            <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-brand-yellow/30 rounded-2xl p-5 relative overflow-hidden shadow-2xl">
              {/* Corner glowing spotlight highlights inside the card */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-red/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4 text-xs text-zinc-200 leading-relaxed font-light relative z-10">
                <div>
                  <p>
                    Founded with a singular mission to <strong className="text-brand-yellow font-bold">revolutionize Addis Ababa's fast-casual sector</strong>, Chef Michael set out to combine traditional European wood-firing methods with vibrant, premium farm-to-table local ingredients.
                  </p>
                </div>
                <div className="h-[1px] bg-white/[0.06]" />
                <div>
                  <p>
                    We don't use shortcut freezers or pre-assembled elements. Every sauce is whisked fresh daily, every ingredient is selected by hand, and every slice tells a story of dedicated kitchen discipline.
                  </p>
                </div>
                <div className="h-[1px] bg-white/[0.06]" />
                <div>
                  <p>
                    Every soft brioche bun is baked fresh at sunrise, every single patty is hand-ground, and our signature slow-fermented pizza dough cold-cures for 48 hours to create the light, airy wood-char crust we are loved for.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Hand Column: Operations, social links, location */}
        <div className="space-y-8">
          {/* Operating Hours in beautiful yellow/red layout */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 pl-1">
              <Clock className="w-4 h-4 text-brand-yellow" />
              <h3 className="text-xs font-black tracking-widest text-white uppercase font-mono">
                Opening Hours
              </h3>
            </div>
            <div className="bg-gradient-to-r from-zinc-950 to-zinc-900 border border-brand-yellow/20 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Regular Days (Mon - Sun)</span>
                <span className="font-extrabold text-white">11:00 AM - 11:30 PM</span>
              </div>
              <div className="h-[1px] bg-white/[0.06]" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Kitchen Last Order</span>
                <span className="font-extrabold text-brand-yellow flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-ping" />
                  11:00 PM
                </span>
              </div>
            </div>
          </div>

          {/* Location & Address */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 pl-1">
              <MapPin className="w-4 h-4 text-brand-red" />
              <h3 className="text-xs font-black tracking-widest text-white uppercase font-mono">
                Location
              </h3>
            </div>
            <div className="bg-gradient-to-br from-zinc-950 to-neutral-900 border border-brand-red/15 rounded-2xl p-4 space-y-1">
              <p className="text-xs text-white font-extrabold flex items-center gap-1">
                <span>📍 Bole Road Branch</span>
              </p>
              <p className="text-xs text-zinc-300 leading-relaxed font-light">
                Bole Main Boulevard, Behind Edna Mall Complex, Addis Ababa, Ethiopia
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 pl-1">
              <Utensils className="w-4 h-4 text-brand-yellow" />
              <h3 className="text-xs font-black tracking-widest text-white uppercase font-mono">
                Contact & Booking
              </h3>
            </div>
            <div className="bg-zinc-950 border border-white/[0.04] rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-brand-yellow" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Phone Reservation</p>
                  <a href="tel:+251911000000" className="text-xs font-black text-white hover:text-brand-yellow transition-colors">
                    +251 911 000 000
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-full bg-brand-red/10 border border-brand-red/20 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-brand-red" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Corporate Email</p>
                  <a href="mailto:contact@wowburger.et" className="text-xs font-black text-white hover:text-brand-red transition-colors">
                    contact@wowburger.et
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase font-mono pl-1">
              Follow Our Channels
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white/[0.02] border border-white/[0.04] hover:border-brand-yellow/30 p-3 rounded-xl flex items-center justify-center gap-1.5 text-xs text-zinc-350 hover:text-white transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4 text-pink-500" />
                <span className="font-bold">Instagram</span>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white/[0.02] border border-white/[0.04] hover:border-brand-yellow/30 p-3 rounded-xl flex items-center justify-center gap-1.5 text-xs text-zinc-350 hover:text-white transition-all cursor-pointer"
              >
                <Facebook className="w-4 h-4 text-blue-500" />
                <span className="font-bold">Facebook</span>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white/[0.02] border border-white/[0.04] hover:border-brand-yellow/30 p-3 rounded-xl flex items-center justify-center gap-1.5 text-xs text-zinc-350 hover:text-white transition-all cursor-pointer"
              >
                <Music className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">TikTok</span>
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="bg-white/[0.02] border border-white/[0.04] hover:border-brand-yellow/30 p-3 rounded-xl flex items-center justify-center gap-1.5 text-xs text-zinc-350 hover:text-white transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-sky-450" />
                <span className="font-bold">Telegram</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* PREMIUM ATTRIBUTION DESIGN AT BOTTOM */}
      <div className="px-6 pb-20 select-none">
        <div className="pt-12 pb-4 border-t border-white/[0.04] text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-zinc-900 px-3 py-1 rounded-full border border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
            <span className="text-[9.5px] text-zinc-400 uppercase font-bold tracking-widest">
              Digital Menu Experience
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">
            Designed & Developed by <span className="text-zinc-300 font-black hover:text-brand-yellow transition-colors">Aldric Labs</span>
          </p>
          <p className="text-[9px] text-zinc-650 font-mono">© 2026 WOW Burger. All Rights Reserved.</p>
        </div>
      </div>
    </motion.div>
  );
}

