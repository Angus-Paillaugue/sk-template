<script lang="ts">
  import '../app.css';
  import { SEO, Toaster } from '$lib/components';
  import i18n from '$lib/i18n';
  import { ModeWatcher } from 'mode-watcher';
  // import Navbar1 from './navbar1.svelte';
  import Navbar2 from './navbar2.svelte';
  import { Actions } from '$lib/components';

  let { children } = $props();
</script>

<SEO title={i18n.t('seo.defaults.title')} description={i18n.t('seo.defaults.description')} />

<ModeWatcher />

<Toaster />

<Actions />

<div class="flex min-h-dvh flex-col">
  <!-- <Navbar1 /> -->
  <Navbar2 />

  <svelte:boundary>{@render children()}</svelte:boundary>
</div>
