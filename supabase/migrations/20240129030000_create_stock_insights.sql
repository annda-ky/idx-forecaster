create table if not exists stock_insights (
  id bigint primary key generated always as identity,
  symbol text not null,
  sentiment text not null,
  score numeric not null,
  title text not null,
  message text not null,
  rsi numeric,
  ema_20 numeric,
  trend text,
  updated_at timestamptz default now(),
  constraint unique_symbol unique (symbol)
);

alter table stock_insights enable row level security;

create policy "Enable read access for all users" on stock_insights
  for select using (true);

create policy "Enable insert/update for service role only" on stock_insights
  for all using (true) with check (true);
