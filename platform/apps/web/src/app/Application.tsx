import { AppProviders } from "@app/providers/AppProviders";
import ApplicationRouter from "@app/router/ApplicationRouter";

export default function Application() {
  return (
    <AppProviders>
      <ApplicationRouter />
    </AppProviders>
  );
}
