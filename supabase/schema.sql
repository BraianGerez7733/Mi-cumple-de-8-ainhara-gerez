create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  attendance text not null check (attendance in ('yes', 'no', 'maybe')),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;
alter table public.rsvps enable row level security;

create policy "public can read messages"
on public.messages
for select
to anon
using (true);

create policy "public can insert messages"
on public.messages
for insert
to anon
with check (true);

create policy "public can read rsvps"
on public.rsvps
for select
to anon
using (true);

create policy "public can insert rsvps"
on public.rsvps
for insert
to anon
with check (true);

create table if not exists public.juego_puntuaciones (
  id uuid primary key default gen_random_uuid(),
  nombre_jugador text not null,
  puntuacion int not null default 0,
  creado_en timestamptz not null default now()
);

alter table public.juego_puntuaciones enable row level security;

create policy "public can read scores"
on public.juego_puntuaciones
for select
to anon
using (true);

create policy "public can insert scores"
on public.juego_puntuaciones
for insert
to anon
with check (true);
