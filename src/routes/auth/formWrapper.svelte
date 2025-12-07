<script lang="ts">
  import { cn, isMobile, navHeight } from '$lib/utils';
  import type { SvelteHTMLElements } from 'svelte/elements';
  import FormImageDark from '$lib/assets/authForm/FormImageDark.jpg?enhanced';
  import FormImageLight from '$lib/assets/authForm/FormImageLight.jpg?enhanced';
  import * as Card from '$lib/components/ui/card';
  import Button from '$lib/components/ui/button/button.svelte';
  import i18n from '$lib/i18n';
  import { ArrowLeft, LogIn } from '@lucide/svelte';
  import { logger } from '$lib/utils/logger';
  import { Toaster } from '$lib/components/Toast/toast';
  import { page } from '$app/state';
  import Theming from '$lib/theming/index.svelte';

  interface Props {
    reverse?: boolean;
    back?: string;
  }

  const easterEggParams = {
    clicks: 5,
    duration: 5000,
  };
  let imgClicks = $state<Date[]>([]);
  let easterEggActive = $state<boolean>(false);
  let oauthLoading = $state(false);

  let {
    children,
    class: className,
    reverse = false,
    back,
    ...restProps
  }: Props & SvelteHTMLElements['div'] = $props();

  function onImageClick() {
    imgClicks.push(new Date());
    if (imgClicks.length > easterEggParams.clicks) {
      imgClicks = imgClicks.slice(-easterEggParams.clicks);
    }

    if (
      imgClicks.length === easterEggParams.clicks &&
      imgClicks[easterEggParams.clicks - 1].getTime() - imgClicks[0].getTime() <
        easterEggParams.duration
    ) {
      easterEggActive = !easterEggActive;
      imgClicks = [];
    }
  }

  async function handleOAuthSetup() {
    if (!page.data.oidcConf.enabled) {
      return;
    }
    try {
      oauthLoading = true;
      const response = await fetch('/api/auth/oauth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate OAuth');
      }

      // Redirect to OAuth provider
      window.location.href = data.authorizationUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OAuth setup failed';
      logger.error(message);
      Toaster.error(message);
      oauthLoading = false;
    }
  }
</script>

{#if easterEggActive}
  <div class="pointer-events-none absolute inset-0 z-50 backdrop-invert"></div>
{/if}

<div
  class={cn('relative flex flex-row overflow-hidden', reverse && 'flex-row-reverse', className)}
  style="height: calc(100dvh - {navHeight}px);"
  {...restProps}
>
  {#if back}
    <div class="animate-in zoom-in-0 absolute top-20 left-6 z-10">
      <Button variant="secondary" class="flex-row gap-2" href={back}>
        <ArrowLeft class="size-4" />
        {i18n.t('auth.formWrapper.back')}
      </Button>
    </div>
  {/if}
  {#if !isMobile.current}
    <div class="flex h-full w-[650px] shrink-0 flex-col items-center justify-center p-18">
      <div class="flex w-full flex-col space-y-8">
        {@render children?.()}
        {#if page.data.oidcConf.enabled}
          <Button onclick={handleOAuthSetup} class="gap-2" loading={oauthLoading} variant="outline">
            <LogIn class="size-4" />
            {i18n.t('auth.oauth.button', { name: page.data.oidcConf.providerName })}
          </Button>
        {/if}
      </div>
    </div>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      onclick={onImageClick}
      class={cn(
        'animate-in relative size-full grow overflow-hidden duration-300 select-none',
        reverse ? 'slide-in-from-left rounded-r-[60px]' : 'slide-in-from-right rounded-l-[60px]'
      )}
    >
      {#if Theming.mode === 'dark'}
        <enhanced:img
          draggable="false"
          src={FormImageDark}
          class="absolute inset-0 size-full object-cover"
          alt=""
        />
      {:else}
        <enhanced:img
          draggable="false"
          src={FormImageLight}
          class="absolute inset-0 size-full object-cover"
          alt=""
        />
      {/if}
    </div>
  {:else}
    {#if Theming.mode === 'dark'}
      <enhanced:img
        draggable="false"
        src={FormImageDark}
        class="absolute inset-0 size-full object-cover"
        alt=""
      />
    {:else}
      <enhanced:img
        draggable="false"
        src={FormImageLight}
        class="absolute inset-0 size-full object-cover"
        alt=""
      />
    {/if}

    <div class="z-10 flex h-full w-full shrink-0 flex-col items-center justify-center p-4">
      <Card.Root class="w-full max-w-sm">
        <Card.Content>
          <div class="flex w-full flex-col space-y-8">
            {@render children?.()}
            {#if page.data.oidcConf.enabled}
              <Button
                onclick={handleOAuthSetup}
                class="gap-2"
                loading={oauthLoading}
                variant="outline"
              >
                <LogIn class="size-4" />
                {i18n.t('auth.oauth.button', { name: page.data.oidcConf.providerName })}
              </Button>
            {/if}
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  {/if}
</div>
