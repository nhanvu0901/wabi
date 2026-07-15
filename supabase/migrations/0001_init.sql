create table services (
  id bigint generated always as identity primary key,
  sort_order int not null,
  name text not null,
  description text not null
);

create table therapists (
  id bigint generated always as identity primary key,
  sort_order int not null,
  name text not null,
  title text not null,
  description text not null,
  specialties text not null,
  price text not null,
  photo_url text
);

create table contact_submissions (
  id bigint generated always as identity primary key,
  name text not null,
  contact text not null,
  message text,
  created_at timestamptz not null default now()
);

alter table services enable row level security;
alter table therapists enable row level security;
alter table contact_submissions enable row level security;

create policy "public read services" on services
  for select using (true);

create policy "public read therapists" on therapists
  for select using (true);

create policy "anon insert contact" on contact_submissions
  for insert with check (true);
