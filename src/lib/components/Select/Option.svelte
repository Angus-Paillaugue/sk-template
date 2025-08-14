<script lang="ts">
  import { cn } from '$lib/utils';
  import { onMount } from 'svelte';
  import type { SvelteHTMLElements } from 'svelte/elements';
  import { get } from 'svelte/store';
  import { minWidth, value as selectValue } from './stores';

  interface MyProps {
    selected?: boolean;
    value: string | number | null;
  }

  const {
    children,
    selected,
    class: className,
    disabled,
    value = null,
    ...restProps
  }: SvelteHTMLElements['button'] & MyProps = $props();

  const baseClasses =
    'hover:bg-secondary focus:ring-2 ring-inset focus:outline-none ring-primary ring-0 transition-colors px-4 py-1.5 cursor-pointer text-sm text-foreground whitespace-nowrap truncate flex flex-row gap-2 items-center';
  let optionElement = $state<HTMLButtonElement | null>(null);

  onMount(() => {
    if (selected) {
      setValue();
    }
    // Only set minWidth if this option is wider than current minWidth
    const thisMinWidth = optionElement ? optionElement.getBoundingClientRect().width : 0;
    if (optionElement && thisMinWidth > get(minWidth)) {
      minWidth.set(thisMinWidth);
    }
  });

  const setValue = () => {
    // If is already selected, do nothing
    if (get(selectValue)?.value === value) return;
    selectValue.set({
      value,
      html: optionElement?.innerHTML || '',
    });
  };
</script>

<button
  bind:this={optionElement}
  class={cn(
    baseClasses,
    disabled && 'text-muted',
    selected && 'bg-card-hover hover:bg-card-hover',
    className
  )}
  onclick={setValue}
  {...restProps}
>
  {@render children?.()}
</button>
