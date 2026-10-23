import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { KNOWLEDGE_BASE, CATEGORIES, PRIORITIES } from './knowledgeBase.js';


const client = env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_BASE_URL,
    }) 
  : null;
if (!client) console.warn('[AI] OPENAI_API_KEY not set — AI features disabled, using rule-based fallback');

const categoryRules = [
  { category: 'Royalty & Payments', words: ['royalty', 'payment', 'payout', 'paid', 'earning', 'bank', 'money', 'refund'] },
  { category: 'ISBN & Metadata Issues', words: ['isbn', 'metadata', 'title correction', 'author bio', 'description', 'duplicate'] },
  { category: 'Printing & Quality', words: ['print', 'printing', 'binding', 'misprint', 'blurry', 'quality', 'damaged', 'pages'] },
  { category: 'Distribution & Availability', words: ['amazon', 'flipkart', 'unavailable', 'distribution', 'listing', 'stock', 'available'] },
  { category: 'Book Status & Production Updates', words: ['status', 'production', 'typesetting', 'cover design', 'proofreading', 'published', 'delay'] }
];
function ruleBasedClassification(text) {
  const normalized = text.toLowerCase();
  return categoryRules.find((rule) => rule.words.some((word) => normalized.includes(word)))?.category ?? 'General Inquiry';
}
function ruleBasedPriority(text, category) {
  const normalized = text.toLowerCase();
  if (/no royalty for [3-9]|no royalty for [1-9][0-9]|months|fraud|wrong isbn|incorrect isbn|wrong book linked|duplicate isbn|serious defect/.test(normalized)) return 'Critical';
  if (category === 'ISBN & Metadata Issues' || /overdue|not received|defect|damaged|misprint|urgent|incorrect/.test(normalized)) return 'High';
  if (category === 'Royalty & Payments' || category === 'Printing & Quality') return 'High';
  if (/update|change|question|can i/.test(normalized)) return 'Low';
  return 'Medium';
}
export async function classifyTicket({ subject, description, book }) {
  const text = `${subject}
${description}`;
  const fallbackCategory = ruleBasedClassification(text);
  const fallbackPriority = ruleBasedPriority(text, fallbackCategory);
  if (!client) return { category: fallbackCategory, priority: fallbackPriority, aiGenerated: false };
  try {
    const response = await client.chat.completions.create({ model: env.OPENAI_MODEL, temperature: 0, max_tokens: 180, response_format: { type: 'json_object' }, messages: [
      { role: 'system', content: `Classify a BookLeaf author support ticket. Return JSON only: {"category": one of ${JSON.stringify(CATEGORIES)}, "priority": one of ${JSON.stringify(PRIORITIES)}}. Prioritize overdue royalties, incorrect/duplicate ISBNs, severe quality defects. Do not invent facts.
Relevant policy:
${KNOWLEDGE_BASE}` },
      { role: 'user', content: JSON.stringify({ subject, description, book: book ? { title: book.title, status: book.status, royaltyPending: book.royaltyPending } : null }) }
    ] });
    const parsed = JSON.parse(response.choices[0]?.message?.content ?? '{}');
    return { category: CATEGORIES.includes(parsed.category) ? parsed.category : fallbackCategory, priority: PRIORITIES.includes(parsed.priority) ? parsed.priority : fallbackPriority, aiGenerated: true };
  } catch (error) {
    console.error('[AI] Classification failed:', error.message, error.status ?? '');
    return { category: fallbackCategory, priority: fallbackPriority, aiGenerated: false };
  }
}
export async function draftResponse(ticket, book) {
  const manualFallback = `Hello,

Thank you for contacting BookLeaf Publishing. We understand your concern regarding "${ticket.subject}" and are reviewing the details. Our support team will investigate and follow up with the next steps.

If you have any additional details that may help us investigate, please reply to this ticket.

Best regards,
BookLeaf Author Support`;
  if (!client) return { draft: manualFallback, aiGenerated: false, reason: 'OPENAI_API_KEY is not configured' };
  try {
    const response = await client.chat.completions.create({ model: env.OPENAI_MODEL, temperature: 0.3, max_tokens: 450, messages: [
      { role: 'system', content: `You draft responses for BookLeaf Publishing author support. Be empathetic, professional, specific, acknowledge the concern, state a clear next step, and do not invent dates, payment confirmations or policies. Use only supplied facts. The draft is for an admin to review; do not claim an action has already happened unless supplied.
Knowledge base:
${KNOWLEDGE_BASE}` },
      { role: 'user', content: JSON.stringify({ ticket: { subject: ticket.subject, description: ticket.description, category: ticket.category, priority: ticket.priority, status: ticket.status }, book: book ? { title: book.title, status: book.status, royaltyPending: book.royaltyPending, royaltyPaid: book.royaltyPaid, totalRoyaltyEarned: book.totalRoyaltyEarned, isbn: book.isbn } : null }) }
    ] });
    const draft = response.choices[0]?.message?.content?.trim();
    return { draft: draft || manualFallback, aiGenerated: Boolean(draft) };
  } catch (error) {
    console.error('[AI] Draft generation failed:', error.message, error.status ?? '');
    return { draft: manualFallback, aiGenerated: false, reason: 'AI provider unavailable; review and edit the fallback draft' };
  }
}
