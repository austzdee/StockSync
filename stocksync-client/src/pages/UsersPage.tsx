import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/contexts/useAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import {
  getUsers,
  updateUserRole,
  type User,
  type UserRole,
} from "@/services/userService";

/**
 * Displays the administrator user-management workspace.
 *
 * The page retrieves registered users and allows administrators
 * to update role assignments. The signed-in administrator cannot
 * demote their own account.
 */
const UsersPage = () => {
  const { user: authenticatedUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [roleSelections, setRoleSelections] = useState<
    Record<number, UserRole>
  >({});
  const [updatingUserId, setUpdatingUserId] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);
  const [actionError, setActionError] = useState<
    string | null
  >(null);
  const [actionMessage, setActionMessage] = useState<
    string | null
  >(null);

  /**
   * Retrieves the latest registered-user list from the API.
   *
   * Loading and error state are reset before each request so the
   * function can support manual retry after a failed request.
   */
  const loadUsers = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    setActionError(null);
    setActionMessage(null);

    try {
      const registeredUsers = await getUsers();
      setUsers(registeredUsers);
      setRoleSelections({});
    } catch (error: unknown) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to load registered users.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Loads users when the administration page is first opened.
   *
   * The request completes asynchronously before React state is
   * updated, avoiding synchronous state changes inside the effect.
   */
  useEffect(() => {
    let isCancelled = false;

    const fetchInitialUsers = async (): Promise<void> => {
      try {
        const registeredUsers = await getUsers();

        if (!isCancelled) {
          setUsers(registeredUsers);
        }
      } catch (error: unknown) {
        if (!isCancelled) {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "Unable to load registered users.",
            ),
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchInitialUsers();

    return () => {
      isCancelled = true;
    };
  }, []);

  /**
   * Stores a pending role selection without changing the backend
   * until the administrator confirms the update.
   */
  const handleRoleSelection = (
    userId: number,
    role: UserRole,
  ): void => {
    setRoleSelections((currentSelections) => ({
      ...currentSelections,
      [userId]: role,
    }));

    setActionError(null);
    setActionMessage(null);
  };

  /**
   * Persists a selected role and updates the corresponding table
   * row with the user returned by the backend.
   */
  const handleRoleUpdate = async (
    selectedUser: User,
  ): Promise<void> => {
    const selectedRole =
      roleSelections[selectedUser.id] ?? selectedUser.role;

    /**
     * The backend also enforces this rule, but preventing the action
     * in the interface gives the administrator immediate feedback.
     */
    if (
      authenticatedUser?.id === selectedUser.id &&
      selectedRole !== selectedUser.role
    ) {
      setActionError(
        "You cannot change the role of your own active account.",
      );

      return;
    }

    setUpdatingUserId(selectedUser.id);
    setActionError(null);
    setActionMessage(null);

    try {
      const updatedUser = await updateUserRole(
        selectedUser.id,
        selectedRole,
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        ),
      );

      setRoleSelections((currentSelections) => {
        const nextSelections = { ...currentSelections };
        delete nextSelections[selectedUser.id];

        return nextSelections;
      });

      setActionMessage(
        `${updatedUser.fullName}'s role was updated to ${updatedUser.role}.`,
      );
    } catch (error: unknown) {
      setActionError(
        getApiErrorMessage(
          error,
          `Unable to update ${selectedUser.fullName}'s role.`,
        ),
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <DashboardLayout>
      <section
        className="space-y-6"
        aria-labelledby="user-administration-heading"
      >
        <header>
          <h1
            id="user-administration-heading"
            className="text-2xl font-semibold text-slate-100"
          >
            User Administration
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            View registered StockSync users and manage their
            assigned roles.
          </p>
        </header>

        {actionMessage && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl border border-emerald-900/70 bg-emerald-950/40 p-4 text-sm font-medium text-emerald-200"
          >
            {actionMessage}
          </div>
        )}

        {actionError && (
          <div
            role="alert"
            className="rounded-xl border border-red-900/70 bg-red-950/40 p-4 text-sm font-medium text-red-200"
          >
            {actionError}
          </div>
        )}

        {isLoading && (
          <div
            className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            aria-live="polite"
            aria-busy="true"
          >
            <p className="text-sm text-slate-300">
              Loading registered users...
            </p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-red-900/70 bg-red-950/40 p-6"
          >
            <p className="font-medium text-red-200">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => void loadUsers()}
              className="mt-4 rounded-lg border border-red-800 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading &&
          !errorMessage &&
          users.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="font-semibold text-slate-100">
                No users found
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                There are currently no registered StockSync users
                to display.
              </p>
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          users.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="border-b border-slate-800 px-5 py-4">
                <h2 className="font-semibold text-slate-100">
                  Registered users
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {users.length}{" "}
                  {users.length === 1 ? "user" : "users"}{" "}
                  registered
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <caption className="sr-only">
                    Registered StockSync users and assigned roles
                  </caption>

                  <thead className="bg-slate-950/60">
                    <tr>
                      <th
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
                      >
                        Name
                      </th>

                      <th
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
                      >
                        Email
                      </th>

                      <th
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
                      >
                        Current role
                      </th>

                      <th
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
                      >
                        Change role
                      </th>

                      <th
                        scope="col"
                        className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {users.map((user) => {
                      const isCurrentAccount =
                        authenticatedUser?.id === user.id;
                      const selectedRole =
                        roleSelections[user.id] ?? user.role;
                      const isUpdating =
                        updatingUserId === user.id;
                      const roleHasChanged =
                        selectedRole !== user.role;

                      return (
                        <tr key={user.id}>
                          <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-100">
                            {user.fullName}

                            {isCurrentAccount && (
                              <span className="ml-2 text-xs font-normal text-slate-400">
                                Current account
                              </span>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">
                            {user.email}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                user.role === "Admin"
                                  ? "bg-purple-950 text-purple-200"
                                  : "bg-slate-800 text-slate-200"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <label
                              htmlFor={`role-${user.id}`}
                              className="sr-only"
                            >
                              Change role for {user.fullName}
                            </label>

                            <select
                              id={`role-${user.id}`}
                              value={selectedRole}
                              disabled={
                                isCurrentAccount || isUpdating
                              }
                              onChange={(event) =>
                                handleRoleSelection(
                                  user.id,
                                  event.target.value as UserRole,
                                )
                              }
                              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value="User">User</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            <button
                              type="button"
                              disabled={
                                isCurrentAccount ||
                                isUpdating ||
                                !roleHasChanged
                              }
                              onClick={() =>
                                void handleRoleUpdate(user)
                              }
                              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                            >
                              {isUpdating
                                ? "Updating..."
                                : "Update role"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </section>
    </DashboardLayout>
  );
};

export default UsersPage;
