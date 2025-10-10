-- Create avatar storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatar',
  'avatar',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create RLS policies for avatar bucket
create policy "Avatar images are publicly accessible" on storage.objects
for select using (bucket_id = 'avatar');

create policy "Users can upload their own avatar" on storage.objects
for insert with check (
  bucket_id = 'avatar' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own avatar" on storage.objects
for update using (
  bucket_id = 'avatar' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own avatar" on storage.objects
for delete using (
  bucket_id = 'avatar' 
  and auth.uid()::text = (storage.foldername(name))[1]
);
