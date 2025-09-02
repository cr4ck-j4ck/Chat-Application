"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { motion } from "framer-motion"

export function BioCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card>
        <CardHeader>
          <CardTitle>Bio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            Passionate about building real-time chat experiences. Coffee lover, part-time gamer, and always up for a
            good conversation on Gufta-Gu.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => toast("Bio editor coming soon.")}
          >
            Edit Bio
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
