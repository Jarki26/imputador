import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import TaskForm from './TaskForm.svelte';
import { CompanyStore } from './companyStore';
import { TaskStore } from './taskStore';
import { i18n } from './i18n.svelte';

describe('TaskForm Company Integration', () => {
  let mockTaskStore: any;
  let mockCompanyStore: any;

  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
    
    mockTaskStore = {
      addTask: vi.fn().mockResolvedValue(1),
      getTasksForDay: vi.fn().mockResolvedValue([]),
      getRecentTasks: vi.fn().mockResolvedValue([]),
    };

    mockCompanyStore = {
      getRecentCompanies: vi.fn().mockResolvedValue([
        { name: 'Apple', useCount: 10 },
        { name: 'Google', useCount: 5 }
      ]),
      searchCompanies: vi.fn().mockResolvedValue([]),
      upsertCompany: vi.fn().mockResolvedValue(undefined)
    };
  });

  it('should render the company autocomplete field before the project field', () => {
    const { container } = render(TaskForm, {
      props: { taskStore: mockTaskStore, companyStore: mockCompanyStore }
    });

    const companyLabel = screen.getByText(/Empresa/i);
    const projectLabel = screen.getByText(/Proyecto/i);

    // Verify order in DOM
    const companyContainer = companyLabel.closest('.autocomplete-container') || companyLabel.parentElement;
    const projectField = projectLabel.parentElement;

    const allFields = Array.from(container.querySelectorAll('.field, .autocomplete-container'));
    const companyIndex = allFields.indexOf(companyContainer!);
    const projectIndex = allFields.indexOf(projectField!);

    expect(companyIndex).toBeLessThan(projectIndex);
    expect(companyIndex).not.toBe(-1);
    expect(projectIndex).not.toBe(-1);
  });

  it('should include company in the saved task and upsert it in the company store', async () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, companyStore: mockCompanyStore }
    });

    await fireEvent.input(screen.getByLabelText(/Título/i), { target: { value: 'Task with Company' } });
    await fireEvent.input(screen.getByLabelText(/Empresa/i), { target: { value: 'My Company' } });
    await fireEvent.input(screen.getByLabelText(/Proyecto/i), { target: { value: 'My Project' } });
    
    const submitBtn = screen.getByRole('button', { name: /Añadir Tarea/i });
    await fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(mockTaskStore.addTask).toHaveBeenCalledWith(expect.objectContaining({
        company: 'My Company'
      }));
    });

    await vi.waitFor(() => {
      expect(mockCompanyStore.upsertCompany).toHaveBeenCalledWith('My Company');
    });
  });

  it('should populate company when selecting a recent task', async () => {
    mockTaskStore.getRecentTasks.mockResolvedValue([
      { title: 'Recent Task', project: 'Recent Project', company: 'Recent Co', type: 'DEVELOPMENT' }
    ]);

    render(TaskForm, {
      props: { taskStore: mockTaskStore, companyStore: mockCompanyStore }
    });

    // Wait for effect to load recent tasks
    await tick();
    await tick();

    const select = screen.getByLabelText(/Tareas Recientes/i) as HTMLSelectElement;
    await fireEvent.change(select, { target: { value: '0' } });

    expect((screen.getByLabelText(/Empresa/i) as HTMLInputElement).value).toBe('Recent Co');
  });

  it('should not call upsertCompany if company field is empty', async () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, companyStore: mockCompanyStore }
    });

    await fireEvent.input(screen.getByLabelText(/Título/i), { target: { value: 'Task without Company' } });
    await fireEvent.input(screen.getByLabelText(/Proyecto/i), { target: { value: 'My Project' } });
    
    const submitBtn = screen.getByRole('button', { name: /Añadir Tarea/i });
    await fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(mockTaskStore.addTask).toHaveBeenCalled();
    });

    expect(mockCompanyStore.upsertCompany).not.toHaveBeenCalled();
  });

  it('should populate company when editing a task', async () => {
    const editingTask = {
      id: 1,
      title: 'Editing Task',
      description: 'Desc',
      project: 'Editing Project',
      company: 'Editing Company',
      type: 'GENERAL',
      startTime: new Date('2023-01-01T10:00:00'),
      endTime: new Date('2023-01-01T11:00:00')
    };

    render(TaskForm, {
      props: { 
        taskStore: mockTaskStore, 
        companyStore: mockCompanyStore,
        editingTask: editingTask as any
      }
    });

    await tick();

    expect((screen.getByLabelText(/Empresa/i) as HTMLInputElement).value).toBe('Editing Company');
  });

  it('should include company in smart fill', async () => {
    mockTaskStore.addWithSmartFill = vi.fn().mockResolvedValue(1);

    render(TaskForm, {
      props: { taskStore: mockTaskStore, companyStore: mockCompanyStore }
    });

    await fireEvent.input(screen.getByLabelText(/Título/i), { target: { value: 'Smart Task' } });
    await fireEvent.input(screen.getByLabelText(/Empresa/i), { target: { value: 'Smart Company' } });
    await fireEvent.input(screen.getByLabelText(/Proyecto/i), { target: { value: 'Smart Project' } });
    
    // Toggle smart fill
    const smartFillCheckbox = screen.getByLabelText(/Relleno Inteligente/i);
    await fireEvent.click(smartFillCheckbox);

    // Set duration
    await fireEvent.input(screen.getByLabelText(/Horas/i), { target: { value: '2' } });

    const submitBtn = screen.getByRole('button', { name: /Añadir Tarea/i });
    await fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(mockCompanyStore.upsertCompany).toHaveBeenCalledWith('Smart Company');
    });
  });
});
