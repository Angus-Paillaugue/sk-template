<script lang="ts">
  import QRCode from 'qrcode';
  import { Button, Input, Modal, Spinner } from '$lib/components';
  import { ArrowRight, CheckCheck, Eye, EyeClosed } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';
  import { page } from '$app/state';
  import type { User } from '$lib/types';
  import { t } from '$lib/i18n';
  import { enhance } from '$app/forms';
  import { copyToClipboard } from '$lib/utils';
  import { logger } from '$lib/utils/logger';
  import { Toaster } from '$lib/components/Toast/toast';

  let user = $state<User>(page.data.user);
  let setUpTOTPModalOpen = $state(false);
  let isSettingUpTOTP = $state(false);
  let TOTPSuccessModalOpen = $state(false);
  let TOTPsecret = $state('');
  let manualTOPTKeyVisible = $state(false);
  let unlinkTOTPSecondStepModalOpen = $state(false);

  async function getTOTPURL() {
    const res = await fetch('/api/auth/totp/generateURL');
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message);
    }
    TOTPsecret = data.secret;
    return data.url;
  }

  const generateQR = async () => {
    try {
      const url = await getTOTPURL();
      const qrCodeUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 256,
        margin: 1
      });
      return qrCodeUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(msg);
      Toaster.error(msg);
    }
  };

  $effect(() => {
    if(page.form && page.form?.success) {
      if(page.form.action === 'setUpTOTP') {
        setUpTOTPModalOpen = false;
        TOTPSuccessModalOpen = true;
        user.totpSecret = TOTPsecret;
      } else if (page.form.action === 'unlinkTOTP') {
        user.totpSecret = undefined;
        unlinkTOTPSecondStepModalOpen = false;
      }
    }else if (page.form && page.form?.error) {
      const errorMessage = page.form.message;
      logger.error(errorMessage);
      Toaster.error(errorMessage);
    }
  });
</script>

<!-- Set up/Unlink 2FA -->
<Modal bind:open={unlinkTOTPSecondStepModalOpen}>
  <Modal.Heading>
    <Modal.Title>{$t('auth.totp.settings.manage.title')}</Modal.Title>
  </Modal.Heading>

  <form
    action="?/unlinkTOTP"
    class="mt-6 flex flex-col gap-4"
    method="POST"
    use:enhance={(e) => {
      e.formData.append('TOTPsecret', TOTPsecret);
      isSettingUpTOTP = true;
      return async ({ update }) => {
        isSettingUpTOTP = false;
        update({ reset: false });
      };
    }}
  >
    <p>{$t('auth.totp.settings.manage.secondStep.description')}</p>
    <Input.TOTP id="totp" class={{ container: 'mx-auto w-fit' }} />
    <Modal.Actions>
      <Button
        type="button"
        onclick={() => (unlinkTOTPSecondStepModalOpen = false)}>{$t('auth.totp.settings.manage.secondStep.cancel')}</Button
      >
      <Button loading={isSettingUpTOTP}>
        {$t('auth.totp.settings.manage.secondStep.confirm')}
        <ArrowRight class="size-4" />
      </Button>
    </Modal.Actions>
  </form>
</Modal>

<!-- Set up/Unlink 2FA -->
<Modal bind:open={setUpTOTPModalOpen}>
  <Modal.Heading>
    <Modal.Title
      >{$t(
        user.totpSecret
          ? 'auth.totp.settings.manage.title'
          : 'auth.totp.settings.setup.title'
      )}</Modal.Title
    >
  </Modal.Heading>

  <!-- Unlink TOTP -->
  {#if user.totpSecret}
    <p>{$t('auth.totp.settings.manage.description')}</p>

    <Modal.Actions>
      <Button type="button" onclick={() => (setUpTOTPModalOpen = false)}
        >{$t('auth.totp.settings.success.buttons.close')}</Button
      >
        <Button
        type="submit"
        onclick={() => {setUpTOTPModalOpen = false;unlinkTOTPSecondStepModalOpen = true}}
        >
          {$t('auth.totp.settings.manage.button')}
          <ArrowRight class="size-4" />
        </Button>
      </Modal.Actions>
  {:else}
    <!-- Set up TOTP -->
    <p>{$t('auth.totp.settings.setup.description')}</p>

    <div class="flex flex-col items-center justify-center gap-4">
      {#await generateQR()}
        <Spinner class="mx-auto size-8" />
      {:then url}
        <img
          src={url}
          alt={$t('auth.totp.settings.setup.qrCodeAlt')}
          class="mx-auto size-64"
        />
        <div class="flex flex-col items-center justify-center">
          <p>{$t('auth.totp.settings.setup.unableToScan')}</p>
          <div class="flex h-6 flex-row items-center justify-center">
            <button
              class="hover:bg-secondary-hover text-muted mr-1 size-6 shrink-0 cursor-pointer rounded-sm p-1 transition-colors"
              title={$t('auth.totp.settings.setup.showHideValue')}
              onclick={() => (manualTOPTKeyVisible = !manualTOPTKeyVisible)}
            >
              {#if manualTOPTKeyVisible}
                <span class="size-full" in:fade={{ duration: 400 }}>
                  <EyeClosed class="size-full" />
                </span>
              {:else}
                <span class="size-full" in:fade={{ duration: 400 }}>
                  <Eye class="size-full" />
                </span>
              {/if}
            </button>
            {#if manualTOPTKeyVisible}
              <button
                in:slide={{ axis: 'x', duration: 400, delay: 400 }}
                out:slide={{ axis: 'x', duration: 400 }}
                class="bg-secondary-hover cursor-copy truncate rounded-sm border px-1 py-0.5 text-start font-mono text-sm"
                onclick={() => copyToClipboard(TOTPsecret)}>{TOTPsecret}</button
              >
            {:else}
              <div
                class="flex h-full flex-row items-center rounded-sm"
                in:slide={{ delay: 400, axis: 'x', duration: 300 }}
                out:slide={{ axis: 'x', duration: 300 }}
              >
                {#each new Array(10) as _}
                  <div class="flex w-2 shrink-0 flex-row items-center justify-center">
                    <span class="bg-muted size-1 rounded-full"></span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {:catch error}
        <p>{error.message}</p>
      {/await}
    </div>

    <!-- <Hr text={$t('auth.totp.settings.setup.confirmCode')} /> -->

    <form
      action="?/setUpTOTP"
      class="mt-6 flex flex-col gap-4"
      method="POST"
      use:enhance={(e) => {
        e.formData.append('TOTPsecret', TOTPsecret);
        isSettingUpTOTP = true;
        return async ({ update }) => {
          isSettingUpTOTP = false;
          update({ reset: false });
        };
      }}
    >
      <Input.TOTP id="totp" class={{ container: 'mx-auto w-fit' }} />
      <Modal.Actions>
        <Button type="button" onclick={() => (setUpTOTPModalOpen = false)}
          >{$t('auth.totp.settings.success.buttons.close')}</Button
        >
        <Button loading={isSettingUpTOTP}>
          {$t('auth.totp.settings.setup.nextButton')}
          <ArrowRight class="size-4" />
        </Button>
      </Modal.Actions>
    </form>
  {/if}
</Modal>

<!-- TOTP success modal -->
<Modal bind:open={TOTPSuccessModalOpen}>
  <Modal.Heading>
    <Modal.Title>{$t('auth.totp.settings.success.title')}</Modal.Title>
    <Modal.Description
      >{$t('auth.totp.settings.success.description')}</Modal.Description
    >
  </Modal.Heading>

  <p>
    {$t('auth.totp.settings.success.message')}
  </p>

  <Modal.Actions>
    <Button onclick={() => (TOTPSuccessModalOpen = false)}>
      <CheckCheck class="size-4" />
      {$t('auth.totp.settings.success.buttons.close')}
    </Button>
  </Modal.Actions>
</Modal>

{#if user.totpSecret}
  <p>{$t('auth.totp.settings.page.disable.description')}</p>
  <Button onclick={() => (setUpTOTPModalOpen = true)}>{$t('auth.totp.settings.page.disable.button')}</Button>
{:else}
  <p>{$t('auth.totp.settings.page.enable.description')}</p>
  <Button onclick={() => (setUpTOTPModalOpen = true)}>{$t('auth.totp.settings.page.enable.button')}</Button>
{/if}
