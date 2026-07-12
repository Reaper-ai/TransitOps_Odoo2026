"use client"
import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/Accordion"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { sections } from "@/data/data"
import { RiCheckboxCircleFill, RiErrorWarningFill } from "@remixicon/react"
import { Link, SlidersHorizontal, Lock } from "lucide-react"
import { useProfile } from "@/lib/ProfileContext"
import { cx } from "@/lib/utils"

const getStatusIcon = (status: string) => {
  if (status === "complete") {
    return (
      <RiCheckboxCircleFill className="size-[18px] shrink-0 text-emerald-600 dark:text-emerald-400" />
    )
  }
  return (
    <RiErrorWarningFill className="size-[18px] shrink-0 text-red-600 dark:text-red-400" />
  )
}

export default function Audits() {
  const { currentProfile } = useProfile()
  const [searchQuery, setSearchQuery] = React.useState("")

  const isViewer = currentProfile.role === "Viewer"

  const filteredSections = React.useMemo(() => {
    if (!searchQuery) return sections
    return sections.filter((section) => {
      const matchesTitle = section.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCertified = section.certified.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesAuditor = section.auditDates.some(audit =>
        audit.auditor.toLowerCase().includes(searchQuery.toLowerCase())
      )
      const matchesDocument = section.documents.some(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      return matchesTitle || matchesCertified || matchesAuditor || matchesDocument
    })
  }, [searchQuery])

  return (
    <section aria-label="Audits overview">
      <div className="flex flex-col items-center justify-between gap-2 p-6 sm:flex-row">
        <Input
          type="search"
          placeholder="Search audits..."
          className="sm:w-64 [&>input]:py-1.5"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          variant="secondary"
          className="w-full gap-2 py-1.5 text-base sm:w-fit sm:text-sm"
        >
          <SlidersHorizontal
            className="-ml-0.5 size-4 shrink-0 text-gray-400 dark:text-gray-600"
            aria-hidden="true"
          />
          Filters
        </Button>
      </div>
      <div className="border-t border-gray-200 px-6 pb-6 dark:border-gray-800">
        {filteredSections.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No audits found matching your search.
          </div>
        ) : (
          <Accordion type="multiple" className="mt-3">
            {filteredSections.map((section) => {
              const hasUserAudited = section.auditDates.some(
                (audit) => audit.auditor === currentProfile.name
              )

              return (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="py-5">
                    <p className="flex w-full items-center justify-between pr-4">
                      <span className="flex items-center gap-2.5">
                        <span className="font-semibold text-gray-900 dark:text-gray-50">{section.title}</span>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-400/10 dark:text-gray-300">
                          {section.certified}
                        </span>
                        {hasUserAudited && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 border border-blue-200/50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50 ml-1">
                            Your Audit
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-x-2 tabular-nums">
                        {getStatusIcon(section.status)}
                        {section.progress.current}/{section.progress.total}
                      </span>
                    </p>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-2 grid grid-cols-1 gap-8 md:grid-cols-2">
                      <div>
                        <p className="flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-gray-50">
                          <span>Audit round</span>
                          <span>Auditor</span>
                        </p>
                        <ul className="mt-1 divide-y divide-gray-200 text-sm text-gray-600 dark:divide-gray-800 dark:text-gray-400">
                          {section.auditDates.map((audit, index) => {
                            const isMe = audit.auditor === currentProfile.name
                            return (
                              <li
                                key={index}
                                className={cx(
                                  "flex items-center justify-between py-2.5",
                                  isMe && "text-blue-600 dark:text-blue-400 font-semibold"
                                )}
                              >
                                <span>{audit.date}</span>
                                <span>
                                  {audit.auditor} {isMe && "(You)"}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                      <div>
                        <p className="flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-gray-50">
                          <span>Related documents</span>
                          <span>Status</span>
                        </p>
                        <ul className="mt-1 divide-y divide-gray-200 text-gray-600 dark:divide-gray-800 dark:text-gray-400">
                          {section.documents.map((doc, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between py-2.5 text-sm"
                            >
                              <a
                                href="#"
                                className="flex items-center gap-2 text-blue-500 hover:underline hover:underline-offset-4 dark:text-blue-500"
                              >
                                <Link
                                  className="size-4 shrink-0"
                                  aria-hidden="true"
                                />
                                {doc.name}
                              </a>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isViewer}
                                  className={cx(
                                    "flex items-center gap-1 hover:text-gray-900 hover:underline hover:underline-offset-4 hover:dark:text-gray-50",
                                    isViewer && "opacity-40 cursor-not-allowed pointer-events-none"
                                  )}
                                >
                                  {isViewer && <Lock className="size-3" />}
                                  Edit
                                </button>
                                <span
                                  className="h-4 w-px bg-gray-300 dark:bg-gray-700"
                                  aria-hidden="true"
                                />
                                <button
                                  type="button"
                                  disabled={isViewer}
                                  className={cx(
                                    "flex items-center gap-1 hover:text-gray-900 hover:underline hover:underline-offset-4 hover:dark:text-gray-50",
                                    isViewer && "opacity-40 cursor-not-allowed pointer-events-none"
                                  )}
                                >
                                  {isViewer && <Lock className="size-3" />}
                                  Re-Upload
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </div>
    </section>
  )
}
