"use client"
import * as React from "react"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table"
import { quotes } from "@/data/data"
import { cx } from "@/lib/utils"
import { Download, Lock } from "lucide-react"
import { Fragment } from "react"
import { useProfile } from "@/lib/ProfileContext"

const colorClasses = [
  "bg-blue-500 dark:bg-blue-500",
  "bg-purple-500 dark:bg-purple-500",
  "bg-emerald-500 dark:bg-emerald-500",
  "bg-cyan-500 dark:bg-cyan-500",
  "bg-rose-500 dark:bg-rose-500",
  "bg-indigo-500 dark:bg-indigo-500",
]

const getRandomColor = (initials: string) => {
  const seed = initials
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colorClasses[seed % colorClasses.length]
}

export default function Overview() {
  const { currentProfile, profiles } = useProfile()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedAssignee, setSelectedAssignee] = React.useState("all")

  const isViewer = currentProfile.role === "Viewer"
  const isAuditor = currentProfile.role === "Auditor"
  const isRestricted = isViewer || isAuditor

  // Enforce filter if Viewer
  const activeAssignee = isViewer ? currentProfile.name : selectedAssignee

  const filteredQuotes = React.useMemo(() => {
    return quotes
      .map((regionGroup) => {
        const matchingProjects = regionGroup.project.filter((proj) => {
          // 1. Filter by assignee
          const matchesAssignee =
            activeAssignee === "all" ||
            proj.assigned.some((a) => a.name === activeAssignee)

          // 2. Filter by search query
          const matchesSearch =
            proj.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proj.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proj.assigned.some((a) =>
              a.name.toLowerCase().includes(searchQuery.toLowerCase())
            )

          return matchesAssignee && matchesSearch
        })

        return {
          ...regionGroup,
          project: matchingProjects,
        }
      })
      .filter((regionGroup) => regionGroup.project.length > 0)
  }, [searchQuery, activeAssignee])

  return (
    <section aria-label="Overview Table">
      <div className="flex flex-col justify-between gap-2 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
        <Input
          type="search"
          placeholder={isViewer ? "Search my quotes..." : "Search quotes..."}
          className="sm:w-64 [&>input]:py-1.5"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <Select
            value={isViewer ? currentProfile.id : (profiles.find((p) => p.name === selectedAssignee)?.id || "all")}
            onValueChange={(val) => {
              if (val === "all") {
                setSelectedAssignee("all")
              } else {
                const matched = profiles.find((p) => p.id === val)
                if (matched) setSelectedAssignee(matched.name)
              }
            }}
            disabled={isViewer}
          >
            <SelectTrigger className="w-full py-1.5 sm:w-44">
              <SelectValue placeholder="Assigned to..." />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All Assignees</SelectItem>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            className="w-full gap-2 py-1.5 text-base sm:w-fit sm:text-sm"
            disabled={isRestricted}
          >
            {isRestricted ? (
              <>
                <Lock className="-ml-0.5 size-4 shrink-0 text-gray-400 dark:text-gray-600" aria-hidden="true" />
                Export Locked
              </>
            ) : (
              <>
                <Download
                  className="-ml-0.5 size-4 shrink-0 text-gray-400 dark:text-gray-600"
                  aria-hidden="true"
                />
                Export
              </>
            )}
          </Button>
        </div>
      </div>
      <TableRoot className="border-t border-gray-200 dark:border-gray-800">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Company</TableHeaderCell>
              <TableHeaderCell>Deal Size</TableHeaderCell>
              <TableHeaderCell>Win Probability</TableHeaderCell>
              <TableHeaderCell>Project Duration</TableHeaderCell>
              <TableHeaderCell>Assigned</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQuotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No quotes found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotes.map((quote) => (
                <Fragment key={quote.region}>
                  <TableRow>
                    <TableHeaderCell
                      scope="colgroup"
                      colSpan={6}
                      className="bg-gray-50 py-3 pl-4 sm:pl-6 dark:bg-gray-900"
                    >
                      {quote.region}
                      <span className="ml-2 font-medium text-gray-600 dark:text-gray-400">
                        {quote.project.length}
                      </span>
                    </TableHeaderCell>
                  </TableRow>
                  {quote.project.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.company}</TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell>{item.probability}</TableCell>
                      <TableCell>{item.duration}</TableCell>
                      <TableCell>
                        <div className="flex -space-x-1 overflow-hidden">
                          {item.assigned.map((name, nameIndex) => (
                            <span
                              key={nameIndex}
                              className={cx(
                                getRandomColor(name.initials),
                                "inline-flex size-5 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-white dark:text-white dark:ring-[#090E1A]",
                              )}
                              title={name.name}
                            >
                              {name.initials}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "Closed"
                              ? "success"
                              : item.status === "Drafted"
                                ? "neutral"
                                : item.status === "Sent"
                                  ? "default"
                                  : "default"
                          }
                          className="rounded-full"
                        >
                          <span
                            className={cx(
                              "size-1.5 shrink-0 rounded-full",
                              "bg-gray-500 dark:bg-gray-500",
                              {
                                "bg-emerald-600 dark:bg-emerald-400":
                                  item.status === "Closed",
                              },
                              {
                                "bg-gray-500 dark:bg-gray-500":
                                  item.status === "Drafted",
                              },
                              {
                                "bg-blue-500 dark:bg-blue-500":
                                  item.status === "Sent",
                              },
                            )}
                            aria-hidden="true"
                          />
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableRoot>
    </section>
  )
}
