<script lang="ts">
  import { SEO, Toaster } from '$lib/components';
  import { t } from '$lib/i18n';
  import '../app.css';

  let { children } = $props();
</script>

<Toaster />

<SEO title={$t('seo.defaults.title')} description={$t('seo.defaults.description')} />

<div class="flex min-h-dvh flex-col">
  {@render children()}
</div>
