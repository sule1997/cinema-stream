import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, Loader2, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useAdmin';
import { useReviewSetting } from '@/components/admin/MovieReview';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const videoLinkSchema = z.object({
  name: z.string().min(1, 'Episode name is required'),
  url: z.string().url('Must be a valid URL'),
});

const movieSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  dj_name: z.string().min(1, 'DJ Name is required').max(100),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  category_ids: z.array(z.string()).min(1, 'At least one category is required').max(4, 'Maximum 4 categories allowed'),
  video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  google_drive_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  movie_type: z.enum(['single', 'season']),
  season_number: z.coerce.number().min(1).optional(),
  video_links: z.array(videoLinkSchema).optional(),
});

type MovieFormData = z.infer<typeof movieSchema>;

interface MovieUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieUploadDialog({ open, onOpenChange }: MovieUploadDialogProps) {
  const { toast } = useToast();
  const { user, profile, role } = useAuth();
  const { data: categories = [] } = useCategories();
  const { data: reviewRequired } = useReviewSetting();
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
      category_ids: [],
      video_url: '',
      google_drive_url: '',
      movie_type: 'single',
      season_number: 1,
      video_links: [{ name: 'Episode 1', url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'video_links',
  });

  const movieType = form.watch('movie_type');

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

      // Get primary category name (first selected)
      const primaryCategory = categories.find(c => c.id === data.category_ids[0]);
      
      // Determine status based on review setting and user role
      const movieStatus = (role === 'admin' || !reviewRequired) ? 'approved' : 'pending';
      
      // Insert movie
      const { error } = await supabase
        .from('movies')
        .insert({
          title: data.title,
          dj_name: data.dj_name,
          description: data.description || null,
          price: data.price,
          release_year: new Date().getFullYear(),
          category: primaryCategory?.name || 'Uncategorized',
          category_id: data.category_ids[0],
          video_url: data.movie_type === 'single' ? (data.video_url || null) : null,
          google_drive_url: data.movie_type === 'single' ? (data.google_drive_url || null) : null,
          image_path: imagePath,
          created_by: user.id,
          status: movieStatus,
          movie_type: data.movie_type,
          season_number: data.movie_type === 'season' ? data.season_number : null,
          video_links: data.movie_type === 'season' ? (data.video_links || []) : [],
        });
      
      if (error) throw error;
      
      const successMessage = movieStatus === 'pending' 
        ? 'Your movie has been submitted for review.' 
        : 'Your movie has been published successfully.';
      
      toast({
        title: movieStatus === 'pending' ? 'Movie Submitted!' : 'Movie Published!',
        description: successMessage,
      });
      
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['djMovies'] });
      queryClient.invalidateQueries({ queryKey: ['pendingMovies'] });
      
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
            {/* Movie Type Selection */}
            <FormField
              control={form.control}
              name="movie_type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Movie Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="single" />
                        <Label htmlFor="single" className="font-normal cursor-pointer">Single Movie</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="season" id="season" />
                        <Label htmlFor="season" className="font-normal cursor-pointer">Season/Series</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {/* Season Number - Only show if season type */}
            {movieType === 'season' && (
              <FormField
                control={form.control}
                name="season_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season Number</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            {/* Multiple Category Selection */}
            <FormField
              control={form.control}
              name="category_ids"
              render={() => (
                <FormItem>
                  <FormLabel>Categories (max 4)</FormLabel>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-border rounded-md">
                    {categories.map((cat) => (
                      <FormField
                        key={cat.id}
                        control={form.control}
                        name="category_ids"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(cat.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    if (current.length < 4) {
                                      field.onChange([...current, cat.id]);
                                    }
                                  } else {
                                    field.onChange(current.filter((id) => id !== cat.id));
                                  }
                                }}
                              />
                            </FormControl>
                            <Label className="text-sm font-normal cursor-pointer">{cat.name}</Label>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Single movie links */}
            {movieType === 'single' && (
              <>
                <FormField
                  control={form.control}
                  name="video_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Link</FormLabel>
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
                      <FormLabel>Download Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Season episode links */}
            {movieType === 'season' && (
              <div className="space-y-3">
                <FormLabel>Episode Links</FormLabel>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-border rounded-md">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <FormField
                        control={form.control}
                        name={`video_links.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Episode 1" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`video_links.${index}.url`}
                        render={({ field }) => (
                          <FormItem className="flex-[2]">
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: `Episode ${fields.length + 1}`, url: '' })}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Episode
                </Button>
              </div>
            )}

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