<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button, Checkbox, Input, SEO } from '$lib/components';
  import { Toaster } from '$lib/components/Toast/toast';
  import { t } from '$lib/i18n';
  import { logger } from '$lib/utils/logger';
  import FormWrapper from '../formWrapper.svelte';
  import type { PageProps } from './$types';

  let { form }: PageProps = $props();
  let loading = $state(false);

  $effect(() => {
    if (form?.error && form?.action === 'signUp') {
      logger.error('Sig-up error:', $t(form.error));
      Toaster.error(form.error);
    }
  });
</script>

<SEO title={$t('seo.auth.signUp.title')} />


<FormWrapper>
  <form
    action="?/signUp"
    method="POST"
    class="flex w-full flex-col space-y-8"
    use:enhance={() => {
      loading = true;
      return async ({ update }) => {
        await update();
        loading = false;
      };
    }}
  >
    <img src="/logo.png" class="size-8 object-contain" alt="" />
    <h1 class="mb-2 text-2xl font-semibold">{$t('auth.signIn.title')}</h1>
    <p class="text-muted text-base">
      {$t('auth.signIn.alreadyHaveAnAccount.text')}
      <a href="/auth/log-in" class="text-primary font-medium"
        >{$t('auth.signIn.alreadyHaveAnAccount.cta')}</a
      >
    </p>
    <Input name="email" placeholder={$t('auth.email')} />
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
</FormWrapper>
