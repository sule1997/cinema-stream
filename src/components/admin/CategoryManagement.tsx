import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, Category } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';

export function CategoryManagement() {
  const { toast } = useToast();
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setCategoryName('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      toast({ title: 'Error', description: 'Category name is required', variant: 'destructive' });
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          name: categoryName.trim(),
          sort_order: editingCategory.sort_order,
        });
        toast({ title: 'Success', description: 'Category updated' });
      } else {
        const maxOrder = Math.max(0, ...categories.map(c => c.sort_order));
        await createCategory.mutateAsync({
          name: categoryName.trim(),
          sort_order: maxOrder + 1,
        });
        toast({ title: 'Success', description: 'Category created' });
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to save category', 
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast({ title: 'Success', description: 'Category deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
    }
  };

  const handleMoveUp = async (category: Category, index: number) => {
    if (index === 0) return;
    const prevCategory = categories[index - 1];
    
    try {
      await Promise.all([
        updateCategory.mutateAsync({
          id: category.id,
          name: category.name,
          sort_order: prevCategory.sort_order,
        }),
        updateCategory.mutateAsync({
          id: prevCategory.id,
          name: prevCategory.name,
          sort_order: category.sort_order,
        }),
      ]);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reorder', variant: 'destructive' });
    }
  };

  const handleMoveDown = async (category: Category, index: number) => {
    if (index === categories.length - 1) return;
    const nextCategory = categories[index + 1];
    
    try {
      await Promise.all([
        updateCategory.mutateAsync({
          id: category.id,
          name: category.name,
          sort_order: nextCategory.sort_order,
        }),
        updateCategory.mutateAsync({
          id: nextCategory.id,
          name: nextCategory.name,
          sort_order: category.sort_order,
        }),
      ]);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reorder', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Categories</CardTitle>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
          {categories.map((category, index) => (
            <div 
              key={category.id} 
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <button 
                    onClick={() => handleMoveUp(category, index)}
                    disabled={index === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button 
                    onClick={() => handleMoveDown(category, index)}
                    disabled={index === categories.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
                <span className="font-medium">{category.name}</span>
              </div>
              
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleOpenEdit(category)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleDelete(category.id)}
                  disabled={deleteCategory.isPending}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          
          {categories.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No categories yet. Create one to get started!
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={createCategory.isPending || updateCategory.isPending}
            >
              {(createCategory.isPending || updateCategory.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
