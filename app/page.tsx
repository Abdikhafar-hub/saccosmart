import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to landing page instead of login
  redirect("/landing")
}
