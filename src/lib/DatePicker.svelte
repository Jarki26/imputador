<script lang="ts">
  interface Props {
    selectedDate?: Date;
    onSelect?: (date: Date) => void;
  }

  let { selectedDate = new Date(), onSelect = () => {} }: Props = $props();
</script>

<div class="date-picker">
  <!-- Empty implementation to fail tests -->
</div>

<style>
  .date-picker {
    display: block;
  }
</style>
