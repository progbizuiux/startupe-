import { beginner, registration } from "@/data/register";
import { PortalLayout } from "@/components/sections/portal-intro";
import { BeginnerForm } from "@/components/sections/beginner-form";
import { RegistrationClosed } from "@/components/sections/registration-closed";

export const metadata = {
  title: "Register — The Beginner",
  description:
    "Register your early-stage startup or new micro-enterprise with Startup E+ for mentoring, compliance support and seed capital guidance.",
  alternates: { canonical: "/register/beginner" },
};

export default function BeginnerPage() {
  return (
    <PortalLayout portal={beginner}>
      {/* One switch in src/data/register.js, so reopening is a one-line change
          and the form below is never edited to close it. */}
      {registration.paused ? <RegistrationClosed /> : <BeginnerForm />}
    </PortalLayout>
  );
}
