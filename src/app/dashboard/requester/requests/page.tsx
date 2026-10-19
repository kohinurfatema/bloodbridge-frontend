import { redirect } from "next/navigation";

// The request list lives on the requester overview; this keeps the breadcrumb link working.
export default function RequestsIndexPage() {
  redirect("/dashboard/requester");
}
