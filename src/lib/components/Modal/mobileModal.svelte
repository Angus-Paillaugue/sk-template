<script lang="ts">
  import { cn } from '$lib/utils';
  import { backInOut } from 'svelte/easing';
  import type { SvelteHTMLElements } from 'svelte/elements';
  import { fly } from 'svelte/transition';
  import { TRANSITION_DURATION } from '.';

  interface MyProps {
    open: boolean;
    fullScreen?: boolean;
  }

  let {
    open = $bindable(false),
    fullScreen = false,
    children
  }: SvelteHTMLElements['div'] & MyProps = $props();

  let initialPosition = $state<{ y: number }>({ y: 0 });
  let swipeY = $state(0);
  let isDragging = $state(false);
  let modalCard = $state<HTMLDivElement>();

  // Drag on mobile
  function handleTouchStart(event: TouchEvent) {
    if (isDragging) return;
    initialPosition = { y: event.touches[0].clientY };
    isDragging = true;
  }
  function handleTouchMove(event: TouchEvent) {
    if (!isDragging) return;

    const dragDistance = event.touches[0].clientY - initialPosition.y;

    swipeY = dragDistance;
  }

  function handleTouchEnd() {
    if (!isDragging || !modalCard) return;
    isDragging = false;
    const closeThreshold = modalCard.clientHeight / 3;
    if (swipeY > closeThreshold) {
      open = false;
    }
    initialPosition = { y: 0 };
    swipeY = 0;
  }

  // Drag on desktop
  function handleMouseDown(event: MouseEvent) {
    if (isDragging) return;
    initialPosition = { y: event.clientY };
    isDragging = true;
  }
  function handleMouseMove(event: MouseEvent) {
    if (!isDragging) return;

    const dragDistance = event.clientY - initialPosition.y;

    swipeY = dragDistance;
  }
  function handleMouseUp() {
    if (!isDragging || !modalCard) return;
    isDragging = false;
    const closeThreshold = modalCard.clientHeight / 3;
    if (swipeY > closeThreshold) {
      open = false;
    }
    initialPosition = { y: 0 };
    swipeY = 0;
  }
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

{#if open}
  <div class="pointer-events-none fixed right-0 bottom-0 left-0 z-20 h-fit max-h-svh p-2">
    <div
      class={cn(
        'bg-card text-foreground border-card pointer-events-auto mx-auto flex max-h-full max-w-screen-md origin-bottom flex-col rounded border p-3',
        !isDragging && 'transition-transform'
      )}
      transition:fly={{ y: '100%', duration: TRANSITION_DURATION, easing: backInOut }}
      bind:this={modalCard}
      style:transform={`translateY(${swipeY >= 0 ? swipeY : 0}px) scaleY(${swipeY < 0 ? -swipeY * 0.0002 + 1 : 1})`}
      style:max-height={`${fullScreen ? '100%' : 'calc(70svh - .5rem'}`}
    >
      <!-- Transform: translate : move modal down to close it, scaleY : when dragging it up, skew it by a small factor -->
      <!-- max-height : max modal height taking padding of the parent into account -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="flex shrink-0 flex-row items-center justify-center pt-1 pb-4"
        ontouchstart={handleTouchStart}
        ontouchmove={handleTouchMove}
        ontouchend={handleTouchEnd}
        onmousedown={handleMouseDown}
      >
        <!-- Drag handle -->
        <div class="bg-foreground h-1 w-1/2 max-w-24 rounded-full"></div>
      </div>
      <div class="flex grow flex-col overflow-y-auto">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}
