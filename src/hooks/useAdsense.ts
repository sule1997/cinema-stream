import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdsenseSettings {
  displayAd: string;
  inArticleAd: string;
}

export const useAdsenseSettings = () => {
  return useQuery({
    queryKey: ['adsense-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['adsense_display_ad', 'adsense_in_article_ad']);

      if (error) throw error;

      const settings: AdsenseSettings = {
        displayAd: '',
        inArticleAd: '',
      };

      data?.forEach((item) => {
        if (item.key === 'adsense_display_ad') {
          settings.displayAd = item.value;
        } else if (item.key === 'adsense_in_article_ad') {
          settings.inArticleAd = item.value;
        }
      });

      return settings;
    },
  });
};

export const useUpdateAdsenseSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('app_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adsense-settings'] });
    },
  });
};
