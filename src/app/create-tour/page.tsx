import { redirect } from "next/navigation";

export default function CreateTourPage() {
  // Redirect to the correct custom tour request page
  // This fixes the fundamental issue identified in TOUR_FUNCTIONALITY_FIXES.md
  redirect("/request-custom-tour");
}
