# AI Integration Guide — Phase 3 Optional Addon

**Purpose:** Add AI features to any project (chatbot, embeddings, RAG, recommendations).

**When to Use:** User answered Phase 1 Q10: "AI features needed? Basic or Advanced"

**Version:** 1.0.0 (2026 providers)

---


## Contents

- [AI Feature Types](#ai-feature-types)
- [Provider Comparison (2026)](#provider-comparison-2026)
- [Cost Estimation](#cost-estimation)
- [Open-Source Alternative (Ollama Local)](#open-source-alternative-ollama-local)
- [Implementation Checklist](#implementation-checklist)
- [Privacy & Security](#privacy-security)
- [Example Use Cases by Project Type](#example-use-cases-by-project-type)
- [Testing Strategy](#testing-strategy)
- [Monitoring & Alerts](#monitoring-alerts)
- [Roadmap](#roadmap)

## AI Feature Types

### 1. Basic AI (Simple)

**Use Cases:**
- Chatbot (customer support, FAQ)
- Text generation (email drafts, summaries)
- Simple classification (sentiment, category)
- Translation

**Tech Stack:**
- **API:** OpenAI GPT-4o-mini ($0.15/1M input tokens) or Anthropic Claude Haiku
- **No database:** Stateless API calls
- **Cost:** $5-10/month (10K conversations)

**Implementation:**
```typescript
// app/api/chat/route.ts
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  const { message } = await req.json()
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful HR assistant.' },
      { role: 'user', content: message }
    ]
  })
  
  return Response.json({ reply: completion.choices[0].message.content })
}
```

---

### 2. Advanced AI (RAG + Embeddings)

**Use Cases:**
- Knowledge base Q&A (search company docs)
- Semantic search (find similar items)
- Recommendations (suggest products, contacts)
- Long-term memory (remember user preferences)

**Tech Stack:**
- **Embeddings API:** OpenAI text-embedding-3-small ($0.02/1M tokens)
- **Vector Database:** 
  - PostgreSQL + pgvector (free, self-hosted)
  - Pinecone (managed, $70/month)
  - Qdrant (open-source, self-host or $25/month cloud)
- **LLM:** OpenAI GPT-4o or Anthropic Claude Sonnet
- **Cost:** $20-50/month (5K documents, 10K queries)

**Architecture (RAG Pipeline):**
```
1. INDEX PHASE (one-time):
   Document → Split chunks → Embed (OpenAI) → Store (pgvector)

2. QUERY PHASE (real-time):
   User question → Embed → Vector search (top 5 chunks) → LLM (generate answer with context)
```

**Implementation:**
```typescript
// lib/ai/embeddings.ts
import OpenAI from 'openai'

const openai = new OpenAI()

export async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1536
  })
  return response.data[0].embedding
}

// lib/ai/rag.ts
import { embedText } from './embeddings'
import { db } from '@/lib/db'

export async function searchDocs(query: string, limit = 5) {
  const queryEmbedding = await embedText(query)
  
  // PostgreSQL + pgvector similarity search
  const results = await db.execute(`
    SELECT content, 
           1 - (embedding <=> $1::vector) AS similarity
    FROM documents
    ORDER BY embedding <=> $1::vector
    LIMIT $2
  `, [queryEmbedding, limit])
  
  return results
}

export async function answerWithRAG(question: string) {
  // 1. Find relevant docs
  const docs = await searchDocs(question)
  
  // 2. Build context
  const context = docs.map(d => d.content).join('\n\n')
  
  // 3. Generate answer
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Answer based on the provided context only.' },
      { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` }
    ]
  })
  
  return {
    answer: completion.choices[0].message.content,
    sources: docs.map(d => d.id)
  }
}
```

**Database Setup (PostgreSQL + pgvector):**
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table with embeddings
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536),  -- OpenAI text-embedding-3-small dimension
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

---

## Provider Comparison (2026)

| Provider | Model | Price (1M tokens) | Speed | Context | Best For |
|----------|-------|-------------------|-------|---------|----------|
| **OpenAI** | GPT-4o-mini | $0.15 in / $0.60 out | Fast | 128K | General chatbot |
| **OpenAI** | GPT-4o | $2.50 in / $10 out | Medium | 128K | Complex reasoning |
| **Anthropic** | Claude Haiku | $0.25 in / $1.25 out | Very Fast | 200K | Speed critical |
| **Anthropic** | Claude Sonnet | $3 in / $15 out | Fast | 200K | Best quality |
| **Groq** | Llama 3.1 8B | $0.05 in / $0.08 out | Ultra Fast | 128K | Budget + speed |
| **Together** | Llama 3.1 70B | $0.88 in / $0.88 out | Fast | 128K | Open-source best |

**Embeddings:**
| Provider | Model | Price (1M tokens) | Dimension | Best For |
|----------|-------|-------------------|-----------|----------|
| **OpenAI** | text-embedding-3-small | $0.02 | 1536 | Standard |
| **OpenAI** | text-embedding-3-large | $0.13 | 3072 | High accuracy |
| **Voyage** | voyage-2 | $0.10 | 1024 | Code search |

---

## Cost Estimation

### Basic Chatbot (10K messages/month)
- 10K × 500 tokens avg = 5M tokens
- GPT-4o-mini: $0.15 × 5 + $0.60 × 5 = **$3.75/month**

### RAG System (5K documents, 10K queries/month)
- **Index phase (one-time):**
  - 5K docs × 1K tokens = 5M tokens
  - Embeddings: $0.02 × 5 = $0.10
- **Query phase (monthly):**
  - 10K queries × 100 tokens = 1M tokens (embed)
  - Embeddings: $0.02 × 1 = $0.02
  - LLM: 10K × 2K tokens context = 20M tokens
  - GPT-4o: $2.50 × 20 = $50
- **Total:** $0.10 (setup) + $50.02/month

**Cheaper Alternative (Groq Llama):**
- Query LLM: $0.05 × 20 = $1
- **Total:** $0.10 (setup) + $1.02/month ✅

---

## Open-Source Alternative (Ollama Local)

**For:** $0 cost, privacy-sensitive data, offline

**Tech Stack:**
- **LLM:** Ollama (Llama 3.1 8B, Mistral 7B)
- **Embeddings:** sentence-transformers (all-MiniLM-L6-v2)
- **Vector DB:** Qdrant (Docker self-hosted)
- **Cost:** $0 (run on own server)

**Setup:**
```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull model
ollama pull llama3.1:8b

# Run API server (localhost:11434)
ollama serve
```

**Implementation:**
```typescript
// lib/ai/ollama.ts
export async function chat(message: string) {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.1:8b',
      messages: [{ role: 'user', content: message }]
    })
  })
  
  return response.json()
}
```

**Trade-offs:**
- ✅ $0 cost
- ✅ Full privacy (data never leaves server)
- ✅ No rate limits
- ❌ Slower (no GPU: 5-10 tokens/s, with GPU: 50+ tokens/s)
- ❌ Lower quality vs GPT-4o/Claude
- ❌ Requires server (8GB RAM minimum, 16GB+ recommended)

---

## Implementation Checklist

### Basic Chatbot
- [ ] Sign up API key (OpenAI / Anthropic)
- [ ] Add to `.env.local`: `OPENAI_API_KEY=sk-...`
- [ ] Create `/api/chat/route.ts` endpoint
- [ ] Add chat UI component (textarea + submit)
- [ ] Test: ask question → receive answer
- [ ] Add error handling (rate limit, timeout)
- [ ] Monitor usage (OpenAI dashboard)

### RAG System
- [ ] Setup pgvector (PostgreSQL extension)
- [ ] Create `documents` table with `vector(1536)` column
- [ ] Index documents:
  - [ ] Fetch documents (from DB / files / web)
  - [ ] Split into chunks (500-1000 tokens)
  - [ ] Embed each chunk (OpenAI API)
  - [ ] Store in `documents` table
- [ ] Create search function (cosine similarity)
- [ ] Create RAG answer function (search → LLM with context)
- [ ] Add UI (search box → display answer + sources)
- [ ] Test: ask question → verify sources cited
- [ ] Monitor cost (embedding + LLM usage)

---

## Privacy & Security

### Data Handling
- ✅ **DO:** Anonymize PII before sending to API (names → "User A")
- ✅ **DO:** Encrypt API keys (environment variables, not hardcoded)
- ✅ **DO:** Rate limit (prevent abuse, cost overrun)
- ❌ **DON'T:** Send passwords, credit cards, health records to external API
- ❌ **DON'T:** Store API responses with PII (comply with GDPR)

### API Key Security
```typescript
// ❌ BAD: Expose API key client-side
const openai = new OpenAI({ 
  apiKey: 'sk-...',  // Client can see this!
  dangerouslyAllowBrowser: true 
})

// ✅ GOOD: API route (server-only)
// app/api/chat/route.ts
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
```

### Rate Limiting
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m')  // 10 requests/minute
})

export async function checkRateLimit(userId: string) {
  const { success } = await ratelimit.limit(userId)
  if (!success) throw new Error('Rate limit exceeded')
}
```

---

## Example Use Cases by Project Type

### CRM System
- **Lead scoring:** Embed lead data → similarity to past won deals → prioritize
- **Email assistant:** Generate personalized outreach emails
- **Smart search:** "Find all enterprise leads from Q2" (semantic, not keyword)

### HRIS System
- **Policy Q&A:** Employee asks "How many sick days?" → RAG search policy docs
- **Performance review assistant:** Generate review template based on past feedback
- **Turnover prediction:** ML model on employee data (advanced, Phase 2)

### E-commerce
- **Product recommendations:** Embed product descriptions → find similar items
- **Customer support bot:** Answer FAQs ("Where is my order?")
- **Review summarization:** Generate summary from 100+ reviews

### Project Management
- **Smart task assignment:** Suggest assignee based on past tasks + skills
- **Meeting notes:** Transcribe + summarize (Whisper API + GPT-4o)
- **Risk detection:** Analyze project updates → flag delays/blockers

---

## Testing Strategy

### Unit Tests
```typescript
// __tests__/ai/embeddings.test.ts
import { embedText } from '@/lib/ai/embeddings'

test('embeddings have correct dimension', async () => {
  const embedding = await embedText('Hello world')
  expect(embedding).toHaveLength(1536)
})

test('similar text has high similarity', async () => {
  const emb1 = await embedText('The cat sat on the mat')
  const emb2 = await embedText('A cat is sitting on a mat')
  const similarity = cosineSimilarity(emb1, emb2)
  expect(similarity).toBeGreaterThan(0.8)  // >0.8 = similar
})
```

### Integration Tests
```typescript
// __tests__/api/chat.test.ts
test('chatbot returns answer', async () => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: 'What is the leave policy?' })
  })
  const data = await response.json()
  expect(data.reply).toContain('leave')  // Check answer mentions "leave"
})
```

### Manual Testing Checklist
- [ ] Basic query works ("Hello" → response)
- [ ] RAG cites correct sources (ask specific question → verify source doc)
- [ ] Handles unknown questions gracefully ("I don't have that information")
- [ ] Rate limit triggers (spam 20 requests → 429 error)
- [ ] Cost within budget (check OpenAI usage dashboard)

---

## Monitoring & Alerts

### Metrics to Track
- **Token usage:** Daily/monthly (prevent surprise bills)
- **Latency:** p50, p95, p99 response time
- **Error rate:** API failures (rate limit, timeout)
- **Cost per query:** Total cost / number of queries

### Setup Alerts
```typescript
// Monitor daily cost
if (dailyCost > 10) {
  sendAlert('AI cost exceeded $10 today')
}

// Monitor error rate
if (errorRate > 0.05) {  // >5% errors
  sendAlert('AI API error rate high')
}
```

### Cost Control
```typescript
// Hard limit (reject requests after budget)
const MONTHLY_BUDGET = 50  // $50/month
const currentSpend = await getMonthlySpend()

if (currentSpend > MONTHLY_BUDGET) {
  return Response.json({ error: 'Monthly AI budget exceeded' }, { status: 429 })
}
```

---

## Roadmap

### Phase 1: Basic (Week 1)
- [ ] Setup OpenAI API key
- [ ] Basic chatbot endpoint
- [ ] Simple UI

### Phase 2: RAG (Week 2-3)
- [ ] Setup pgvector
- [ ] Index initial documents (10-50 docs)
- [ ] RAG search + answer
- [ ] Cite sources

### Phase 3: Production (Week 4)
- [ ] Rate limiting
- [ ] Error handling
- [ ] Cost monitoring
- [ ] User feedback (thumbs up/down)

### Phase 4: Advanced (v2.0)
- [ ] Fine-tune model (custom domain knowledge)
- [ ] Multi-modal (image + text)
- [ ] Streaming responses (SSE)
- [ ] Conversation memory (store chat history)

---

**Agent: Load this guide when user requests AI features (Phase 1 Q10: Basic or Advanced).**

**Last Updated:** September 17, 2026  
**Version:** 1.0.0
