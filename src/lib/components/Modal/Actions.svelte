<script lang="ts">
  import { cn } from '$lib/utils';
  import type { SvelteHTMLElements } from 'svelte/elements';

  let { children, class: className, ...props }: SvelteHTMLElements['div'] = $props();
</script>

<div class={cn('item-center mt-4 flex w-full flex-row justify-end gap-4', className)} {...props}>
  {@render children?.()}
</div>
