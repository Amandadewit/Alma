"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Building2, Briefcase, GitBranch, ChevronRight, Users, CalendarClock } from "lucide-react"
import Link from "next/link"
import { funds, companies as allCompanies } from "@/lib/mock-data"

// Per-fund master-data attributes not modelled on the fund object itself
const fundMeta: Record<string, { startDate: string; strategy: string; status: string }> = {
  'fund-iv': { startDate: '2020-01-15', strategy: 'Growth Equity', status: 'Active' },
  'fund-iii': { startDate: '2017-06-01', strategy: 'Buyout', status: 'Harvesting' },
  'fund-impact-i': { startDate: '2020-04-01', strategy: 'Impact', status: 'Investing' },
}

// Funds derived from the shared mock-data
const existingFunds = funds.map((fund) => ({
  id: fund.id,
  name: fund.name,
  startDate: fundMeta[fund.id]?.startDate ?? `${fund.vintageYear}-01-01`,
  totalSize: fund.committedCapital,
  strategy: fundMeta[fund.id]?.strategy ?? 'Growth Equity',
  status: fundMeta[fund.id]?.status ?? 'Active',
  vintage: fund.vintageYear,
}))

// Lifecycle status shared by portfolio companies and add-ons
const lifecycleStatuses = ['Active', 'Exited', 'Reserved capital', 'Identified', 'In process'] as const
type Lifecycle = (typeof lifecycleStatuses)[number]

const lifecycleBadge: Record<Lifecycle, string> = {
  'Active': 'bg-green-50 text-green-700',
  'Exited': 'bg-gray-100 text-gray-500',
  'Reserved capital': 'bg-blue-50 text-blue-700',
  'Identified': 'bg-gray-100 text-gray-600',
  'In process': 'bg-amber-50 text-amber-700',
}

// Sector lookup per company id (not modelled on the company object)
const sectorMap: Record<string, string> = {
  'medtech-group': 'Healthcare',
  'fruit-op-je-werk': 'Consumer',
  'cleanflow': 'Cleantech',
  'logiserve': 'Logistics',
  'datavault': 'Technology',
  'retailplus': 'Consumer',
  'nordic-payments': 'Technology',
  'greenbox-logistics': 'Logistics',
  'medisupply': 'Healthcare',
  'aquatech': 'Cleantech',
  'printwave': 'Services',
  'urban-mobility': 'Transport',
  'foodlab': 'Consumer',
  'solarroof': 'Energy',
  'purewater': 'Cleantech',
  'circular-textiles': 'Consumer',
  'edugrow': 'Education',
  'agriloop': 'Agriculture',
  'windpeak': 'Energy',
  'cyberguard': 'Technology',
  'brightcare': 'Healthcare',
}

const fundShortName: Record<string, string> = Object.fromEntries(funds.map((f) => [f.id, f.shortName]))

// Convert an "MM-YYYY" entry date to an ISO date string
const toIsoDate = (mmYYYY: string) => {
  const [mm, yyyy] = mmYYYY.split('-')
  return yyyy && mm ? `${yyyy}-${mm.padStart(2, '0')}-01` : mmYYYY
}

// Portfolio companies derived from the shared mock-data (held + exited)
const existingCompanies = allCompanies.map((company) => ({
  id: company.id,
  name: company.name,
  fund: fundShortName[company.fundId] ?? company.fundId,
  sector: sectorMap[company.id] ?? 'Services',
  entryDate: toIsoDate(company.entryDate),
  sharePercent: company.valuation.exit.shareOrdinaryEquity ?? company.valuation.current.shareOrdinaryEquity ?? 0,
  status: company.exited ? 'X' : 'P',
  investment: company.valuation.current.investedValue || company.valuation.exit.investedValue,
  lifecycle: (company.exited ? 'Exited' : 'Active') as Lifecycle,
}))

const existingAddons = [
  { id: '1', name: 'LogiPack BV', parentCompany: 'GreenBox Logistics', acquisitionDate: '2023-06-15', value: 4.5, lifecycle: 'Active' as Lifecycle },
  { id: '2', name: 'SecureLayer Inc', parentCompany: 'CyberGuard', acquisitionDate: '2024-05-01', value: 3.2, lifecycle: 'Active' as Lifecycle },
  { id: '3', name: 'CareClinics BV', parentCompany: 'BrightCare', acquisitionDate: '2024-02-28', value: 8.0, lifecycle: 'In process' as Lifecycle },
  { id: '4', name: 'RoofMount GmbH', parentCompany: 'SolarRoof', acquisitionDate: '2024-01-15', value: 6.5, lifecycle: 'Reserved capital' as Lifecycle },
]

// Mock cap table data
const capTableData = [
  { shareholder: 'Alma Capital Fund IV', shares: 750000, percentage: 75, type: 'Ordinary' },
  { shareholder: 'Management Team', shares: 150000, percentage: 15, type: 'Ordinary' },
  { shareholder: 'Founders', shares: 80000, percentage: 8, type: 'Ordinary' },
  { shareholder: 'ESOP Pool', shares: 20000, percentage: 2, type: 'Options' },
]

export default function KeyDataPage() {
  const [newFundOpen, setNewFundOpen] = useState(false)
  const [newCompanyOpen, setNewCompanyOpen] = useState(false)
  const [newAddonOpen, setNewAddonOpen] = useState(false)
  const [capTableOpen, setCapTableOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<typeof existingCompanies[0] | null>(null)

  const handleCapTableClick = (company: typeof existingCompanies[0]) => {
    setSelectedCompany(company)
    setCapTableOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-[#2C2C2A]">Key Data</h1>
            <p className="text-[13px] text-[#6B6963]">Manage master data for funds, portfolio companies, and add-ons</p>
          </div>
          <Link href="/data-entry/periods">
            <Button
              variant="outline"
              className="gap-2 border-[#E8E6E0] bg-white text-[#2C2C2A] hover:bg-[#F7F6F3]"
            >
              <CalendarClock className="h-4 w-4" />
              Reporting Periods
            </Button>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex gap-3">
          <Dialog open={newFundOpen} onOpenChange={setNewFundOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1B4D45] hover:bg-[#163d38] text-white">
                <Plus className="mr-2 h-4 w-4" />
                New Fund
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#1B4D45]" />
                  Create New Fund
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Fund Name</label>
                    <Input placeholder="e.g. Alma Capital Fund VI" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Vintage Year</label>
                    <Input type="number" placeholder="2024" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Start Date</label>
                    <Input type="date" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">{"Total Fund Size (€M)"}</label>
                    <Input type="number" placeholder="200" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Strategy</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="growth">Growth Equity</SelectItem>
                        <SelectItem value="buyout">Buyout</SelectItem>
                        <SelectItem value="venture">Venture Capital</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Status</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fundraising">Fundraising</SelectItem>
                        <SelectItem value="investing">Investing</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="harvesting">Harvesting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B6963]">Management Fee (%)</label>
                  <Input type="number" step="0.1" placeholder="2.0" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B6963]">Carried Interest (%)</label>
                  <Input type="number" step="0.1" placeholder="20.0" className="mt-1" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setNewFundOpen(false)}>Cancel</Button>
                  <Button className="bg-[#B8975A] hover:bg-[#A68548] text-white" onClick={() => setNewFundOpen(false)}>
                    Create Fund
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={newCompanyOpen} onOpenChange={setNewCompanyOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1B4D45] hover:bg-[#163d38] text-white">
                <Plus className="mr-2 h-4 w-4" />
                New Portfolio Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#1B4D45]" />
                  Add Portfolio Company
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Company Name</label>
                    <Input placeholder="Company name" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Fund</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select fund" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingFunds.map(fund => (
                          <SelectItem key={fund.id} value={fund.id}>{fund.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Sector</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="energy">Energy</SelectItem>
                        <SelectItem value="consumer">Consumer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Entry Date</label>
                    <Input type="date" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">{"Investment (€M)"}</label>
                    <Input type="number" step="0.1" placeholder="15.0" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Share %</label>
                    <Input type="number" step="0.1" placeholder="75" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Status</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="P">Portfolio (P)</SelectItem>
                        <SelectItem value="X">Exited (X)</SelectItem>
                        <SelectItem value="W">Written Off (W)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Lifecycle</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select lifecycle" />
                      </SelectTrigger>
                      <SelectContent>
                        {lifecycleStatuses.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Country</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NL">Netherlands</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="BE">Belgium</SelectItem>
                        <SelectItem value="NO">Norway</SelectItem>
                        <SelectItem value="SE">Sweden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B6963]">Description</label>
                  <Input placeholder="Brief description of the company" className="mt-1" />
                </div>
                <div className="rounded-lg border border-dashed border-[#E5E4E0] bg-[#FAFAF8] p-4">
                  <div className="flex items-center gap-2 text-sm text-[#6B6963]">
                    <Users className="h-4 w-4" />
                    <span>Cap Table will be available after creating the company</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setNewCompanyOpen(false)}>Cancel</Button>
                  <Button className="bg-[#B8975A] hover:bg-[#A68548] text-white" onClick={() => setNewCompanyOpen(false)}>
                    Add Company
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={newAddonOpen} onOpenChange={setNewAddonOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#1B4D45] text-[#1B4D45] hover:bg-[#1B4D45]/5">
                <Plus className="mr-2 h-4 w-4" />
                New Add-on
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-[#1B4D45]" />
                  Add New Add-on Acquisition
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Add-on Name</label>
                    <Input placeholder="Company name" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Parent Company</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select parent" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingCompanies.map(company => (
                          <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">Acquisition Date</label>
                    <Input type="date" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#6B6963]">{"Enterprise Value (€M)"}</label>
                    <Input type="number" step="0.1" placeholder="5.0" className="mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B6963]">Lifecycle</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select lifecycle" />
                    </SelectTrigger>
                    <SelectContent>
                      {lifecycleStatuses.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B6963]">Strategic Rationale</label>
                  <Input placeholder="Brief description of strategic fit" className="mt-1" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setNewAddonOpen(false)}>Cancel</Button>
                  <Button className="bg-[#B8975A] hover:bg-[#A68548] text-white" onClick={() => setNewAddonOpen(false)}>
                    Add Add-on
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tables */}
        <div className="space-y-6">
          {/* Funds Table */}
          <Card className="border-[#E5E4E0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-[#2C2C2A] flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#1B4D45]" />
                Funds
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F5F3] border-y border-[#E5E4E0]">
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Fund Name</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Start Date</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963] text-right">{"Total Size (€M)"}</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Strategy</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Vintage</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {existingFunds.map((fund) => (
                    <TableRow key={fund.id} className="hover:bg-[#FAFAF8] cursor-pointer border-b border-[#E5E4E0]">
                      <TableCell className="text-sm font-medium text-[#2C2C2A]">{fund.name}</TableCell>
                      <TableCell className="text-sm text-[#6B6963]">{new Date(fund.startDate).toLocaleDateString('nl-NL')}</TableCell>
                      <TableCell className="text-sm text-[#2C2C2A] text-right font-medium">€ {fund.totalSize}M</TableCell>
                      <TableCell className="text-sm text-[#6B6963]">{fund.strategy}</TableCell>
                      <TableCell className="text-sm text-[#6B6963]">{fund.vintage}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          fund.status === 'Active' ? 'bg-green-50 text-green-700' :
                          fund.status === 'Investing' ? 'bg-blue-50 text-blue-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {fund.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Portfolio Companies Table */}
          <Card className="border-[#E5E4E0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-[#2C2C2A] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#1B4D45]" />
                Portfolio Companies
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F5F3] border-y border-[#E5E4E0]">
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Company</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Fund</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Sector</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Entry Date</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963] text-right">{"Investment (€M)"}</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963] text-right">Share %</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Status</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Lifecycle</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Cap Table</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {existingCompanies.map((company) => (
                    <TableRow key={company.id} className="hover:bg-[#FAFAF8] border-b border-[#E5E4E0]">
                      <TableCell className="text-sm font-medium text-[#2C2C2A]">{company.name}</TableCell>
                      <TableCell className="text-sm text-[#6B6963]">{company.fund}</TableCell>
                      <TableCell className="text-sm text-[#6B6963]">{company.sector}</TableCell>
                      <TableCell className="text-sm text-[#6B6963]">{new Date(company.entryDate).toLocaleDateString('nl-NL')}</TableCell>
                      <TableCell className="text-sm text-[#2C2C2A] text-right font-medium">€ {company.investment}M</TableCell>
                      <TableCell className="text-sm text-[#2C2C2A] text-right font-medium">{company.sharePercent}%</TableCell>
                      <TableCell>
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1B4D45] text-[10px] font-medium text-white">
                          {company.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${lifecycleBadge[company.lifecycle]}`}>
                          {company.lifecycle}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleCapTableClick(company)}
                          className="flex items-center gap-1 text-xs text-[#1B4D45] hover:underline"
                        >
                          <Users className="h-3 w-3" />
                          View
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add-ons Table */}
          <Card className="border-[#E5E4E0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-[#2C2C2A] flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-[#1B4D45]" />
                Add-on Acquisitions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F5F3] border-y border-[#E5E4E0]">
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Add-on Name</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Parent Company</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Acquisition Date</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963] text-right">{"Value (€M)"}</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Lifecycle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {existingAddons.map((addon) => (
                    <TableRow key={addon.id} className="hover:bg-[#FAFAF8] border-b border-[#E5E4E0]">
                      <TableCell className="text-sm font-medium text-[#2C2C2A]">{addon.name}</TableCell>
                      <TableCell className="text-sm text-[#6B6963]">{addon.parentCompany}</TableCell>
                      <TableCell className="text-sm text-[#6B6963]">{new Date(addon.acquisitionDate).toLocaleDateString('nl-NL')}</TableCell>
                      <TableCell className="text-sm text-[#2C2C2A] text-right font-medium">€ {addon.value}M</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${lifecycleBadge[addon.lifecycle]}`}>
                          {addon.lifecycle}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Cap Table Dialog */}
        <Dialog open={capTableOpen} onOpenChange={setCapTableOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#1B4D45]" />
                Cap Table - {selectedCompany?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="pt-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-[#6B6963]">
                  Total Share: <span className="font-medium text-[#2C2C2A]">{selectedCompany?.sharePercent}%</span>
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  <Plus className="mr-1 h-3 w-3" />
                  Upload Cap Table
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F5F3] border-y border-[#E5E4E0]">
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Shareholder</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963] text-right">Shares</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963] text-right">Percentage</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#6B6963]">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {capTableData.map((row, idx) => (
                    <TableRow key={idx} className="border-b border-[#E5E4E0]">
                      <TableCell className="text-sm font-medium text-[#2C2C2A]">{row.shareholder}</TableCell>
                      <TableCell className="text-sm text-[#2C2C2A] text-right">{row.shares.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-[#2C2C2A] text-right font-medium">{row.percentage}%</TableCell>
                      <TableCell className="text-sm text-[#6B6963]">{row.type}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-[#F5F5F3] font-medium">
                    <TableCell className="text-sm text-[#1B4D45]">Total</TableCell>
                    <TableCell className="text-sm text-[#1B4D45] text-right">1,000,000</TableCell>
                    <TableCell className="text-sm text-[#1B4D45] text-right">100%</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-4 rounded-lg border border-dashed border-[#E5E4E0] bg-[#FAFAF8] p-4">
                <p className="text-xs text-[#6B6963]">
                  Drag and drop a cap table file (Excel, CSV) here to import shareholder data, or click the button above to upload.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
