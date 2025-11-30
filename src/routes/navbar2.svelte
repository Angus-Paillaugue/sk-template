<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import { Button } from '$lib/components/ui/button';
  import i18n from '$lib/i18n';
  import { cn, isMobile } from '$lib/utils';
  import X from '@lucide/svelte/icons/x';
  import { Menu } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import { scale, slide } from 'svelte/transition';

  let mobileNavOpen = $state(false);
  let scrollYPos = $state(0);

  interface Link {
    href: string;
    text: string;
  }

  let links = $derived<Link[]>([
    { href: '/', text: 'nav.home' },
    { href: '/#about', text: 'nav.about' },
    { href: '/#pricing', text: 'nav.pricing' },

    ...(page.data?.user
      ? [
          { href: '/app', text: 'nav.app' },
          { href: '/app/account', text: 'nav.account' },
        ]
      : [
          { href: '/auth/sign-up', text: 'nav.signUp' },
          { href: '/auth/log-in', text: 'nav.logIn' },
        ]),
  ]);

  afterNavigate(() => {
    mobileNavOpen = false;
  });

  onMount(() => {
    const handleScroll = () => {
      scrollYPos = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

{#snippet button(link: Link, className: string = '')}
  <div
    class={cn('bg-card border-border flex h-full flex-col items-center justify-center', className)}
  >
    <Button variant="none" animatedText={i18n.t(link.text)} href={link.href} class="px-6 font-mono" />
  </div>
{/snippet}

{#snippet slice()}
  <div class="border-border grow border-x">
    <div
      class="size-full bg-[image:repeating-linear-gradient(315deg,var(--color-border)0,var(--color-border)1px,transparent_0,transparent_50%)] bg-[size:10px_10px] bg-fixed"
    ></div>
  </div>
{/snippet}

<div class="h-14 shrink-0 lg:h-16"></div>

{#if mobileNavOpen && isMobile.current}
  <div
    class="bg-card/80 fixed top-14 right-0 bottom-0 left-0 z-40 backdrop-blur-sm lg:top-16"
    transition:slide={{ axis: 'x', duration: 500 }}
  >
    <div class="flex h-full w-dvw flex-col items-center justify-center">
      <div class="border-border flex w-1/2 flex-col items-center border">
        {#each links as link, i (link.href)}
          <div class={cn('bg-card/50 flex w-full flex-col', i !== 0 && 'border-t')}>
            <Button variant="none" class="w-full" size="lg" href={link.href}>{i18n.t(link.text)}</Button
            >
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<nav
  class={cn(
    'fixed top-0 right-0 left-0 z-40 flex h-14 w-full transition-all lg:h-16',
    (mobileNavOpen && isMobile.current) || scrollYPos === 0 ? 'p-0' : 'p-2',
    isMobile.current ? 'duration-500' : 'duration-200'
  )}
>
  <div
    class={cn(
      'border-border flex w-full flex-row border transition-all duration-500',
      mobileNavOpen && isMobile.current
        ? 'bg-card/80 backdrop-blur-sm'
        : 'bg-card/30 backdrop-blur-sm'
    )}
  >
    {#if isMobile.current}
      {@render slice()}
      <div class="bg-card aspect-square h-full">
        <Button variant="none" class="size-full" onclick={() => (mobileNavOpen = !mobileNavOpen)}>
          {#if mobileNavOpen}
            <span class="size-6" in:scale={{ duration: 500 }}>
              <X class="size-full" />
            </span>
          {:else}
            <span class="size-6" in:scale={{ duration: 500 }}>
              <Menu class="size-6" />
            </span>
          {/if}
        </Button>
      </div>
    {:else}
      <div class="flex shrink-0 flex-row items-center">
        {#each links.slice(0, 3) as link, i (link.href)}
          {@render button(link, i !== 0 ? 'border-l' : '')}
        {/each}
      </div>
      {@render slice()}
      <div class="flex flex-row items-center">
        {#each links.slice(3) as link, i (link.href)}
          {@render button(link, i !== 0 ? 'border-l' : '')}
        {/each}
      </div>
    {/if}
  </div>
</nav>
