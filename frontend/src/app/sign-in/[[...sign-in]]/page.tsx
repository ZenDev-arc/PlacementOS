import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Particle Field */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center" style={{ boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>
          </div>
          <span className="font-black text-2xl tracking-tight text-white">Placement<span className="text-indigo-400">OS</span></span>
        </div>

        <SignIn 
          appearance={{
            baseTheme: dark
          }}
        />
      </div>
    </div>
  );
}
