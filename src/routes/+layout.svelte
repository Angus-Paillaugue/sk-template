<script lang="ts">
  import '../app.css';
  import { SEO, Toaster } from '$lib/components';
  import i18n from '$lib/i18n';
  import { ModeWatcher } from 'mode-watcher';
  // import Navbar1 from './navbar1.svelte';
  import Navbar2 from './navbar2.svelte';
  import { Actions } from '$lib/components';
  import { onMount } from 'svelte';
  import { SSEClient } from '$lib/utils/sse';
  import Globals from '$lib/globals.svelte';
  import CookieModal from '$lib/Cookie/CookieModal.svelte';

  let { children, data } = $props();
  Globals.flags.setFlags(data.flags || {});

  // Global SSE subscription to flag updates
  onMount(() => {
    const sse = SSEClient.subscribe<{ flagKey: string; value: boolean | null }>(
      'flags:update',
      (d) => {
        const { flagKey, value } = d;
        Globals.flags.setOverride(flagKey, value);
      }
    );

    return () => {
      sse.close();
    };
  });
</script>

<SEO title={i18n.t('seo.defaults.title')} description={i18n.t('seo.defaults.description')} />

<ModeWatcher />

<Toaster />

<Actions />

<CookieModal />

<div class="flex min-h-dvh flex-col">
  <!-- <Navbar1 /> -->
  <Navbar2 />

  <svelte:boundary>{@render children()}</svelte:boundary>
</div>
