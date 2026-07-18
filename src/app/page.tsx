"use client";

import { useState, useEffect } from "react";
import { useGrammarChecker } from "@/hooks/useGrammarChecker";

type ActiveTab = "grammar" | "paraphraser" | "ai-detection" | "humanizer";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("grammar");
  const [rephrasedText, setRephrasedText] = useState<string[]>([]);
  const [scrolled, setScrolled] = useState(false);

  const {
    text,
    setText,
    alerts,
    isLoading,
    setIsLoading,
    error,
    score,
    expandedAlert,
    setExpandedAlert,
    wordCount,
    hardAlerts,
    styleAlerts,
    autoFixableAlerts,
    checkGrammar,
    reset,
    showToast,
    toastMessage,
  } = useGrammarChecker({ enabled: activeTab === "grammar" });

  const handleRephrase = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setRephrasedText([]);

    try {
      const res = await fetch("/api/rephrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 || data.error?.includes("429")) {
          alert("Rate limit reached (429 Too Many Requests). Please wait 60 seconds before trying again.");
          throw new Error("Rate limit exceeded. Please wait 60 seconds.");
        }
        throw new Error(data.error || "Rephrase failed");
      }

      const results: string[] = Array.isArray(data.results) ? data.results : [];
      setRephrasedText(results);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabAction = () => {
    if (activeTab === "grammar") checkGrammar();
    else if (activeTab === "paraphraser") handleRephrase();
    else setError("This feature is coming soon!");
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-white border-b border-surface-variant shadow-sm"
          : "bg-transparent border-b border-transparent"
          }`}
      >
        <div className="max-w-[1280px] w-full mx-auto flex justify-between items-center px-md py-xs h-16">
          <div className="flex items-center gap-md">
            <span className="font-headline-md text-headline-md font-bold text-primary">
              Scrib
            </span>
          </div>
          <div className="hidden md:flex items-center gap-md font-label-md text-label-md">
            <a className="text-secondary font-medium hover:text-primary-container transition-colors duration-200" href="#hero">Home</a>
            <a className="text-secondary font-medium hover:text-primary-container transition-colors duration-200" href="#editor">Try it</a>
            <a className="text-secondary font-medium hover:text-primary-container transition-colors duration-200" href="#features">Features</a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-surface-variant bg-surface-container-lowest hover:border-primary/40 transition-colors text-[13px] font-medium text-secondary hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">code</span>
              Source Code
            </a>
          </div>
        </div>
      </nav>

      {/*Hero Section*/}
      <main>
        <section
          className="relative min-h-screen flex flex-col items-center justify-center text-center hero-pattern overflow-hidden"
        >
          <div className="z-10 flex flex-col items-center gap-md px-md" data-aos="fade-up">
            <span className="bg-surface-container font-label-md text-label-md text-on-surface-variant px-sm py-[4px] rounded-full border border-surface-variant" data-aos="fade-up" data-aos-delay="100">
              Precision in every word
            </span>
            <h1 className="font-display text-display text-on-surface font-bold tracking-tight" data-aos="fade-up" data-aos-delay="200">
              Write with <span className="text-primary-container">confidence</span>.
              Communicate with impact.
            </h1>
            <p className="font-body-lg text-body-lg text-secondary max-w-[600px] mt-xs" data-aos="fade-up" data-aos-delay="300">
              Scrib is the advanced AI grammar checker designed for professionals. Experience real-time corrections, nuanced style suggestions, and effortless clarity.
            </p>
            <div className="flex gap-sm mt-md" data-aos="fade-up" data-aos-delay="400">
              <button className="bg-primary-container text-on-primary rounded font-button text-button px-lg py-[12px] hover:bg-primary transition-colors shadow-[0_4px_12px_rgba(255,92,0,0.2)]">
                Try for Free
              </button>
              <button className="bg-surface-container-lowest text-on-surface border border-surface-variant rounded font-button text-button px-lg py-[12px] hover:bg-surface-container-low transition-colors">
                View Demo
              </button>
            </div>

            <div className="mt-16 flex flex-col items-center gap-6" data-aos="fade-up" data-aos-delay="500">
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                <div className="text-center">
                  <div className="font-bold text-3xl text-on-surface">99%</div>
                  <div className="text-secondary text-sm mt-1">Grammar Accuracy</div>
                </div>
                <div className="w-px h-10 bg-surface-variant hidden md:block" />
                <div className="text-center">
                  <div className="font-bold text-3xl text-on-surface">50ms</div>
                  <div className="text-secondary text-sm mt-1">Real-time Check</div>
                </div>
                <div className="w-px h-10 bg-surface-variant hidden md:block" />
                <div className="text-center">
                  <div className="font-bold text-3xl text-on-surface">4+</div>
                  <div className="text-secondary text-sm mt-1">AI-Powered Tools</div>
                </div>
                <div className="w-px h-10 bg-surface-variant hidden md:block" />
                <div className="text-center">
                  <div className="font-bold text-3xl text-on-surface">Free</div>
                  <div className="text-secondary text-sm mt-1">To Get Started</div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating UI Chips to fill hero space */}
          <div className="absolute top-20 left-[5%] md:left-[10%] bg-surface-container-lowest px-5 py-2.5 rounded-full border border-surface-variant shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center gap-2 animate-bounce hidden md:flex" style={{ animationDuration: '3.5s' }}>
            <span className="material-symbols-outlined text-primary-container text-[20px]">spellcheck</span>
            <span className="font-label-md text-[13px] font-bold text-on-surface">Grammar</span>
          </div>
          <div className="absolute bottom-40 left-[2%] md:left-[5%] bg-surface-container-lowest px-5 py-2.5 rounded-full border border-surface-variant shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center gap-2 animate-bounce hidden md:flex" style={{ animationDuration: '4.2s', animationDelay: '0.5s' }}>
            <span className="material-symbols-outlined text-tertiary-container text-[20px]">swap_horiz</span>
            <span className="font-label-md text-[13px] font-bold text-on-surface">Paraphraser</span>
          </div>
          <div className="absolute top-32 right-[5%] md:right-[10%] bg-surface-container-lowest px-5 py-2.5 rounded-full border border-surface-variant shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center gap-2 animate-bounce hidden md:flex" style={{ animationDuration: '3.8s', animationDelay: '1s' }}>
            <span className="material-symbols-outlined text-error text-[20px]">find_in_page</span>
            <span className="font-label-md text-[13px] font-bold text-on-surface">AI Detection</span>
          </div>
          <div className="absolute bottom-28 right-[8%] md:right-[12%] bg-surface-container-lowest px-5 py-2.5 rounded-full border border-surface-variant shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center gap-2 animate-bounce hidden md:flex" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>
            <span className="material-symbols-outlined text-[#00bfa5] text-[20px]">psychology</span>
            <span className="font-label-md text-[13px] font-bold text-on-surface">Humanizer</span>
          </div>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-primary/10 to-transparent blur-[100px] z-0 pointer-events-none" />
          <div className="absolute -left-20 top-20 w-96 h-96 bg-primary-fixed-dim opacity-30 rounded-full blur-[100px] animate-pulse z-0 pointer-events-none" style={{ animationDuration: '4s' }} />
          <div className="absolute -right-20 top-40 w-[400px] h-[400px] bg-tertiary-fixed-dim opacity-30 rounded-full blur-[120px] animate-pulse z-0 pointer-events-none" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        </section >

        {/*Editor Section*/}
        < div className="max-w-container-max mx-auto px-4 sm:px-md" >
          <section className="py-20 sm:py-[120px]" data-aos="fade-up">
            <div className="max-w-editor-width mx-auto">
              <div className="mb-xl" data-aos="fade-up" data-aos-delay="100">
                <span className="text-primary-container font-label-md tracking-tighter uppercase text-[12px] font-bold">
                  Try it out
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mt-2">
                  Experience the difference
                </h2>
                <p className="font-body-md text-body-md text-secondary mt-4 max-w-[600px] leading-relaxed">
                  Paste your text below and watch Scrib&apos;s AI work in real-time. From grammar fixes to paraphrasing and AI detection — all in one place.
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-container/20 via-tertiary-fixed-dim/20 to-primary/20 blur-[100px] -z-10 rounded-[3rem]" />

                {/* Top Toolbar Outside Editor */}
                <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-2 sm:gap-3 mb-4 sm:mb-5 relative z-10 w-full" data-aos="fade-up" data-aos-delay="150">
                  <button onClick={() => { setActiveTab("grammar"); reset(); }} className={`shrink-0 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-[12px] sm:text-[14px] flex items-center gap-2 border transition-colors ${activeTab === "grammar" ? "bg-surface-container-lowest shadow-sm text-primary font-bold border-surface-variant" : "bg-surface-container-lowest/40 backdrop-blur hover:bg-surface-container-lowest text-secondary font-medium border-transparent hover:border-surface-variant"}`}>
                    <span className="material-symbols-outlined text-[20px]">spellcheck</span>
                    Grammar
                  </button>
                  <button onClick={() => { setActiveTab("paraphraser"); setRephrasedText([]); reset(); }} className={`shrink-0 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-[12px] sm:text-[14px] flex items-center gap-2 border transition-colors ${activeTab === "paraphraser" ? "bg-surface-container-lowest shadow-sm text-primary font-bold border-surface-variant" : "bg-surface-container-lowest/40 backdrop-blur hover:bg-surface-container-lowest text-secondary font-medium border-transparent hover:border-surface-variant"}`}>
                    <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
                    Paraphraser
                  </button>
                  <button onClick={() => { setActiveTab("ai-detection"); reset(); }} className={`shrink-0 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-[12px] sm:text-[14px] flex items-center gap-2 border transition-colors ${activeTab === "ai-detection" ? "bg-surface-container-lowest shadow-sm text-primary font-bold border-surface-variant" : "bg-surface-container-lowest/40 backdrop-blur hover:bg-surface-container-lowest text-secondary font-medium border-transparent hover:border-surface-variant"}`}>
                    <span className="material-symbols-outlined text-[20px]">find_in_page</span>
                    AI Detection
                  </button>
                  <button onClick={() => { setActiveTab("humanizer"); reset(); }} className={`shrink-0 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-[12px] sm:text-[14px] flex items-center gap-2 border transition-colors ${activeTab === "humanizer" ? "bg-surface-container-lowest shadow-sm text-primary font-bold border-surface-variant" : "bg-surface-container-lowest/40 backdrop-blur hover:bg-surface-container-lowest text-secondary font-medium border-transparent hover:border-surface-variant"}`}>
                    <span className="material-symbols-outlined text-[20px]">psychology</span>
                    Humanizer
                  </button>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl shadow-xl flex flex-col lg:flex-row min-h-[420px] sm:min-h-[500px] lg:max-h-[700px] overflow-hidden relative z-10" data-aos="fade-up" data-aos-delay="200">
                  <div className="flex-1 flex flex-col">

                    <div className="p-4 sm:p-6 flex-1 flex flex-col">
                      <textarea
                        value={text}
                        onChange={(e) => {
                          setText(e.target.value);
                        }}
                        className="w-full flex-1 resize-none outline-none border-none focus:outline-none focus:ring-0 text-body-lg text-on-surface bg-transparent font-body-lg leading-relaxed placeholder:opacity-30"
                        placeholder="Start typing or paste your text here to see the magic..."
                      />
                    </div>
                    <div className="px-4 sm:px-6 py-4 bg-transparent border-t border-surface-variant grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 sm:flex sm:justify-between sm:items-center sm:gap-2">
                      <div className="col-span-2 flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <span className="font-label-md text-[12px] text-secondary whitespace-nowrap shrink-0">
                          {wordCount} Words
                        </span>
                        <div className="hidden sm:block w-px h-4 bg-surface-variant shrink-0" />
                        <button
                          onClick={async () => {
                            if (!text.trim()) return;

                            try {
                              await navigator.clipboard.writeText(text);
                              showToast("Copied to clipboard");
                            } catch {
                              showToast("Copy failed");
                            }
                          }}
                          className="flex items-center gap-1 font-label-md text-[12px] text-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!text.trim()}
                        >
                          <span className="material-symbols-outlined text-[14px]">content_copy</span>
                          Copy
                        </button>
                        <span className="font-label-md text-[12px] text-primary-container font-bold whitespace-nowrap shrink-0 ml-auto sm:ml-0">
                          {score ?? "Ready"}
                        </span>
                      </div>
                      {autoFixableAlerts.length > 0 && activeTab === "grammar" ? (
                        <button
                          onClick={() => {
                            let fixed = text;
                            const sorted = [...autoFixableAlerts]
                              .sort((a, b) => b.offset - a.offset);
                            sorted.forEach(a => {
                              fixed = fixed.slice(0, a.offset) + a.replacements[0] + fixed.slice(a.offset + a.length);
                            });
                            setText(fixed);
                            setAlerts([]);
                            setScore("Perfect Score");
                            setExpandedAlert(null);
                            showToast("Grammar fixed");
                          }}
                          className="col-span-2 sm:col-span-1 shrink-0 w-full sm:w-auto bg-primary-container text-on-primary rounded-lg font-button text-button px-8 py-3 hover:bg-primary transition-all shadow-lg hover:shadow-primary-container/20 active:scale-95 whitespace-nowrap sm:ml-4 flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                          Fix All
                        </button>
                      ) : (
                        <button
                          onClick={handleTabAction}
                          disabled={isLoading || !text.trim()}
                          className="col-span-2 sm:col-span-1 shrink-0 w-full sm:w-auto bg-primary-container text-on-primary rounded-lg font-button text-button px-8 py-3 hover:bg-primary transition-all shadow-lg hover:shadow-primary-container/20 active:scale-95 whitespace-nowrap sm:ml-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isLoading && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
                          {activeTab === "grammar" && (isLoading ? "Checking..." : "Check Grammar")}
                          {activeTab === "paraphraser" && (isLoading ? "Rephrasing..." : "Rephrase Text")}
                          {(activeTab === "ai-detection" || activeTab === "humanizer") && "Coming Soon"}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full lg:w-[540px] bg-surface-container-lowest border-t lg:border-t-0 lg:border-l border-surface-variant flex flex-col min-h-0">
                    <div className="p-5 border-b border-surface-variant bg-transparent flex items-start justify-between gap-3 min-w-0">
                      <div className="min-w-0">
                        <h4 className="font-label-md text-[11px] sm:text-label-md text-on-surface font-bold min-w-0 truncate">
                          {activeTab === "grammar" ? "Live Suggestions" : activeTab === "paraphraser" ? "Rephrased Versions" : "Results"}
                        </h4>
                        <p className="mt-1 text-[11px] text-secondary leading-tight max-w-[220px] sm:max-w-none">
                          {activeTab === "grammar"
                            ? styleAlerts.length > 0
                              ? "Style suggestions are shown, but only hard errors are auto-applied."
                              : "Review and apply fixes one by one."
                            : activeTab === "paraphraser"
                              ? "Pick the version you want to use."
                              : "Status and output will appear here."}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-auto shrink-0">
                        {activeTab === "grammar" && hardAlerts.length > 0 && (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary-container/10 text-primary-container whitespace-nowrap">
                            {hardAlerts.length} issue{hardAlerts.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {activeTab === "grammar" && hardAlerts.length === 0 && styleAlerts.length > 0 && (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface-variant text-secondary whitespace-nowrap">
                            {styleAlerts.length} style suggestion{styleAlerts.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {rephrasedText.length > 0 && activeTab === "paraphraser" && (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary-container/10 text-primary-container whitespace-nowrap">
                            {rephrasedText.length} option{rephrasedText.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto min-h-0 bg-gradient-to-b from-surface-container-lowest to-surface-container-low/40">
                      {isLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-secondary">
                          <span className="material-symbols-outlined text-primary-container text-[40px] animate-spin">progress_activity</span>
                          <p className="text-sm">Analyzing your text...</p>
                        </div>
                      )}
                      {error && !isLoading && (
                        <div className="bg-error/5 border border-error/20 rounded-xl p-4 text-error text-sm">
                          <span className="material-symbols-outlined text-[18px] align-middle mr-1">error</span>
                          {error}
                        </div>
                      )}
                      {!isLoading && !error && activeTab === "grammar" && alerts.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-primary-container/5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary-container text-[32px] opacity-40">edit_note</span>
                          </div>
                          <p className="font-body-sm text-secondary px-4 leading-relaxed">
                            {score === "Perfect Score" ? "✅ No issues found! Your text looks great." : "Paste text and click Check Grammar to start."}
                          </p>
                        </div>
                      )}
                      {!isLoading && activeTab === "grammar" && alerts.filter(a => a && a.category).map((alert, i) => {
                        const isExpanded = expandedAlert === i;
                        const categoryColor: Record<string, string> = {
                          Grammar: "text-primary-container bg-primary-container/10",
                          Spelling: "text-error bg-error/10",
                          Punctuation: "text-tertiary-container bg-tertiary-fixed-dim/20",
                          Style: "text-secondary bg-surface-variant",
                        };
                        const colorClass = categoryColor[alert.category] || "text-secondary bg-surface-variant";
                        return (
                          <div key={i} className={`border rounded-2xl transition-all overflow-hidden ${isExpanded ? "bg-white border-primary-container/30 shadow-md" : "bg-white border-surface-variant shadow-sm hover:border-primary-container/20"}`}>
                            {/* Compact header — always visible */}
                            <button
                              onClick={() => setExpandedAlert(isExpanded ? null : i)}
                              className="w-full flex flex-col items-stretch gap-2 px-4 py-3.5 text-left min-h-[48px] min-w-0"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${colorClass}`}>
                                  {alert.category}
                                </span>
                                <span className="shrink-0 text-[11px] text-secondary font-medium tabular-nums">
                                  {typeof alert.length === "number" ? `${alert.length} char${alert.length !== 1 ? "s" : ""}` : ""}
                                </span>
                                {alert?.replacements?.[0] && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const before = text.slice(0, alert.offset);
                                      const after = text.slice(alert.offset + alert.length);
                                      setText(before + alert.replacements[0] + after);
                                      setAlerts(prev => prev.filter((_, idx) => idx !== i));
                                      setExpandedAlert(null);
                                      showToast("Grammar fixed");
                                    }}
                                    className="ml-auto shrink-0 text-xs px-3 py-1.5 bg-primary-container text-on-primary rounded-full font-medium hover:bg-primary transition-colors max-w-[140px] truncate"
                                    title={alert.replacements[0]}
                                  >
                                    {alert.replacements[0]}
                                  </button>
                                )}
                                <span className={`material-symbols-outlined text-[16px] text-secondary transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}>
                                  expand_more
                                </span>
                              </div>
                              <span className="block min-w-0 text-sm text-on-surface font-medium whitespace-normal leading-relaxed">
                                {alert.shortMessage || alert.message || "Unknown issue"}
                              </span>
                            </button>
                            {/* Expanded detail */}
                            {isExpanded && (
                              <div className="px-4 pb-4 border-t border-surface-variant pt-3 bg-surface-container-lowest/70">
                                <p className="text-xs text-secondary leading-relaxed mb-3">{alert.message}</p>
                                {alert?.replacements?.length > 1 && (
                                  <div className="flex flex-wrap gap-2">
                                    <span className="text-xs text-secondary self-center">More fixes:</span>
                                    {alert.replacements.slice(1, 4).map((r, j) => (
                                      <button
                                        key={j}
                                        onClick={() => {
                                          const before = text.slice(0, alert.offset);
                                          const after = text.slice(alert.offset + alert.length);
                                          setText(before + r + after);
                                          setAlerts(prev => prev.filter((_, idx) => idx !== i));
                                          setExpandedAlert(null);
                                          showToast("Grammar fixed");
                                        }}
                                        className="text-xs px-3 py-1 bg-surface-variant text-on-surface rounded-full font-medium hover:bg-primary-container hover:text-on-primary transition-colors"
                                      >
                                        {r}
                                      </button>
                                    ))}
                                  </div>
                                )}
                                <button
                                  onClick={() => {
                                    setAlerts(prev => prev.filter((_, idx) => idx !== i));
                                    setExpandedAlert(null);
                                  }}
                                  className="mt-3 text-xs text-secondary hover:text-error transition-colors flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[14px]">close</span>
                                  Dismiss
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {!isLoading && activeTab === "paraphraser" && rephrasedText.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-tertiary-fixed-dim/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-tertiary-container text-[32px] opacity-60">swap_horiz</span>
                          </div>
                          <p className="font-body-sm text-secondary px-4 leading-relaxed">Paste text and click &quot;Rephrase Text&quot; to see alternatives.</p>
                        </div>
                      )}
                      {!isLoading && activeTab === "paraphraser" && rephrasedText.map((result, i) => (
                        <div key={i} className="bg-white border border-surface-variant rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <span className="text-[11px] font-bold uppercase tracking-wide text-tertiary-container bg-tertiary-fixed-dim/20 px-2 py-0.5 rounded-full mb-2 inline-block">Option {i + 1}</span>
                          <p className="text-sm text-on-surface leading-relaxed mt-2">{result}</p>
                          <button
                            onClick={() => setText(result)}
                            className="mt-3 text-xs px-3 py-1.5 bg-tertiary-container/20 text-tertiary-container rounded-full font-medium hover:bg-tertiary-container/40 transition-colors"
                          >
                            Use this
                          </button>
                        </div>
                      ))}
                      {!isLoading && (activeTab === "ai-detection" || activeTab === "humanizer") && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                          <span className="material-symbols-outlined text-[48px] text-secondary opacity-30">construction</span>
                          <p className="font-body-sm text-secondary px-4">This feature is coming soon! Stay tuned.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div >

      {toastMessage && (
        <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 pointer-events-none">
          <div className="flex items-center gap-2 rounded-full border border-surface-variant bg-surface-container-lowest px-4 py-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <span className="material-symbols-outlined text-[18px] text-primary-container">check_circle</span>
            <span className="font-label-md text-[12px] font-bold uppercase tracking-wide text-on-surface">
              {toastMessage}
            </span>
          </div>
        </div>
      )}

        <section className="relative py-[120px] overflow-hidden" data-aos="fade-up">
          <div className="absolute inset-0 bg-[#f8f9fb] z-0" />

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e1e2e4_1px,transparent_1px)] [background-size:24px_24px] opacity-60 z-0" />

          {/* Glowing Animated Orbs */}
          <div className="absolute top-20 left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] z-0 animate-pulse" style={{ animationDuration: '7s' }} />
          <div className="absolute bottom-10 right-[-10%] w-[600px] h-[600px] bg-tertiary-fixed-dim/15 rounded-full blur-[120px] z-0 animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />
          <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-error/10 rounded-full blur-[100px] z-0 animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />

          {/* Fade overlays for smooth transition */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#f8f9fb] to-transparent z-0" />
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#f8f9fb] to-transparent z-0" />

          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-surface-variant to-transparent z-0" />
          <div className="max-w-container-max mx-auto px-md relative z-10">
            <div className="text-center mb-xl" data-aos="fade-up" data-aos-delay="100">
              <span className="text-primary-container font-label-md tracking-tighter uppercase text-[12px] font-bold">
                Capabilities
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mt-2">
                Powerful tools for flawless writing
              </h2>
              <p className="font-body-md text-body-md text-secondary mt-4 max-w-[600px] mx-auto leading-relaxed">
                Everything you need to write clearer, more engaging content. Our AI-powered suite analyzes your text in real-time to provide actionable improvements.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 relative overflow-hidden group premium-shadow" data-aos="fade-up" data-aos-delay="150">
                <div className="max-w-[400px] relative z-10">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                    <span className="material-symbols-outlined">bolt</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Real-time Checking
                  </h3>
                  <p className="font-body-md text-body-md text-secondary mt-3">
                    Catch grammar, spelling, and punctuation errors as you type with low-latency suggestions.
                  </p>
                </div>
                <div className="absolute bottom-[-10px] right-[-10px] w-[75%] glass-card rounded-tl-2xl p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 group-hover:-translate-y-4 group-hover:-translate-x-4 z-0 border border-surface-variant/50">
                  <div className="flex gap-1.5 mb-5 opacity-70">
                    <div className="w-2.5 h-2.5 rounded-full bg-error" />
                    <div className="w-2.5 h-2.5 rounded-full bg-tertiary-container" />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-fixed-dim" />
                  </div>
                  <div className="space-y-3 mb-8">
                    <div className="h-2.5 w-full bg-surface-variant/80 rounded-full" />
                    <div className="flex gap-2 items-end">
                      <div className="h-2.5 w-1/3 bg-surface-variant/80 rounded-full mb-1" />
                      <span className="text-error border-b-[3px] border-error border-dotted font-medium text-[15px] leading-none mb-[-2px]">teh</span>
                      <div className="h-2.5 w-1/4 bg-surface-variant/80 rounded-full mb-1" />
                    </div>
                  </div>

                  <div className="absolute bottom-5 right-5 bg-surface-container-lowest border border-surface-variant/60 rounded-xl p-2.5 shadow-xl transform transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 origin-bottom-right">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-secondary line-through opacity-70 text-[13px] font-medium">teh</span>
                        <span className="material-symbols-outlined text-[14px] text-surface-tint">arrow_forward</span>
                        <span className="text-primary-container font-bold text-[14px]">the</span>
                      </div>
                      <button className="bg-primary-container text-on-primary text-[11px] px-3 py-1.5 rounded-lg font-bold hover:bg-primary transition-colors shadow-sm">
                        Fix
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 flex flex-col premium-shadow" data-aos="fade-up" data-aos-delay="200">
                <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center mb-6 text-tertiary">
                  <span className="material-symbols-outlined">palette</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Style Refinement
                </h3>
                <p className="font-body-md text-body-md text-secondary mt-3">
                  Elevate your prose with advanced vocabulary and structural improvements.
                </p>
                <div className="mt-8 p-4 bg-tertiary-fixed/30 rounded-xl border border-tertiary-fixed">
                  <span className="font-label-md text-[10px] text-tertiary-container uppercase font-bold">
                    Clarity Tip
                  </span>
                  <div className="mt-2 space-y-1">
                    <p className="text-body-sm text-secondary line-through opacity-50 text-[13px]">
                      In order to effectively communicate
                    </p>
                    <p className="text-body-sm text-on-tertiary-fixed-variant font-bold text-[14px]">
                      To communicate
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 flex flex-col premium-shadow" data-aos="fade-up" data-aos-delay="250">
                <div className="w-12 h-12 bg-on-surface-variant/10 rounded-xl flex items-center justify-center mb-6 text-on-surface-variant">
                  <span className="material-symbols-outlined">devices</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Anywhere you write
                </h3>
                <p className="font-body-md text-body-md text-secondary mt-3">
                  Browser extensions, desktop apps, and mobile keyboards for total coverage.
                </p>
              </div>

              <div className="md:col-span-8 bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 relative overflow-hidden group premium-shadow" data-aos="fade-up" data-aos-delay="300">
                <div className="max-w-[400px] relative z-10">
                  <div className="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center mb-6 text-primary-container">
                    <span className="material-symbols-outlined">analytics</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Writing Analytics
                  </h3>
                  <p className="font-body-md text-body-md text-secondary mt-3">
                    Track your progress, identify recurring mistakes, and measure readability scores over time.
                  </p>
                </div>
                <div className="absolute bottom-0 right-8 flex items-end gap-3 h-[100px]">
                  <div className="w-8 bg-surface-container-high h-[40%] rounded-t-lg" />
                  <div className="w-8 bg-surface-variant h-[60%] rounded-t-lg" />
                  <div className="w-8 bg-primary-fixed-dim h-[80%] rounded-t-lg" />
                  <div className="w-8 bg-primary-container h-[100%] rounded-t-lg shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main >

      <footer className="bg-surface-container dark:bg-surface-dim border-t border-surface-variant dark:border-outline-variant w-full py-xl px-md flex flex-col md:flex-row justify-between items-center gap-md mt-xl">
        <div className="text-primary font-bold font-headline-md text-headline-md">Scrib</div>
        <div className="flex flex-wrap justify-center gap-x-md gap-y-sm font-label-md text-label-md">
          <a className="text-on-surface-variant dark:text-on-secondary-container hover:text-primary transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="text-on-surface-variant dark:text-on-secondary-container hover:text-primary transition-colors" href="#">
            Terms of Service
          </a>
          <a className="text-on-surface-variant dark:text-on-secondary-container hover:text-primary transition-colors" href="#">
            API Docs
          </a>
          <a className="text-on-surface-variant dark:text-on-secondary-container hover:text-primary transition-colors" href="#">
            Contact Support
          </a>
        </div>
        <div className="font-body-sm text-body-sm text-secondary">
          © 2026 Scrib AI. Precision in every word.
        </div>
      </footer>
    </>
  );
}
