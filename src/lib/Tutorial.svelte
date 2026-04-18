<script lang="ts">
  import { onMount } from 'svelte';
  import { i18n } from './i18n.svelte';

  interface Step {
    title: string;
    content: string;
    targetSelector?: string;
    action?: () => void;
  }

  let {
    show = false,
    onClose,
    setView,
  }: {
    show: boolean;
    onClose: () => void;
    setView: (view: 'daily' | 'weekly') => void;
  } = $props();

  const steps: Step[] = $derived([
    {
      title: i18n.t('tutorial.step1_title'),
      content: i18n.t('tutorial.step1_content'),
      action: () => setView('weekly'),
    },
    {
      title: i18n.t('tutorial.step2_title'),
      content: i18n.t('tutorial.step2_content'),
      targetSelector: '.grid-content', // Changed from .weekly-container as it might be missing
    },
    {
      title: i18n.t('tutorial.step3_title'),
      content: i18n.t('tutorial.step3_content'),
      targetSelector: '.nav-controls',
    },
    {
      title: i18n.t('tutorial.step4_title'),
      content: i18n.t('tutorial.step4_content'),
      targetSelector: '.grid-content',
    },
    {
      title: i18n.t('tutorial.step5_title'),
      content: i18n.t('tutorial.step5_content'),
      targetSelector: '.view-toggle',
      action: () => setView('daily'),
    },
    {
      title: i18n.t('tutorial.step6_title'),
      content: i18n.t('tutorial.step6_content'),
      targetSelector: '.task-list', // Changed from .list-section
    },
    {
      title: i18n.t('tutorial.step7_title'),
      content: i18n.t('tutorial.step7_content'),
      targetSelector: '.add-btn', // Drill-down into form would be better but let's point to Add button
    },
    {
      title: i18n.t('tutorial.step8_title'),
      content: i18n.t('tutorial.step8_content'),
      targetSelector: '.view-toggle',
      action: () => setView('weekly'),
    },
    {
      title: i18n.t('tutorial.step9_title'),
      content: i18n.t('tutorial.step9_content'),
      targetSelector: '.grid-header',
    },
    {
      title: i18n.t('tutorial.step10_title'),
      content: i18n.t('tutorial.step10_content'),
    },
    {
      title: i18n.t('tutorial.step11_title'),
      content: i18n.t('tutorial.step11_content'),
    },
    {
      title: i18n.t('tutorial.step12_title'),
      content: i18n.t('tutorial.step12_content'),
    },
    {
      title: i18n.t('tutorial.step13_title'),
      content: i18n.t('tutorial.step13_content'),
      targetSelector: '.history-controls',
    },
    {
      title: i18n.t('tutorial.step14_title'),
      content: i18n.t('tutorial.step14_content'),
      targetSelector: '.action-locks',
    },
    {
      title: i18n.t('tutorial.step15_title'),
      content: i18n.t('tutorial.step15_content'),
    },
  ]);

  let currentStepIndex = $state(0);
  let currentStep = $derived(steps[currentStepIndex]);
  let highlightStyles = $state('');

  function nextStep() {
    if (currentStepIndex < steps.length - 1) {
      currentStepIndex++;
      if (steps[currentStepIndex].action) {
        steps[currentStepIndex].action!();
      }
    } else {
      onClose();
    }
  }

  function prevStep() {
    if (currentStepIndex > 0) {
      currentStepIndex--;
      if (steps[currentStepIndex].action) {
        steps[currentStepIndex].action!();
      }
    }
  }

  $effect(() => {
    if (show && currentStep.targetSelector) {
      // Small timeout to allow DOM to update if view changed
      setTimeout(() => {
        const el = document.querySelector(currentStep.targetSelector!);
        if (el) {
          const rect = el.getBoundingClientRect();
          highlightStyles = `
            top: ${rect.top - 8}px;
            left: ${rect.left - 8}px;
            width: ${rect.width + 16}px;
            height: ${rect.height + 16}px;
          `;
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          highlightStyles = '';
        }
      }, 150); // Increased timeout a bit for safety
    } else {
      highlightStyles = '';
    }
  });

  // Reset when closed/opened
  $effect(() => {
    if (!show) {
      currentStepIndex = 0;
    }
  });
</script>

{#if show}
  <div class="tutorial-overlay">
    {#if highlightStyles}
      <div class="highlight-box" style={highlightStyles}></div>
    {/if}

    <div class="tutorial-card" class:has-highlight={!!highlightStyles}>
      <header>
        <h3>{currentStep.title}</h3>
        <span class="step-counter">{currentStepIndex + 1} / {steps.length}</span
        >
      </header>
      <div class="content">
        <p>{currentStep.content}</p>
      </div>
      <footer>
        <button class="btn secondary" onclick={onClose}
          >{i18n.t('tutorial.skip')}</button
        >
        <div class="nav-btns">
          {#if currentStepIndex > 0}
            <button class="btn secondary" onclick={prevStep}
              >{i18n.t('tutorial.back')}</button
            >
          {/if}
          <button class="btn primary" onclick={nextStep}>
            {currentStepIndex === steps.length - 1
              ? i18n.t('tutorial.finish')
              : i18n.t('tutorial.next')}
          </button>
        </div>
      </footer>
    </div>
  </div>
{/if}

<style>
  .tutorial-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
  }

  .highlight-box {
    position: fixed;
    border: 4px solid var(--md-sys-color-primary);
    border-radius: 12px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
    z-index: 2001;
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .tutorial-card {
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    width: 90%;
    max-width: 400px;
    padding: 1.5rem;
    border-radius: 24px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
    z-index: 2002;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
  }

  .tutorial-card.has-highlight {
    position: fixed;
    bottom: 2rem;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  header h3 {
    margin: 0;
    color: var(--md-sys-color-primary);
  }

  .step-counter {
    font-size: 0.85rem;
    color: var(--md-sys-color-outline);
    font-weight: 500;
  }

  .content p {
    margin: 0;
    line-height: 1.5;
  }

  footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
  }

  .nav-btns {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    padding: 8px 20px;
    border-radius: 20px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .btn.primary {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
  }

  .btn.secondary {
    background: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-on-surface);
  }

  .btn:hover {
    opacity: 0.9;
  }
</style>
