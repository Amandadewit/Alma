// Uploads a portfolio-company CFO has already submitted through the Portfolio Portal.
// The May 2026 performance sheet is a demo submission: opening it shows the Excel
// intake output of test case A, read-only, as it was confirmed and imported into Alma.

export interface PortalSubmission {
  id: string
  title: string
  cadence: string
  submittedAt: string
  submittedBy: string
  file: string
  /** Intake output that can be opened; absent for older archived uploads. */
  caseId?: "A" | "B"
}

export const portalSubmissions: PortalSubmission[] = [
  {
    id: "performance-may-2026",
    title: "Performance Sheet — May 2026",
    cadence: "Monthly reporting",
    submittedAt: "3 Jun 2026",
    submittedBy: "Marijke Bakker",
    file: "Alma_Testcase_A_Lenderrapportage_2026-08.xlsx",
    caseId: "A",
  },
  {
    id: "performance-apr-2026",
    title: "Performance Sheet — April 2026",
    cadence: "Monthly reporting",
    submittedAt: "6 May 2026",
    submittedBy: "Marijke Bakker",
    file: "Alma_Performance_Sheet_2026-04.xlsx",
  },
]
