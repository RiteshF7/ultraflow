-- Create the plan table for pricing plans
create table plan (
  id bigint primary key generated always as identity,
  name text not null,
  description text,
  price numeric(10,2) not null,
  currency text default 'INR',
  interval text default 'month', -- 'month', 'quarter', 'year'
  features jsonb default '[]'::jsonb,
  sort integer default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable row level security
alter table plan enable row level security;

-- Create policy to allow public read access to active plans
create policy "Allow public read access to active plans" on plan
  for select
  using (active = true);

-- Insert default plans for Ultra Flow
insert into plan (name, description, price, currency, interval, features, sort, active) values
('Monthly Plan', 'Perfect for trying out our service with monthly billing.', 300.00, 'INR', 'month', '["All core features included", "Generate unlimited flowcharts", "AI-powered article analysis", "Export to SVG/PNG", "Banner image generation"]'::jsonb, 1, true),
('Quarterly Plan', 'Best value for 3 months with flexible commitment.', 200.00, 'INR', 'quarter', '["All core features included", "Generate unlimited flowcharts", "AI-powered article analysis", "Export to SVG/PNG", "Banner image generation"]'::jsonb, 2, true),
('Yearly Plan', 'Maximum savings with annual subscription.', 100.00, 'INR', 'year', '["All core features included", "Generate unlimited flowcharts", "AI-powered article analysis", "Export to SVG/PNG", "Banner image generation"]'::jsonb, 3, true);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_plan_updated_at
  before update on plan
  for each row
  execute procedure update_updated_at_column();
