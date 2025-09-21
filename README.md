## Project Objective

- Built a responsive single-page app that displays cryptocurrency prices from a free API ( eg: CoinGrecko)
- Requirements:
  1. homepage with a list of coins, prices and %change, use vanry/usdt pair as the first crypto currency to show.
  2. clicking a coin shows a detail view with a chart.
  3. add a search + filter feature
  4. UI must look professional ( use tailwind, material ui or styled components.
  5. dark/light mode toggle.


## Project Deployed on Vercel

**URL**: [https://lovable.dev/projects/6d79abf4-99d7-4554-bcc3-d59fcdbd0dd1](https://cryptocurrency-dashboard-three.vercel.app/)

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


# AI Tools Used: 
- Lovable, ChatGPT, Deepseek for creating UI
- Vibe coding with custom prompts to get the desired outcome
- manual adjustments maded for extracting the vanry coin and displaying it as the first pair.


# Screenshots

<img width="1357" height="844" alt="image" src="https://github.com/user-attachments/assets/c9958f57-7dbb-41a1-8546-42e40edaaaa7" />
<img width="1370" height="838" alt="image" src="https://github.com/user-attachments/assets/f2c8448c-5e64-4bb1-9716-d29df1816d10" />
<img width="1366" height="794" alt="image" src="https://github.com/user-attachments/assets/56b8fc21-4013-459a-b333-367fe3b04c9f" />



CLI (do not change flags)
We will run exactly:
python run_agent_hybrid.py \
--batch sample_questions_hybrid_eval.jsonl \
--out outputs_hybrid.jsonl
Each line in outputs_hybrid.jsonl must follow the Output Contract.
Output Contract (per question)
{
"id": "
...
"
,
"final_answer": <matches format_hint>,
"sql": "<last executed SQL or empty if RAG-only>"
,
"confidence": 0.0,
"explanation": "<= 2 sentences>"
,
"citations": [
"Orders"
,
"Order Details"
,
"Products"
,
"Customers"
,
"kpi_definitions::chunk2"
,
"marketing_calendar::chunk0"
]
}
●
final_answer: must match the input format_hint exactly (e.g., int, float, object,
or list of objects). Floats graded with ±0.01 tolerance.
●
citations: include every DB table actually used and every doc chunk ID you relied on
(e.g., marketing_calendar::chunk0).
Acceptance Criteria & Scoring
●
Correctness (40%) — values match expected (±0.01 for floats), and types match
format_hint.
●
DSPy impact (20%) — a measurable improvement on the chosen module (brief
table/notes).
●
Resilience (20%) — a repair/validation loop that actually helps (e.g., raises valid-SQL or
format-adherence rate).
●
Clarity (20%) — readable code, short README, sensible confidence, proper citations &
trace.
Implementation Hints
Retrieval
●
You can implement TF-IDF (no downloads) or BM25 (e.g., rank-bm25) over
paragraph-level chunks.
●
Keep chunks small; store id, content, source (filename), score.
SQL
●
Prefer Orders + "Order Details" + Products joins.
●
Revenue: SUM(UnitPrice * Quantity * (1 - Discount)) from "Order
Details"
.
●
If needed, map categories via Categories join through Products.CategoryID.
Confidence
●
Heuristics are fine: combine retrieval score coverage + SQL success + non-empty rows;
down-weight when repaired.

Build a local, free AI agent that answers retail analytics questions by combining:
●
RAG over local docs (docs/)
●
SQL over a local SQLite DB (Northwind)
Produce typed, auditable answers with citations.
Use DSPy to optimize at least one component.
No paid APIs or external calls at inference time.
Estimated time: 2–3 focused hours
Runs on: normal PC (CPU ok), 16GB RAM recommended
Local model constraint: Phi-3.5-mini-instruct via Ollama (or llama.cpp GGUF)



Tables you’ll use (canonical Northwind names):
●
Orders(OrderID, CustomerID, EmployeeID, OrderDate, …)
●
"Order Details"(OrderID, ProductID, UnitPrice, Quantity, Discount)
●
Products(ProductID, ProductName, SupplierID, CategoryID, UnitPrice, …)
●
Customers(CustomerID, CompanyName, Country, …)
●
(You may use Categories, Suppliers as needed.)
