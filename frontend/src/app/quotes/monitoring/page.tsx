"use client"
import * as React from "react"
import { BarChart } from "@/components/BarChart"
import { Button } from "@/components/Button"
import { ComboChart } from "@/components/ComboChart"
import { ConditionalBarChart } from "@/components/ConditionalBarChart"
import {
  CustomTooltip,
  CustomTooltip2,
  CustomTooltip3,
  CustomTooltip4,
} from "@/components/CustomTooltips"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select"
import { dataChart, dataChart2, dataChart3, dataChart4 } from "@/data/data"
import { formatters, cx } from "@/lib/utils"
import { SlidersHorizontal, Lock } from "lucide-react"
import { useProfile } from "@/lib/ProfileContext"

export default function Monitoring() {
  const { currentProfile } = useProfile()

  const isViewer = currentProfile.role === "Viewer"
  const isAuditor = currentProfile.role === "Auditor"

  if (isViewer) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center border-t border-gray-200 dark:border-gray-800">
        <span className="flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 mb-4">
          <Lock className="size-6" />
        </span>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Access Denied</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          The Monitoring dashboard is restricted to Admin, Manager, and Auditor roles. Please switch your profile to access this content.
        </p>
      </div>
    )
  }

  return (
    <section aria-label="App Monitoring">
      <div className="flex flex-col items-center justify-between gap-2 p-6 sm:flex-row">
        <Select defaultValue="365-days">
          <SelectTrigger className="py-1.5 sm:w-44">
            <SelectValue placeholder="Assigned to..." />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="30-days">Last 30 days</SelectItem>
            <SelectItem value="90-days">Last 90 days</SelectItem>
            <SelectItem value="180-days">Last 180 days</SelectItem>
            <SelectItem value="365-days">Last 365 days</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          className="w-full gap-2 py-1.5 text-base sm:w-fit sm:text-sm"
        >
          <SlidersHorizontal
            className="-ml-0.5 size-4 shrink-0 text-gray-400 dark:text-gray-600"
            aria-hidden="true"
          />
          Report Filters
        </Button>
      </div>
      <dl className="grid grid-cols-1 gap-x-14 gap-y-10 border-t border-gray-200 p-6 md:grid-cols-2 dark:border-gray-800">
        {/* Chart 1: Inherent Risk */}
        <div className="flex flex-col justify-between p-0">
          <div>
            <dt className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              Inherent risk
            </dt>
            <dd className="mt-0.5 text-sm/6 text-gray-500 dark:text-gray-500">
              Risk scenarios over time grouped by risk level
            </dd>
          </div>
          <BarChart
            data={dataChart}
            index="date"
            categories={["Current year", "Same period last year"]}
            colors={["blue", "lightGray"]}
            yAxisWidth={45}
            customTooltip={CustomTooltip}
            yAxisLabel="Number of inherent risks"
            barCategoryGap="20%"
            valueFormatter={(value) => formatters.unit(value)}
            className="mt-4 hidden h-60 md:block"
          />
          <BarChart
            data={dataChart}
            index="date"
            categories={["Current year", "Same period last year"]}
            colors={["blue", "lightGray"]}
            showYAxis={false}
            customTooltip={CustomTooltip}
            barCategoryGap="20%"
            className="mt-4 h-60 md:hidden"
          />
        </div>

        {/* Chart 2: Quote-to-Deal ratio (Financial - restricted to Auditors) */}
        <div className="relative flex flex-col justify-between">
          <div>
            <dt className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              Quote-to-Deal ratio
            </dt>
            <dd className="mt-0.5 text-sm/6 text-gray-500 dark:text-gray-500">
              Number of quotes compared to total deal size for given month
            </dd>
          </div>
          <div className={cx(isAuditor && "blur-[3px] select-none pointer-events-none")}>
            <ComboChart
              data={dataChart2}
              index="date"
              enableBiaxial={true}
              barSeries={{
                categories: ["Quotes"],
                yAxisLabel: "Number of quotes / Deal size ($)",
                valueFormatter: (value) =>
                  formatters.currency({ number: value, maxFractionDigits: 0 }),
              }}
              lineSeries={{
                categories: ["Total deal size"],
                colors: ["lightGray"],
                showYAxis: false,
              }}
              customTooltip={CustomTooltip2}
              className="mt-4 hidden h-60 md:block"
            />
            <ComboChart
              data={dataChart2}
              index="date"
              enableBiaxial={true}
              barSeries={{
                categories: ["Quotes"],
                showYAxis: false,
              }}
              lineSeries={{
                categories: ["Total deal size"],
                colors: ["lightGray"],
                showYAxis: false,
              }}
              customTooltip={CustomTooltip2}
              className="mt-4 h-60 md:hidden"
            />
          </div>
          {isAuditor && (
            <div className="absolute inset-x-0 bottom-0 top-12 z-10 flex flex-col items-center justify-center bg-white/60 dark:bg-gray-950/60 backdrop-blur-[2px] rounded-lg border border-gray-100 dark:border-gray-800/50">
              <Lock className="size-6 text-gray-400 dark:text-gray-600 mb-2" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">Restricted Data</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[220px] text-center">
                Financial metrics are hidden for the Auditor role.
              </span>
            </div>
          )}
        </div>

        {/* Chart 3: ESG impact */}
        <div className="flex flex-col justify-between">
          <div>
            <dt className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              ESG impact
            </dt>
            <dd className="mt-0.5 text-sm/6 text-gray-500 dark:text-gray-500">
              Evaluation of addressed ESG criteria in biddings over time
            </dd>
          </div>
          <BarChart
            data={dataChart3}
            index="date"
            categories={["Addressed", "Unrealized"]}
            colors={["emerald", "lightEmerald"]}
            customTooltip={CustomTooltip3}
            type="percent"
            yAxisWidth={55}
            yAxisLabel="% of criteria addressed"
            barCategoryGap="30%"
            className="mt-4 hidden h-60 md:block"
          />
          <BarChart
            data={dataChart3}
            index="date"
            categories={["Addressed", "Unrealized"]}
            colors={["emerald", "lightEmerald"]}
            customTooltip={CustomTooltip3}
            showYAxis={false}
            type="percent"
            barCategoryGap="30%"
            className="mt-4 h-60 md:hidden"
          />
        </div>

        {/* Chart 4: Bidder density */}
        <div className="flex flex-col justify-between">
          <div>
            <dt className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              Bidder density
            </dt>
            <dd className="mt-0.5 text-sm/6 text-gray-500 dark:text-gray-500">
              Competition level measured by number and size of bidders over time
            </dd>
          </div>
          <ConditionalBarChart
            data={dataChart4}
            index="date"
            categories={["Density"]}
            colors={["orange"]}
            customTooltip={CustomTooltip4}
            valueFormatter={(value) =>
              formatters.percentage({ number: value, decimals: 0 })
            }
            yAxisWidth={55}
            yAxisLabel="Competition density (%)"
            barCategoryGap="30%"
            className="mt-4 hidden h-60 md:block"
          />
          <ConditionalBarChart
            data={dataChart4}
            index="date"
            categories={["Density"]}
            colors={["orange"]}
            customTooltip={CustomTooltip4}
            valueFormatter={(value) =>
              formatters.percentage({ number: value, decimals: 0 })
            }
            showYAxis={false}
            barCategoryGap="30%"
            className="mt-4 h-60 md:hidden"
          />
        </div>
      </dl>
    </section>
  )
}
