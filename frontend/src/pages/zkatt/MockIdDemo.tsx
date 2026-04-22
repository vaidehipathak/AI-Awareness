import React, { useRef, useState } from 'react';
import { Download, ShieldAlert, AlertTriangle, Info, User, Calendar, CreditCard, Hash, MapPin, Lock } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type DocType = 'PAN' | 'AADHAR' | 'CREDIT_CARD';

const MockIdDemo: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [docType, setDocType] = useState<DocType>('PAN');

  const mockData = {
    name: 'JOHN DOE',
    dob: '01/01/1990',
    mockAadhar: 'Aadhar: 2345 6789 2345',
    mockPan: 'ABCDE1234F',
    address: '123 Fake Street, Springfield, IN 12345',
    gender: 'MALE',
    cardNumber: '4111 1111 1111 1111',
    expiry: '12/28',
    cvv: '999'
  };

  const piiAnalysis: Record<string, { title: string, description: string, danger: string, icon: React.ReactNode }> = {
    name: {
      title: "Full Name",
      description: "Identifies the individual's legal name.",
      danger: "Can be used for identity theft, social engineering, and targeted phishing attacks when combined with other data.",
      icon: <User className="w-5 h-5 text-indigo-400" />
    },
    dob: {
      title: "Date of Birth",
      description: "The exact date the individual was born.",
      danger: "Often used as a security question or verification step by banks and services. Crucial for full identity takeover.",
      icon: <Calendar className="w-5 h-5 text-indigo-400" />
    },
    address: {
      title: "Residential Address",
      description: "The physical location where the individual resides.",
      danger: "Exposes physical location, can be used for doxing, physical harassment, or opening fraudulent localized accounts.",
      icon: <MapPin className="w-5 h-5 text-indigo-400" />
    },
    mockAadhar: {
      title: "National ID Number (Aadhar-format)",
      description: "A unique 12-digit identification number.",
      danger: "Extremely sensitive. Can be used to open fraudulent bank accounts, secure loans, or access government services illegally.",
      icon: <Hash className="w-5 h-5 text-red-500" />
    },
    mockPan: {
      title: "Tax ID Number (PAN-format)",
      description: "A 10-character alphanumeric identifier for taxation.",
      danger: "Used for financial fraud, filing fake tax returns, and evading taxes under someone else's name.",
      icon: <CreditCard className="w-5 h-5 text-red-500" />
    },
    cardNumber: {
      title: "Credit Card Number",
      description: "A 16-digit primary account number linking to financial funds.",
      danger: "Direct access to finances. Used for unauthorized online purchases, card cloning, and severe financial theft.",
      icon: <CreditCard className="w-5 h-5 text-red-500" />
    },
    cvv: {
      title: "CVV / Security Code",
      description: "The 3 or 4 digit security code on a bank card.",
      danger: "Bypasses 'card not present' security checks for online transactions. Combined with the card number, allows instant unauthorized charges.",
      icon: <Lock className="w-5 h-5 text-red-500" />
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    
    try {
      cardRef.current.classList.add('pdf-export-mode');
      
      // Temporarily hide watermarks for cleaner OCR
      const watermarks = cardRef.current.querySelectorAll('.watermark');
      watermarks.forEach(w => (w as HTMLElement).style.display = 'none');
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      watermarks.forEach(w => (w as HTMLElement).style.display = '');
      cardRef.current.classList.remove('pdf-export-mode');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [canvas.width * 0.264583, canvas.height * 0.264583]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * 0.264583, canvas.height * 0.264583);
      pdf.save(`mock-${docType.toLowerCase()}-document.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
      alert('Failed to generate PDF.');
    }
  };

  const handleTabChange = (type: DocType) => {
    setDocType(type);
    setSelectedField(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
              <ShieldAlert className="text-indigo-500" /> PII DOCUMENT DEMO
            </h2>
            <p className="text-slate-400 text-sm italic">
              Select a document type, then click on the highlighted fields to analyze the risks of sharing Personally Identifiable Information (PII).
            </p>
          </div>
          <button 
            onClick={handleDownloadPDF}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all"
          >
            <Download className="w-5 h-5" /> Download {docType === 'CREDIT_CARD' ? 'Card' : docType} PDF
          </button>
        </div>

        <div className="flex justify-center mb-8">
            <div className="bg-black/50 p-1 rounded-lg border border-white/10 inline-flex flex-wrap justify-center gap-1">
                <button 
                    onClick={() => handleTabChange('PAN')}
                    className={`px-6 py-2 rounded-md font-bold transition-all ${docType === 'PAN' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Mock Tax ID (PAN)
                </button>
                <button 
                    onClick={() => handleTabChange('AADHAR')}
                    className={`px-6 py-2 rounded-md font-bold transition-all ${docType === 'AADHAR' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Mock National ID (Aadhar)
                </button>
                <button 
                    onClick={() => handleTabChange('CREDIT_CARD')}
                    className={`px-6 py-2 rounded-md font-bold transition-all ${docType === 'CREDIT_CARD' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Mock Credit Card
                </button>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* MOCK ID CARD CONTAINER */}
          <div className="flex-1 flex justify-center items-start">
            
            {docType === 'PAN' && (
              <div 
                ref={cardRef}
                className="relative w-[450px] min-h-[280px] bg-gradient-to-br from-amber-50 to-amber-100 text-slate-900 rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-200 flex flex-col p-6 pb-8 font-sans group"
              >
                {/* Card Header */}
                <div className="text-center border-b-2 border-amber-300 pb-2 mb-4 flex justify-between items-center">
                  <div className="w-12 h-8 bg-amber-200 rounded"></div>
                  <h3 className="font-black text-lg uppercase tracking-widest text-slate-800">Income Tax Department</h3>
                  <div className="w-12 h-8 bg-amber-200 rounded"></div>
                </div>

                <div className="flex gap-6">
                  {/* Photo Placeholder */}
                  <div className="w-24 h-32 bg-slate-200 border-2 border-slate-400 flex items-center justify-center shadow-inner overflow-hidden relative shrink-0">
                      <User className="w-12 h-12 text-slate-400" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-3">
                    <div 
                      onClick={() => setSelectedField('name')}
                      className={`cursor-pointer p-1 -m-1 rounded transition-colors ${selectedField === 'name' ? 'bg-indigo-500/20 ring-2 ring-indigo-500' : 'hover:bg-black/5'}`}
                    >
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Name</span>
                      <p className="font-black text-lg leading-tight">{mockData.name}</p>
                    </div>

                    <div 
                      onClick={() => setSelectedField('dob')}
                      className={`cursor-pointer p-1 -m-1 rounded transition-colors ${selectedField === 'dob' ? 'bg-indigo-500/20 ring-2 ring-indigo-500' : 'hover:bg-black/5'}`}
                    >
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Date of Birth</span>
                      <p className="font-bold">{mockData.dob}</p>
                    </div>

                    <div 
                      onClick={() => setSelectedField('mockPan')}
                      className={`cursor-pointer p-1 -m-1 rounded transition-colors mt-4 ${selectedField === 'mockPan' ? 'bg-red-500/20 ring-2 ring-red-500' : 'hover:bg-black/5'}`}
                    >
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Permanent Account Number</span>
                      <p className="font-mono font-black text-xl tracking-widest">{mockData.mockPan}</p>
                    </div>
                  </div>
                </div>

                {/* Watermark overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] rotate-[-20deg]">
                  <span className="text-6xl font-black text-slate-900 tracking-widest whitespace-nowrap">SAMPLE SAMPLE</span>
                </div>
              </div>
            )}

            {docType === 'AADHAR' && (
              <div 
                ref={cardRef}
                className="relative w-[450px] min-h-[300px] bg-gradient-to-br from-slate-50 to-slate-200 text-slate-900 rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-300 flex flex-col p-6 pb-8 font-sans group"
              >
                {/* Card Header */}
                <div className="text-center border-b-2 border-red-500 pb-2 mb-4 shrink-0">
                  <h3 className="font-black text-lg uppercase tracking-widest text-slate-800">Government of Mockland</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">National Identification Card</p>
                </div>

                <div className="flex gap-6 flex-1 mb-4">
                  {/* Photo Placeholder */}
                  <div className="w-24 h-32 bg-slate-200 border-2 border-slate-400 flex items-center justify-center shadow-inner overflow-hidden relative shrink-0">
                      <User className="w-12 h-12 text-slate-400" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-2">
                    <div 
                      onClick={() => setSelectedField('name')}
                      className={`cursor-pointer p-1 -m-1 rounded transition-colors ${selectedField === 'name' ? 'bg-indigo-500/20 ring-2 ring-indigo-500' : 'hover:bg-black/5'}`}
                    >
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Name</span>
                      <p className="font-black text-base leading-tight">{mockData.name}</p>
                    </div>

                    <div className="flex gap-4">
                        <div 
                        onClick={() => setSelectedField('dob')}
                        className={`cursor-pointer p-1 -m-1 rounded transition-colors ${selectedField === 'dob' ? 'bg-indigo-500/20 ring-2 ring-indigo-500' : 'hover:bg-black/5'}`}
                        >
                        <span className="text-[10px] text-slate-500 font-bold uppercase">DOB</span>
                        <p className="font-bold text-sm">{mockData.dob}</p>
                        </div>

                        <div className="p-1 -m-1 rounded">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Gender</span>
                        <p className="font-bold text-sm">{mockData.gender}</p>
                        </div>
                    </div>

                    <div 
                      onClick={() => setSelectedField('address')}
                      className={`cursor-pointer p-1 -m-1 rounded transition-colors ${selectedField === 'address' ? 'bg-indigo-500/20 ring-2 ring-indigo-500' : 'hover:bg-black/5'}`}
                    >
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Address</span>
                      <p className="font-medium text-xs leading-tight">{mockData.address}</p>
                    </div>
                  </div>
                </div>

                {/* Aadhar-like number at bottom */}
                <div 
                  onClick={() => setSelectedField('mockAadhar')}
                  className={`text-center border-t border-slate-300 pt-3 mt-auto cursor-pointer p-2 rounded transition-colors shrink-0 ${selectedField === 'mockAadhar' ? 'bg-red-500/20 ring-2 ring-red-500' : 'hover:bg-black/5'}`}
                >
                   <p className="font-mono font-bold text-2xl tracking-widest text-slate-800">{mockData.mockAadhar}</p>
                </div>

                {/* Watermark overlay */}
                <div className="watermark absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] rotate-[-20deg]">
                  <span className="text-6xl font-black text-slate-900 tracking-widest whitespace-nowrap">SAMPLE SAMPLE</span>
                </div>
              </div>
            )}

            {docType === 'CREDIT_CARD' && (
              <div 
                ref={cardRef}
                className="relative w-[450px] min-h-[280px] bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col p-8 font-sans group"
              >
                <div className="flex justify-between items-start mb-8">
                    <h3 className="font-black text-2xl italic text-slate-300">MockBank Credit Card</h3>
                    <CreditCard className="w-10 h-10 text-slate-400 opacity-50" />
                </div>

                {/* Chip Icon */}
                <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md mb-6 opacity-80 border border-yellow-600 shadow-inner"></div>

                {/* Card Number */}
                <div 
                  onClick={() => setSelectedField('cardNumber')}
                  className={`cursor-pointer p-2 -m-2 rounded transition-colors mb-6 ${selectedField === 'cardNumber' ? 'bg-red-500/30 ring-2 ring-red-500' : 'hover:bg-white/5'}`}
                >
                  <p className="font-mono font-bold text-3xl tracking-normal text-slate-100">
                    {mockData.cardNumber}
                  </p>
                </div>

                <div className="flex justify-between items-end mt-auto">
                    {/* Name */}
                    <div 
                      onClick={() => setSelectedField('name')}
                      className={`cursor-pointer p-2 -m-2 rounded transition-colors ${selectedField === 'name' ? 'bg-indigo-500/30 ring-2 ring-indigo-500' : 'hover:bg-white/5'}`}
                    >
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block mb-1">Cardholder Name</span>
                      <p className="font-bold text-lg uppercase tracking-wide">{mockData.name}</p>
                    </div>

                    <div className="flex gap-6 text-right">
                        {/* Expiry */}
                        <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block mb-1">Valid Thru</span>
                            <p className="font-bold text-lg">{mockData.expiry}</p>
                        </div>

                        {/* CVV */}
                        <div 
                          onClick={() => setSelectedField('cvv')}
                          className={`cursor-pointer p-2 -m-2 rounded transition-colors bg-white/20 ${selectedField === 'cvv' ? 'bg-red-500/50 ring-2 ring-red-500' : 'hover:bg-white/30'}`}
                        >
                            <span className="text-base text-white font-bold uppercase tracking-normal block mb-1">CVV</span>
                            <p className="font-bold text-2xl text-white tracking-normal">{mockData.cvv}</p>
                        </div>
                    </div>
                </div>

                {/* Watermark overlay */}
                <div className="watermark absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] rotate-[-20deg]">
                  <span className="text-6xl font-black text-white tracking-widest whitespace-nowrap">SAMPLE SAMPLE</span>
                </div>
              </div>
            )}
          </div>

          {/* ANALYSIS PANEL */}
          <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 min-h-[300px] flex flex-col">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
              <Info className="text-indigo-400" /> PII Analysis
            </h3>
            
            {selectedField && piiAnalysis[selectedField] ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                        {piiAnalysis[selectedField].icon}
                    </div>
                    <h4 className="text-xl font-black text-white">{piiAnalysis[selectedField].title}</h4>
                </div>
                
                <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">What is it?</span>
                        <p className="text-sm text-slate-200 leading-relaxed">{piiAnalysis[selectedField].description}</p>
                    </div>

                    <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
                        <span className="text-xs font-bold text-red-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Risk if exposed
                        </span>
                        <p className="text-sm text-red-200 leading-relaxed">{piiAnalysis[selectedField].danger}</p>
                    </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 h-full">
                <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                <p>Select a highlighted field on the mock document to view its risk analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockIdDemo;
