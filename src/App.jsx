import { useState, useCallback, useEffect } from 'react'
import { analyzeEmail } from './utils/analyzeEmail.js'
import { rewriteEmail } from './utils/rewriteEmail.js'
import { SAMPLES } from './utils/samples.js'
import { saveToHistory, getHistory, clearHistory, restoreFromHistory } from './utils/history.js'

// Score color thresholds
function getScoreColor(score) {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function getScoreBg(score) {
  if (score >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
  if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
  return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
}

function getProgressColor(score) {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

// Compact score badge for the overview row
function ScoreBadge({ label, score, explanation }) {
  const color = getScoreColor(score)
  const bg = getScoreBg(score)
  const progressColor = getProgressColor(score)

  return (
    <article className={`rounded-xl border p-4 ${bg}`} aria-labelledby={`${label.toLowerCase()}-badge`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 id={`${label.toLowerCase()}-badge`} className="text-sm font-semibold text-gray-900 dark:text-white flex-1 min-w-0">
          {label}
        </h3>
        <span className={`text-2xl font-bold ${color} flex-shrink-0`} aria-label={`${label} score: ${score} out of 100`}>
          {score}
        </span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" role="img" aria-label={`${label} score ${score} percent`}>
        <div
          className={progressColor}
          style={{ width: `${score}%`, transition: 'width 0.3s ease' }}
          aria-hidden="true"
        />
      </div>
      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{explanation}</p>
    </article>
  )
}

// Suggestion item component
function SuggestionItem({ quote, fix }) {
  return (
    <li className="py-3 px-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-3">
        <span className="font-medium text-gray-900 dark:text-white sm:w-1/3 sm:flex-shrink-0">Issue:</span>
        <span className="text-gray-700 dark:text-gray-300 flex-1 min-w-0">"{quote}"</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-3 mt-2">
        <span className="font-medium text-indigo-600 dark:text-indigo-400 sm:w-1/3 sm:flex-shrink-0">Fix:</span>
        <span className="text-indigo-600 dark:text-indigo-400 flex-1 min-w-0">{fix}</span>
      </div>
    </li>
  )
}

// Suggestion group for each category
function SuggestionGroup({ label, suggestions, score }) {
  if (suggestions.length === 0) {
    return (
      <div className="py-4 px-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{label}: No major issues detected</span>
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-3" aria-labelledby={`${label.toLowerCase()}-suggestions`}>
      <h3 id={`${label.toLowerCase()}-suggestions`} className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${getScoreColor(score) === 'text-green-600 dark:text-green-400' ? 'bg-green-500' : getScoreColor(score) === 'text-yellow-600 dark:text-yellow-400' ? 'bg-yellow-500' : 'bg-red-500'}`} aria-hidden="true" />
        {label} ({suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''})
      </h3>
      <ul className="space-y-2" role="list">
        {suggestions.map((s, i) => (
          <SuggestionItem key={i} quote={s.quote} fix={s.fix} />
        ))}
      </ul>
    </section>
  )
}

function EmailInput({ onTextChange, onAnalyze, onClear, onSampleSelect, disabled, text, charCount, wordCount }) {
  return (
    <section
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 sm:p-8 shadow-sm"
      aria-labelledby="input-title"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 id="input-title" className="text-xl font-semibold text-gray-900 dark:text-white">
          Paste Your Cold Email
        </h2>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{charCount} characters</span>
          <span>·</span>
          <span>{wordCount} words</span>
        </div>
      </div>

      <label htmlFor="email-input" className="sr-only">
        Cold outreach email text
      </label>
      <textarea
        id="email-input"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        className="w-full min-h-[200px] max-h-[400px] px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y font-mono text-sm leading-relaxed"
        placeholder="Paste a cold outreach email here to analyze..."
        aria-describedby="input-hint"
      />

      <p id="input-hint" className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
        Tip: Include the full email — subject line, greeting, body, and sign-off.
      </p>

      {/* Sample Emails Selector */}
      <div className="mt-6">
        <label htmlFor="sample-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quick Load Sample:
        </label>
        <select
          id="sample-select"
          onChange={(e) => onSampleSelect(e.target.value)}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Select a sample...</option>
          {SAMPLES.map(sample => (
            <option key={sample.id} value={sample.content}>
              {sample.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={disabled || text.trim().length === 0}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Analyze Email
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled || text.trim().length === 0}
          className="w-full sm:w-auto px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Clear
        </button>
      </div>

      {text.trim().length === 0 && (
        <div className="mt-6 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-center">
          <svg
            className="w-10 h-10 mx-auto mb-2 text-indigo-500 dark:text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="text-indigo-700 dark:text-indigo-300 font-medium">
            Ready when you are
          </p>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
            Paste any cold outreach email above and click <strong>Analyze</strong> to get
            four explainable quality scores with specific improvement suggestions.
          </p>
        </div>
      )}
    </section>
  )
}

// Toast notification component
function Toast({ message, type = 'info', onClose }) {
  if (!message) return null

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ease-in-out ${type === 'success' ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900 dark:border-green-800 dark:text-green-200' : type === 'error' ? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900 dark:border-red-800 dark:text-red-200' : 'bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-200'}`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function ResultsPanel({ result, onRewrite, rewrittenText, isRewriting }) {
  if (!result) return null

  const { scores, explanations, suggestions, meta } = result
  const categories = [
    { key: 'clarity', label: 'Clarity', score: scores.clarity, explanation: explanations.clarity, suggestions: suggestions.clarity },
    { key: 'relevance', label: 'Relevance', score: scores.relevance, explanation: explanations.relevance, suggestions: suggestions.relevance },
    { key: 'credibility', label: 'Credibility', score: scores.credibility, explanation: explanations.credibility, suggestions: suggestions.credibility },
    { key: 'actionability', label: 'Actionability', score: scores.actionability, explanation: explanations.actionability, suggestions: suggestions.actionability },
  ]

  return (
    <section
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 sm:p-8 shadow-sm"
      aria-labelledby="results-title"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 id="results-title" className="text-xl font-semibold text-gray-900 dark:text-white">
          Analysis Results
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {meta.wordCount} words · {meta.sentenceCount} sentences · Analyzed just now
        </div>
      </div>

      {/* Score Overview Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8" role="list" aria-label="Quality scores">
        {categories.map((cat) => (
          <ScoreBadge
            key={cat.key}
            label={cat.label}
            score={cat.score}
            explanation={cat.explanation}
          />
        ))}
      </div>

      {/* Suggestions Section */}
      <div className="space-y-6" aria-labelledby="suggestions-heading">
        <h3 id="suggestions-heading" className="text-lg font-semibold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
          Improvement Suggestions
        </h3>
        <div className="space-y-6">
          {categories.map((cat) => (
            <SuggestionGroup
              key={cat.key}
              label={cat.label}
              suggestions={cat.suggestions}
              score={cat.score}
            />
          ))}
        </div>
      </div>

      {/* Rewrite Section */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Rule-Based Rewrite
          </h3>
          <button
            onClick={onRewrite}
            disabled={isRewriting || !result}
            className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRewriting ? 'Generating...' : 'Rewrite'}
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Applies rule-based improvements to address the detected issues. Preserves intent, names, numbers, and URLs.
        </p>
        {rewrittenText && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Rewritten Email:
            </h4>
            <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
              {rewrittenText}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="mt-8 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-100 dark:border-gray-800 pt-4">
        <strong>Note:</strong> Scores are heuristic guidance based on textual patterns,
        not predictions of actual reply rates. No recipient facts are invented or assumed.
      </p>
    </section>
  )
}

// History Panel component
function HistoryPanel({ history, onRestore, onClear, showConfirm, onConfirmClear, onCancelClear }) {
  if (history.length === 0) return null

  return (
    <section
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 sm:p-8 shadow-sm"
      aria-labelledby="history-title"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 id="history-title" className="text-xl font-semibold text-gray-900 dark:text-white">
          Recent History
        </h2>
        {showConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Clear all history?</span>
            <button
              onClick={onConfirmClear}
              className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            >
              Yes, Clear
            </button>
            <button
              onClick={onCancelClear}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={onClear}
            className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Stored locally in this browser. No server storage.
      </p>

      <ul className="space-y-3" role="list" aria-label="Analysis history">
        {history.map((entry) => (
          <li
            key={entry.id}
            onClick={() => onRestore(entry.id)}
            className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onRestore(entry.id); }}
            aria-label={`Restore analysis from ${new Date(entry.timestamp).toLocaleString()}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap text-sm">
                <span className="font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
                <div className="flex items-center gap-2 text-xs">
                  {['Clarity', 'Relevance', 'Credibility', 'Actionability'].map((label, i) => (
                    <span key={label} className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${entry.scores[label.toLowerCase()] >= 80 ? 'bg-green-500' : entry.scores[label.toLowerCase()] >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} aria-hidden="true" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{entry.scores[label.toLowerCase()]}</span>
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={entry.emailText}>
                {entry.preview}
              </p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              Click to restore
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function App() {
  const [emailText, setEmailText] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [rewrittenText, setRewrittenText] = useState('')
  const [isRewriting, setIsRewriting] = useState(false)
  const [toast, setToast] = useState({ message: '', type: '' })
  const [history, setHistory] = useState([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory())
  }, [])

  const refreshHistory = useCallback(() => {
    setHistory(getHistory())
  }, [])

  const handleTextChange = useCallback((text) => {
    setEmailText(text)
    // Clear previous results when text changes
    if (analysisResult) setAnalysisResult(null)
    if (rewrittenText) setRewrittenText('')
  }, [analysisResult, rewrittenText])

  const handleSampleSelect = useCallback((sampleContent) => {
    setEmailText(sampleContent)
    if (analysisResult) setAnalysisResult(null)
    if (rewrittenText) setRewrittenText('')
  }, [analysisResult, rewrittenText])

  const handleAnalyze = useCallback(() => {
    if (!emailText.trim()) return
    setIsAnalyzing(true)
    // Run analysis synchronously (fast) — no fake delay
    const result = analyzeEmail(emailText)
    setAnalysisResult(result)
    setIsAnalyzing(false)
    // Save to history
    saveToHistory(result, emailText)
    refreshHistory()
  }, [emailText, refreshHistory])

  const handleRewrite = useCallback(() => {
    if (!analysisResult) return
    setIsRewriting(true)
    try {
      const rewritten = rewriteEmail(emailText, analysisResult)
      setRewrittenText(rewritten)
    } catch (e) {
      console.error('Rewrite failed:', e)
      showToast('Failed to generate rewrite. Please try again.', 'error')
    } finally {
      setIsRewriting(false)
    }
  }, [emailText, analysisResult])

  const handleCopyRewrite = useCallback(async () => {
    if (!rewrittenText) return

    try {
      await navigator.clipboard.writeText(rewrittenText)
      showToast('Rewritten email copied to clipboard!', 'success')
    } catch (e) {
      console.error('Copy failed:', e)
      // Fallback for mobile browsers or older browsers
      const textArea = document.createElement('textarea')
      textArea.value = rewrittenText
      textArea.style.position = 'absolute'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand('copy')
        showToast('Rewritten email copied to clipboard!', 'success')
      } catch (err) {
        console.error('Fallback copy failed:', err)
        showToast('Failed to copy. Please select and copy manually.', 'error')
      }

      document.body.removeChild(textArea)
    }
  }, [rewrittenText])

  const handleRestoreHistory = useCallback((id) => {
    const restored = restoreFromHistory(id)
    if (!restored) {
      showToast('Failed to restore from history.', 'error')
      return
    }
    setEmailText(restored.emailText)
    setAnalysisResult(restored.analysis)
    setRewrittenText('')
    showToast('Restored from history.', 'info')
  }, [])

  const handleClearHistory = useCallback(() => {
    setShowClearConfirm(true)
  }, [])

  const handleConfirmClear = useCallback(() => {
    clearHistory()
    refreshHistory()
    setShowClearConfirm(false)
    showToast('History cleared.', 'success')
  }, [refreshHistory])

  const handleCancelClear = useCallback(() => {
    setShowClearConfirm(false)
  }, [])

  const showToast = (message, type) => {
    setToast({ message, type })
    setTimeout(() => {
      setToast({ message: '', type: '' })
    }, 4000)
  }

  const handleClear = useCallback(() => {
    setEmailText('')
    setAnalysisResult(null)
    setRewrittenText('')
  }, [])

  const charCount = emailText.length
  const wordCount = emailText.trim() ? emailText.trim().split(/\s+/).length : 0

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                Inbox Autopsy
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Features
              </a>
              <a
                href="#"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section - compact */}
        <section className="mb-8 text-center" aria-labelledby="app-title">
          <h1
            id="app-title"
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight text-balance mb-3"
          >
            Cold Email Auditor
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Paste a cold outreach email. Get four explainable quality scores
            and specific improvement suggestions — instantly, privately, free.
          </p>
        </section>

        {/* Input Panel */}
        <EmailInput
          onTextChange={handleTextChange}
          onAnalyze={handleAnalyze}
          onClear={handleClear}
          onSampleSelect={handleSampleSelect}
          disabled={isAnalyzing}
          text={emailText}
          charCount={charCount}
          wordCount={wordCount}
        />

        {/* Results Panel */}
        <ResultsPanel
          result={analysisResult}
          onRewrite={handleRewrite}
          rewrittenText={rewrittenText}
          isRewriting={isRewriting}
        />

        {/* Copy Rewrite button (visible only when there's rewritten text) */}
        {rewrittenText && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleCopyRewrite}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Rewrite
            </button>
          </div>
        )}

        {/* History Panel */}
        <HistoryPanel
          history={history}
          onRestore={handleRestoreHistory}
          onClear={handleClearHistory}
          showConfirm={showClearConfirm}
          onConfirmClear={handleConfirmClear}
          onCancelClear={handleCancelClear}
        />

        {/* Tech Stack Badge */}
        <p className="mt-10 text-sm text-gray-500 dark:text-gray-400 text-center">
          Built with React 18 + Vite + Tailwind CSS v4 • No backend • No
          tracking • Fully offline-capable
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Inbox Autopsy v0.1 — Spec-Driven Development •{" "}
            <a
              href="#"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              View Specification
            </a>
          </p>
        </div>
      </footer>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
    </main>
  )
}

export default App