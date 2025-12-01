<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/state';
  import { Toaster } from '$lib/components/Toast/toast';
  import * as Alert from '$lib/components/ui/alert';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import i18n from '$lib/i18n';
  import { logger } from '$lib/utils/logger';
  import { AlertCircle, CheckCheck } from '@lucide/svelte';

  let formValues = $state({ username: page.data.user.username, email: page.data.user.email });
  let initialFormValues = $state({ ...formValues });
  let checkUsernameStatusData = $state({
    available: false,
    loading: false,
    error: null,
    controller: new AbortController(),
  });
  let updateEmailLoading = $state(false);

  async function onUsernameInput() {
    if (formValues.username !== initialFormValues.username) {
      checkUsernameStatusData.loading = true;
      checkUsernameStatusData.available = await isUsernameTakenFunc(formValues.username);
    } else {
      checkUsernameStatusData.available = false;
    }
    checkUsernameStatusData.loading = false;
  }

  $effect(() => {
    if (page?.form && page.form.action === 'general') {
      if (page.form.success) {
        Toaster.success(page.form.message);
        initialFormValues = { ...formValues };
      } else {
        logger.error(page.form.message);
        Toaster.error(page.form.message);
      }
      page.form.action = null; // reset form action to prevent duplicate toasts
    }
  });

  async function isUsernameTakenFunc(newValue: string) {
    if (newValue.length <= 3) return false;
    checkUsernameStatusData.controller?.abort?.();
    checkUsernameStatusData.controller = new AbortController();
    const res = await fetch(`/api/auth/username-taken?username=${encodeURIComponent(newValue)}`, {
      signal: checkUsernameStatusData.controller.signal,
    });
    const data = await res.json();
    checkUsernameStatusData.error = data.error || null;
    if (data.error) {
      logger.error(data.error);
      Toaster.error(data.error);
      return false;
    }
    checkUsernameStatusData.loading = false;
    return !data.taken;
  }
</script>

<form
  action="?/updateUsername"
  class="space-y-4"
  method="POST"
  use:enhance={() => {
    checkUsernameStatusData.loading = true;
    return async ({ update }) => {
      update({ reset: false });
      checkUsernameStatusData.loading = false;
    };
  }}
>
  <div class="space-y-2">
    <Label for="username">{i18n.t('auth.username')}</Label>
    <Input name="username" bind:value={formValues.username} oninput={onUsernameInput} />
  </div>

  {#if formValues.username !== initialFormValues.username && formValues.username.length > 3}
    {#if checkUsernameStatusData.available}
      <Alert.Root variant="success">
        <AlertCircle />
        <Alert.Title
          >{i18n.t(
            'account.settings.tabs.general.changeUsername.alerts.available.title'
          )}</Alert.Title
        >
        <Alert.Description>
          <p>
            {i18n.t('account.settings.tabs.general.changeUsername.alerts.available.description', {
              username: formValues.username,
            })}
          </p>
        </Alert.Description>
      </Alert.Root>
    {:else}
      <Alert.Root variant="destructive">
        <CheckCheck />
        <Alert.Title
          >{i18n.t('account.settings.tabs.general.changeUsername.alerts.taken.title')}</Alert.Title
        >
        <Alert.Description>
          <p>
            {i18n.t('account.settings.tabs.general.changeUsername.alerts.taken.description', {
              username: formValues.username,
            })}
          </p>
        </Alert.Description>
      </Alert.Root>
    {/if}
  {/if}

  <Button
    type="submit"
    disabled={checkUsernameStatusData.loading || formValues.username === initialFormValues.username}
    loading={checkUsernameStatusData.loading}
  >
    {i18n.t('account.settings.tabs.general.changeUsername.title')}
  </Button>
</form>

<form
  action="?/updateEmail"
  class="space-y-4"
  method="POST"
  use:enhance={() => {
    updateEmailLoading = true;
    return async ({ update }) => {
      update({ reset: false });
      updateEmailLoading = false;
    };
  }}
>
  <div class="space-y-2">
    <Label for="email">{i18n.t('auth.email')}</Label>
    <Input name="email" bind:value={formValues.email} type="email" />
  </div>

  <Button
    type="submit"
    disabled={updateEmailLoading || formValues.email === initialFormValues.email}
    loading={updateEmailLoading}
  >
    {i18n.t('account.settings.tabs.general.changeEmail.title')}
  </Button>
</form>
