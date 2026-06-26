import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Download, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import { motion } from 'motion/react';

export const BadgePage = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('ATTENDEE');
  const [image, setImage] = useState<string | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!badgeRef.current) return;
    setIsGenerating(true);
    try {
      // Small delay to ensure any CSS transitions finish
      await new Promise(resolve => setTimeout(resolve, 100));
      const dataUrl = await toPng(badgeRef.current, {
        pixelRatio: 3,
        backgroundColor: '#050505',
      });
      const link = document.createElement('a');
      link.download = 'SCD_Dhule_2026_Badge.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating badge:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-[110vh] bg-[#050505] text-[#e0e0e0] flex flex-col font-sans relative overflow-x-hidden overflow-y-auto">
      {/* Background aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-f1-red/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-aws-orange/10 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto mt-0 pt-0 px-4 sm:px-6 lg:px-8 py-4 md:py-8 flex-grow flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-2 md:mb-4 relative z-50">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-aws-orange transition-colors group cursor-pointer relative z-50">
            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-sm tracking-wider uppercase">Back to Home</span>
          </Link>
          <div className="hidden md:block">
             <span className="font-mono text-xs text-f1-red uppercase tracking-[0.2em] font-bold px-3 py-1 bg-f1-red/10 border border-f1-red/20 rounded-full">
               Participation Badge
             </span>
          </div>
        </header>

        <div className="mb-4 md:mb-6 flex flex-col lg:flex-row lg:justify-between  ">
          <div >
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white mb-2">
            Show you're <span className="text-aws-orange font-sans normal-case italic">in.</span>
          </h1>
          <p className="text-white/60 max-w-xl font-medium">
            Generate your personalized AWS Student Community Day Dhule 2026 digital badge. 
            Download and share it on your socials to let everyone know!
          </p>
        </div>
    
        </div>
        

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
          
          {/* Left Column: Badge Preview */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
            <div className="relative p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent">
              {/* Actual Badge Container for html-to-image */}
              <div 
                ref={badgeRef}
                className="w-[360px] h-[450px] bg-[#0a0a0a] rounded-[24px] overflow-hidden relative shadow-2xl flex flex-col border-4 border-f1-red/80"
              >
                {/* Badge inner aesthetic layers */}
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute top-[70px] left-0 w-full h-[250px] z-0 mix-blend-overlay bg-gradient-to-b from-f1-red/30 to-transparent"></div>
                
                {/* Top Black Header for Logos */}
                <div className="absolute top-0 left-0 w-full h-[70px] bg-[#050505] z-30 flex justify-between items-center px-5 border-b border-white/10 shadow-md">
                  {/* Left Logo */}
                  <img 
                    src="/scd-dhule-logo.avif" 
                    alt="SCD Dhule" 
                    className="h-20 w-auto object-contain" 
                    crossOrigin="anonymous" 
                  />
                  {/* Right Logos - Single Line */}
                  <div className="flex items-center gap-2">
                    <img 
                      src="/AWS_Builder.png" 
                      alt="AWS Builder" 
                      className="h-8 w-auto object-contain" 
                      crossOrigin="anonymous" 
                    />
                  </div>
                </div>

                {/* Photo Area - Starts below header */}
                <div className="absolute top-[70px] left-0 right-0 h-[280px] z-10 flex items-start justify-center overflow-hidden">
                  {image ? (
                    <img 
                      src={image} 
                      alt="User" 
                      className="w-full h-full object-cover object-top" 
                      crossOrigin="anonymous" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <ImageIcon className="w-16 h-16 mb-16 text-white/20" strokeWidth={1} />
                    </div>
                  )}
                  {/* Smooth gradient fade overlay to blend the photo into the card background */}
                  <div className="absolute bottom-0 left-0 right-0 h-[110px] pointer-events-none bg-gradient-to-b from-transparent to-[#0a0a0a]" />
                </div>

                {/* Content Area - Bottom part */}
                <div className="relative z-20 mt-auto flex flex-col w-full h-[180px] justify-end pb-4">
                  {/* Status/Badge Label */}
                  <div className="px-6 mb-3">
                    <div className="inline-block bg-gradient-to-r from-aws-orange to-f1-red text-black font-mono text-[9px] font-black tracking-widest px-2.5 py-1 uppercase transform -skew-x-12 shadow-[0_0_15px_rgba(255,153,0,0.4)]">
                      I'M ATTENDING
                    </div>
                  </div>

                  <div className="px-6 mb-4 pb-4 flex-grow flex flex-col justify-end">
                    <h2 className="text-[32px] leading-[0.9] font-black text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] break-words w-full">
                      {name ? (
                        name.split(' ').map((part, i) => (
                          <span key={i} className="block">{part}</span>
                        ))
                      ) : (
                        <>
                          <span className="block text-white/50">YOUR</span>
                          <span className="block text-white/50">NAME</span>
                        </>
                      )}
                    </h2>
                  </div>

                  {/* Stats / Event Info Row */}
                  <div className="w-[90%] mx-auto backdrop-blur-md bg-f1-red/90 rounded-xl px-5 py-3 flex justify-between items-center border border-white/20 shadow-[0_10px_20px_rgba(225,6,0,0.3)]">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-mono tracking-widest uppercase text-white/80">Aug</span>
                      <span className="text-xl font-black text-white leading-none mt-1">14</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-mono tracking-widest uppercase text-white/80">Year</span>
                      <span className="text-xl font-black text-white leading-none mt-1">26</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-mono tracking-widest uppercase text-white/80">City</span>
                      <span className="text-xl font-black text-white leading-none mt-1">DHL</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-mono tracking-widest uppercase text-white/80">Role</span>
                      <span className="text-xl font-black text-white leading-none uppercase mt-1">{role || 'ATTENDEE'}</span>
                    </div>
                  </div>
                </div>
              </div>    
               <div className="mt-3 flex  flex-col gap-1.5 border-t border-white/10 pt-2">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>Everything happens in your browser.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>Your photo is never uploaded to any server.</span>
                  </div>
                </div>

            </div>
          </div>
          

          {/* Right Column: Controls */}
          <div className="w-full lg:w-1/2 flex flex-col space-y-4 lg:space-y-5">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-aws-orange/20 border border-aws-orange flex items-center justify-center text-aws-orange font-bold font-mono text-sm shadow-[0_0_15px_rgba(255,153,0,0.3)]">
                1
              </div>
              <div className="flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white mb-0.5">Select your photo</h3>
                <p className="text-sm text-white/50 mb-3">A clear, face-forward photo works best.</p>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Choose photo"
                  />
                  <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 rounded-lg text-white font-medium transition-all focus:outline-none focus:ring-2 focus:ring-aws-orange w-max">
                    <Upload className="w-4 h-4" />
                    {image ? 'Change photo' : 'Choose photo'}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-f1-red/20 border border-f1-red flex items-center justify-center text-f1-red font-bold font-mono text-sm shadow-[0_0_15px_rgba(225,6,0,0.3)]">
                2
              </div>
              <div className="flex flex-col flex-grow w-full max-w-md">
                <h3 className="text-lg font-bold text-white mb-0.5">Add your name</h3>
                <p className="text-sm text-white/50 mb-3">It'll appear prominently on your badge.</p>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  maxLength={30}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-aws-orange focus:ring-1 focus:ring-aws-orange transition-all"
                />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold font-mono text-sm">
                3
              </div>
              <div className="flex flex-col flex-grow w-full max-w-md">
                <h3 className="text-lg font-bold text-white mb-0.5">Select your role</h3>
                <p className="text-sm text-white/50 mb-3">Attendee, VIP, Speaker, etc.</p>
                <input 
                  type="text" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. ATTENDEE "
                  maxLength={12}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-aws-orange focus:ring-1 focus:ring-aws-orange transition-all"
                />
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold font-mono text-sm">
                4
              </div>
              <div className="flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white mb-0.5">Download & share</h3>
                <p className="text-sm text-white/50 mb-3">Post it on LinkedIn and tag <strong className="text-white">#SCDDhule2026</strong>.</p>
                
                <button 
                  onClick={handleDownload}
                  disabled={!image || !name || isGenerating}
                  className={`flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold uppercase tracking-wider text-sm transition-all w-full sm:w-auto max-w-md ${
                    (!image || !name) 
                      ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5' 
                      : 'bg-aws-orange text-black hover:bg-aws-orange-dark hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,153,0,0.4)]'
                  }`}
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  {isGenerating ? 'Generating...' : 'Download Badge'}
                </button>

               
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
