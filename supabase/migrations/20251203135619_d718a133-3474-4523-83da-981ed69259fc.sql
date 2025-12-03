-- Add DELETE policy for anggota table (admin only can delete)
CREATE POLICY "Admin can delete anggota" 
ON public.anggota 
FOR DELETE 
USING (has_role(auth.uid(), 'admin_rw'::app_role) OR has_role(auth.uid(), 'admin_rt'::app_role));