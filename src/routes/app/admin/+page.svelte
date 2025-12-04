<script lang="ts">
  import type { PageProps } from './$types';
  import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { Toaster } from '$lib/components/Toast/toast';
  import Button from '$lib/components/ui/button/button.svelte';
  import { ArrowRight, Pen, Plus, Save, Trash2 } from '@lucide/svelte';
  import Globals from '$lib/globals.svelte';
  import { cn } from '$lib/utils';
  import { flip } from 'svelte/animate';
  import * as Dialog from '$lib/components/ui/dialog';
  import { enhance } from '$app/forms';
  import { logger } from '$lib/utils/logger';
  import i18n from '$lib/i18n';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import { invalidateAll } from '$app/navigation';
  import * as AlertDialog from '$lib/components/ui/alert-dialog';

  let { data, form }: PageProps = $props();
  let flags = $derived(data.adminFlags);
  let dialogsOpen = $state({ create: false, delete: false, edit: false });
  let loadingStates = $state<{ create: boolean; delete: boolean; edit: boolean }>({
    create: false,
    delete: false,
    edit: false,
  });
  let formValues = $state<{
    create: { key: string; description: string; chance: number };
    edit: { originalId: string; key: string; description: string; chance: number };
    delete: string;
  }>({
    create: { key: '', description: '', chance: 0 },
    edit: { originalId: '', key: '', description: '', chance: 0 },
    delete: '',
  });

  $effect(() => {
    if (form?.message) {
      if (form?.error) {
        logger.error('Error:', form.message);
        Toaster.error(form.message);
      } else {
        Toaster.success(form.message);
        if (form.action === 'create') {
          dialogsOpen.create = false;
        } else if (form.action === 'delete') {
          dialogsOpen.delete = false;
        } else if (form.action === 'edit') {
          dialogsOpen.edit = false;
        }
        invalidateAll();
      }
    }
  });

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
      Toaster.success('Flag override updated successfully', {
        timeout: 2000,
      });
    } else {
      Toaster.error('Failed to update flag override');
    }
  }

  const isFormValid = (key: keyof typeof formValues) => {
    switch (key) {
      case 'create':
        return (
          formValues.create.key.trim().length > 0 &&
          formValues.create.description.trim().length > 0 &&
          formValues.create.chance >= 0 &&
          formValues.create.chance <= 100 &&
          flags.findIndex((f) => f.key === formValues.create.key.trim()) === -1
        );
      case 'edit':
        return (
          formValues.edit.key.trim().length > 0 &&
          formValues.edit.description.trim().length > 0 &&
          formValues.edit.chance >= 0 &&
          formValues.edit.chance <= 100 &&
          (formValues.edit.key.trim() === formValues.edit.originalId ||
            flags.findIndex((f) => f.key === formValues.edit.key.trim()) === -1)
        );
      default:
        return false;
    }
  };
</script>

<AlertDialog.Root bind:open={dialogsOpen.delete}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>{i18n.t('admin.flags.delete.title')}</AlertDialog.Title>
      <AlertDialog.Description>
        {i18n.t('admin.flags.delete.description')}
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>
        {i18n.t('admin.flags.delete.cancel')}</AlertDialog.Cancel
      >
      <form
        action="?/delete"
        method="POST"
        class="w-fit"
        use:enhance={(e) => {
          e.formData.append('key', formValues.delete);
          loadingStates.delete = true;
          return async ({ update }) => {
            loadingStates.delete = false;
            update({ reset: false });
          };
        }}
      >
        <AlertDialog.Action type="submit" disabled={loadingStates.delete} class="gap-2">
          {i18n.t('admin.flags.delete.confirm')}
          <ArrowRight class="size-4" />
        </AlertDialog.Action>
      </form>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<Dialog.Root bind:open={dialogsOpen.create}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{i18n.t('admin.flags.create.title')}</Dialog.Title>
      <Dialog.Description>{i18n.t('admin.flags.create.description')}</Dialog.Description>
    </Dialog.Header>

    <form
      action="?/create"
      class="mt-6 flex flex-col gap-4"
      method="POST"
      use:enhance={() => {
        loadingStates.create = true;
        return async ({ update }) => {
          loadingStates.create = false;
          update({ reset: false });
        };
      }}
    >
      <div class="space-y-2">
        <Label for="key">{i18n.t('admin.flags.create.input.key')}</Label>
        <Input name="key" bind:value={formValues.create.key} />
      </div>
      <div class="space-y-2">
        <Label for="description">{i18n.t('admin.flags.create.input.description')}</Label>
        <Textarea
          name="description"
          rows={3}
          class="resize-none"
          bind:value={formValues.create.description}
          placeholder={i18n.t('admin.flags.create.input.exampleDescription')}
        />
      </div>
      <div class="space-y-2">
        <Label for="chance">{i18n.t('admin.flags.create.input.chance')}</Label>
        <Input
          type="number"
          min={0}
          max={100}
          bind:value={formValues.create.chance}
          name="chance"
        />
      </div>

      <Dialog.Footer>
        <Button
          loading={loadingStates.create}
          disabled={loadingStates.create || !isFormValid('create')}
          type="submit"
          class="gap-2"
        >
          <Plus class="size-4" />
          {i18n.t('admin.flags.create.button')}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={dialogsOpen.edit}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{i18n.t('admin.flags.edit.title')}</Dialog.Title>
      <Dialog.Description>{i18n.t('admin.flags.edit.description')}</Dialog.Description>
    </Dialog.Header>

    <form
      action="?/edit"
      class="mt-6 flex flex-col gap-4"
      method="POST"
      use:enhance={(e) => {
        e.formData.append('originalId', formValues.edit.originalId);
        loadingStates.edit = true;
        return async ({ update }) => {
          loadingStates.edit = false;
          update({ reset: false });
        };
      }}
    >
      <div class="space-y-2">
        <Label for="key">{i18n.t('admin.flags.edit.input.key')}</Label>
        <Input name="key" bind:value={formValues.edit.key} />
      </div>
      <div class="space-y-2">
        <Label for="description">{i18n.t('admin.flags.edit.input.description')}</Label>
        <Textarea
          name="description"
          rows={3}
          class="resize-none"
          bind:value={formValues.edit.description}
          placeholder={i18n.t('admin.flags.edit.input.exampleDescription')}
        />
      </div>
      <div class="space-y-2">
        <Label for="chance">{i18n.t('admin.flags.edit.input.chance')}</Label>
        <Input type="number" min={0} max={100} bind:value={formValues.edit.chance} name="chance" />
      </div>

      <Dialog.Footer>
        <Button
          loading={loadingStates.edit}
          disabled={loadingStates.edit || !isFormValid('edit')}
          type="submit"
          class="gap-2"
        >
          <Save class="size-4" />
          {i18n.t('admin.flags.edit.button')}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>

<div class="mx-auto flex w-full max-w-[1000px] grow flex-col gap-4 py-2 lg:py-8">
  <div class="flex flex-row items-center justify-between">
    <h1 class="font-mono text-xl uppercase">Flags</h1>
    <Button class="gap-2" onclick={() => (dialogsOpen.create = true)}>
      <Plus class="size-5" />
      Create
    </Button>
  </div>
  <table>
    <thead>
      <tr class="border-border border-b">
        <td class="p-2 font-medium">Key</td>
        <td class="p-2 font-medium">Description</td>
        <td class="p-2 font-medium">Chance</td>
        <td class="p-2 font-medium">Override</td>
        <td class="p-2 font-medium">Actions</td>
      </tr>
    </thead>
    <tbody>
      {#each flags as flag (flag.key)}
        {@const selectValue =
          flag.overrideValue === true
            ? 'enabled'
            : flag.overrideValue === false
              ? 'disabled'
              : 'unset'}
        <tr
          class={cn(
            'border-border border-b transition-colors last:border-0',
            Globals.flags.getFlagOverride(flag.key) !== null ? 'bg-muted/50' : ''
          )}
          animate:flip={{ duration: 300 }}
        >
          <td class="p-2 text-lg font-medium">{flag.key}</td>
          <td class="p-2"><p class="line-clamp-3 text-ellipsis">{flag.description}</p></td>
          <td class="p-2 font-mono text-lg">{flag.chance}%</td>
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
          <td class="grid grid-cols-1 grid-rows-2 justify-items-end gap-2 p-2">
            <Button
              size="icon"
              variant="outline"
              onclick={() => {
                dialogsOpen.edit = true;
                formValues.edit.key = flag.key;
                formValues.edit.originalId = flag.key;
                formValues.edit.description = flag.description;
                formValues.edit.chance = flag.chance;
              }}><Pen class="size-4" /></Button
            >
            <Button
              size="icon"
              variant="destructive"
              onclick={() => {
                dialogsOpen.delete = true;
                formValues.delete = flag.key;
              }}><Trash2 class="size-4" /></Button
            >
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
