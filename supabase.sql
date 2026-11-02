-- Jalankan seluruh skrip ini di Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.guests (
 id uuid primary key default gen_random_uuid(), name text not null unique,
 phone text, group_name text, note text,
 created_at timestamptz not null default now()
);
create table if not exists public.rsvps (
 id uuid primary key default gen_random_uuid(), guest_name text not null,
 phone text not null, attendance text not null check (attendance in ('Hadir','Tidak hadir')),
 guest_count integer not null default 0 check (guest_count between 0 and 20),
 guest_label text, created_at timestamptz not null default now()
);
create table if not exists public.wishes (
 id uuid primary key default gen_random_uuid(), guest_name text not null,
 message text not null, approved boolean not null default false,
 created_at timestamptz not null default now()
);
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.wishes enable row level security;
-- Pengunjung boleh mengirim RSVP dan ucapan, tetapi tidak boleh membaca data privat.
drop policy if exists "public insert rsvp" on public.rsvps;
create policy "public insert rsvp" on public.rsvps for insert to anon, authenticated with check (true);
drop policy if exists "public insert wishes" on public.wishes;
create policy "public insert wishes" on public.wishes for insert to anon, authenticated with check (length(trim(guest_name)) between 1 and 100 and length(trim(message)) between 1 and 1000);
-- Ucapan yang telah disetujui dapat dibaca pengunjung.
drop policy if exists "public read approved wishes" on public.wishes;
create policy "public read approved wishes" on public.wishes for select to anon, authenticated using (approved = true);
-- Hanya admin yang login dapat mengelola data tamu, RSVP, dan semua ucapan.
drop policy if exists "admin manage guests" on public.guests;
create policy "admin manage guests" on public.guests for all to authenticated using (true) with check (true);
drop policy if exists "admin read rsvps" on public.rsvps;
create policy "admin read rsvps" on public.rsvps for select to authenticated using (true);
drop policy if exists "admin manage wishes" on public.wishes;
create policy "admin manage wishes" on public.wishes for all to authenticated using (true) with check (true);
