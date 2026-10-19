import type { Metadata } from "next";
import { ClockIcon, HeartHandshakeIcon, ShieldCheckIcon } from "lucide-react";

import { CreateRequestForm } from "@/components/requester/create-request-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "New blood request — BloodBridge" };

const STEPS = [
  { icon: ClockIcon, title: "Post your request", text: "Emergency requests raise an alert for our admin team." },
  { icon: HeartHandshakeIcon, title: "We match a donor", text: "Admins match an available donor with the same blood type." },
  { icon: ShieldCheckIcon, title: "Donor confirms", text: "You'll see the donor's contact once they accept." },
];

// Server Component shell — only the form itself is a Client Component.
export default function NewRequestPage() {
  return (
    <>
      <PageHeader
        title="New blood request"
        description="Tell donors what you need. Accurate details lead to faster matches."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CreateRequestForm />
        </div>
        <aside className="order-first lg:order-last">
          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {STEPS.map(({ icon: Icon, title, text }, i) => (
                  <li key={title} className="flex gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {i + 1}. {title}
                      </p>
                      <p className="text-sm text-muted-foreground">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
