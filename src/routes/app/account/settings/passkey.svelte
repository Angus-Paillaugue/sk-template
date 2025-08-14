<script lang="ts">
  import { startRegistration } from '@simplewebauthn/browser';
  import { logger } from '$lib/utils/logger';
  import { Toaster } from '$lib/components/Toast/toast';
  import { enhance } from '$app/forms';
  import { Button, Modal } from '$lib/components';
  import { t } from '$lib/i18n';
  import { page } from '$app/state';
  import { ArrowRight } from 'lucide-svelte';

  let isDeletingPasskey = $state(false);
  let removePasskeyModalOpen = $state(false);
  let user = $state(page.data.user);

  $effect(() => {
    if (page?.form && page.form.action === 'deletePasskey') {
      if(page.form.success) {
        user.passkey = null; // Clear passkey from user data
        removePasskeyModalOpen = false; // Close modal if it was open
        Toaster.success($t('successes.passkeyDeleted'));
      }else {
        logger.error(page.form.message);
        Toaster.error($t(page.form.message));
      }
    }
  });

  async function registerPasskey() {
    const optsRes = await fetch(
      `/api/auth/generate-registration-options?username=${user.username}`
    )
    const opts = await optsRes.json()
    if(!optsRes.ok) {
      logger.error(opts.error);
      Toaster.error(opts.error);
      return;
    }
    try {
      const attResp = await startRegistration(opts);

      const verificationRes = await fetch('/api/auth/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, attResp }),
      });
      const verification = await verificationRes.json();
      if(!verificationRes.ok) {
        throw new Error(verification.error);
      }

      if (!verification.verified) {
        throw new Error(verification.error);
      }
      logger.debug("Passkey added")
      Toaster.success("successes.passkeyAdded")
      user.passkey = verification.passkey;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(errorMessage);
      Toaster.error(errorMessage);
    }
  }
</script>

<Modal bind:open={removePasskeyModalOpen}>
  <Modal.Heading>
    <Modal.Title>{$t('auth.passkey.settings.remove.modal.title')}</Modal.Title>
  </Modal.Heading>

  <p>
    {$t('auth.passkey.settings.remove.modal.description')}
  </p>

  <Modal.Actions>
    <Button onclick={() => (removePasskeyModalOpen = false)}>
      {$t('auth.passkey.settings.remove.modal.cancel')}
    </Button>
    <form action="?/deletePasskey" method="POST" class="w-fit" use:enhance={() => {
      isDeletingPasskey = true;
      return async ({ update }) => {
        await update();
        isDeletingPasskey = false;
      };
    }}>
      <Button loading={isDeletingPasskey} type="submit">
        {$t('auth.passkey.settings.remove.modal.confirm')}
        <ArrowRight class="size-4" />
      </Button>
    </form>
  </Modal.Actions>
</Modal>

{#if user.passkey}
  <p>{$t('auth.passkey.settings.remove.title')}</p>
  <Button onclick={() => (removePasskeyModalOpen = true)}>
    {$t('auth.passkey.settings.remove.button')}
  </Button>
{:else}
  <p>{$t('auth.passkey.settings.register.title')}</p>
  <Button onclick={registerPasskey}>
    {$t('auth.passkey.settings.register.button')}
  </Button>
{/if}
