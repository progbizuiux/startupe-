import { beginner } from "@/data/register";
import { PortalLayout } from "@/components/sections/portal-intro";
import { BeginnerForm } from "@/components/sections/beginner-form";

export const metadata = {
  title: "Register — The Beginner",
  description:
    "Register your early-stage startup or new micro-enterprise with Startup E for mentoring, compliance support and seed capital guidance.",
};

export default function BeginnerPage() {
  return (
    <PortalLayout portal={beginner}>
      <BeginnerForm />
    </PortalLayout>
  );
}
