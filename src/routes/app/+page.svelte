<script lang="ts">
  import { SEO } from '$lib/components';
  import { t } from '$lib/i18n';
  import { Plus, User } from 'lucide-svelte';
  import { actions } from '$lib/components';
  // import type { PageProps } from './$types';

  // let { data }: PageProps = $props();

  $actions = [
    {
      text: 'New user',
      icon: User,
      onclick: () => {
        console.log('New user');
      },
    },
    {
      text: 'New file',
      icon: Plus,
      onclick: () => {
        console.log('New file');
      },
    },
  ];
</script>

<SEO title={$t('seo.homePage.title')} />

<section class="relative flex h-full flex-col"></section>
