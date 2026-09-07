// Alma Insights Mock Data

export type StatusType = 'on-track' | 'watch' | 'alert'

export interface Fund {
  id: string
  name: string
  shortName: string
  vintageYear: number
  committedCapital: number
  invested: number
  fairValue: number
  grossMOI: number
  grossIRR: number
}

export interface Company {
  id: string
  name: string
  fundId: string
  entryDate: string
  status: StatusType
  holdingPeriod: number
  /** True when the company has been fully exited (realised). */
  exited?: boolean
  bank: string
  investmentTeam: string[]
  financials: CompanyFinancials
  valuation: CompanyValuation
  kpis: CompanyKPIs
  comments: Comment[]
  priorities: Priority[]
}

export interface CompanyFinancials {
  revenue: FinancialMetric
  grossMargin: FinancialMetric
  ebitda: FinancialMetric
  normalizedEbitda: FinancialMetric
  normalizedEbitdaPercent: FinancialMetric
  freeCashFlow: FinancialMetric
  netDebt: NetDebtMetric
  leverage: number
}

export interface FinancialMetric {
  ytd: { actual: number; budget: number; ly: number; deltaAvsB: number }
  fy: { ly: number; ltm: number; le: number; budget: number; deltaLEvsB: number }
}

export interface NetDebtMetric {
  fy2024A: number
  fy2025LE: number
  fy2025B: number
  leverageLE: number
}

export interface CompanyValuation {
  current: {
    moi: number
    investedValue: number
    fairValue: number
    realisedProceeds: number
    evEbitda: number
    shareOrdinaryEquity: number | null
    year: number
  }
  exit: {
    moi: number
    investedValue: number
    fairValue: number
    evEbitda: number
    shareOrdinaryEquity: number
    year: number
  }
}

export interface CompanyKPIs {
  fteTotal: number
  enps: number | null
  sickLeaveRate: number
  turnover: number | null
  totalLeverage: number
  bankLeverage: number
  covenantBreach: string
  netDebt: number
  bankDebt: number
  cashEnd: number
  otherDebt: number
  customKPIs: { name: string; actual: number[]; budget: number[] }[]
}

export interface Comment {
  id: string
  author: string
  period: string
  text: string
  createdAt: string
}

export interface Priority {
  id: string
  category: 'operations' | 'go-to-market' | 'talent' | 'other'
  text: string
  status: StatusType
  period: string
  updatedBy?: string
  updatedAt?: string
}

export interface ValueCreationBridge {
  entryToCurrent: {
    ebitdaEntry: number
    ma: number
    organicGrowth: number
    ebitdaLTM: number
  }
  currentToExit: {
    revenueGrowth: number
    marginImprovement: number
    ebitdaExit: number
  }
}

export interface FundAllocation {
  invested: { total: number; companies: { name: string; amount: number }[] }
  reservedAddOns: { total: number; items: { name: string; amount: number }[] }
  feesCosts: { total: number; managementFee: number; estFutureCosts: number }
  dryPowder: number
}

// Mock Funds
export const funds: Fund[] = [
  {
    id: 'fund-iv',
    name: 'Alma Capital Fund IV',
    shortName: 'Fund IV',
    vintageYear: 2021,
    committedCapital: 120,
    invested: 71.5,
    fairValue: 142,
    grossMOI: 1.99,
    grossIRR: 18.2,
  },
  {
    id: 'fund-iii',
    name: 'Alma Capital Fund III',
    shortName: 'Fund III',
    vintageYear: 2017,
    committedCapital: 85,
    invested: 82,
    fairValue: 156,
    grossMOI: 2.34,
    grossIRR: 22.1,
  },
  {
    id: 'fund-impact-i',
    name: 'Alma Impact Fund I',
    shortName: 'Impact I',
    vintageYear: 2020,
    committedCapital: 95,
    invested: 68,
    fairValue: 118,
    grossMOI: 1.74,
    grossIRR: 15.6,
  },
]

// Compact factory that expands a small spec into a full Company object with
// plausible derived financials. Keeps the 15 extra portfolio companies readable.
interface CompanySpec {
  id: string
  name: string
  fundId: string
  entryDate: string
  holdingPeriod: number
  status: StatusType
  bank: string
  team: [string, string]
  revenueLTM: number
  ebitdaMargin: number // 0-1
  leverage: number
  invested: number
  fairValue: number
  realised: number
  evEbitda: number
  currentYear: number
  exitInvested: number
  exitProceeds: number
  exitEvEbitda: number
  exitShare: number
  exitYear: number
  fte: number
  enps: number | null
  comment: string
  priority: string
  exited?: boolean
}

const round1 = (n: number) => Math.round(n * 10) / 10

const buildMetric = (fyLtm: number, deltaFactor: number): FinancialMetric => {
  const q = fyLtm / 4
  return {
    ytd: {
      actual: round1(q),
      budget: round1(q * (1 - deltaFactor * 0.5)),
      ly: round1(q * 0.9),
      deltaAvsB: round1(q * deltaFactor * 0.5),
    },
    fy: {
      ly: round1(fyLtm * 0.88),
      ltm: round1(fyLtm),
      le: round1(fyLtm * (1 + deltaFactor)),
      budget: round1(fyLtm * (1 + deltaFactor * 0.6)),
      deltaLEvsB: round1(fyLtm * deltaFactor * 0.4),
    },
  }
}

const makeCompany = (s: CompanySpec): Company => {
  const deltaFactor = s.status === 'on-track' ? 0.06 : s.status === 'watch' ? -0.03 : -0.12
  const revenue = buildMetric(s.revenueLTM, deltaFactor)
  const grossMargin = buildMetric(s.revenueLTM * 0.45, deltaFactor)
  const ebitdaLTM = s.revenueLTM * s.ebitdaMargin
  const ebitda = buildMetric(ebitdaLTM, deltaFactor)
  const normalizedEbitda = buildMetric(ebitdaLTM * 1.03, deltaFactor)
  const normalizedEbitdaPercent = buildMetric(s.ebitdaMargin * 100, deltaFactor * 0.4)
  const freeCashFlow = buildMetric(ebitdaLTM * 0.45, deltaFactor)
  const netDebtValue = round1(ebitdaLTM * s.leverage)
  const currentMoi = s.invested > 0 ? round1((s.fairValue + s.realised) / s.invested) : 0

  return {
    id: s.id,
    name: s.name,
    fundId: s.fundId,
    entryDate: s.entryDate,
    status: s.status,
    holdingPeriod: s.holdingPeriod,
    exited: s.exited,
    bank: s.bank,
    investmentTeam: s.team,
    financials: {
      revenue,
      grossMargin,
      ebitda,
      normalizedEbitda,
      normalizedEbitdaPercent,
      freeCashFlow,
      netDebt: {
        fy2024A: netDebtValue,
        fy2025LE: round1(netDebtValue * 0.92),
        fy2025B: round1(netDebtValue * 0.95),
        leverageLE: round1(s.leverage * 0.92),
      },
      leverage: s.leverage,
    },
    valuation: {
      current: {
        moi: currentMoi,
        investedValue: s.invested,
        fairValue: s.fairValue,
        realisedProceeds: s.realised,
        evEbitda: s.evEbitda,
        shareOrdinaryEquity: null,
        year: s.currentYear,
      },
      exit: {
        moi: s.exitInvested > 0 ? round1(s.exitProceeds / s.exitInvested) : 0,
        investedValue: s.exitInvested,
        fairValue: s.exitProceeds,
        evEbitda: s.exitEvEbitda,
        shareOrdinaryEquity: s.exitShare,
        year: s.exitYear,
      },
    },
    kpis: {
      fteTotal: s.fte,
      enps: s.enps,
      sickLeaveRate: round1(3 + (s.status === 'alert' ? 4 : s.status === 'watch' ? 2 : 0.5)),
      turnover: s.enps === null ? null : Math.round(10 + (s.status === 'alert' ? 12 : s.status === 'watch' ? 5 : 0)),
      totalLeverage: s.leverage,
      bankLeverage: round1(s.leverage * 0.92),
      covenantBreach: s.status === 'alert' ? '4.5x' : s.status === 'watch' ? '4.0x' : 'N/A',
      netDebt: netDebtValue,
      bankDebt: round1(netDebtValue * 1.1),
      cashEnd: round1(ebitdaLTM * 0.3),
      otherDebt: round1(netDebtValue * 0.05),
      customKPIs: [],
    },
    comments: [
      { id: '1', author: s.team[0].split(' ')[0], period: 'Q1 2026', text: s.comment, createdAt: '2026-04-18' },
    ],
    priorities: [
      { id: '1', category: 'operations', text: s.priority, status: s.status, period: 'May 2025' },
    ],
  }
}

// 15 additional portfolio companies across Fund III, Impact I and Fund IV,
// including older names that have already been exited (realised).
const generatedCompanies: Company[] = [
  // --- Fund III (older 2017 vintage — several exits) ---
  makeCompany({ id: 'nordic-payments', name: 'Nordic Payments', fundId: 'fund-iii', entryDate: '05-2018', holdingPeriod: 5.2, status: 'on-track', bank: 'Nordea', team: ['Willem de Jong', 'Sophie Klein'], revenueLTM: 62, ebitdaMargin: 0.31, leverage: 2.4, invested: 14, fairValue: 41, realised: 6, evEbitda: 11.5, currentYear: 2024, exitInvested: 14, exitProceeds: 58, exitEvEbitda: 13, exitShare: 64, exitYear: 2026, fte: 320, enps: 48, comment: 'Payment volumes up 22% YoY; preparing for a 2026 exit process.', priority: 'Scale enterprise sales team across the Nordics' }),
  makeCompany({ id: 'greenbox-logistics', name: 'GreenBox Logistics', fundId: 'fund-iii', entryDate: '09-2018', holdingPeriod: 4.8, status: 'watch', bank: 'ING', team: ['Ewout Verschuur', 'Mark de Vries'], revenueLTM: 88, ebitdaMargin: 0.14, leverage: 3.2, invested: 18, fairValue: 24, realised: 4, evEbitda: 7, currentYear: 2024, exitInvested: 18, exitProceeds: 39, exitEvEbitda: 8, exitShare: 52, exitYear: 2027, fte: 540, enps: 30, comment: 'Margin recovery underway after fuel-cost normalisation.', priority: 'Roll out route-optimisation software to all depots' }),
  makeCompany({ id: 'medisupply', name: 'MediSupply', fundId: 'fund-iii', entryDate: '02-2017', holdingPeriod: 6.5, status: 'on-track', bank: 'ABN AMRO', team: ['Lisa van der Berg', 'Willem de Jong'], revenueLTM: 45, ebitdaMargin: 0.24, leverage: 1.8, invested: 11, fairValue: 0, realised: 34, evEbitda: 10, currentYear: 2023, exitInvested: 11, exitProceeds: 34, exitEvEbitda: 10.5, exitShare: 60, exitYear: 2023, fte: 210, enps: 45, comment: 'Exited to strategic buyer at 3.1x in 2023 — strong realised return.', priority: 'Transition support to acquirer completed', exited: true }),
  makeCompany({ id: 'aquatech', name: 'AquaTech Systems', fundId: 'fund-iii', entryDate: '07-2017', holdingPeriod: 5.0, status: 'on-track', bank: 'Rabobank', team: ['Semme Jonkers', 'Eva Bakker'], revenueLTM: 33, ebitdaMargin: 0.27, leverage: 2.0, invested: 9, fairValue: 0, realised: 24, evEbitda: 9, currentYear: 2022, exitInvested: 9, exitProceeds: 24, exitEvEbitda: 9.5, exitShare: 58, exitYear: 2022, fte: 140, enps: 50, comment: 'Realised via secondary buyout at 2.7x in 2022.', priority: 'Deal closed — no further actions', exited: true }),
  makeCompany({ id: 'printwave', name: 'PrintWave', fundId: 'fund-iii', entryDate: '11-2017', holdingPeriod: 4.4, status: 'alert', bank: 'Deutsche Bank', team: ['Ewout Verschuur', 'Sophie Klein'], revenueLTM: 27, ebitdaMargin: 0.09, leverage: 4.1, invested: 12, fairValue: 0, realised: 7, evEbitda: 4, currentYear: 2022, exitInvested: 12, exitProceeds: 7, exitEvEbitda: 4.5, exitShare: 30, exitYear: 2022, fte: 95, enps: 12, comment: 'Written down and exited below cost at 0.6x — structural print decline.', priority: 'Wind-down completed', exited: true }),
  makeCompany({ id: 'urban-mobility', name: 'Urban Mobility', fundId: 'fund-iii', entryDate: '03-2019', holdingPeriod: 4.1, status: 'on-track', bank: 'BNG Bank', team: ['Jim Pfennings', 'Jannet Diepenbroek'], revenueLTM: 54, ebitdaMargin: 0.19, leverage: 2.6, invested: 15, fairValue: 33, realised: 3, evEbitda: 8.5, currentYear: 2025, exitInvested: 15, exitProceeds: 46, exitEvEbitda: 9.5, exitShare: 56, exitYear: 2027, fte: 380, enps: 38, comment: 'Fleet electrification ahead of plan; subscription revenue growing.', priority: 'Expand into two new metropolitan regions' }),
  makeCompany({ id: 'foodlab', name: 'FoodLab', fundId: 'fund-iii', entryDate: '06-2019', holdingPeriod: 3.9, status: 'watch', bank: 'ABN AMRO', team: ['Lisa van der Berg', 'Mark de Vries'], revenueLTM: 39, ebitdaMargin: 0.16, leverage: 3.0, invested: 13, fairValue: 21, realised: 2, evEbitda: 7.5, currentYear: 2025, exitInvested: 13, exitProceeds: 34, exitEvEbitda: 8.5, exitShare: 50, exitYear: 2028, fte: 260, enps: 34, comment: 'Retail listings expanding but input costs pressuring margin.', priority: 'Launch private-label range with two major retailers' }),

  // --- Impact Fund I (2020 vintage, impact focus, 2 exits) ---
  makeCompany({ id: 'solarroof', name: 'SolarRoof', fundId: 'fund-impact-i', entryDate: '04-2020', holdingPeriod: 4.0, status: 'on-track', bank: 'Triodos Bank', team: ['Semme Jonkers', 'Eva Bakker'], revenueLTM: 71, ebitdaMargin: 0.22, leverage: 2.2, invested: 16, fairValue: 38, realised: 5, evEbitda: 10, currentYear: 2025, exitInvested: 16, exitProceeds: 52, exitEvEbitda: 11, exitShare: 60, exitYear: 2027, fte: 410, enps: 55, comment: 'Residential solar installs up 35%; strong impact KPIs on CO2 avoided.', priority: 'Scale installer network to meet demand backlog' }),
  makeCompany({ id: 'purewater', name: 'PureWater', fundId: 'fund-impact-i', entryDate: '08-2020', holdingPeriod: 3.7, status: 'on-track', bank: 'Rabobank', team: ['Eva Bakker', 'Sophie Klein'], revenueLTM: 29, ebitdaMargin: 0.26, leverage: 1.6, invested: 10, fairValue: 22, realised: 2, evEbitda: 9.5, currentYear: 2025, exitInvested: 10, exitProceeds: 28, exitEvEbitda: 10.5, exitShare: 58, exitYear: 2028, fte: 130, enps: 60, comment: 'Water-purification units deployed in 12 new municipalities.', priority: 'Secure framework contract with national utility' }),
  makeCompany({ id: 'circular-textiles', name: 'Circular Textiles', fundId: 'fund-impact-i', entryDate: '01-2021', holdingPeriod: 3.2, status: 'watch', bank: 'ASN Bank', team: ['Jannet Diepenbroek', 'Mark de Vries'], revenueLTM: 24, ebitdaMargin: 0.12, leverage: 2.8, invested: 9, fairValue: 12, realised: 1, evEbitda: 6.5, currentYear: 2025, exitInvested: 9, exitProceeds: 19, exitEvEbitda: 8, exitShare: 46, exitYear: 2029, fte: 170, enps: 40, comment: 'Recycling volumes growing but automation capex weighing on EBITDA.', priority: 'Commission second fibre-recycling line' }),
  makeCompany({ id: 'edugrow', name: 'EduGrow', fundId: 'fund-impact-i', entryDate: '05-2021', holdingPeriod: 2.9, status: 'on-track', bank: 'Triodos Bank', team: ['Lisa van der Berg', 'Jim Pfennings'], revenueLTM: 18, ebitdaMargin: 0.20, leverage: 1.2, invested: 7, fairValue: 15, realised: 0, evEbitda: 9, currentYear: 2025, exitInvested: 7, exitProceeds: 21, exitEvEbitda: 10, exitShare: 62, exitYear: 2029, fte: 90, enps: 58, comment: 'EdTech platform reached 500k learners; net retention above 120%.', priority: 'Expand B2B channel to vocational institutions' }),
  makeCompany({ id: 'agriloop', name: 'AgriLoop', fundId: 'fund-impact-i', entryDate: '03-2020', holdingPeriod: 4.2, status: 'on-track', bank: 'Rabobank', team: ['Semme Jonkers', 'Jannet Diepenbroek'], revenueLTM: 42, ebitdaMargin: 0.23, leverage: 2.1, invested: 12, fairValue: 0, realised: 31, evEbitda: 10, currentYear: 2024, exitInvested: 12, exitProceeds: 31, exitEvEbitda: 10.5, exitShare: 60, exitYear: 2024, fte: 220, enps: 52, comment: 'Exited to strategic agri-group at 2.6x in 2024.', priority: 'Post-close earn-out tracking on target', exited: true }),
  makeCompany({ id: 'windpeak', name: 'WindPeak', fundId: 'fund-impact-i', entryDate: '06-2020', holdingPeriod: 3.5, status: 'watch', bank: 'ABN AMRO', team: ['Eva Bakker', 'Ewout Verschuur'], revenueLTM: 36, ebitdaMargin: 0.18, leverage: 3.3, invested: 14, fairValue: 0, realised: 18, evEbitda: 7, currentYear: 2023, exitInvested: 14, exitProceeds: 18, exitEvEbitda: 7.5, exitShare: 44, exitYear: 2023, fte: 160, enps: 36, comment: 'Exited at 1.3x in 2023 after permitting delays capped upside.', priority: 'Handover to acquirer finalised', exited: true }),

  // --- Fund IV (two more current holdings) ---
  makeCompany({ id: 'cyberguard', name: 'CyberGuard', fundId: 'fund-iv', entryDate: '02-2023', holdingPeriod: 3.2, status: 'on-track', bank: 'ING', team: ['Sophie Klein', 'Willem de Jong'], revenueLTM: 31, ebitdaMargin: 0.28, leverage: 1.9, invested: 13, fairValue: 24, realised: 0, evEbitda: 11, currentYear: 2025, exitInvested: 13, exitProceeds: 39, exitEvEbitda: 12.5, exitShare: 63, exitYear: 2028, fte: 150, enps: 54, comment: 'ARR growth of 41%; strong pipeline in mid-market security.', priority: 'Launch managed detection & response offering' }),
  makeCompany({ id: 'brightcare', name: 'BrightCare', fundId: 'fund-iv', entryDate: '10-2023', holdingPeriod: 2.5, status: 'watch', bank: 'ABN AMRO', team: ['Lisa van der Berg', 'Mark de Vries'], revenueLTM: 48, ebitdaMargin: 0.15, leverage: 3.0, invested: 16, fairValue: 19, realised: 0, evEbitda: 7.5, currentYear: 2025, exitInvested: 16, exitProceeds: 34, exitEvEbitda: 9, exitShare: 50, exitYear: 2029, fte: 620, enps: 33, comment: 'Staffing cost inflation being offset by rate increases with payers.', priority: 'Standardise care model across acquired clinics' }),
]

// Mock Companies
export const companies: Company[] = [
  {
    id: 'medtech-group',
    name: 'MedTech Group',
    fundId: 'fund-iv',
    entryDate: '12-2021',
    status: 'on-track',
    holdingPeriod: 3.4,
    bank: 'ABN AMRO',
    investmentTeam: ['Willem de Jong', 'Lisa van der Berg'],
    financials: {
      revenue: {
        ytd: { actual: 7.5, budget: 7.2, ly: 6.8, deltaAvsB: 0.3 },
        fy: { ly: 24.1, ltm: 28.1, le: 30.2, budget: 28.0, deltaLEvsB: 2.2 },
      },
      grossMargin: {
        ytd: { actual: 4.8, budget: 4.6, ly: 4.3, deltaAvsB: 0.2 },
        fy: { ly: 15.4, ltm: 18.0, le: 19.3, budget: 17.9, deltaLEvsB: 1.4 },
      },
      ebitda: {
        ytd: { actual: 1.7, budget: 1.5, ly: 1.4, deltaAvsB: 0.2 },
        fy: { ly: 5.4, ltm: 6.2, le: 6.8, budget: 6.5, deltaLEvsB: 0.3 },
      },
      normalizedEbitda: {
        ytd: { actual: 1.8, budget: 1.6, ly: 1.5, deltaAvsB: 0.2 },
        fy: { ly: 5.6, ltm: 6.4, le: 7.0, budget: 6.7, deltaLEvsB: 0.3 },
      },
      normalizedEbitdaPercent: {
        ytd: { actual: 24.0, budget: 22.2, ly: 22.1, deltaAvsB: 1.8 },
        fy: { ly: 23.2, ltm: 22.8, le: 23.2, budget: 23.9, deltaLEvsB: -0.7 },
      },
      freeCashFlow: {
        ytd: { actual: 0.8, budget: 0.6, ly: 0.5, deltaAvsB: 0.2 },
        fy: { ly: 2.1, ltm: 3.2, le: 3.8, budget: 3.5, deltaLEvsB: 0.3 },
      },
      netDebt: { fy2024A: 16.8, fy2025LE: 14.3, fy2025B: 15.0, leverageLE: 2.8 },
      leverage: 2.8,
    },
    valuation: {
      current: { moi: 2.38, investedValue: 4.2, fairValue: 7.0, realisedProceeds: 3.0, evEbitda: 7.2, shareOrdinaryEquity: null, year: 2023 },
      exit: { moi: 4.2, investedValue: 4.2, fairValue: 17.6, evEbitda: 9.0, shareOrdinaryEquity: 62, year: 2027 },
    },
    kpis: {
      fteTotal: 142,
      enps: 42,
      sickLeaveRate: 3.8,
      turnover: 12,
      totalLeverage: 2.8,
      bankLeverage: 2.6,
      covenantBreach: 'N/A',
      netDebt: 16.8,
      bankDebt: 18.2,
      cashEnd: 1.8,
      otherDebt: 0.4,
      customKPIs: [
        { name: '# Devices sold', actual: [120, 135, 142, 158, 165, 172, 180, 188, 195, 202, 210, 218], budget: [125, 140, 155, 170, 185, 200, 215, 230, 245, 260, 275, 290] },
      ],
    },
    comments: [
      { id: '1', author: 'Willem', period: 'Q1 2026', text: 'Strong start to the year with new product launch driving growth. Pipeline looks healthy for H2.', createdAt: '2026-04-15' },
      { id: '2', author: 'Lisa', period: 'Q4 2025', text: 'Exceeded targets in Q4. US expansion proceeding as planned.', createdAt: '2026-01-20' },
    ],
    priorities: [
      { id: '1', category: 'go-to-market', text: 'US market expansion - first 3 distribution partners signed', status: 'on-track', period: 'May 2025' },
      { id: '2', category: 'operations', text: 'New ERP system implementation', status: 'watch', period: 'May 2025' },
    ],
  },
  {
    id: 'fruit-op-je-werk',
    name: 'Sure Operations',
    fundId: 'fund-iv',
    entryDate: '03-2023',
    status: 'on-track',
    holdingPeriod: 3.1,
    bank: 'OLB bank',
    investmentTeam: ['Jim Pfennings', 'Jannet Diepenbroek'],
    financials: {
      revenue: {
        ytd: { actual: 11.0, budget: 11.0, ly: 10.1, deltaAvsB: 0.0 },
        fy: { ly: 40.8, ltm: 41.7, le: 46.2, budget: 46.2, deltaLEvsB: 0.0 },
      },
      grossMargin: {
        ytd: { actual: 7.0, budget: 6.9, ly: 6.3, deltaAvsB: 0.1 },
        fy: { ly: 25.7, ltm: 26.4, le: 28.9, budget: 28.9, deltaLEvsB: 0.0 },
      },
      ebitda: {
        ytd: { actual: 2.0, budget: 1.9, ly: 1.7, deltaAvsB: 0.1 },
        fy: { ly: 6.5, ltm: 6.8, le: 8.1, budget: 8.1, deltaLEvsB: 0.0 },
      },
      normalizedEbitda: {
        ytd: { actual: 2.0, budget: 1.9, ly: 1.8, deltaAvsB: 0.1 },
        fy: { ly: 6.8, ltm: 6.9, le: 8.1, budget: 8.1, deltaLEvsB: 0.0 },
      },
      normalizedEbitdaPercent: {
        ytd: { actual: 18.3, budget: 17.0, ly: 18.1, deltaAvsB: 1.3 },
        fy: { ly: 16.7, ltm: 16.7, le: 17.5, budget: 17.5, deltaLEvsB: 0.0 },
      },
      freeCashFlow: {
        ytd: { actual: 0.6, budget: 0.7, ly: 0, deltaAvsB: -0.1 },
        fy: { ly: 0, ltm: 2.4, le: 0, budget: 4.6, deltaLEvsB: -4.6 },
      },
      netDebt: { fy2024A: 15.1, fy2025LE: 13.8, fy2025B: 14.0, leverageLE: 2.2 },
      leverage: 2.2,
    },
    valuation: {
      current: { moi: 2.23, investedValue: 10.1, fairValue: 14.0, realisedProceeds: 8.5, evEbitda: 6.5, shareOrdinaryEquity: null, year: 2023 },
      exit: { moi: 5.53, investedValue: 10.1, fairValue: 55.6, evEbitda: 9.0, shareOrdinaryEquity: 58, year: 2027 },
    },
    kpis: {
      fteTotal: 264,
      enps: null,
      sickLeaveRate: 5.2,
      turnover: null,
      totalLeverage: 2.2,
      bankLeverage: 2.1,
      covenantBreach: 'N/A',
      netDebt: 15.1,
      bankDebt: 17.2,
      cashEnd: 2.4,
      otherDebt: 0.327,
      customKPIs: [
        { name: '# Average price', actual: [24, 24.5, 25, 25.2, 25.5, 26, 26.2, 26.5, 27, 27.2, 27.5, 28], budget: [24, 24, 24.5, 25, 25.5, 26, 26, 26.5, 27, 27, 27.5, 28] },
        { name: '# Service Contracts', actual: [12000, 12200, 12500, 12800, 13000, 13200, 13500, 13800, 14000, 14200, 14500, 14800], budget: [12000, 12500, 13000, 13500, 14000, 14500, 15000, 15500, 16000, 16500, 17000, 17500] },
        { name: 'Churn', actual: [2.1, 2.0, 1.9, 1.8, 1.9, 2.0, 1.8, 1.7, 1.6, 1.8, 1.9, 1.7], budget: [2.0, 2.0, 2.0, 1.9, 1.9, 1.9, 1.8, 1.8, 1.8, 1.7, 1.7, 1.7] },
        { name: 'New Boxes', actual: [450, 480, 520, 490, 510, 550, 580, 540, 560, 590, 620, 600], budget: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500] },
      ],
    },
    comments: [
      { id: '1', author: 'Jim', period: 'Q1 2026', text: 'Valuation maintained at 6.5x LTM EBITDA. Exit timeline moved from 2027 to late 2027 due to Scandinavia add-on timing. Upside scenario at 9.0x if M&A completes.', createdAt: '2026-04-20' },
      { id: '2', author: 'Jannet', period: 'dec 2025', text: 'In December, the Netherlands delivered a very strong performance driven by the successful Deelcember campaign and high delivery volumes during the Christmas holidays, resulting in an EBITDA of €526k, while Belgium and Germany were negatively impacted by holiday cancellations and additional costs.', createdAt: '2026-01-15' },
      { id: '3', author: 'Jannet', period: 'nov 2025', text: 'November results in line with LE. Revenue slightly below LE due to cancellation of a larger customer. Offset by higher gross margin this month.', createdAt: '2025-12-10' },
      { id: '4', author: 'Jannet', period: 'sep 2025', text: 'September was best month ever, with > 800k in EBITDA (helped by 5 delivery days).', createdAt: '2025-10-08' },
    ],
    priorities: [
      { id: '1', category: 'operations', text: 'Implement new WMS system across all 3 warehouses', status: 'on-track', period: 'May 2025' },
      { id: '2', category: 'operations', text: 'Reduce delivery error rate from 3.2% to < 1.5%', status: 'on-track', period: 'May 2025' },
      { id: '3', category: 'operations', text: 'Hire operations manager for Belgium — delayed due to candidate withdrawal', status: 'watch', period: 'May 2025' },
      { id: '4', category: 'go-to-market', text: 'Launch corporate gifting product line Q2', status: 'on-track', period: 'May 2025' },
      { id: '5', category: 'go-to-market', text: 'Scandinavia expansion — LOI signed but due diligence delayed by 6 weeks', status: 'alert', period: 'May 2025', updatedBy: 'Jim', updatedAt: '2 days ago' },
      { id: '6', category: 'go-to-market', text: 'Price increase 5% per July 1st — customer communication prepared', status: 'on-track', period: 'May 2025' },
      { id: '7', category: 'talent', text: 'Management team complete — CFO started March 1st', status: 'on-track', period: 'May 2025' },
      { id: '8', category: 'other', text: 'ESG roadmap — baseline measurement scheduled for Q3', status: 'watch', period: 'May 2025' },
    ],
  },
  {
    id: 'cleanflow',
    name: 'CleanFlow',
    fundId: 'fund-iv',
    entryDate: '09-2022',
    status: 'on-track',
    holdingPeriod: 2.7,
    bank: 'Rabobank',
    investmentTeam: ['Semme Jonkers', 'Eva Bakker'],
    financials: {
      revenue: {
        ytd: { actual: 6.2, budget: 5.8, ly: 5.4, deltaAvsB: 0.4 },
        fy: { ly: 19.2, ltm: 22.8, le: 24.5, budget: 23.3, deltaLEvsB: 1.2 },
      },
      grossMargin: {
        ytd: { actual: 4.0, budget: 3.7, ly: 3.4, deltaAvsB: 0.3 },
        fy: { ly: 12.3, ltm: 14.6, le: 15.7, budget: 14.9, deltaLEvsB: 0.8 },
      },
      ebitda: {
        ytd: { actual: 1.5, budget: 1.3, ly: 1.2, deltaAvsB: 0.2 },
        fy: { ly: 4.6, ltm: 5.5, le: 6.1, budget: 5.8, deltaLEvsB: 0.3 },
      },
      normalizedEbitda: {
        ytd: { actual: 1.6, budget: 1.4, ly: 1.3, deltaAvsB: 0.2 },
        fy: { ly: 4.8, ltm: 5.7, le: 6.3, budget: 6.0, deltaLEvsB: 0.3 },
      },
      normalizedEbitdaPercent: {
        ytd: { actual: 25.8, budget: 24.1, ly: 24.1, deltaAvsB: 1.7 },
        fy: { ly: 25.0, ltm: 25.0, le: 25.7, budget: 25.8, deltaLEvsB: -0.1 },
      },
      freeCashFlow: {
        ytd: { actual: 0.5, budget: 0.4, ly: 0.3, deltaAvsB: 0.1 },
        fy: { ly: 1.8, ltm: 2.5, le: 3.0, budget: 2.7, deltaLEvsB: 0.3 },
      },
      netDebt: { fy2024A: 9.2, fy2025LE: 8.1, fy2025B: 8.5, leverageLE: 1.8 },
      leverage: 1.8,
    },
    valuation: {
      current: { moi: 1.88, investedValue: 8.5, fairValue: 11.0, realisedProceeds: 5.0, evEbitda: 6.8, shareOrdinaryEquity: null, year: 2023 },
      exit: { moi: 3.8, investedValue: 8.5, fairValue: 32.3, evEbitda: 8.5, shareOrdinaryEquity: 55, year: 2027 },
    },
    kpis: {
      fteTotal: 98,
      enps: 52,
      sickLeaveRate: 3.2,
      turnover: 8,
      totalLeverage: 1.8,
      bankLeverage: 1.7,
      covenantBreach: 'N/A',
      netDebt: 9.2,
      bankDebt: 10.5,
      cashEnd: 1.5,
      otherDebt: 0.2,
      customKPIs: [],
    },
    comments: [
      { id: '1', author: 'Semme', period: 'Q1 2026', text: 'EBITDA margin expanded to 24%, highest in portfolio. New sustainability certification driving customer wins.', createdAt: '2026-04-18' },
    ],
    priorities: [
      { id: '1', category: 'go-to-market', text: 'Sustainability certification for premium pricing', status: 'on-track', period: 'May 2025' },
      { id: '2', category: 'operations', text: 'Automation of production line 2', status: 'on-track', period: 'May 2025' },
    ],
  },
  {
    id: 'logiserve',
    name: 'LogiServe',
    fundId: 'fund-iv',
    entryDate: '06-2023',
    status: 'watch',
    holdingPeriod: 1.9,
    bank: 'ING',
    investmentTeam: ['Ewout Verschuur', 'Mark de Vries'],
    financials: {
      revenue: {
        ytd: { actual: 4.5, budget: 5.0, ly: 5.2, deltaAvsB: -0.5 },
        fy: { ly: 20.1, ltm: 19.4, le: 18.8, budget: 19.6, deltaLEvsB: -0.8 },
      },
      grossMargin: {
        ytd: { actual: 2.7, budget: 3.0, ly: 3.1, deltaAvsB: -0.3 },
        fy: { ly: 12.1, ltm: 11.6, le: 11.3, budget: 11.8, deltaLEvsB: -0.5 },
      },
      ebitda: {
        ytd: { actual: 0.6, budget: 0.8, ly: 0.9, deltaAvsB: -0.2 },
        fy: { ly: 3.2, ltm: 2.9, le: 2.6, budget: 2.8, deltaLEvsB: -0.2 },
      },
      normalizedEbitda: {
        ytd: { actual: 0.7, budget: 0.9, ly: 1.0, deltaAvsB: -0.2 },
        fy: { ly: 3.4, ltm: 3.1, le: 2.8, budget: 3.0, deltaLEvsB: -0.2 },
      },
      normalizedEbitdaPercent: {
        ytd: { actual: 15.6, budget: 18.0, ly: 19.2, deltaAvsB: -2.4 },
        fy: { ly: 16.9, ltm: 16.0, le: 14.9, budget: 15.3, deltaLEvsB: -0.4 },
      },
      freeCashFlow: {
        ytd: { actual: -0.2, budget: 0.1, ly: 0.2, deltaAvsB: -0.3 },
        fy: { ly: 0.8, ltm: 0.4, le: 0.2, budget: 0.5, deltaLEvsB: -0.3 },
      },
      netDebt: { fy2024A: 18.4, fy2025LE: 19.1, fy2025B: 17.5, leverageLE: 3.1 },
      leverage: 3.1,
    },
    valuation: {
      current: { moi: 1.11, investedValue: 12.0, fairValue: 7.3, realisedProceeds: 6.0, evEbitda: 5.5, shareOrdinaryEquity: null, year: 2023 },
      exit: { moi: 1.8, investedValue: 12.0, fairValue: 21.6, evEbitda: 7.0, shareOrdinaryEquity: 48, year: 2028 },
    },
    kpis: {
      fteTotal: 185,
      enps: 28,
      sickLeaveRate: 6.8,
      turnover: 18,
      totalLeverage: 3.1,
      bankLeverage: 2.9,
      covenantBreach: '4.0x',
      netDebt: 18.4,
      bankDebt: 20.2,
      cashEnd: 2.1,
      otherDebt: 0.3,
      customKPIs: [],
    },
    comments: [
      { id: '1', author: 'Ewout', period: 'Q1 2026', text: 'Revenue declined 4% below budget for 3rd consecutive month. Customer churn increasing in SMB segment. Initiating cost reduction program.', createdAt: '2026-04-22' },
    ],
    priorities: [
      { id: '1', category: 'operations', text: 'Cost reduction program - target €1.2M savings', status: 'watch', period: 'May 2025' },
      { id: '2', category: 'talent', text: 'New commercial director search', status: 'alert', period: 'May 2025' },
    ],
  },
  {
    id: 'datavault',
    name: 'DataVault',
    fundId: 'fund-iv',
    entryDate: '01-2024',
    status: 'alert',
    holdingPeriod: 1.3,
    bank: 'Deutsche Bank',
    investmentTeam: ['Ewout Verschuur', 'Sophie Klein'],
    financials: {
      revenue: {
        ytd: { actual: 1.8, budget: 2.2, ly: 2.4, deltaAvsB: -0.4 },
        fy: { ly: 9.1, ltm: 8.2, le: 7.5, budget: 8.8, deltaLEvsB: -1.3 },
      },
      grossMargin: {
        ytd: { actual: 1.1, budget: 1.4, ly: 1.5, deltaAvsB: -0.3 },
        fy: { ly: 5.5, ltm: 4.9, le: 4.5, budget: 5.3, deltaLEvsB: -0.8 },
      },
      ebitda: {
        ytd: { actual: 0.1, budget: 0.3, ly: 0.4, deltaAvsB: -0.2 },
        fy: { ly: 1.2, ltm: 0.7, le: 0.5, budget: 1.1, deltaLEvsB: -0.6 },
      },
      normalizedEbitda: {
        ytd: { actual: 0.2, budget: 0.4, ly: 0.5, deltaAvsB: -0.2 },
        fy: { ly: 1.4, ltm: 0.9, le: 0.6, budget: 1.2, deltaLEvsB: -0.6 },
      },
      normalizedEbitdaPercent: {
        ytd: { actual: 11.1, budget: 18.2, ly: 20.8, deltaAvsB: -7.1 },
        fy: { ly: 15.4, ltm: 11.0, le: 8.0, budget: 13.6, deltaLEvsB: -5.6 },
      },
      freeCashFlow: {
        ytd: { actual: -0.5, budget: -0.1, ly: 0.1, deltaAvsB: -0.4 },
        fy: { ly: 0.2, ltm: -0.8, le: -1.2, budget: 0.0, deltaLEvsB: -1.2 },
      },
      netDebt: { fy2024A: 22.0, fy2025LE: 23.5, fy2025B: 21.0, leverageLE: 4.2 },
      leverage: 4.2,
    },
    valuation: {
      current: { moi: 1.00, investedValue: 15.0, fairValue: 8.0, realisedProceeds: 7.0, evEbitda: 4.5, shareOrdinaryEquity: null, year: 2024 },
      exit: { moi: 1.2, investedValue: 15.0, fairValue: 18.0, evEbitda: 6.0, shareOrdinaryEquity: 35, year: 2029 },
    },
    kpis: {
      fteTotal: 72,
      enps: 15,
      sickLeaveRate: 8.5,
      turnover: 25,
      totalLeverage: 4.2,
      bankLeverage: 4.0,
      covenantBreach: '4.5x',
      netDebt: 22.0,
      bankDebt: 23.5,
      cashEnd: 1.8,
      otherDebt: 0.3,
      customKPIs: [],
    },
    comments: [
      { id: '1', author: 'Ewout', period: 'Q1 2026', text: 'Leverage at 4.2x approaching covenant threshold of 4.5x. Urgent turnaround plan in progress. New CEO starting May 1st.', createdAt: '2026-04-25' },
    ],
    priorities: [
      { id: '1', category: 'operations', text: 'Turnaround plan execution', status: 'alert', period: 'May 2025' },
      { id: '2', category: 'talent', text: 'New CEO onboarding - starts May 1st', status: 'on-track', period: 'May 2025' },
    ],
  },
  {
    id: 'retailplus',
    name: 'RetailPlus',
    fundId: 'fund-iv',
    entryDate: '04-2024',
    status: 'watch',
    holdingPeriod: 1.0,
    bank: 'ABN AMRO',
    investmentTeam: ['Willem de Jong', 'Mark de Vries'],
    financials: {
      revenue: {
        ytd: { actual: 2.6, budget: 2.9, ly: 3.2, deltaAvsB: -0.3 },
        fy: { ly: 12.5, ltm: 11.3, le: 11.0, budget: 12.1, deltaLEvsB: -1.1 },
      },
      grossMargin: {
        ytd: { actual: 1.5, budget: 1.7, ly: 1.9, deltaAvsB: -0.2 },
        fy: { ly: 7.5, ltm: 6.8, le: 6.6, budget: 7.3, deltaLEvsB: -0.7 },
      },
      ebitda: {
        ytd: { actual: 0.25, budget: 0.35, ly: 0.4, deltaAvsB: -0.1 },
        fy: { ly: 1.5, ltm: 1.2, le: 1.1, budget: 1.3, deltaLEvsB: -0.2 },
      },
      normalizedEbitda: {
        ytd: { actual: 0.3, budget: 0.4, ly: 0.45, deltaAvsB: -0.1 },
        fy: { ly: 1.6, ltm: 1.3, le: 1.2, budget: 1.4, deltaLEvsB: -0.2 },
      },
      normalizedEbitdaPercent: {
        ytd: { actual: 11.5, budget: 13.8, ly: 14.1, deltaAvsB: -2.3 },
        fy: { ly: 12.8, ltm: 11.5, le: 10.9, budget: 11.6, deltaLEvsB: -0.7 },
      },
      freeCashFlow: {
        ytd: { actual: -0.1, budget: 0.05, ly: 0.1, deltaAvsB: -0.15 },
        fy: { ly: 0.4, ltm: 0.1, le: -0.1, budget: 0.2, deltaLEvsB: -0.3 },
      },
      netDebt: { fy2024A: 14.5, fy2025LE: 15.2, fy2025B: 14.0, leverageLE: 3.5 },
      leverage: 3.5,
    },
    valuation: {
      current: { moi: 1.00, investedValue: 11.0, fairValue: 6.0, realisedProceeds: 5.0, evEbitda: 5.2, shareOrdinaryEquity: null, year: 2024 },
      exit: { moi: 1.5, investedValue: 11.0, fairValue: 16.5, evEbitda: 6.5, shareOrdinaryEquity: 42, year: 2028 },
    },
    kpis: {
      fteTotal: 156,
      enps: 32,
      sickLeaveRate: 5.5,
      turnover: 15,
      totalLeverage: 3.5,
      bankLeverage: 3.3,
      covenantBreach: '4.0x',
      netDebt: 14.5,
      bankDebt: 16.0,
      cashEnd: 1.8,
      otherDebt: 0.3,
      customKPIs: [],
    },
    comments: [
      { id: '1', author: 'Willem', period: 'Q1 2026', text: 'Retail headwinds continuing. Store optimization program launched. Focus on online channel acceleration.', createdAt: '2026-04-20' },
    ],
    priorities: [
      { id: '1', category: 'go-to-market', text: 'Online channel acceleration - 30% revenue target', status: 'watch', period: 'May 2025' },
      { id: '2', category: 'operations', text: 'Store optimization - 5 closures planned', status: 'on-track', period: 'May 2025' },
    ],
  },
  ...generatedCompanies,
]

// Fund allocation data
export const fundAllocation: FundAllocation = {
  invested: {
    total: 60.0,
    companies: [
      { name: 'MedTech Group', amount: 4.2 },
      { name: 'Sure Operations', amount: 10.1 },
      { name: 'CleanFlow', amount: 8.5 },
      { name: 'LogiServe', amount: 12.0 },
      { name: 'DataVault', amount: 15.0 },
      { name: 'RetailPlus', amount: 11.0 },
    ],
  },
  reservedAddOns: {
    total: 12.0,
    items: [
      { name: 'MedTech — Scandinavia', amount: 4.0 },
      { name: 'Unallocated reserve', amount: 8.0 },
    ],
  },
  feesCosts: {
    total: 12.0,
    managementFee: 10.0,
    estFutureCosts: 2.0,
  },
  dryPowder: 36.0,
}

// Portfolio valuation chart data
export const portfolioValuationData = [
  { name: 'ADC', investment: 18, fairValue: 16, totalProceeds: 68 },
  { name: 'Auxo', investment: 16, fairValue: 14, totalProceeds: 59 },
  { name: 'Ciphix', investment: 20, fairValue: 5, totalProceeds: 50 },
  { name: 'Sure Ops', investment: 10, fairValue: 19, totalProceeds: 56 },
  { name: 'Holmris', investment: 30, fairValue: 39, totalProceeds: 130 },
  { name: 'SH Group', investment: 18, fairValue: 31, totalProceeds: 107 },
  { name: 'SPC', investment: 15, fairValue: 13, totalProceeds: 36 },
]

// Fund valuation over time
export const fundValuationOverTime = [
  { period: '2022 Q4', investment: 28, fairValue: 22, realisedValue: 0 },
  { period: '2023 Q4', investment: 48, fairValue: 42, realisedValue: 0 },
  { period: '2024 Q4', investment: 72, fairValue: 98, realisedValue: 2 },
  { period: '2025 Q4', investment: 72, fairValue: 142, realisedValue: 2 },
]

// Monthly EBITDA data for charts
export const monthlyEbitdaData = [
  { month: 'Apr', value: 6.1 },
  { month: 'May', value: 6.1 },
  { month: 'Jun', value: 6.3 },
  { month: 'Jul', value: 6.2 },
  { month: 'Aug', value: 6.2 },
  { month: 'Sep', value: 6.5 },
  { month: 'Oct', value: 6.7 },
  { month: 'Nov', value: 6.8 },
  { month: 'Dec', value: 6.7 },
  { month: 'Jan', value: 6.8 },
  { month: 'Feb', value: 6.8 },
  { month: 'Mar', value: 6.9 },
]

// Value creation bridge data
export const valueCreationBridgeData: ValueCreationBridge = {
  entryToCurrent: {
    ebitdaEntry: 3.1,
    ma: 0.6,
    organicGrowth: 3.2,
    ebitdaLTM: 6.9,
  },
  currentToExit: {
    revenueGrowth: 1.8,
    marginImprovement: 1.5,
    ebitdaExit: 10.3,
  },
}

// Revenue and EBITDA projection data
export const projectionData = {
  revenue: [
    { year: '2023', fundCase: 25, le: 25 },
    { year: '2024', fundCase: 34, le: 34 },
    { year: '2025', fundCase: 35, le: 41 },
    { year: '2026', fundCase: 41, le: 46 },
    { year: '2027', fundCase: 46, le: 53 },
  ],
  ebitda: [
    { year: '2023', fundCase: 5, le: 5 },
    { year: '2024', fundCase: 6, le: 6 },
    { year: '2025', fundCase: 7, le: 7 },
    { year: '2026', fundCase: 8, le: 8 },
    { year: '2027', fundCase: 9, le: 10 },
  ],
}

// LP Report status data
export interface LPReportSection {
  id: string
  title: string
  status: 'auto' | 'manual' | 'locked'
  statusLabel: string
  description: string
}

export const lpReportSections: LPReportSection[] = [
  { id: 'fund-overview', title: 'Fund overview', status: 'auto', statusLabel: 'Automatisch gevuld', description: 'Key fund metrics and performance summary' },
  { id: 'portfolio-performance', title: 'Portfolio performance per company', status: 'auto', statusLabel: 'Automatisch gevuld', description: 'Financial highlights and status per company' },
  { id: 'valuations', title: 'Valuations and footnotes', status: 'manual', statusLabel: 'Handmatig', description: 'Valuation methodology and notes' },
  { id: 'commentary', title: 'Deal team commentary', status: 'manual', statusLabel: 'Handmatig', description: 'Qualitative updates from investment team' },
  { id: 'export', title: 'Export and distribution', status: 'locked', statusLabel: 'Klaar na afsluiting', description: 'Generate reports in various formats' },
]

// Recent changes for value creation tab
export const recentChanges = [
  { id: '1', priority: 'Scandinavia expansion', fromStatus: 'on-track', toStatus: 'alert', user: 'Edo', timeAgo: '2 days ago' },
  { id: '2', priority: 'CFO hired', fromStatus: 'watch', toStatus: 'on-track', user: 'Femke', timeAgo: '1 week ago' },
  { id: '3', priority: 'Price increase 5%', fromStatus: null, toStatus: 'on-track', user: 'Edo', timeAgo: '2 weeks ago' },
]

// User data
export interface User {
  id: string
  name: string
  initials: string
  email: string
  role: 'admin' | 'partner' | 'deal-team' | 'viewer'
}

export const currentUser: User = {
  id: 'user-1',
  name: 'Amanda de Wit',
  initials: 'AW',
  email: 'amanda@hollandcapital.com',
  role: 'partner',
}

export const users: User[] = [
  currentUser,
  { id: 'user-2', name: 'Edo Pfennings', initials: 'EP', email: 'edo@hollandcapital.com', role: 'partner' },
  { id: 'user-3', name: 'Femke Diepenbroek', initials: 'FD', email: 'femke@hollandcapital.com', role: 'deal-team' },
  { id: 'user-4', name: 'Willem de Jong', initials: 'WJ', email: 'willem@hollandcapital.com', role: 'partner' },
  { id: 'user-5', name: 'Ewout Verschuur', initials: 'EV', email: 'ewout@hollandcapital.com', role: 'deal-team' },
  { id: 'user-6', name: 'Semme Jonkers', initials: 'SJ', email: 'semme@hollandcapital.com', role: 'deal-team' },
]

// AI Analysis mock data
export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sources?: string[]
}

export const aiQuickAnalyses = [
  { id: 'health', icon: 'HeartPulse', title: 'Portfolio health check', description: 'Compare all companies against budget and flag underperformers' },
  { id: 'trends', icon: 'TrendingUp', title: 'Trend analysis', description: 'Identify revenue and EBITDA trends across the portfolio over the last 12 months' },
  { id: 'peer', icon: 'Users', title: 'Peer comparison', description: "Compare a company's margins and growth against portfolio average" },
  { id: 'risk', icon: 'AlertTriangle', title: 'Risk assessment', description: 'Highlight leverage concerns, covenant risks and cash flow issues' },
  { id: 'lp-draft', icon: 'FileText', title: 'LP report draft', description: 'Generate a narrative summary for the quarterly LP report based on current data' },
  { id: 'exit', icon: 'DoorOpen', title: 'Exit readiness', description: "Assess each company's readiness for exit based on financial and strategic KPIs" },
]

export const aiRecentInsights = [
  { id: '1', status: 'amber', timeAgo: '2 days ago', text: 'LogiServe revenue declined 4% below budget for 3rd consecutive month' },
  { id: '2', status: 'alert', timeAgo: '1 week ago', text: 'DataVault leverage at 4.2x approaching covenant threshold of 4.5x' },
  { id: '3', status: 'on-track', timeAgo: '3 days ago', text: 'CleanFlow EBITDA margin expanded to 24%, highest in portfolio' },
]

export const mockAIMessages: AIMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Give me a portfolio health check',
    timestamp: '2026-04-27T10:30:00',
  },
  {
    id: '2',
    role: 'assistant',
    content: `## Portfolio Health Check - Q1 2026

### Overview
The portfolio shows mixed performance with 3 companies on track, 2 requiring attention, and 1 in alert status.

### Performance Summary

| Company | Status | Revenue vs Budget | EBITDA vs Budget | Key Concern |
|---------|--------|-------------------|------------------|-------------|
| MedTech Group | On Track | +8% | +4% | None |
| Sure Operations | On Track | 0% | 0% | None |
| CleanFlow | On Track | +5% | +3% | None |
| LogiServe | Watch | -4% | -8% | Revenue decline |
| DataVault | Alert | -15% | -40% | Covenant risk |
| RetailPlus | Watch | -9% | -12% | Market headwinds |

### Key Insights

**Outperformers:**
- CleanFlow continues strong margin expansion at 24% EBITDA margin
- MedTech Group benefiting from US expansion and new product launch

**Requiring Attention:**
- **DataVault** is critical: leverage at 4.2x, approaching 4.5x covenant
- **LogiServe** showing revenue decline for 3rd consecutive month
- **RetailPlus** impacted by broader retail headwinds

### Recommended Actions
1. Weekly monitoring of DataVault cash flow and covenant headroom
2. Review LogiServe commercial strategy with deal team
3. Accelerate RetailPlus online channel pivot`,
    timestamp: '2026-04-27T10:30:15',
    sources: ['Fund IV Q1 2026 actuals', 'Company financials as of March 2026'],
  },
]
