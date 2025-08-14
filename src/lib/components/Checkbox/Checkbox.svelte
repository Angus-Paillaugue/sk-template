<script lang="ts">
  import { cn } from '$lib/utils';
  import { Check } from 'lucide-svelte';
  import type { SvelteHTMLElements } from 'svelte/elements';

  let { type, checked, class: className, ...restProps }: SvelteHTMLElements['input'] = $props();
  let width = $state();
  let height = $state();
</script>

<div class="relative" style="width: {width}px; height: {height}px;">
  <input
    type="checkbox"
    class={cn(
      'checked:bg-primary bg-card border-border peer block size-4 cursor-pointer appearance-none rounded-xs border transition-all',
      className
    )}
    bind:offsetWidth={width}
    bind:offsetHeight={height}
    {checked}
    {...restProps}
  />
  <div
    class="pointer-events-none absolute inset-0 opacity-0 transition-opacity peer-checked:opacity-100"
  >
    <Check class="text-secondary size-full" />
  </div>
</div>
