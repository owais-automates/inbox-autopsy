/**
 * Email Analysis Module - Pure JavaScript, no React dependencies.
 * Returns deterministic heuristic scores for cold outreach emails.
 *
 * @param {string} text - The email text to analyze
 * @returns {Object} Analysis result with scores, explanations, and suggestions
 */
export function analyzeEmail(text) {
  const normalized = text.trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = normalized.length;

  // Sentence splitting (handles . ! ? followed by space or end)
  const sentences = normalized.split(/[.!?]+(?:\s+|$)/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;

  // Helper: count occurrences of regex matches
  const countMatches = (str, regex) => (str.match(regex) || []).length;

  // ---------- CLARITY ----------
  // Flesch-Kincaid Grade Level approximation
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllables / wordCount || 0;
  const fleschKincaid = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

  // Passive voice detection (simple heuristic: "be" + past participle)
  const passiveMatches = countMatches(normalized, /\b(am|is|are|was|were|been|being|be)\s+\w+ed\b/gi);

  // Jargon/buzzword list (common corporate speak)
  const jargonWords = [
    'synergy', 'leverage', 'paradigm', 'disrupt', 'pivot', 'scalable', 'robust',
    'seamless', 'holistic', 'granular', 'bandwidth', 'low-hanging fruit',
    'move the needle', 'circle back', 'touch base', 'deep dive', 'drill down',
    'best practice', 'value add', 'core competency', 'strategic', 'innovative',
    'cutting-edge', 'game-changing', 'revolutionary', 'world-class', 'enterprise-grade'
  ];
  const jargonCount = jargonWords.reduce((sum, j) => sum + countMatches(normalized.toLowerCase(), new RegExp(`\\b${j.replace(/\s+/g, '\\s+')}\\b`, 'gi')), 0);

  // Clarity scoring (0-100)
  let clarityScore = 100;
  // Penalize high grade level (harder to read)
  clarityScore -= Math.max(0, (fleschKincaid - 8) * 4); // Penalize above grade 8
  // Penalize long sentences
  clarityScore -= Math.max(0, (avgWordsPerSentence - 20) * 2);
  // Penalize passive voice
  clarityScore -= Math.min(20, passiveMatches * 5);
  // Penalize jargon
  clarityScore -= Math.min(15, jargonCount * 3);
  // Bonus for short emails (concise)
  if (wordCount > 0 && wordCount < 100) clarityScore += 5;
  clarityScore = Math.round(Math.max(0, Math.min(100, clarityScore)));

  const clarityExplanation = `Readability: ~Grade ${Math.max(1, Math.round(fleschKincaid))} • Avg sentence: ${avgWordsPerSentence.toFixed(1)} words • Passive voice: ${passiveMatches} • Jargon hits: ${jargonCount}`;
  const claritySuggestions = [];
  if (avgWordsPerSentence > 20) claritySuggestions.push({ quote: 'Long sentences detected', fix: 'Break sentences into shorter ones (≤20 words each).' });
  if (passiveMatches > 0) claritySuggestions.push({ quote: `${passiveMatches} passive construction${passiveMatches > 1 ? 's' : ''} found`, fix: 'Use active voice: "We helped X" not "X was helped by us".' });
  if (jargonCount > 0) claritySuggestions.push({ quote: `${jargonCount} buzzword${jargonCount > 1 ? 's' : ''} detected`, fix: 'Replace jargon with plain, specific language.' });
  if (fleschKincaid > 10) claritySuggestions.push({ quote: 'High reading grade level', fix: 'Simplify vocabulary and sentence structure for broader accessibility.' });

  // ---------- RELEVANCE ----------
  // You/your vs I/we/my ratio
  const youCount = countMatches(normalized, /\b(you|your|yours)\b/gi);
  const iCount = countMatches(normalized, /\b(i|me|my|mine|we|us|our|ours)\b/gi);
  const youRatio = iCount > 0 ? youCount / iCount : (youCount > 0 ? 5 : 0);

  // Prospect-specific tokens (name, company, role indicators)
  const prospectTokens = countMatches(normalized, /\b(name|company|role|title|position|organization|team|department)\b/gi);
  // Look for capitalized words that might be names/companies (simple heuristic)
  const capitalizedWords = countMatches(normalized, /\b[A-Z][a-z]{2,}\b/g);
  const hasPersonalization = prospectTokens > 0 || capitalizedWords > 2;

  // Generic template detection
  const templatePhrases = [
    'dear sir', 'dear madam', 'to whom it may concern', 'hello there',
    'i hope this email finds you', 'i wanted to reach out', 'just following up',
    'checking in', 'circling back', 'bumping this'
  ];
  const templateHits = templatePhrases.reduce((sum, p) => sum + (normalized.toLowerCase().includes(p.toLowerCase()) ? 1 : 0), 0);

  let relevanceScore = 100;
  // You/your ratio (target ≥ 2:1)
  if (youRatio < 2) relevanceScore -= (2 - youRatio) * 15;
  // Personalization bonus
  if (hasPersonalization) relevanceScore += 10;
  else relevanceScore -= 15;
  // Template penalty
  relevanceScore -= Math.min(20, templateHits * 5);
  // Length penalty for very short emails (likely generic)
  if (wordCount < 30) relevanceScore -= 10;
  relevanceScore = Math.round(Math.max(0, Math.min(100, relevanceScore)));

  const relevanceExplanation = `"You/your" vs "I/we": ${youCount}:${iCount} (ratio ${youRatio.toFixed(1)}:1) • Personalization signals: ${hasPersonalization ? 'Yes' : 'No'} • Template phrases: ${templateHits}`;
  const relevanceSuggestions = [];
  if (youRatio < 2) relevanceSuggestions.push({ quote: `Low "you/your" ratio (${youRatio.toFixed(1)}:1)`, fix: 'Rewrite to focus on the recipient: use "you" and "your" at least 2x more than "I/we/my".' });
  if (!hasPersonalization) relevanceSuggestions.push({ quote: 'No prospect-specific details detected', fix: 'Add the recipient\'s name, company, role, or a specific reference to their work.' });
  if (templateHits > 0) relevanceSuggestions.push({ quote: `${templateHits} generic template phrase${templateHits > 1 ? 's' : ''} found`, fix: 'Replace boilerplate openings with a specific, relevant hook.' });
  if (wordCount < 30) relevanceSuggestions.push({ quote: 'Very short email', fix: 'Add context showing you\'ve researched the recipient.' });

  // ---------- CREDIBILITY ----------
  // Concrete numbers/metrics
  const numberMatches = countMatches(normalized, /\b\d+(\.\d+)?%?\b/);
  const metricWords = countMatches(normalized, /\b(revenue|growth|increase|decrease|roi|conversion|customers?|users?|clients?|leads?|sales|profit|margin)\b/gi);

  // Social proof indicators
  const socialProofWords = countMatches(normalized, /\b(client|customer|partner|testimonial|case study|logo|trusted by|worked with|helped)\b/gi);

  // Spam triggers
  const allCapsWords = countMatches(normalized, /\b[A-Z]{3,}\b/g);
  const excessiveExclamations = countMatches(normalized, /!{2,}/g);
  const spamWords = ['guarantee', 'free', 'risk-free', 'no obligation', 'limited time', 'act now', 'urgent', 'amazing', 'incredible', 'miracle'];
  const spamWordCount = spamWords.reduce((sum, w) => sum + countMatches(normalized.toLowerCase(), new RegExp(`\\b${w}\\b`, 'gi')), 0);

  let credibilityScore = 50; // Start neutral
  // Numbers/metrics bonus
  credibilityScore += Math.min(20, numberMatches * 3 + metricWords * 2);
  // Social proof bonus
  credibilityScore += Math.min(20, socialProofWords * 5);
  // Spam penalties
  credibilityScore -= Math.min(30, allCapsWords * 5 + excessiveExclamations * 10 + spamWordCount * 5);
  credibilityScore = Math.round(Math.max(0, Math.min(100, credibilityScore)));

  const credibilityExplanation = `Numbers/metrics: ${numberMatches + metricWords} • Social proof signals: ${socialProofWords} • Spam triggers: ${allCapsWords} ALL CAPS, ${excessiveExclamations} excessive !, ${spamWordCount} spam words`;
  const credibilitySuggestions = [];
  if (numberMatches + metricWords === 0) credibilitySuggestions.push({ quote: 'No concrete numbers or metrics', fix: 'Add a specific result: "increased revenue 23%" or "saved 10 hours/week".' });
  if (socialProofWords === 0) credibilitySuggestions.push({ quote: 'No social proof mentioned', fix: 'Name-drop a client, mention a case study, or reference a recognizable logo.' });
  if (allCapsWords > 0) credibilitySuggestions.push({ quote: `${allCapsWords} ALL CAPS word${allCapsWords > 1 ? 's' : ''}`, fix: 'Avoid ALL CAPS — it triggers spam filters and looks aggressive.' });
  if (excessiveExclamations > 0) credibilitySuggestions.push({ quote: 'Excessive exclamation marks', fix: 'Use at most one exclamation point per email.' });
  if (spamWordCount > 0) credibilitySuggestions.push({ quote: `${spamWordCount} spam-trigger word${spamWordCount > 1 ? 's' : ''} detected`, fix: 'Remove words like "guarantee", "free", "risk-free" that hurt deliverability.' });

  // ---------- ACTIONABILITY ----------
  // CTA detection: questions, links, clear next steps
  const questionCount = countMatches(normalized, /\?/g);
  const linkCount = countMatches(normalized, /https?:\/\/\S+/g);
  const ctaPhrases = countMatches(normalized, /\b(call|meeting|chat|demo|trial|schedule|book|reply|let me know|interested|available)\b/gi);

  // Competing asks (multiple CTAs)
  const ctaIndicators = questionCount + linkCount + ctaPhrases;
  const hasClearCTA = ctaIndicators > 0;
  const multipleCTAs = ctaIndicators > 2;

  // Low friction: specific time proposal, calendar link, simple question
  const lowFriction = countMatches(normalized, /\b(15|20|30)\s*(min|minute)|calendar|calendly|pick a time|thursday|friday|monday|tuesday|wednesday\b/gi);

  let actionabilityScore = 50;
  if (hasClearCTA) actionabilityScore += 30;
  if (multipleCTAs) actionabilityScore -= 20;
  if (lowFriction > 0) actionabilityScore += 15;
  if (questionCount === 0 && linkCount === 0) actionabilityScore -= 25;
  actionabilityScore = Math.round(Math.max(0, Math.min(100, actionabilityScore)));

  const actionabilityExplanation = `CTA signals: ${ctaIndicators} (questions: ${questionCount}, links: ${linkCount}, action words: ${ctaPhrases}) • Low-friction indicators: ${lowFriction} • Multiple CTAs: ${multipleCTAs ? 'Yes' : 'No'}`;
  const actionabilitySuggestions = [];
  if (!hasClearCTA) actionabilitySuggestions.push({ quote: 'No clear call-to-action found', fix: 'Add one specific ask: a question ("Open to a 15-min call Thursday?") or a low-friction link.' });
  if (multipleCTAs) actionabilitySuggestions.push({ quote: 'Multiple competing calls-to-action', fix: 'Keep only ONE clear next step — remove competing asks.' });
  if (lowFriction === 0 && hasClearCTA) actionabilitySuggestions.push({ quote: 'CTA present but high friction', fix: 'Reduce friction: propose a specific time, add a calendar link, or ask a simple yes/no question.' });

  return {
    scores: {
      clarity: clarityScore,
      relevance: relevanceScore,
      credibility: credibilityScore,
      actionability: actionabilityScore,
    },
    explanations: {
      clarity: clarityExplanation,
      relevance: relevanceExplanation,
      credibility: credibilityExplanation,
      actionability: actionabilityExplanation,
    },
    suggestions: {
      clarity: claritySuggestions,
      relevance: relevanceSuggestions,
      credibility: credibilitySuggestions,
      actionability: actionabilitySuggestions,
    },
    meta: {
      wordCount,
      charCount,
      sentenceCount,
      analyzedAt: new Date().toISOString(),
    },
  };
}

/**
 * Simple syllable counter for English words (heuristic).
 */
function countSyllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  // Count vowel groups
  const matches = w.match(/[aeiouy]+/g);
  let count = matches ? matches.length : 1;
  // Silent e adjustment
  if (w.endsWith('e') && !w.endsWith('le') && count > 1) count--;
  return Math.max(1, count);
}