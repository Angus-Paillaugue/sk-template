<script lang="ts">
  import { cn } from '$lib/utils';
  import { backInOut } from 'svelte/easing';
  import type { SvelteHTMLElements } from 'svelte/elements';
  import { fly } from 'svelte/transition';
  import { TRANSITION_DURATION } from '.';

  interface MyProps {
    open: boolean;
  }

  let { open = $bindable(false), children }: SvelteHTMLElements['div'] & MyProps = $props();
</script>

{#if open}
  <div class="pointer-events-none fixed inset-2 z-20 flex items-center justify-center">
    <div
      class={cn(
        'bg-card text-foreground border-border pointer-events-auto flex max-h-full w-full max-w-screen-sm flex-col rounded border p-4'
      )}
      transition:fly={{ y: '100', duration: TRANSITION_DURATION, easing: backInOut }}
    >
      {@render children?.()}
    </div>
  </div>
{/if}
