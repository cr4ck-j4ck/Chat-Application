import { ProfileCard } from "@/components/Dashboard/profile-card"
import { BioCard } from "@/components/Dashboard/Bio-card"
import { FriendsList } from "@/components/Dashboard/Friends-list"
import { Link } from "react-router-dom"
import { MessageSquare, UserPlus2 } from "lucide-react"

export default function DashboardPage() {
  return (
    <main className="px-4 py-6 md:px-8 lg:px-12">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Your space</p>
        <div className="mt-1 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your profile, bio, friends, and account metadata.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/chat">
              <button className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                <MessageSquare className="size-4" />
                Open Chat
              </button>
            </Link>
            <a href="#friends">
              <button className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                <UserPlus2 className="size-4" />
                Manage Friends
              </button>
            </a>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-1">
          <ProfileCard />
        </div>

        <div className="space-y-6 md:col-span-2" id="friends">
          <BioCard />
          <FriendsList />
        </div>
      </section>
    </main>
  )
}
