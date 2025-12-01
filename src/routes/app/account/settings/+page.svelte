<script lang="ts">
  import * as Tabs from '$lib/components/ui/tabs';
  import * as Card from '$lib/components/ui/card';
  import Passkey from './passkey.svelte';
  import Totp from './totp.svelte';
  import i18n from '$lib/i18n';
  import Password from './password.svelte';
  import General from './general.svelte';
  import { page } from '$app/state';
  import { toggleMode } from 'mode-watcher';
  import { Button } from '$lib/components/ui/button';
  import { Moon, Sun } from '@lucide/svelte';

  const entries = [
    {
      name: 'General',
      component: General,
      title: 'account.settings.tabs.general.title',
      description: 'account.settings.tabs.general.description',
    },
    {
      name: 'Password',
      component: Password,
      title: 'account.settings.tabs.password.title',
      description: 'account.settings.tabs.password.description',
    },
    {
      name: 'TOTP',
      component: Totp,
      title: 'account.settings.tabs.TOTP.title',
      description: 'account.settings.tabs.TOTP.description',
    },
    {
      name: 'Passkey',
      component: Passkey,
      title: 'account.settings.tabs.passkey.title',
      description: 'account.settings.tabs.passkey.description',
    },
  ];
</script>

<div class="mx-auto flex w-full max-w-[1000px] flex-col gap-4">
  {#if page.data.user.oauthProvider}
    <Card.Root>
      <Card.Header>
        <Card.Title>{i18n.t('account.settings.oauth.title')}</Card.Title>
        <Card.Description
          >{@html i18n.t('account.settings.oauth.description', {
            provider: page.data.user.oauthProvider,
          })}</Card.Description
        >
      </Card.Header>
      <Card.Content class="grid gap-6">
        <Button onclick={toggleMode} variant="outline" size="icon">
          <Sun
            class="size-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
          />
          <Moon
            class="absolute size-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
          />
          <span class="sr-only">Toggle theme</span>
        </Button>

        <Button href="/auth/log-out">Log out</Button>
      </Card.Content>
    </Card.Root>
  {:else}
    <Tabs.Root value={entries[0].name}>
      <Tabs.List>
        {#each entries as e (e.name)}
          <Tabs.Trigger value={e.name}>{i18n.t(e.title)}</Tabs.Trigger>
        {/each}
      </Tabs.List>
      {#each entries as e (e.name)}
        <Tabs.Content value={e.name}>
          <Card.Root>
            <Card.Header>
              <Card.Title>{i18n.t(e.title)}</Card.Title>
              <Card.Description>{i18n.t(e.description)}</Card.Description>
            </Card.Header>
            <Card.Content class="grid gap-6">
              <svelte:component this={e.component} />
            </Card.Content>
          </Card.Root>
        </Tabs.Content>
      {/each}
    </Tabs.Root>
  {/if}
</div>
