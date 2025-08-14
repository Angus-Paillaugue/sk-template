<script lang="ts">
  import { cn } from '$lib/utils';
  import type { SvelteHTMLElements } from 'svelte/elements';

  let { children, class: className, ...props }: SvelteHTMLElements['iv'] = $props();
</script>

<div class={cn('mb-4 flex flex-col gap-1', className)} {...props}>
  {@render children?.()}
</div>
