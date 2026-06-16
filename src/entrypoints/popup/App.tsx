import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { PageSignals, AnalysisResult, PageRisk } from "@/lib/analysis/types";
import { computeCategoryScores, computeGoblinScore, generateComplaints, generateFixes, getBiggestCrime } from "@/lib/analysis/scoring";
import { pickVerdict, buildSummary } from "@/lib/analysis/roast-copy";
import { normalizePageUrl, detectPageRisk } from "@/lib/analysis/signals";
import type { ExtractResponse } from "@/lib/messaging";
import { addRecentRoast } from "@/lib/storage";
import { ScoreOrb } from "@/components/ScoreOrb";
import { VerdictLine } from "@/components/VerdictLine";
import { ComplaintItem } from "@/components/ComplaintItem";
import { QuickFixList } from "@/components/QuickFixList";
import { LoadingState } from "@/components/LoadingState";

type AppState = "idle" | "loading" | "results" | "error";

function runAnalysis(signals: PageSignals): AnalysisResult {
  const { url, domain } = normalizePageUrl(signals.url);
  const categoryScores = computeCategoryScores(signals);
  const goblinScore = computeGoblinScore(categoryScores);
  const goblinComplaints = generateComplaints(signals, categoryScores);
  const actuallyUsefulFixes = generateFixes(signals, categoryScores);
  const biggestCrime = getBiggestCrime(goblinComplaints);
  const verdict = pickVerdict(goblinScore);
  const warnings = detectPageRisk(url);

  const result: AnalysisResult = {
    goblinScore,
    categoryScores,
    biggestCrime,
    goblinComplaints,
    actuallyUsefulFixes,
    verdict,
    summaryMarkdown: "",
    warnings,
    normalizedUrl: url,
    domain,
    metrics: {},
  };
  result.summaryMarkdown = buildSummary(result);
  return result;
}

export default function App() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [signals, setSignals] = useState<PageSignals | null>(null);
  const [error, setError] = useState<string>("");
  const [showFixes, setShowFixes] = useState(false);
  const [showPrivateWarning, setShowPrivateWarning] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRoast = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const response: ExtractResponse = await browser.runtime.sendMessage({
        type: "EXTRACT_SIGNALS",
      });
      if (!response.ok) {
        throw new Error(response.error);
      }
      const pageSignals = response.signals;
      setSignals(pageSignals);
      const analysis = runAnalysis(pageSignals);
      setResult(analysis);
      setState("results");
      await addRecentRoast(pageSignals, analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }, []);

  const handleOpenFullRoast = useCallback(async () => {
    if (!signals || !result) return;
    const warnings = result.warnings;
    const hasDanger = warnings.some((w) => w.severity === "danger");
    if (hasDanger && !showPrivateWarning) {
      setShowPrivateWarning(true);
      return;
    }
    setShowPrivateWarning(false);
    setSending(true);
    try {
      const res = await fetch("https://pagegoblin.org/api/roasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signals }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const reportPath = data?.links?.report ?? (data?.report?.slug ? `/roasts/${data.report.slug}` : null);
      if (reportPath) {
        await browser.tabs.create({ url: `https://pagegoblin.org${reportPath}` });
      } else {
        throw new Error("No report URL returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send to pagegoblin.org");
    } finally {
      setSending(false);
    }
  }, [signals, result, showPrivateWarning]);

  const handleCopySummary = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.summaryMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = result.summaryMarkdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  return (
    <div className="flex flex-col min-h-[480px] max-h-[600px] overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bone/90 backdrop-blur-sm border-b border-gray-200/50 px-5 py-3 flex items-center gap-3">
        <img src="/icon/32.png" alt="PageGoblin" className="w-7 h-7" />
        <div>
          <h1 className="font-display text-sm font-bold text-ink leading-none">
            PageGoblin
          </h1>
          <p className="text-[10px] text-gray-500">Website Roast & Teardown</p>
        </div>
      </header>

      <main className="flex-1 px-5 py-4">
        <AnimatePresence mode="wait">
          {/* Idle State */}
          {state === "idle" && (
            <motion.div
              key="idle"
              className="flex flex-col items-center justify-center py-12 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-24 h-24">
                <img src="/icon/128.png" alt="Goblin" className="w-full h-full" />
              </div>
              <div className="text-center">
                <p className="font-display text-lg font-bold text-ink">
                  Ready to roast?
                </p>
                <p className="text-sm text-gray-500 mt-1 max-w-[240px]">
                  Click below and the goblin will tear this page apart. Instantly.
                </p>
              </div>
              <button
                onClick={handleRoast}
                className="w-full max-w-[280px] py-3 px-6 rounded-xl font-display font-bold text-sm text-white shadow-lg hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer"
                style={{ background: "linear-gradient(135deg, #4ade80, #16a34a)" }}
              >
                Roast This Page
              </button>
            </motion.div>
          )}

          {/* Loading State */}
          {state === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingState />
            </motion.div>
          )}

          {/* Results State */}
          {state === "results" && result && (
            <motion.div
              key="results"
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-center py-2">
                <ScoreOrb score={result.goblinScore} />
              </div>

              <VerdictLine verdict={result.verdict} />

              {/* Biggest Crime */}
              <motion.div
                className="rounded-xl p-3 border-2"
                style={{
                  background: "linear-gradient(135deg, #fef2f2, #fff7ed)",
                  borderColor: "#fecaca",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose mb-1">
                  Biggest Crime
                </p>
                <p className="text-sm font-display font-semibold text-ink">
                  {result.biggestCrime}
                </p>
              </motion.div>

              {/* Complaints */}
              {result.goblinComplaints.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-deep">
                    Goblin Complaints
                  </h3>
                  {result.goblinComplaints.slice(0, 3).map((c, i) => (
                    <ComplaintItem key={c.id} complaint={c} index={i} />
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {/* Private page warning */}
                <AnimatePresence>
                  {showPrivateWarning && (
                    <motion.div
                      className="rounded-xl p-3 border-2 border-rose/30 bg-rose/5"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <p className="text-xs text-rose font-medium mb-2">
                        This looks like a private/internal page. Sending it to
                        pagegoblin.org will share its content. Are you sure?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowPrivateWarning(false)}
                          className="flex-1 py-1.5 text-xs font-medium text-gray-600 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleOpenFullRoast}
                          className="flex-1 py-1.5 text-xs font-medium text-white bg-rose rounded-lg hover:bg-rose/90 transition-colors cursor-pointer"
                        >
                          Proceed Anyway
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleOpenFullRoast}
                  disabled={sending}
                  className="w-full py-2.5 px-4 rounded-xl font-display font-bold text-sm text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #4ade80, #16a34a)" }}
                >
                  {sending ? "Sending..." : "Open Full Roast →"}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopySummary}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-medium text-purple-deep border border-purple-deep/20 hover:bg-purple-deep/5 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {copied ? "Copied!" : "Copy Roast Summary"}
                  </button>
                  <button
                    onClick={() => setShowFixes(!showFixes)}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-medium text-goblin-dark border border-goblin/30 hover:bg-goblin/5 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {showFixes ? "Hide Fixes" : "Useful Fixes"}
                  </button>
                </div>
              </div>

              {/* Fixes Expansion */}
              <AnimatePresence>
                {showFixes && result.actuallyUsefulFixes.length > 0 && (
                  <QuickFixList fixes={result.actuallyUsefulFixes} />
                )}
              </AnimatePresence>

              {/* Retry */}
              <div className="pt-2 pb-4">
                <button
                  onClick={() => {
                    setState("idle");
                    setResult(null);
                    setSignals(null);
                    setShowFixes(false);
                  }}
                  className="w-full py-2 text-xs text-gray-500 hover:text-ink transition-colors cursor-pointer"
                >
                  Roast another page
                </button>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {state === "error" && (
            <motion.div
              key="error"
              className="flex flex-col items-center justify-center py-12 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-16 h-16 rounded-full bg-rose/10 flex items-center justify-center">
                <svg viewBox="0 0 80 80" fill="none" className="w-10 h-10">
                  <circle cx="40" cy="40" r="28" fill="#4ade80" />
                  <circle cx="30" cy="36" r="6" fill="white" />
                  <circle cx="31" cy="36" r="3" fill="#1a1a2e" />
                  <circle cx="50" cy="36" r="6" fill="white" />
                  <circle cx="51" cy="36" r="3" fill="#1a1a2e" />
                  <path d="M30 54 Q40 46 50 54" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-display text-base font-bold text-ink">
                  The goblin got confused
                </p>
                <p className="text-sm text-gray-500 mt-1 max-w-[260px]">
                  {error}
                </p>
              </div>
              <button
                onClick={handleRoast}
                className="py-2.5 px-6 rounded-xl font-display font-bold text-sm text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
                style={{ background: "linear-gradient(135deg, #4ade80, #16a34a)" }}
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
