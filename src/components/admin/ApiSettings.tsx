import { useState } from 'react';
import { Plus, Trash2, Loader2, Eye, EyeOff, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useApiSettings, useCreateApiSetting, useDeleteApiSetting } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';

export function ApiSettings() {
  const { toast } = useToast();
  const { data: settings = [], isLoading } = useApiSettings();
  const createSetting = useCreateApiSetting();
  const deleteSetting = useDeleteApiSetting();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [description, setDescription] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreate = async () => {
    if (!name.trim() || !apiKey.trim()) {
      toast({ title: 'Error', description: 'Name and API key are required', variant: 'destructive' });
      return;
    }

    try {
      await createSetting.mutateAsync({
        name: name.trim(),
        api_key: apiKey.trim(),
        description: description.trim() || undefined,
      });
      toast({ title: 'Success', description: 'API setting added' });
      setDialogOpen(false);
      setName('');
      setApiKey('');
      setDescription('');
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to add API setting', 
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSetting.mutateAsync(id);
      toast({ title: 'Success', description: 'API setting removed' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove API setting', variant: 'destructive' });
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
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Settings
          </CardTitle>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
          {settings.map((setting) => (
            <div 
              key={setting.id} 
              className="p-3 rounded-lg bg-muted/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{setting.name}</span>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => toggleShowKey(setting.id)}
                  >
                    {showKeys[setting.id] ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleDelete(setting.id)}
                    disabled={deleteSetting.isPending}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
              
              <div className="font-mono text-xs bg-background p-2 rounded">
                {showKeys[setting.id] 
                  ? setting.api_key 
                  : '•'.repeat(Math.min(setting.api_key.length, 32))
                }
              </div>
              
              {setting.description && (
                <p className="text-xs text-muted-foreground">{setting.description}</p>
              )}
            </div>
          ))}
          
          {settings.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No API settings configured
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add API Setting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="API Name (e.g., Fastlipa)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="API Key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={createSetting.isPending}
            >
              {createSetting.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Add'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
