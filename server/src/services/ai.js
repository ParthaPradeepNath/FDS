const SENTIMENTS = ['positive', 'negative', 'neutral']

const PROVIDER_MODELS = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-haiku-latest',
  google: 'gemini-flash-latest',
}

const truncate = (text, max) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)

const detectProvider = (key) => {
  if (key.startsWith('sk-ant')) return 'anthropic'
  if (key.startsWith('AIza')) return 'google'
  return 'openai'
}

export const isAiConfigured = () => resolveConfig() !== null

const resolveConfig = () => {
  const explicit = (process.env.AI_PROVIDER || '').toLowerCase()
  const keys = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GEMINI_API_KEY,
  }
  const shared = process.env.AI_API_KEY

  let provider = ''
  if (explicit) provider = explicit
  else if (shared) provider = detectProvider(shared)
  else provider = Object.keys(keys).find((p) => keys[p]) || ''

  if (!provider || !PROVIDER_MODELS[provider]) return null
  const key = keys[provider] || shared
  if (!key) return null

  return { provider, key, model: process.env.AI_MODEL || PROVIDER_MODELS[provider] }
}

const TRANSIENT_STATUSES = [429, 500, 502, 503, 504]

const fetchWithTimeout = (url, options, ms = 30000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer))
}

const httpError = (label, status, body) => {
  const error = new Error('AI analysis is temporarily unavailable. Please try again in a few minutes.')
  error.status = status
  error.detail = `${label} request failed (${status}): ${truncate(body, 500)}`
  return error
}

const callWithRetry = async (fn, attempts = 3) => {
  let lastError
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!error.status || !TRANSIENT_STATUSES.includes(error.status) || i === attempts - 1) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 600 * 2 ** i))
    }
  }
  throw lastError
}

const callOpenAI = async ({ key, model, system, user }) => {
  const base = process.env.AI_BASE_URL || 'https://api.openai.com/v1'
  const res = await fetchWithTimeout(`${base.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!res.ok) throw httpError('OpenAI', res.status, await res.text())
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

const callAnthropic = async ({ key, model, system, user }) => {
  const res = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      temperature: 0,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })
  if (!res.ok) throw httpError('Anthropic', res.status, await res.text())
  const data = await res.json()
  return data.content?.map((b) => b.text).filter(Boolean).join('') || ''
}

const callGoogle = async ({ key, model, system, user }) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature: 0 },
    }),
  })
  if (!res.ok) throw httpError('Gemini', res.status, await res.text())
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
}

const CALLS = {
  openai: callOpenAI,
  anthropic: callAnthropic,
  google: callGoogle,
}

const parseJson = (content) => {
  const cleaned = content.replace(/```json|```/gi, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('LLM response was not JSON')
  return JSON.parse(cleaned.slice(start, end + 1))
}

const normalize = (parsed, fallback) => {
  const sentiment = SENTIMENTS.includes(parsed.sentiment) ? parsed.sentiment : null
  const topics = Array.isArray(parsed.topics)
    ? parsed.topics
        .filter((t) => typeof t === 'string' && t.trim())
        .slice(0, 5)
        .map((t) => t.trim().toLowerCase())
    : []
  const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : ''

  if (!sentiment && topics.length === 0 && !summary) throw new Error('LLM response missing fields')

  return {
    sentiment: sentiment || fallback.sentiment,
    topics,
    summary: summary || fallback.summary,
  }
}

export const analyzeFeedback = async ({ comment, rating, suggestion = '' }) => {
  const config = resolveConfig()
  if (!config) {
    throw new Error(
      'No AI provider configured. Set an API key in server/.env (AI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY).',
    )
  }

  const system =
    'You are a feedback analysis assistant. Always respond with valid JSON matching the requested schema. No markdown, no code fences, no extra text.'

  const user = [
    'Analyze the following user feedback. Respond with JSON only using exactly this schema:',
    '{"sentiment":"positive or negative or neutral","topics":["one to three short lowercase topic labels such as teaching, content, facilities, food, support, pricing, product, scheduling"],"summary":"one concise single-sentence summary, max 40 words"}',
    `Rating: ${rating}/5.`,
    `Comment: "${truncate(comment, 1200)}"`,
    suggestion ? `Suggestion: "${truncate(suggestion, 500)}"` : '',
  ].join('\n')

  const content = await callWithRetry(() =>
    CALLS[config.provider]({
      key: config.key,
      model: config.model,
      system,
      user,
    }),
  )

  const parsed = parseJson(content)
  const fallback = {
    sentiment: rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral',
    topics: [],
    summary: truncate(comment, 220),
  }
  return normalize(parsed, fallback)
}
