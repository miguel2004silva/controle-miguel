-- ==============================================================================
-- CONTROLE DE JEJUM — BANCO DE DADOS & SEGURANÇA (SUPABASE POSTGRES)
-- ==============================================================================
-- Este script configura o schema completo, restrições, índices e políticas de
-- Row Level Security (RLS) para o aplicativo Controle de Jejum.
-- Execute este script no SQL Editor do seu projeto Supabase.
-- ==============================================================================

-- 1. TABELA DE PERFIS DE USUÁRIO (PROFILES)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  preferred_goal_hours numeric default 16 check (preferred_goal_hours >= 1 and preferred_goal_hours <= 72),
  sound_enabled boolean default true,
  theme text default 'system' check (theme in ('system', 'dark', 'light')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Comentários descritivos
comment on table public.profiles is 'Preferências e dados complementares da conta do usuário autenticado';

-- 2. TABELA DE JEJUNS (FASTS)
create table if not exists public.fasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users(id) on delete cascade not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  goal_hours numeric not null check (goal_hours >= 1 and goal_hours <= 72),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Restrição de coerência temporal: se finalizado, ended_at deve ser posterior ou igual a started_at
  constraint check_fast_time_order check (ended_at is null or ended_at >= started_at)
);

comment on table public.fasts is 'Registros de jejuns intermitentes dos usuários';
comment on column public.fasts.goal_hours is 'Meta estipulada em horas para o jejum (1 a 72h)';

-- 3. ÍNDICES DE PERFORMANCE E INTEGRIDADE
-- Índice único condicional: impede que um usuário tenha mais de 1 jejum ativo simultaneamente
create unique index if not exists one_active_fast_per_user
  on public.fasts (user_id)
  where ended_at is null;

-- Índices de consulta rápida por usuário e datas
create index if not exists idx_fasts_user_started on public.fasts (user_id, started_at desc);
create index if not exists idx_fasts_user_ended on public.fasts (user_id, ended_at desc);

-- 4. GATILHO AUTOMÁTICO DE CRIAÇÃO DE PERFIL
-- Cria automaticamente a linha em profiles quando um usuário se cadastra no auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, preferred_goal_hours, sound_enabled, theme)
  values (
    new.id,
    new.email,
    16,
    true,
    'system'
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. ATUALIZAÇÃO AUTOMÁTICA DE updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_fasts_updated_at on public.fasts;
create trigger set_fasts_updated_at
  before update on public.fasts
  for each row execute procedure public.handle_updated_at();

-- 6. ROW LEVEL SECURITY (RLS) — SEGURANÇA ESTRITA
-- Ativa RLS em todas as tabelas públicas
alter table public.profiles enable row level security;
alter table public.fasts enable row level security;

-- Revoga todo acesso não autenticado (anon) explicitamente
revoke all on public.profiles from anon;
revoke all on public.fasts from anon;

-- Políticas para PROFILES (Apenas o próprio usuário autenticado pode ler/atualizar seu perfil)
drop policy if exists "Usuário pode visualizar seu próprio perfil" on public.profiles;
create policy "Usuário pode visualizar seu próprio perfil"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Usuário pode atualizar seu próprio perfil" on public.profiles;
create policy "Usuário pode atualizar seu próprio perfil"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Usuário pode criar seu perfil" on public.profiles;
create policy "Usuário pode criar seu perfil"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- Políticas para FASTS (Apenas o dono pode selecionar, inserir, atualizar e deletar seus jejuns)
drop policy if exists "Usuário pode visualizar seus próprios jejuns" on public.fasts;
create policy "Usuário pode visualizar seus próprios jejuns"
  on public.fasts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Usuário pode registrar um novo jejum" on public.fasts;
create policy "Usuário pode registrar um novo jejum"
  on public.fasts
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Usuário pode atualizar seus próprios jejuns" on public.fasts;
create policy "Usuário pode atualizar seus próprios jejuns"
  on public.fasts
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Usuário pode excluir seus próprios jejuns" on public.fasts;
create policy "Usuário pode excluir seus próprios jejuns"
  on public.fasts
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
