import React, { useState, useEffect } from 'react';
import { Languages, ArrowRightLeft, Copy, Check, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LANGUAGES = [
  { code: 'ar', name: 'العربية' },
  { code: 'en', name: 'الإنجليزية' },
  { code: 'es', name: 'الإسبانية' },
  { code: 'fr', name: 'الفرنسية' },
  { code: 'de', name: 'الألمانية' },
  { code: 'zh', name: 'الصينية' },
  { code: 'ja', name: 'اليابانية' },
  { code: 'ru', name: 'الروسية' },
  { code: 'it', name: 'الإيطالية' },
  { code: 'tr', name: 'التركية' },
  { code: 'hi', name: 'الهندية' },
  { code: 'ko', name: 'الكورية' },
];

export default function App() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('ar');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Debounce logic for auto-translation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sourceText.trim()) {
        translateText();
      } else {
        setTranslatedText('');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [sourceText, sourceLang, targetLang]);

  const translateText = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          sourceLang: sourceLang === 'auto' ? 'auto' : LANGUAGES.find(l => l.code === sourceLang)?.name,
          targetLang: LANGUAGES.find(l => l.code === targetLang)?.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل في الترجمة');

      setTranslatedText(data.translation || '');
    } catch (error: any) {
      console.error("Translation failed:", error);
      setErrorMessage(error.message || 'حدث خطأ. حاول مرة أخرى.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return; // Cannot swap 'auto'
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
  };

  const copyToClipboard = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speakText = (text: string, langCode: string) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    // Use an approximate language code. 'auto' defaults to local.
    utterance.lang = langCode === 'auto' ? 'ar-SA' : langCode;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F9FAFB] text-gray-900">
      <header className="py-6 px-8 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3 max-w-7xl mx-auto w-full">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
            <Languages size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">مُتَرجِم ذكي</h1>
            <p className="text-xs text-gray-500 font-medium">مدعوم بالذكاء الاصطناعي من Gemini</p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
        
        <div className="w-full bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mt-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 p-4 bg-gray-50/50 gap-4">
             <div className="flex-1 w-full relative">
                <select 
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer shadow-sm hover:bg-gray-50 transition-colors"
                  dir="rtl"
                >
                  <option value="auto">التعرف التلقائي</option>
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
             </div>

             <button 
                onClick={handleSwapLanguages}
                disabled={sourceLang === 'auto'}
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm z-10"
                title="تبديل اللغات"
             >
                <ArrowRightLeft size={18} />
             </button>

             <div className="flex-1 w-full relative">
                <select 
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer shadow-sm hover:bg-gray-50 transition-colors"
                  dir="rtl"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-gray-100 min-h-[400px]">
            {/* Source Text Area */}
            <div className="flex-1 flex flex-col relative bg-white">
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="أدخل النص للترجمة..."
                className="flex-1 w-full resize-none p-6 text-xl leading-relaxed outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                style={{ direction: 'auto' }}
              />
              {sourceText && (
                 <div className="absolute bottom-4 left-4">
                    <button 
                       onClick={() => setSourceText('')}
                       className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                       title="مسح النص"
                    >
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                 </div>
              )}
            </div>

            {/* Target Text Area */}
            <div className="flex-1 flex flex-col relative bg-gray-50/30">
              <div className="flex-1 p-6 text-xl leading-relaxed text-gray-800 overflow-y-auto" style={{ direction: 'auto' }}>
                 {isTranslating && !translatedText ? (
                    <div className="flex items-center gap-3 text-blue-600 font-medium">
                       <Loader2 size={24} className="animate-spin" />
                       جاري الترجمة...
                    </div>
                 ) : (
                    translatedText ? (
                       <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          transition={{ duration: 0.3 }}
                       >
                         {translatedText}
                       </motion.div>
                    ) : (
                       <span className="text-gray-300 pointer-events-none">الترجمة ستظهر هنا...</span>
                    )
                 )}
              </div>

              {translatedText && (
                 <div className="border-t border-gray-100 bg-white p-3 flex items-center justify-end gap-2">
                    <button 
                       onClick={() => speakText(translatedText, targetLang)}
                       className="p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
                       title="استماع"
                    >
                       <Volume2 size={18} />
                    </button>
                    <button 
                       onClick={copyToClipboard}
                       className="p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
                       title="نسخ الترجمة"
                    >
                       {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                       {copied && <span className="text-green-500">تم النسخ</span>}
                    </button>
                 </div>
              )}
            </div>
          </div>

        </div>

        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 bg-red-50 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm border border-red-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              <p className="font-medium text-sm">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}