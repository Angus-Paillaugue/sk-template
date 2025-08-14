<script lang="ts">
  import { cn, isMobile } from '$lib/utils';
  import type { SvelteHTMLElements } from 'svelte/elements';

  let { children, class:className, ...restProps }: SvelteHTMLElements['div'] = $props();
</script>

<div class={cn("relative flex h-dvh flex-row overflow-hidden", className)} {...restProps}>
  {#if !isMobile.current}
    <div class="flex h-full w-[650px] shrink-0 flex-col items-center justify-center p-18">
      {@render children?.()}
    </div>

    <div
      class="size-full grow rounded-l-[60px] bg-[url(/logInImageLight.jpg)] bg-cover bg-center bg-no-repeat"
    ></div>
  {:else}
    <img src="/logInImageLight.jpg" class="absolute inset-0 size-full object-cover" alt="" />

    <div class="z-10 flex h-full w-full shrink-0 flex-col items-center justify-center p-4">
      <div
        class="bg-card text-card-foreground border-border rounded-xl border px-10 py-16 max-sm:px-4 max-sm:py-6"
      >
        {@render children?.()}
      </div>
    </div>
  {/if}
</div>
