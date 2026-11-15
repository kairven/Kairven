import {create} from 'zustand'

export type Currency = 'INR' | 'USD'

type AuditForm = {
  name: string
  business: string
  painPoint: string
}

type AppState = {
  currency: Currency
  setCurrency: (c: Currency) => void

  auditOpen: boolean
  openAudit: (intent?: string) => void
  closeAudit: () => void
  auditIntent: string | null

  form: AuditForm
  setForm: (patch: Partial<AuditForm>) => void
  resetForm: () => void
}

const emptyForm: AuditForm = {name: '', business: '', painPoint: ''}

export const useAppStore = create<AppState>((set) => ({
  currency: 'INR',
  setCurrency: (currency) => set({currency}),

  auditOpen: false,
  auditIntent: null,
  openAudit: (intent) => set({auditOpen: true, auditIntent: intent ?? null}),
  closeAudit: () => set({auditOpen: false}),

  form: emptyForm,
  setForm: (patch) => set((s) => ({form: {...s.form, ...patch}})),
  resetForm: () => set({form: emptyForm}),
}))

export const INR_TO_USD = 0.012
