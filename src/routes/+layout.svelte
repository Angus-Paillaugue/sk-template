<script lang="ts">
  import '../app.css';
  import { SEO, Toaster } from '$lib/components';
  import { t } from '$lib/i18n';
  import { ModeWatcher, toggleMode } from 'mode-watcher';
  import { Button } from '$lib/components/ui/button';
  import { Moon, Sun } from 'lucide-svelte';
  import Navbar1 from './navbar1.svelte';
  import Navbar2 from './navbar2.svelte';

  let { children } = $props();
</script>

<SEO title={$t('seo.defaults.title')} description={$t('seo.defaults.description')} />

<ModeWatcher />

<Toaster />

<div class="flex min-h-dvh flex-col">
  <!-- <Navbar1 /> -->
  <Navbar2 />
  {@render children()}
</div>

<div class="bg-card fixed right-2 bottom-2 z-10 rounded-md">
  <Button onclick={toggleMode} variant="outline" size="icon">
    <Sun class="size-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90" />
    <Moon
      class="absolute size-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
    />
    <span class="sr-only">Toggle theme</span>
  </Button>
</div>
