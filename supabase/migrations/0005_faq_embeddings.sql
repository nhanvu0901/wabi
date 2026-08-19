-- Dense-vector store for the Vietnamese FAQ RAG corpus.
-- Apply manually in the Supabase SQL Editor before running embed-faq-rag.mjs.
-- This deliberately has no foreign key to faq.id: source_faq_id is the stable
-- identifier from data/faq-rag.json, while faq.id is a generated database ID.

create extension if not exists vector with schema extensions;

create table if not exists public.faq_embeddings (
  source_faq_id bigint primary key,
  content text not null,
  embedding extensions.vector(4096) not null,
  embedding_model text not null,
  created_at timestamptz not null default now()
);

alter table public.faq_embeddings enable row level security;

drop policy if exists "public read FAQ embeddings" on public.faq_embeddings;
create policy "public read FAQ embeddings"
  on public.faq_embeddings for select using (true);

-- Exact cosine search is intentional for the initial 44-row corpus. Add an HNSW
-- index only after the corpus is large enough to need approximate search.
create or replace function public.match_faq_embeddings(
  query_embedding extensions.vector(4096),
  match_count int default 5
)
returns table (
  source_faq_id bigint,
  content text,
  similarity float
)
language sql stable
as $$
  select
    source_faq_id,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from public.faq_embeddings
  order by embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

grant execute on function public.match_faq_embeddings(extensions.vector, int) to anon, authenticated;
