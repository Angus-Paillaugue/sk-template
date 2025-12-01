<script lang="ts">
  import type { PageProps } from './$types';
  import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { Toaster } from '$lib/components/Toast/toast';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Plus } from '@lucide/svelte';

  let { data }: PageProps = $props();
  let flags = $state(data.adminFlags);

  async function setOverride(flagKey: string, value: boolean | null) {
    const response = await fetch('/api/admin/flags/override', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ flagKey, value }),
    });

    if (response.ok) {
      const idx = flags.findIndex((f) => f.key === flagKey);
      if (idx !== -1) {
        flags[idx].overrideValue = value;
      }
      Toaster.success('Flag override updated successfully');
    } else {
      Toaster.error('Failed to update flag override');
    }
  }
</script>

<div class="mx-auto flex w-full max-w-[1000px] grow flex-col gap-4 py-2 lg:py-8">
  <div class="flex flex-row items-center justify-between">
    <h1 class="font-mono text-xl uppercase">Flags</h1>
    <Button class="gap-2">
      <Plus class="size-5" />
      Create
    </Button>
  </div>
  <table>
    <thead>
      <tr class="border-border border-b">
        <td class="p-2 font-medium">Key</td>
        <td class="p-2 font-medium">Description</td>
        <td class="p-2 font-medium">Override</td>
      </tr>
    </thead>
    <tbody>
      {#each flags as flag}
        {@const selectValue =
          flag.overrideValue === true
            ? 'enabled'
            : flag.overrideValue === false
              ? 'disabled'
              : 'unset'}
        <tr class="border-border border-b last:border-0">
          <td class="p-2 font-medium">{flag.key}</td>
          <td class="p-2">{flag.description}</td>
          <td class="p-2">
            <RadioGroup.Root
              value={selectValue}
              onValueChange={(value) => {
                setOverride(flag.key, value === 'unset' ? null : value === 'enabled');
              }}
            >
              <div class="flex items-center space-x-2">
                <RadioGroup.Item value="unset" id="r1" />
                <Label for="r1">Unset</Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroup.Item value="enabled" id="r2" />
                <Label for="r2">Enabled</Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroup.Item value="disabled" id="r3" />
                <Label for="r3">Disabled</Label>
              </div>
            </RadioGroup.Root>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
