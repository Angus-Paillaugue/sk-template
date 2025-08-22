<script lang="ts">
  import { fly, slide } from 'svelte/transition';
  import actions from '.';
  import { backOut } from 'svelte/easing';
  import { flip } from 'svelte/animate';
  import { navigating, page } from '$app/state';

  $effect(() => {
    if (navigating.to && navigating.to.url.pathname !== page.url.pathname) {
      actions.set([]);
    }
  });
</script>

{#if $actions.length > 0}
  <div
    class="fixed bottom-4 left-1/2 z-40 -translate-x-1/2"
    transition:fly={{ y: '100%', duration: 500, easing: backOut }}
  >
    <div class="bg-card flex flex-row items-center rounded-xl p-1.5">
      <span class="text-muted-foreground mx-2 font-mono text-sm uppercase">actions</span>
      {#each $actions as action (action.text)}
        <button
          onclick={action.onclick}
          animate:flip={{
            duration: 500,
            easing: backOut,
          }}
          transition:slide={{ duration: 300, axis: 'x' }}
          class="bg-muted hover:bg-ring/30 border-border ml-1.5 flex flex-row items-center gap-2 rounded-lg border p-1 px-2 transition-all"
        >
          <span class="whitespace-nowrap">
            {action.text}
          </span>
          {#if action.icon}
            <div class="bg-muted rounded p-1">
              <action.icon class="size-3" />
            </div>
          {/if}
        </button>
      {/each}
    </div>
  </div>
{/if}
