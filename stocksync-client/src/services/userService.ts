import { api } from "@/services/api";


/**
 * Defines the roles supported by StockSync.
 */
export type UserRole = "Admin" | "User";

/**
 * Represents a StockSync user returned by the user
 * administration API.
 */
export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

/**
 * Represents the request body used when changing
 * a user's assigned role.
 */
export interface UpdateUserRoleRequest {
  role: UserRole;
}

/**
 * Retrieves every registered StockSync user.
 *
 * The backend restricts this endpoint to authenticated
 * administrators.
 */
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>("/users");

  return response.data;
};

/**
 * Retrieves one StockSync user by identifier.
 *
 * @param userId - Identifier of the user to retrieve.
 */
export const getUserById = async (
  userId: number,
): Promise<User> => {
  const response = await api.get<User>(`/users/${userId}`);

  return response.data;
};

/**
 * Changes the assigned role of an existing StockSync user.
 *
 * @param userId - Identifier of the user being updated.
 * @param role - New role assigned to the user.
 */
export const updateUserRole = async (
  userId: number,
  role: UpdateUserRoleRequest["role"],
): Promise<User> => {
  const response = await api.put<User>(
    `/users/${userId}/role`,
    {
      role,
    } satisfies UpdateUserRoleRequest,
  );

  return response.data;
};
