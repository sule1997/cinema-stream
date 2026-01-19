import { useState, useEffect } from 'react';
import { Loader2, Monitor, FileText, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAdsenseSettings, useUpdateAdsenseSetting } from '@/hooks/useAdsense';
import { useToast } from '@/hooks/use-toast';

export function AdsenseSettings() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useAdsenseSettings();
  const updateSetting = useUpdateAdsenseSetting();
  
  const [displayAd, setDisplayAd] = useState('');
  const [inArticleAd, setInArticleAd] = useState('');
  const [isSavingDisplay, setIsSavingDisplay] = useState(false);
  const [isSavingInArticle, setIsSavingInArticle] = useState(false);

  useEffect(() => {
    if (settings) {
      setDisplayAd(settings.displayAd);
      setInArticleAd(settings.inArticleAd);
    }
  }, [settings]);

  const handleSaveDisplayAd = async () => {
    setIsSavingDisplay(true);
    try {
      await updateSetting.mutateAsync({ 
        key: 'adsense_display_ad', 
        value: displayAd 
      });
      toast({ title: 'Success', description: 'Display ad code saved' });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to save', 
        variant: 'destructive' 
      });
    } finally {
      setIsSavingDisplay(false);
    }
  };

  const handleSaveInArticleAd = async () => {
    setIsSavingInArticle(true);
    try {
      await updateSetting.mutateAsync({ 
        key: 'adsense_in_article_ad', 
        value: inArticleAd 
      });
      toast({ title: 'Success', description: 'In-article ad code saved' });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to save', 
        variant: 'destructive' 
      });
    } finally {
      setIsSavingInArticle(false);
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
    <div className="space-y-4">
      {/* Display Ads */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Display Ads
          </CardTitle>
          <CardDescription>
            Paste your AdSense display ad code here. This will show after every 2 rows of movies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayAd">Ad Code</Label>
            <Textarea
              id="displayAd"
              placeholder="<script async src='https://pagead2.googlesyndication.com/...'>...</script>"
              value={displayAd}
              onChange={(e) => setDisplayAd(e.target.value)}
              rows={8}
              className="font-mono text-xs"
            />
          </div>
          <Button 
            onClick={handleSaveDisplayAd}
            disabled={isSavingDisplay}
            className="w-full sm:w-auto"
          >
            {isSavingDisplay ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Display Ad
          </Button>
        </CardContent>
      </Card>

      {/* In-Article Ads */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            In-Article Ads
          </CardTitle>
          <CardDescription>
            Paste your AdSense in-article ad code here. This will show on movie detail pages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inArticleAd">Ad Code</Label>
            <Textarea
              id="inArticleAd"
              placeholder="<script async src='https://pagead2.googlesyndication.com/...'>...</script>"
              value={inArticleAd}
              onChange={(e) => setInArticleAd(e.target.value)}
              rows={8}
              className="font-mono text-xs"
            />
          </div>
          <Button 
            onClick={handleSaveInArticleAd}
            disabled={isSavingInArticle}
            className="w-full sm:w-auto"
          >
            {isSavingInArticle ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save In-Article Ad
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
