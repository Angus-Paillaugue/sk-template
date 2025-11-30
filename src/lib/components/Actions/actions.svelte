<script lang="ts">
  import { fly, slide } from 'svelte/transition';
  import { backInOut } from 'svelte/easing';
  // import { flip } from 'svelte/animate';
  import { getPageActions } from '$lib/utils/actions.svelte';
  import { cn } from '$lib/utils';

  let actions = $derived(getPageActions());
</script>

{#if actions.length > 0}
  <div
    class="fixed bottom-4 left-1/2 z-40 w-max max-w-dvw -translate-x-1/2"
    transition:fly={{ y: '100%', duration: 500, easing: backInOut }}
  >
    <div class="bg-card flex w-fit flex-row flex-wrap items-center rounded-xl p-1.5">
      <span class="text-muted-foreground mx-2 hidden font-mono text-sm uppercase lg:block"
        >actions</span
      >
      {#each actions as action, i (action.text)}
        {@const tagName = action.href ? 'a' : 'button'}
        <!--
          animate:flip={{
            duration: 500,
            easing: backInOut,
          }}
        -->
        <svelte:element
          this={tagName}
          role="button"
          href={action.href}
          tabindex="0"
          onclick={action.onclick}
          transition:slide={{ duration: 300, axis: 'x' }}
          class={cn(
            'bg-muted hover:bg-ring/30 border-border flex flex-row items-center gap-2 rounded-lg border p-1 px-2 transition-all',
            i !== 0 && 'ml-1.5'
          )}
        >
          <span class="whitespace-nowrap">
            {action.text}
          </span>
          {#if action.icon}
            <div class="bg-muted rounded p-1">
              <action.icon class="size-3" />
            </div>
          {/if}
        </svelte:element>
      {/each}
    </div>
  </div>
{/if}
