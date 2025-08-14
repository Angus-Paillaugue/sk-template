<script lang="ts">
  import { cn } from '$lib/utils';
  import { Eye, EyeOff } from 'lucide-svelte';
  import type { SvelteHTMLElements } from 'svelte/elements';
  import { scale } from 'svelte/transition';

  type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
  type Props = WithRequired<SvelteHTMLElements['input'], 'name'>;

  let { name, placeholder, type, class: className, ...restProps }: Props = $props();
  let innerType = $state(type || 'text');
</script>

<div class="flex w-full flex-col gap-1">
  {#if placeholder}
    <label for={name} class="text-foreground text-sm font-medium">{placeholder}</label>
  {/if}
  <div class="relative">
    <input
      {name}
      class={cn(
        'border-border w-full rounded border p-2 focus-visible:ring-[3px] focus:outline-none focus-visible:ring-primary/30 transition-all',
        className
      )}
      type={innerType}
      {...restProps}
    />
    {#if type === 'password'}
      <button
        type="button"
        aria-label="Toggle password visibility"
        class="text-muted absolute top-3 right-3 bottom-3"
        onclick={() => (innerType = innerType === 'text' ? 'password' : 'text')}
      >
        {#if innerType === 'text'}
          <span in:scale={{ duration: 150 }}>
            <EyeOff class="size-full" />
          </span>
        {:else if innerType === 'password'}
          <span in:scale={{ duration: 150 }}>
            <Eye class="size-full" />
          </span>
        {/if}
      </button>
    {/if}
  </div>
</div>
