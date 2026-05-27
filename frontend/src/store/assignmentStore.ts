import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Assignment, GeneratedPaper, GenerationState, CreateAssignmentFormData } from '@/types';

interface AssignmentStore {
  // Assignments list
  assignments: Assignment[];
  isLoadingAssignments: boolean;
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  removeAssignment: (id: string) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  setLoadingAssignments: (loading: boolean) => void;

  // Current form state
  formData: Partial<CreateAssignmentFormData>;
  setFormData: (data: Partial<CreateAssignmentFormData>) => void;
  resetFormData: () => void;

  // Generation state
  generationStates: Record<string, GenerationState>;
  setGenerationState: (assignmentId: string, state: Partial<GenerationState>) => void;
  getGenerationState: (assignmentId: string) => GenerationState;

  // Current paper
  papers: Record<string, GeneratedPaper>;
  setPaper: (assignmentId: string, paper: GeneratedPaper) => void;
  getPaper: (assignmentId: string) => GeneratedPaper | undefined;
}

const defaultGenerationState: GenerationState = {
  status: 'pending',
  progress: 0,
  message: '',
  paper: null,
  error: null,
};

export const useAssignmentStore = create<AssignmentStore>()(
  devtools(
    (set, get) => ({
      assignments: [],
      isLoadingAssignments: false,
      setAssignments: (assignments) => set({ assignments }),
      addAssignment: (assignment) =>
        set((state) => ({ assignments: [assignment, ...state.assignments] })),
      removeAssignment: (id) =>
        set((state) => ({ assignments: state.assignments.filter((a) => a._id !== id) })),
      updateAssignment: (id, updates) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a._id === id ? { ...a, ...updates } : a
          ),
        })),
      setLoadingAssignments: (loading) => set({ isLoadingAssignments: loading }),

      formData: {},
      setFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),
      resetFormData: () => set({ formData: {} }),

      generationStates: {},
      setGenerationState: (assignmentId, state) =>
        set((prev) => ({
          generationStates: {
            ...prev.generationStates,
            [assignmentId]: {
              ...(prev.generationStates[assignmentId] || defaultGenerationState),
              ...state,
            },
          },
        })),
      getGenerationState: (assignmentId) =>
        get().generationStates[assignmentId] || { ...defaultGenerationState },

      papers: {},
      setPaper: (assignmentId, paper) =>
        set((state) => ({ papers: { ...state.papers, [assignmentId]: paper } })),
      getPaper: (assignmentId) => get().papers[assignmentId],
    }),
    { name: 'veda-assignment-store' }
  )
);
