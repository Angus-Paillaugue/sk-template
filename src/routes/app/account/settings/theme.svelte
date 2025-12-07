<script lang="ts">
  import { page } from '$app/state';
  import { Label } from '$lib/components/ui/label';
  import * as Select from "$lib/components/ui/select";
  import i18n from '$lib/i18n';
  import Theming, { availableModes, availableThemes, type Mode } from '$lib/theming/index.svelte';
  import { capitalize } from '$lib/utils';
  import { Monitor, Moon, Sun } from '@lucide/svelte';

  let currentTheme = $state(page.data.theme);
</script>

{#snippet modeIcon(mode: Mode)}
  {#if mode === 'system'}
    <Monitor class="size-full" />
  {:else if mode === 'dark'}
    <Moon class="size-full" />
  {:else if mode === 'light'}
    <Sun class="size-full" />
  {/if}
{/snippet}

<div class="grid grid-cols-2 gap-4">
  <div class="flex flex-col gap-2">
    <Label for="modeSelect">{i18n.t('account.settings.tabs.general.theme.mode')}</Label>
    <Select.Root type="single" name="modeSelect" bind:value={currentTheme.mode.mode} onValueChange={() => Theming.setMode(currentTheme.mode.mode, currentTheme.theme)}>
      <Select.Trigger class="w-[180px]">
        <div class="flex gap-2 items-center">
          <span class="size-4">
            {@render modeIcon(currentTheme.mode.mode)}
          </span>
          {capitalize(currentTheme.mode.mode)}
        </div>
      </Select.Trigger>
      <Select.Content>
        {#each availableModes as mode (mode)}
          <Select.Item
            value={mode}
            disabled={mode === currentTheme.mode.mode}
            class="flex gap-2 items-center"
          >
            <span class="size-4">
              {@render modeIcon(mode)}
            </span>
            {capitalize(mode)}
          </Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>
  <div class="flex flex-col gap-2">
    <Label for="themeSelect">{i18n.t('account.settings.tabs.general.theme.theme')}</Label>
    <Select.Root type="single" name="themeSelect" bind:value={currentTheme.theme} onValueChange={() => Theming.setTheme(currentTheme.theme, currentTheme.mode.mode)}>
      <Select.Trigger class="w-[180px]">
        {capitalize(currentTheme.theme)}
      </Select.Trigger>
      <Select.Content>
        {#each availableThemes as theme (theme)}
          <Select.Item
            value={theme}
            disabled={theme === currentTheme.theme}
          >
            {capitalize(theme)}
          </Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>
</div>
