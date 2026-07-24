import { Outlet } from "react-router-dom";

/**
 * Shared layout for all public-facing pages.
 *
 * This layout provides a consistent visual foundation for pages that
 * do not require user authentication, such as the landing page,
 * login, and registration screens.
 *
 * Public pages intentionally share the application's colour palette
 * and typography to provide a seamless transition into the
 * authenticated inventory management experience.
 */
const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Shared public navigation can be rendered here when required. */}
      {/* <LandingNavbar /> */}

      {/* Renders the active public route. */}
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;