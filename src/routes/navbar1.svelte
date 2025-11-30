<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import i18n from '$lib/i18n';
  import { cn, isMobile } from '$lib/utils';
  import { Menu } from '@lucide/svelte';

  let mobileNavOpen = $state(false);

  interface Link {
    href: string;
    text: string;
  }

  let links = $derived<Link[][]>([
    [
      { href: '/', text: 'nav.home' },
      { href: '/#about', text: 'nav.about' },
      { href: '/#pricing', text: 'nav.pricing' },
    ],
    page.data?.user
      ? [
          { href: '/app', text: 'nav.app' },
          { href: '/app/account', text: 'nav.account' },
        ]
      : [
          { href: '/auth/sign-up', text: 'nav.signUp' },
          { href: '/auth/log-in', text: 'nav.logIn' },
        ],
  ]);

  afterNavigate(() => {
    mobileNavOpen = false;
  });
</script>

{#snippet entry(link: Link)}
  <Button
    variant="none"
    animatedText={i18n.t(link.text)}
    href={link.href}
    class="before:acale-0 dark:before:bg-accent before:bg-border px-4 font-mono before:absolute before:inset-0 before:z-0 before:scale-0 before:rounded-full before:transition-all hover:before:scale-100"
  />
{/snippet}

{#snippet corner(vFlip: boolean = false)}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class={cn('dark:fill-card fill-muted size-8', vFlip && 'rotate-90')}
    viewBox="0 0 250 250"
    ><path
      d="M 0.003 250.177 L 0.003 -0.01 L 250.253 -0.031 C 250.253 -0.031 138.657 -1.098 70.006 69.958 C 1.595 140.765 0.003 250.177 0.003 250.177 Z"
    ></path></svg
  >
{/snippet}

{#snippet navCorner(entries: { href: string; text: string }[] = [], vFlip: boolean = false)}
  <div class={cn('flex flex-col justify-start', vFlip ? 'items-end' : 'items-start')}>
    <div class={cn('flex items-start justify-start', vFlip ? 'flex-row-reverse' : 'flex-row')}>
      <div
        class={cn(
          'dark:bg-card bg-muted pointer-events-auto flex flex-row items-center p-2',
          vFlip ? 'rounded-bl-[1.5rem]' : 'rounded-br-[1.5rem]'
        )}
      >
        {#each entries as e (e.href)}
          {@render entry(e)}
        {/each}
      </div>
      {@render corner(vFlip)}
    </div>
    {@render corner(vFlip)}
  </div>
{/snippet}

<Dialog.Root bind:open={mobileNavOpen}>
  <Dialog.Content>
    {#each links as l, i}
      {#each l as link (link.href)}
        <Button variant="link" href={link.href}>{i18n.t(link.text)}</Button>
      {/each}
      {#if i < links.length - 1}
        <hr class="border-border my-2" />
      {/if}
    {/each}
  </Dialog.Content>
</Dialog.Root>

{#if isMobile.current}
  <nav class="bg-card z-30 flex h-14 flex-col items-end justify-center border-b p-2">
    <Button variant="secondary" size="icon" onclick={() => (mobileNavOpen = !mobileNavOpen)}>
      <Menu class="size-6" />
    </Button>
  </nav>
{:else}
  <nav
    class="pointer-events-none fixed top-0 right-0 left-0 z-30 flex flex-row items-center justify-between"
  >
    {@render navCorner(links[0])}

    {@render navCorner(links[1], true)}
  </nav>
{/if}
