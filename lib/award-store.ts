"use client";

import { PaymentStatus } from "@/lib/types";

export type AwardAttempt = {
  id: string;
  supplierId: string;
  supplierName: string;
  status: "Blocked" | "Not eligible" | "Validated";
  title: string;
  description: string;
  timestamp: string;
  eventType: "award_blocked" | "award_ineligible" | "award_validated";
};

export type StoredAwardReceipt = {
  id: string;
  tenderId: string;
  supplierId: string;
  supplierName: string;
  awardValue: number;
  currency: string;
  policyVersion: string;
  validationStatus: "Award validated";
  paymentStatus: PaymentStatus.ReadyForControlledRelease;
  issuedAt: string;
};

export type StoredAwardState = {
  tenderId: string;
  tenderStatus: "Evaluation in progress" | "Validated";
  selectedSupplierId: string | null;
  decisionStatus: "Draft" | "Blocked" | "Not eligible" | "Validated";
  validationReason: string | null;
  validatedAt: string | null;
  receipt: StoredAwardReceipt | null;
  paymentStatus: PaymentStatus.NotReady | PaymentStatus.ReadyForControlledRelease;
  paymentMarkedAt: string | null;
  attempts: AwardAttempt[];
  auditEvents: Array<{
    id: string;
    label: string;
    description: string;
    timestamp: string;
    actor: string;
    eventType: string;
  }>;
};

const keyForTender = (tenderId: string) => `ofora:award-state:v2:${tenderId}`;

export function getAwardState(tenderId: string): StoredAwardState {
  if (typeof window === "undefined") return createInitialAwardState(tenderId);
  const stored = window.localStorage.getItem(keyForTender(tenderId));
  if (stored) return JSON.parse(stored) as StoredAwardState;
  const initial = createInitialAwardState(tenderId);
  saveAwardState(initial);
  return initial;
}

export function saveAwardState(state: StoredAwardState) {
  window.localStorage.setItem(keyForTender(state.tenderId), JSON.stringify(state));
}

export function resetAwardState(tenderId: string) {
  const state = createInitialAwardState(tenderId);
  saveAwardState(state);
  return state;
}

export function recordAwardAttempt(state: StoredAwardState, attempt: Omit<AwardAttempt, "id" | "timestamp">) {
  const timestamp = new Date().toISOString();
  const event =
    attempt.status === "Validated"
      ? {
          id: `event-${Date.now()}-validated`,
          label: "Award independently validated",
          description: "The selected supplier was confirmed as the highest-scoring eligible submission under the locked selection rules.",
          timestamp,
          actor: "Ofora validation service",
          eventType: "award_validated"
        }
      : {
          id: `event-${Date.now()}-${attempt.eventType}`,
          label: attempt.status === "Blocked" ? "Award validation blocked" : "Supplier not eligible for award",
          description: attempt.description,
          timestamp,
          actor: "Elena Marquez",
          eventType: attempt.eventType
        };

  const next: StoredAwardState = {
    ...state,
    selectedSupplierId: attempt.supplierId,
    decisionStatus: attempt.status,
    validationReason: attempt.description,
    validatedAt: attempt.status === "Validated" ? timestamp : state.validatedAt,
    tenderStatus: attempt.status === "Validated" ? "Validated" : "Evaluation in progress",
    attempts: [{ ...attempt, id: `attempt-${Date.now()}`, timestamp }, ...state.attempts],
    auditEvents: [event, ...state.auditEvents]
  };
  saveAwardState(next);
  return next;
}

export function issueReceipt(state: StoredAwardState, receipt: StoredAwardReceipt) {
  const next: StoredAwardState = {
    ...state,
    receipt,
    paymentStatus: PaymentStatus.ReadyForControlledRelease,
    auditEvents: [
      {
        id: `event-${Date.now()}-receipt`,
        label: "Fair Award Receipt issued",
        description: "A formal award record was created for the validated procurement decision.",
        timestamp: receipt.issuedAt,
        actor: "Ofora",
        eventType: "receipt_issued"
      },
      ...state.auditEvents
    ]
  };
  saveAwardState(next);
  return next;
}

export function markPaymentReady(state: StoredAwardState) {
  const timestamp = new Date().toISOString();
  const next: StoredAwardState = {
    ...state,
    paymentStatus: PaymentStatus.ReadyForControlledRelease,
    paymentMarkedAt: timestamp,
    auditEvents: [
      {
        id: `event-${Date.now()}-payment`,
        label: "Award marked ready for payment",
        description: "The validated award was marked ready to move into the organization’s approved payment process.",
        timestamp,
        actor: "Elena Marquez",
        eventType: "payment_ready"
      },
      ...state.auditEvents
    ]
  };
  saveAwardState(next);
  return next;
}

function createInitialAwardState(tenderId: string): StoredAwardState {
  return {
    tenderId,
    tenderStatus: "Evaluation in progress",
    selectedSupplierId: null,
    decisionStatus: "Draft",
    validationReason: null,
    validatedAt: null,
    receipt: null,
    paymentStatus: PaymentStatus.NotReady,
    paymentMarkedAt: null,
    attempts: [],
    auditEvents: [
      {
        id: "eval-started",
        label: "Confidential evaluation started",
        description: "Supplier assessments began against the selection rules locked before submissions opened.",
        timestamp: "2026-06-25T09:05:00.000Z",
        actor: "Elena Marquez",
        eventType: "evaluation_started"
      }
    ]
  };
}
