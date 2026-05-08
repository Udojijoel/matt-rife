-- Create storage bucket for product and show images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Allow anyone to view images (public bucket)
CREATE POLICY "Anyone can view images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

-- Allow admins to upload images
CREATE POLICY "Admins can upload images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'images' 
  AND has_role(auth.uid(), 'admin')
);

-- Allow admins to update images
CREATE POLICY "Admins can update images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'images' 
  AND has_role(auth.uid(), 'admin')
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'images' 
  AND has_role(auth.uid(), 'admin')
);