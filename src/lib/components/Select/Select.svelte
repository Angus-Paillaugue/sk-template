<script lang="ts">
  import { cn } from '$lib/utils';
  import { ChevronDown } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import type { SvelteHTMLElements } from 'svelte/elements';
  import { minWidth, value } from './stores';
  import { slide } from 'svelte/transition';
  import { accordion } from './collapsible';

  type DropdownPosition = 'top' | 'bottom';

  interface MyProps {
    onChange?: (val: string | number | null) => void;
    maxWidth?: number;
    dropdownPosition?: DropdownPosition;
  }

  const {
    class: className,
    onChange,
    children,
    dropdownPosition = 'bottom',
    maxWidth = 300,
    ...restProps
  }: MyProps & SvelteHTMLElements['div'] = $props();

  const baseClasses =
    'block bg-background text-foreground text-sm min-w-[40px] relative font-medium px-2 py-1 rounded-md font-sans focus:outline-hidden border border-border outline-hidden focus:ring-2 transition-all ring-primary flex flex-row gap-2 items-center';

  const finalClasses = cn(baseClasses, className);

  let open = $state(false);
  let selectElement: HTMLDivElement | null = null;

  function onPageClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (selectElement && !selectElement.contains(target)) {
      open = false;
    }
  }

  onMount(() => {
    if (onChange) value.subscribe((val) => onChange(val.value));
  });

  function handleClick() {
    open = !open;
  }

  const dropdownPositionClasses: Record<DropdownPosition, string> = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
  };
</script>

<svelte:window onclick={onPageClick} />

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  tabindex="0"
  class={finalClasses}
  bind:this={selectElement}
  onclick={handleClick}
  style="width: {Math.min(Math.max($minWidth, 40), maxWidth) + 30}px;"
  {...restProps}
>
  <div class="flex flex-row items-center gap-2">
    {@html $value?.html}
  </div>
  <ChevronDown
    class={cn(
      'text-muted size-4 transition-transform ltr:ml-auto rtl:mr-auto',
      open && 'rotate-180'
    )}
  />
  <div
    use:accordion={open}
    class={cn('absolute right-0 left-0', dropdownPositionClasses[dropdownPosition])}
    transition:slide
  >
    <div class="border-border bg-background flex flex-col overflow-hidden rounded-md border">
      {@render children?.()}
    </div>
  </div>
</div>
