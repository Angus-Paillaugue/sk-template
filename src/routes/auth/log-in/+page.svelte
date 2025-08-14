<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button, Checkbox, Input, Modal, SEO } from '$lib/components';
  import { Toaster } from '$lib/components/Toast/toast';
  import { t } from '$lib/i18n';
  import { logger } from '$lib/utils/logger';
  import FormWrapper from '../formWrapper.svelte';
  import { startAuthentication } from '@simplewebauthn/browser';
  import type { PageProps } from './$types';
  import { ArrowRight, KeyRound } from 'lucide-svelte';

  let { form }: PageProps = $props();
  let loading = $state(false);
  let passkeyLoading = $state(false);
  let totpModalOpen = $state(false);
  let formData = $state<FormData>(new FormData());

  $effect(() => {
    if (form?.error && form?.action === 'logIn') {
      if(form?.noTOTPCode) {
        totpModalOpen = true;
        return;
      }
      logger.error('Log in error:', $t(form.message));
      Toaster.error(form.message);
    }
  });

  async function loginWithPasskey() {
    passkeyLoading = true;
    try {
      const optsRes = await fetch('/api/auth/generate-authentication-options');
      const { opts, UUID } = await optsRes.json();
      const authResp = await startAuthentication(opts);

      const verificationRes = await fetch('/api/auth/verify-authentication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authResp, UUID }),
      })
      const verification = await verificationRes.json();
      if(!verificationRes.ok) {
        console.log(verification)
        throw new Error(verification.error || 'errors.auth.verificationFailed');
      }

      if (verification.verified) {
        window.location.href = '/app';
      }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(errorMessage);
        Toaster.error(errorMessage);
    } finally {
      passkeyLoading = false;
    }
  }
</script>

<SEO title={$t('seo.auth.logIn.title')} />

<!-- Set up/Unlink 2FA -->
<Modal bind:open={totpModalOpen} noBackdropClose={true}>
  <Modal.Heading>
    <Modal.Title>{$t('auth.totp.logIn.title')}</Modal.Title>
    <Modal.Description>{$t('auth.totp.logIn.description')}</Modal.Description>
  </Modal.Heading>


    <form
      action="?/logIn"
      class="mt-6 flex flex-col gap-4"
      method="POST"
      use:enhance={(e) => {
        for(const [key, value] of formData.entries()) {
          e.formData.append(key, value);
        }
        loading = true;
        return async ({ update }) => {
          loading = false;
          update({ reset: false });
        };
      }}
    >
      <Input.TOTP name="totpCode" class={{ container: 'mx-auto w-fit' }} />
      <Modal.Actions>
        <Button loading={loading}>
          {$t('auth.totp.logIn.nextButton')}
          <ArrowRight class="size-4" />
        </Button>
      </Modal.Actions>
    </form>
</Modal>

<FormWrapper>
  <div class="flex w-full flex-col space-y-8">
    <form
      action="?/logIn"
      method="POST"
      class="flex w-full flex-col space-y-8"
      use:enhance={(e) => {
        loading = true;
        formData = e.formData;
        return async ({ update }) => {
          await update();
          loading = false;
        };
      }}
    >
      <img src="/logo.png" class="size-8 object-contain" alt="" />
      <h1 class="mb-2 text-2xl font-semibold">{$t('auth.logIn.title')}</h1>
      <p class="text-muted text-base">
        {$t('auth.logIn.dontHaveAnAccount.text')}
        <a href="/auth/sign-up" class="text-primary font-medium"
          >{$t('auth.logIn.dontHaveAnAccount.cta')}</a
        >
      </p>
      <Input name="username" placeholder={$t('auth.username')} />
      <Input name="password" type="password" placeholder={$t('auth.password')} />
      <div class="flex flex-row items-center justify-between">
        <div class="flex flex-row items-center gap-1">
          <Checkbox name="rememberMe" id="rememberMe" checked={true} />
          <label for="rememberMe" class="text-muted text-sm">{$t('auth.rememberMe')}</label>
        </div>
        <a href="/auth/forgot-password" class="text-primary text-sm font-medium"
          >{$t('auth.forgotPassword')}</a
        >
      </div>
      <Button type="submit" {loading}>{$t('auth.submit')}</Button>
    </form>

    <!-- Hr -->
    <div class="flex flex-row items-center gap-2">
      <div class="border-border w-full border-t"></div>
      <span class="font-mono text-base font-semibold uppercase">{$t('auth.passkey.separator')}</span
      >
      <div class="border-border w-full border-t"></div>
    </div>

    <Button onclick={loginWithPasskey} class="gap-2" loading={passkeyLoading}>
      <KeyRound class="size-4" />
      {$t('auth.passkey.button')}
    </Button>
  </div>
</FormWrapper>
