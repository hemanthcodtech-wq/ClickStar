import React from 'react';
import { 
  Server, 
  Database, 
  HardDrive, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Lock, 
  KeyRound,
  Mail,
  Zap
} from 'lucide-react';

export const AdminSystemSettings = () => {
  const configs = [
    {
      name: 'Neon PostgreSQL Serverless',
      category: 'Database Cluster',
      status: 'Connected & Healthy',
      latency: '18ms',
      icon: Database,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      name: 'Cloudinary CDN Media Storage',
      category: 'Asset Delivery & Video Transcoding',
      status: 'Active (tcv5pbsb)',
      latency: '24ms',
      icon: HardDrive,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      name: 'Gmail SMTP Email Relay',
      category: 'OTP Verification & Password Recovery',
      status: 'Authenticated (sailusai7@gmail.com)',
      latency: 'Normal',
      icon: Mail,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      name: 'Google OAuth 2.0 Provider',
      category: 'Single Sign-On (SSO)',
      status: 'Live (Client ID configured)',
      latency: 'Active',
      icon: ShieldCheck,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Infrastructure Card */}
      <div className="bg-[#141416] border border-white/10 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Cloud Infrastructure & API Gateways</h3>
            <p className="text-xs text-zinc-400">All microservices powering ClickStar authentication, database and media pipelines</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configs.map((cfg, idx) => {
            const Icon = cfg.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#1c1c20] border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${cfg.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{cfg.name}</h4>
                    <p className="text-[11px] text-zinc-400">{cfg.category}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Online
                  </span>
                  <span className="block text-[10px] text-zinc-500 mt-1">{cfg.latency}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rewards Configuration */}
      <div className="bg-[#141416] border border-white/10 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">ClickStar Reward Rules Engine</h3>
            <p className="text-xs text-zinc-400">Point values automatically credited to users for community contributions</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-4 rounded-2xl bg-[#1c1c20] border border-white/5">
            <span className="text-xs text-zinc-400 font-semibold block">Create Post</span>
            <span className="text-xl font-extrabold text-amber-400 mt-1 block">+100 Stars</span>
            <span className="text-[10px] text-zinc-500">Per media published</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1c1c20] border border-white/5">
            <span className="text-xs text-zinc-400 font-semibold block">Welcome Bonus</span>
            <span className="text-xl font-extrabold text-amber-400 mt-1 block">+100 Stars</span>
            <span className="text-[10px] text-zinc-500">On email verification</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1c1c20] border border-white/5">
            <span className="text-xs text-zinc-400 font-semibold block">Receive Like</span>
            <span className="text-xl font-extrabold text-amber-400 mt-1 block">+10 Stars</span>
            <span className="text-[10px] text-zinc-500">Per photo like</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1c1c20] border border-white/5">
            <span className="text-xs text-zinc-400 font-semibold block">New Follower</span>
            <span className="text-xl font-extrabold text-amber-400 mt-1 block">+5 Stars</span>
            <span className="text-[10px] text-zinc-500">Per user follow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

