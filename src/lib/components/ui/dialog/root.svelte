<script lang="ts">
  // import Desktop from './desktop.svelte';
  import { Backdrop, portal } from '.';
  // import { isMobile } from '$lib/utils';
  import MobileModal from './mobile.svelte';
  import type { SvelteHTMLElements } from 'svelte/elements';

  interface MyProps {
    open: boolean;
    // showCloseButton?: boolean;
    noBackdropClose?: boolean;
    backdropClasses?: string;
  }

  let {
    children,
    open = $bindable(false),
    // showCloseButton,
    noBackdropClose,
    backdropClasses,
  }: SvelteHTMLElements['div'] & MyProps = $props();
</script>

<div use:portal class="portal" style="position: absolute; opacity: 0; pointer-events: none;">
  <Backdrop bind:open class={backdropClasses} {noBackdropClose} />
  <!-- {#if isMobile.current} -->
  <MobileModal bind:open>
    {@render children?.()}
  </MobileModal>
  <!-- {:else}
    <Desktop bind:open {noBackdropClose} {showCloseButton}>
      {@render children?.()}
    </Desktop>
  {/if} -->
</div>
