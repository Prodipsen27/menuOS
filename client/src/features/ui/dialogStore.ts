import { create } from "zustand";

type DialogType = "info" | "confirm" | "error" | "warning" | "success";

interface DialogState {
  isOpen: boolean;
  type: DialogType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  
  show: (options: {
    type?: DialogType;
    title?: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
  }) => void;
  close: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  isOpen: false,
  type: "info",
  title: "",
  message: "",
  onConfirm: undefined,
  onCancel: undefined,
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",

  show: (options) => set({
    isOpen: true,
    type: options.type || "info",
    title: options.title || "",
    message: options.message,
    onConfirm: options.onConfirm,
    onCancel: options.onCancel,
    confirmLabel: options.confirmLabel || "Confirm",
    cancelLabel: options.cancelLabel || "Cancel",
  }),
  
  close: () => set({ isOpen: false }),
}));
