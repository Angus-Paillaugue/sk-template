<script lang="ts">
  import { isMobile } from '$lib/utils';
  import { portal } from '$lib/utils/portal.svelte';
  import type { SvelteHTMLElements } from 'svelte/elements';
  import Backdrop from './Backdrop.svelte';
  import DesktopModal from './desktopModal.svelte';
  import MobileModal from './mobileModal.svelte';

  interface MyProps {
    open: boolean;
    fullScreen?: boolean;
    onClose?: () => void;
    noBackdropClose?: boolean;
  }

  let {
    open = $bindable(false),
    fullScreen = false,
    onClose,
    children,
    noBackdropClose = false
  }: SvelteHTMLElements['div'] & MyProps = $props();
  let portalElement = $state<HTMLElement | null>(null);

  async function focusFirstModalInput() {
    if (!portalElement) return;
    const firstInput = portalElement.querySelector('input, textarea, select') as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    if (firstInput) {
      firstInput.focus();
    }
  }

  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      // Focus the first input field in the modal
      focusFirstModalInput();
    } else {
      document.body.style.overflow = 'auto';
      if (onClose) onClose();
    }
  });
</script>

<div
  use:portal
  class="portal"
  bind:this={portalElement}
  style="position: absolute; opacity: 0; pointer-events: none;"
>
  <Backdrop bind:open {noBackdropClose} />
  {#if isMobile.current}
    <MobileModal bind:open {children} {fullScreen} />
  {:else}
    <DesktopModal bind:open {children} />
  {/if}
</div>
