import { aspirant } from "@/data/register";
import { PortalLayout } from "@/components/sections/portal-intro";
import { AspirantForm } from "@/components/sections/aspirant-form";

export const metadata = {
  title: "Register — The Aspirant",
  description:
    "Register with Startup E+ if you have an idea or want to start a business but have not registered an entity yet.",
};

export default function AspirantPage() {
  return (
    <PortalLayout portal={aspirant}>
      <AspirantForm />
    </PortalLayout>
  );
}
