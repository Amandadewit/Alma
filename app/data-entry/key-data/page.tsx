"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Building2, Briefcase, GitBranch, ChevronRight, Pencil, CalendarClock } from "lucide-react"
import Link from "next/link"
import { funds, companies as allCompanies } from "@/lib/mock-data"
import { lifecycleStatuses, sectorMap, existingAddons, type Lifecycle } from "@/lib/company-master-data"

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

const lifecycleBadge: Record<Lifecycle, string> = {
  'Active': 'bg-green-50 text-green-700',
  'Exited': 'bg-gray-100 text-gray-500',
  'Reserved capital': 'bg-blue-50 text-blue-700',
  'Identified': 'bg-gray-100 text-gray-600',
  'In process': 'bg-amber-50 text-amber-700',
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

export default function KeyDataPage() {
  const [newFundOpen, setNewFundOpen] = useState(false)
  const [newCompanyOpen, setNewCompanyOpen] = useState(false)
  const [newAddonOpen, setNewAddonOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface-2">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-ink">Key Data</h1>
            <p className="text-[13px] text-ink-2">Manage master data for funds, portfolio companies, and add-ons</p>
          </div>
          <Link href="/data-entry/periods">
            <Button
              variant="outline"
              className="gap-2 border-line bg-white text-ink hover:bg-bg"
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
              <Button className="bg-brand hover:bg-action-hover text-white">
                <Plus className="mr-2 h-4 w-4" />
                New Fund
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-brand" />
                  Create New Fund
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-ink-2">Fund Name</label>
                    <Input placeholder="e.g. Alma Capital Fund VI" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-2">Vintage Year</label>
                    <Input type="number" placeholder="2024" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-ink-2">Start Date</label>
                    <Input type="date" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-2">{"Total Fund Size (€M)"}</label>
                    <Input type="number" placeholder="200" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-ink-2">Strategy</label>
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
                    <label className="text-xs font-medium text-ink-2">Status</label>
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
                  <label className="text-xs font-medium text-ink-2">Management Fee (%)</label>
                  <Input type="number" step="0.1" placeholder="2.0" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-2">Carried Interest (%)</label>
                  <Input type="number" step="0.1" placeholder="20.0" className="mt-1" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setNewFundOpen(false)}>Cancel</Button>
                  <Button className="bg-action hover:bg-action-hover text-on-action" onClick={() => setNewFundOpen(false)}>
                    Create Fund
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={newCompanyOpen} onOpenChange={setNewCompanyOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand hover:bg-action-hover text-white">
                <Plus className="mr-2 h-4 w-4" />
                New Portfolio Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-brand" />
                  Add Portfolio Company
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-ink-2">Company Name</label>
                    <Input placeholder="Company name" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-2">Fund</label>
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
                    <label className="text-xs font-medium text-ink-2">Sector</label>
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
                    <label className="text-xs font-medium text-ink-2">Entry Date</label>
                    <Input type="date" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-ink-2">{"Investment (€M)"}</label>
                    <Input type="number" step="0.1" placeholder="15.0" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-2">Share %</label>
                    <Input type="number" step="0.1" placeholder="75" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-ink-2">Status</label>
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
                    <label className="text-xs font-medium text-ink-2">Lifecycle</label>
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
                    <label className="text-xs font-medium text-ink-2">Country</label>
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
                  <label className="text-xs font-medium text-ink-2">Description</label>
                  <Input placeholder="Brief description of the company" className="mt-1" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setNewCompanyOpen(false)}>Cancel</Button>
                  <Button className="bg-action hover:bg-action-hover text-on-action" onClick={() => setNewCompanyOpen(false)}>
                    Add Company
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={newAddonOpen} onOpenChange={setNewAddonOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-brand text-brand hover:bg-brand/5">
                <Plus className="mr-2 h-4 w-4" />
                New Add-on
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-brand" />
                  Add New Add-on Acquisition
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-ink-2">Add-on Name</label>
                    <Input placeholder="Company name" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-2">Parent Company</label>
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
                    <label className="text-xs font-medium text-ink-2">Acquisition Date</label>
                    <Input type="date" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-2">{"Enterprise Value (€M)"}</label>
                    <Input type="number" step="0.1" placeholder="5.0" className="mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-2">Lifecycle</label>
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
                  <label className="text-xs font-medium text-ink-2">Strategic Rationale</label>
                  <Input placeholder="Brief description of strategic fit" className="mt-1" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setNewAddonOpen(false)}>Cancel</Button>
                  <Button className="bg-action hover:bg-action-hover text-on-action" onClick={() => setNewAddonOpen(false)}>
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
          <Card className="border-line">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-ink flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-brand" />
                Funds
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-bg border-y border-line">
                    <TableHead className="text-[11px] font-medium text-ink-2">Fund Name</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2">Start Date</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2 text-right">{"Total Size (€M)"}</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2">Strategy</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2">Vintage</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {existingFunds.map((fund) => (
                    <TableRow key={fund.id} className="hover:bg-surface-2 cursor-pointer border-b border-line">
                      <TableCell className="text-sm font-medium text-ink">{fund.name}</TableCell>
                      <TableCell className="text-sm text-ink-2">{new Date(fund.startDate).toLocaleDateString('nl-NL')}</TableCell>
                      <TableCell className="text-sm text-ink text-right font-medium">€ {fund.totalSize}M</TableCell>
                      <TableCell className="text-sm text-ink-2">{fund.strategy}</TableCell>
                      <TableCell className="text-sm text-ink-2">{fund.vintage}</TableCell>
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
          <Card className="border-line">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-ink flex items-center gap-2">
                <Building2 className="h-4 w-4 text-brand" />
                Portfolio Companies
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-bg border-y border-line">
                    <TableHead className="text-[11px] font-medium text-ink-2">Company</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2">Fund</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2">Sector</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2">Entry Date</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2 text-right">{"Investment (€M)"}</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2 text-right">Share %</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2">Status</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2">Lifecycle</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2 text-right">Company data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {existingCompanies.map((company) => (
                    <TableRow key={company.id} className="hover:bg-surface-2 border-b border-line">
                      <TableCell className="text-sm font-medium text-ink"><Link href={`/data-entry/key-data/${company.id}`} className="hover:text-brand hover:underline">{company.name}</Link></TableCell>
                      <TableCell className="text-sm text-ink-2">{company.fund}</TableCell>
                      <TableCell className="text-sm text-ink-2">{company.sector}</TableCell>
                      <TableCell className="text-sm text-ink-2">{new Date(company.entryDate).toLocaleDateString('nl-NL')}</TableCell>
                      <TableCell className="text-sm text-ink text-right font-medium">€ {company.investment}M</TableCell>
                      <TableCell className="text-sm text-ink text-right font-medium">{company.sharePercent}%</TableCell>
                      <TableCell>
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-medium text-white">
                          {company.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${lifecycleBadge[company.lifecycle]}`}>
                          {company.lifecycle}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/data-entry/key-data/${company.id}?adjust=1`}
                          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-brand hover:bg-bg"
                        >
                          <Pencil className="h-3 w-3" />
                          Adjust
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add-ons Table */}
          <Card className="border-line">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-ink flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-brand" />
                Add-on Acquisitions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-bg border-y border-line">
                    <TableHead className="text-[11px] font-medium text-ink-2">Add-on Name</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2">Parent Company</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2">Acquisition Date</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2 text-right">{"Value (€M)"}</TableHead>
                    <TableHead className="text-[11px] font-medium text-ink-2">Lifecycle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {existingAddons.map((addon) => (
                    <TableRow key={addon.id} className="hover:bg-surface-2 border-b border-line">
                      <TableCell className="text-sm font-medium text-ink">{addon.name}</TableCell>
                      <TableCell className="text-sm text-ink-2">{addon.parentCompany}</TableCell>
                      <TableCell className="text-sm text-ink-2">{new Date(addon.acquisitionDate).toLocaleDateString('nl-NL')}</TableCell>
                      <TableCell className="text-sm text-ink text-right font-medium">€ {addon.value}M</TableCell>
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
      </div>
    </div>
  )
}
