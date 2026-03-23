export default function IntroOverlay({ visible }) {
  return (
    <div
      className="fixed inset-0 bg-[#020617] z-[9999] flex flex-col items-center justify-center transition-transform duration-700 ease-in-out"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)' }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 blur-[60px] opacity-20 animate-pulse"></div>
        <h1 className="relative text-7xl font-black text-white mb-2 tracking-tighter">
          JKC<span className="text-indigo-500">:</span>RP
        </h1>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-indigo-500"></div>
        <p className="text-indigo-400 text-xs tracking-[0.5em] uppercase font-bold">System Loading</p>
        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-indigo-500"></div>
      </div>
    </div>
  );
}
