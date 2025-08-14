<script lang="ts">
  import { cn } from '$lib/utils';
  import { Loader2 } from 'lucide-svelte';
  import type { SvelteHTMLElements } from 'svelte/elements';
  import { slide } from 'svelte/transition';

  interface Props {
    loading?: boolean;
    href?: string;
  }

  type ButtonProps = Props &
    (({ href: string } & SvelteHTMLElements['a']) | SvelteHTMLElements['button']);

  let { children, loading, class: className, ...restProps }: ButtonProps = $props();

  const tagName = 'href' in restProps ? 'a' : 'button';
</script>

<svelte:element
  this={tagName}
  class={cn(
    'bg-primary text-secondary flex cursor-pointer flex-row items-center justify-center rounded-sm px-4 py-1 text-base font-medium transition-all active:rounded-2xl',
    className
  )}
  {...restProps}
>
  {#if loading}
    <span class="h-5 w-8" transition:slide={{ duration: 300, axis: 'x' }}>
      <Loader2 class="size-5 animate-spin" />
    </span>
  {/if}

  {@render children?.()}
</svelte:element>
