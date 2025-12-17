import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const movieSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  dj_name: z.string().min(1, 'DJ Name is required').max(100),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  release_year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  category_id: z.string().min(1, 'Category is required'),
  video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  google_drive_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type MovieFormData = z.infer<typeof movieSchema>;

interface MovieUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieUploadDialog({ open, onOpenChange }: MovieUploadDialogProps) {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { data: categories = [] } = useCategories();
  const queryClient = useQueryClient();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: '',
      dj_name: profile?.username || '',
      description: '',
      price: 0,
      release_year: new Date().getFullYear(),
      category_id: '',
      video_url: '',
      google_drive_url: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: MovieFormData) => {
    if (!user) return;
    
    setIsUploading(true);
    
    try {
      let imagePath = null;
      
      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('movie-posters')
          .upload(fileName, imageFile);
        
        if (uploadError) throw uploadError;
        imagePath = fileName;
      }

      // Get category name
      const category = categories.find(c => c.id === data.category_id);
      
      // Insert movie
      const { error } = await supabase
        .from('movies')
        .insert({
          title: data.title,
          dj_name: data.dj_name,
          description: data.description || null,
          price: data.price,
          release_year: data.release_year,
          category: category?.name || 'Uncategorized',
          category_id: data.category_id,
          video_url: data.video_url || null,
          google_drive_url: data.google_drive_url || null,
          image_path: imagePath,
          created_by: user.id,
        });
      
      if (error) throw error;
      
      toast({
        title: 'Movie Published!',
        description: 'Your movie has been published successfully.',
      });
      
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['djMovies'] });
      
      // Reset form
      form.reset();
      removeImage();
      onOpenChange(false);
      
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Upload Movie</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Movie Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter movie title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dj_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DJ Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your DJ name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Movie description..." 
                      className="resize-none" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (Tsh)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="release_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Year</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Movie Link (MP4/MKV)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="google_drive_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Drive Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://drive.google.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <div className="space-y-2">
              <FormLabel>Movie Poster</FormLabel>
              {imagePreview ? (
                <div className="relative w-32 h-48 rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Movie'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
