import { Outlet } from "react-router-dom";

/**
 * Provides the shared layout for public-facing pages.
 *
 * Public pages use a separate navigation experience from the
 * authenticated inventory-management dashboard.
 */
const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <LandingNavbar /> */}

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;