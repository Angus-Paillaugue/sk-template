<script lang="ts">
  import XIcon from '@lucide/svelte/icons/x';
  import { cn } from '$lib/utils';
  import type { SvelteHTMLElements } from 'svelte/elements';

  interface MyProps {
    open: boolean;
    showCloseButton?: boolean;
  }

  let {
    class: className,
    children,
    open = $bindable(false),
    showCloseButton,
    ...restProps
  }: SvelteHTMLElements['div'] & MyProps = $props();
</script>

{#if open}
  <div
    data-state={open ? 'open' : 'closed'}
    class={cn(
      'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
      className
    )}
    {...restProps}
  >
    {@render children?.()}
    {#if showCloseButton}
      <button
        class="ring-offset-background focus:ring-ring absolute end-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
      >
        <XIcon />
        <span class="sr-only">Close</span>
      </button>
    {/if}
  </div>
{/if}
