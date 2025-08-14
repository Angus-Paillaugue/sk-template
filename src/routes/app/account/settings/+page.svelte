<script lang="ts">
  import { cn } from "$lib/utils";
  import Passkey from "./passkey.svelte";
  import Totp from "./totp.svelte";

  let tabs: { name: string; component: any; }[] = [
    { name: 'TOTP', component: Totp },
    { name: 'Passkey', component: Passkey }
  ]

  let tabSelectorWidths = $state<number[]>([]);
  let activeTabIndex = $state(0);
  let activeTabIndicator = $state<undefined | HTMLDivElement>()

  $effect(() => {
    tabSelectorWidths = tabs.map((tab, i) => {
      const el = document.querySelector(`#tab-${i}`) as HTMLElement;
      return el ? el.clientWidth : 0;
    });
  });

  $effect(() => {
    const activeTab = document.querySelector(`#tab-${activeTabIndex}`) as HTMLElement;
    if (activeTab && activeTabIndicator) {
      const indicator = activeTabIndicator;
      const indicatorRect = indicator.getBoundingClientRect();
      const activeRect = activeTab.getBoundingClientRect();

      // Calculate left and width for animation
      const parentRect = indicator.parentElement!.getBoundingClientRect();
      const fromLeft = indicatorRect.left - parentRect.left;
      const toLeft = activeRect.left - parentRect.left;
      const fromWidth = indicatorRect.width;
      const toWidth = activeRect.width;

      // Step animation: expand to cover both tabs, then shrink to new tab
      const stepWidth = Math.abs(toLeft - fromLeft) + Math.max(fromWidth, toWidth);
      const minLeft = Math.min(fromLeft, toLeft);

      indicator.animate([
        { left: `${fromLeft}px`, width: `${fromWidth}px` },
        { left: `${minLeft}px`, width: `${stepWidth}px` },
        { left: `${minLeft}px`, width: `${stepWidth}px` },
        { left: `${toLeft}px`, width: `${toWidth}px` }
      ], {
        duration: 600,
        easing: 'cubic-bezier(.4,0,.2,1)',
        fill: 'forwards',
      });

      // Set final position after animation
      setTimeout(() => {
        indicator.style.left = `${toLeft}px`;
        indicator.style.width = `${toWidth}px`;
      }, 400);
    }
  });
</script>

<div class="flex flex-col gap-4 max-w-[1000px] mx-auto w-full">

  <!-- Tab selector -->
  <div class="flex flex-row items-center rounded-full p-2 bg-card border border-border w-fit relative">
    <div class="absolute top-2 bottom-2 rounded-full bg-primary z-0" bind:this={activeTabIndicator}></div>
    {#each tabs as tab, i}
      <button class={cn("py-2 px-4 transition-all z-[1] font-medium font-mono", i === activeTabIndex ? 'text-background' : 'text-muted')} id="tab-{i}" onclick={() => (activeTabIndex = i)}>{tab.name}</button>
    {/each}
  </div>


  <div class="h-[500px] overflow-hidden bg-card border border-border rounded">
    <div
      class="grid"
      style="
        height: calc({tabs.length * 100}%);
        grid-template-rows: repeat({tabs.length}, 1fr);
        transform: translateY(-{(activeTabIndex / tabs.length) * 100}%);
        transition: transform 0.4s ease;
      "
    >
      {#each tabs as tab}
        <div class="p-4 lg:p-8 flex flex-col">
          <h2 class="text-lg font-semibold mb-4">{tab.name}</h2>
          <!-- svelte-ignore svelte_component_deprecated -->
          <svelte:component this={tab.component} />
        </div>
      {/each}
    </div>
  </div>
</div>
