<script lang="ts">
  import { onMount } from 'svelte';

  interface Step {
    title: string;
    content: string;
    targetSelector?: string;
    action?: () => void;
  }

  let { 
    show = false, 
    onClose,
    setView // New prop to change view from tutorial
  }: { 
    show: boolean; 
    onClose: () => void;
    setView: (view: 'daily' | 'weekly') => void;
  } = $props();

  const steps: Step[] = [
    {
      title: 'Welcome to Imputador!',
      content: 'This tutorial will guide you through the main features of the app.',
      action: () => setView('weekly')
    },
    {
      title: 'Weekly View',
      content: 'Here you can see your whole week. You can drag and drop tasks to move them, or drag the bottom edge to resize them.',
      targetSelector: '.weekly-container',
    },
    {
      title: 'Navigation',
      content: 'Use the arrows to navigate between weeks.',
      targetSelector: '.nav-controls',
    },
    {
      title: 'Adding Tasks',
      content: 'Click on any empty slot in the Weekly View to register a new task.',
      targetSelector: '.grid-content',
    },
    {
      title: 'Daily View Details',
      content: 'Let\'s switch to the Daily View. Here you can see a detailed list of your tasks.',
      targetSelector: '.view-toggle',
      action: () => setView('daily')
    },
    {
      title: 'Gaps Detection',
      content: 'The Daily View automatically detects and highlights gaps in your workday so you never miss a minute.',
      targetSelector: '.list-section',
    },
    {
      title: 'Quick Access',
      content: 'In the form, you can select from your 10 most recent tasks to quickly fill frequently used entries.',
      targetSelector: '.form-section',
    },
    {
      title: 'Returning to Weekly',
      content: 'You can always switch back to the Weekly View using the toggle or by clicking the logo.',
      targetSelector: '.view-toggle',
      action: () => setView('weekly')
    },
    {
      title: 'Day Drill-down',
      content: 'Pro tip: Click on any day header in the Weekly View to jump directly to that day\'s Daily View.',
      targetSelector: '.grid-header',
    },
    {
      title: 'Advanced Manipulation',
      content: 'When a new task overlaps with existing ones, you can choose to "Overwrite" (splitting tasks) or "Displace" (pushing subsequent tasks forward).',
    },
    {
      title: 'Smart Fill',
      content: 'Use "Smart Fill" in the task form to automatically distribute a total duration across available gaps.',
    },
    {
      title: 'Billable Absence',
      content: 'The "Ausencia Facturable" task type counts towards your weekly goal but doesn\'t count as active work hours.',
    },
    {
      title: 'Undo / Redo',
      content: 'Made a mistake? Use the Undo and Redo buttons (or Ctrl+Z / Ctrl+Y) to revert your actions.',
      targetSelector: '.history-controls',
    },
    {
      title: 'Action Locks',
      content: 'Use these buttons to lock moving, editing, or creating tasks. Useful on touch devices.',
      targetSelector: '.action-locks',
    },
    {
      title: 'All set!',
      content: 'You are ready to log your workday efficiently.',
    },
  ];

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
      }, 100);
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
        <span class="step-counter">{currentStepIndex + 1} / {steps.length}</span>
      </header>
      <div class="content">
        <p>{currentStep.content}</p>
      </div>
      <footer>
        <button class="btn secondary" onclick={onClose}>Skip</button>
        <div class="nav-btns">
          {#if currentStepIndex > 0}
            <button class="btn secondary" onclick={prevStep}>Back</button>
          {/if}
          <button class="btn primary" onclick={nextStep}>
            {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
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
