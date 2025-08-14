<script lang="ts">
  import { flip } from 'svelte/animate';
  import { toasts } from './toast';
  import { Toaster } from '../';
</script>

<div
  class='fixed bottom-4 z-40 flex flex-col gap-2 transition-all max-md:left-4 right-4 md:w-[400px]'
>
  {#each $toasts as toast (toast.id)}
    <div animate:flip={{ duration: 300 }}>
      <Toaster.Toast {toast} />
    </div>
  {/each}
</div>
