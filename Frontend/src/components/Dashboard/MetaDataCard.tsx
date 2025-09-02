"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, MessageSquare, Users } from "lucide-react"
import { motion } from "framer-motion"

const items = [
  { label: "Member since", value: "Jan 2024", icon: CalendarDays },
  { label: "Last active", value: "5 mins ago", icon: Clock },
  { label: "Total friends", value: "128", icon: Users },
  { label: "Messages sent", value: "8,421", icon: MessageSquare },
]

export function MetadataCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Self Metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3">
          {items.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-primary" />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
