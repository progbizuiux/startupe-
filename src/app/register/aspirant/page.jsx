import { aspirant, registration } from "@/data/register";
import { PortalLayout } from "@/components/sections/portal-intro";
import { AspirantForm } from "@/components/sections/aspirant-form";
import { RegistrationClosed } from "@/components/sections/registration-closed";

export const metadata = {
  title: "Register — The Aspirant",
  description:
    "Register with Startup E+ if you have an idea or want to start a business but have not registered an entity yet.",
  alternates: { canonical: "/register/aspirant" },
};

export default function AspirantPage() {
  return (
    <PortalLayout portal={aspirant}>
      {/* One switch in src/data/register.js, so reopening is a one-line change
          and the form below is never edited to close it. */}
      {registration.paused ? <RegistrationClosed /> : <AspirantForm />}
    </PortalLayout>
  );
}
