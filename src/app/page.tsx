import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/site";

// Once authentication exists, this will route signed-in admins to the dashboard.
export default function HomePage() {
  redirect(ROUTES.login);
}
