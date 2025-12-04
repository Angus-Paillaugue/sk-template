<script lang="ts">
  import { page } from '$app/state';
  import { Button } from '$lib/components/ui/button';
  import { fade, fly, slide } from 'svelte/transition';
  import { COOKIES, type CookieConsent } from '.';
  import { backIn, quadIn } from 'svelte/easing';
  import { Switch } from '$lib/components/ui/switch';
  import i18n from '$lib/i18n';

  let cookieConsent = $state<CookieConsent>(page.data.cookieConsent);
  let editCookiePreferences = $state<Record<string, boolean>>(COOKIES.getCookieConsent(false));
  let learnMoreOpen = $state(false);
</script>

{#if cookieConsent === 'pending'}
  <div class="bg-background/50 fixed inset-0 z-50" transition:fade={{ duration: 300 }}></div>
  <div
    transition:fly={{ duration: 500, x: '-100%', easing: backIn }}
    class="bg-background border-border fixed bottom-2 left-2 z-50 flex flex-row items-end gap-4 rounded-lg border p-4 max-sm:right-2 sm:w-[650px]"
  >
    <img src="/cookie-illustration.svg" class="size-26 max-sm:hidden" alt="" />
    <div class="flex w-full flex-col">
      <h2 class="text-lg font-medium">{i18n.t('cookies.title')}</h2>
      <p class="mt-1 text-sm">
        {@html COOKIES.hasNonEssentialCookies()
          ? i18n.t('cookies.descriptionWithCookies')
          : i18n.t('cookies.descriptionWithoutCookies')}
      </p>
      {#if learnMoreOpen}
        <div
          class="no-scrollbar mt-4 flex max-h-[200px] flex-col overflow-y-auto"
          transition:slide={{ duration: 300, easing: quadIn }}
        >
          <table>
            <thead>
              <tr class="border-border border-t">
                <td class="p-1">{i18n.t('cookies.moreInfo.table.name')}</td>
                <td class="p-1">{i18n.t('cookies.moreInfo.table.purpose')}</td>
                <td class="p-1">{i18n.t('cookies.moreInfo.table.accepted')}</td>
              </tr>
            </thead>
            <tbody>
              {#each Object.entries(COOKIES.COOKIES) as [key]}
                <tr class="border-border border-t">
                  <td class="p-1">{i18n.t(`cookies.moreInfo.cookies.${key}.name` as any)}</td>
                  <td class="p-1">{i18n.t(`cookies.moreInfo.cookies.${key}.purpose` as any)}</td>
                  <td class="flex flex-row items-center gap-2 p-1">
                    {#if COOKIES.COOKIES[key].required}
                      <Switch id="cookie-consent-switch-{key}" disabled={true} checked={true} /> *
                    {:else}
                      <Switch
                        id="cookie-consent-switch-{key}"
                        disabled={COOKIES.COOKIES[key].required}
                        bind:checked={editCookiePreferences[key]}
                      />
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>

          <small class="text-xs">{i18n.t('cookies.moreInfo.requiredAsterisk')}</small>
        </div>
      {/if}
      <div class="mt-4 flex flex-row items-center justify-end gap-2">
        {#if COOKIES.hasNonEssentialCookies()}
          <Button
            variant="outline"
            onclick={() => {
              if (learnMoreOpen) {
                COOKIES.setCookieConsent(editCookiePreferences);
                cookieConsent = editCookiePreferences;
              } else {
                learnMoreOpen = true;
              }
            }}
            >{learnMoreOpen
              ? i18n.t('cookies.cta.savePreferences')
              : i18n.t('cookies.cta.moreOptions')}</Button
          >
          <Button
            onclick={() => {
              cookieConsent = COOKIES.acceptAllCookies();
            }}>{i18n.t('cookies.cta.acceptAll')}</Button
          >
        {:else}
          <Button variant="link" onclick={() => (learnMoreOpen = !learnMoreOpen)}
            >{learnMoreOpen
              ? i18n.t('cookies.cta.learnLess')
              : i18n.t('cookies.cta.learnMore')}</Button
          >
          <div class="grow"></div>
          <Button
            onclick={() => {
              cookieConsent = COOKIES.acceptAllCookies();
            }}>{i18n.t('cookies.cta.thatsAlright')}</Button
          >
        {/if}
      </div>
    </div>
  </div>
{/if}
