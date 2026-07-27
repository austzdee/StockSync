import axios from "axios";

type ApiErrorResponse = {
  message?: unknown;
  detail?: unknown;
  title?: unknown;
  errors?: unknown;
};

/**
 * Converts an unknown API failure into a safe, user-facing message.
 *
 * Supports common ASP.NET Core response formats, including validation
 * errors and Problem Details responses.
 */
export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  if (!error.response) {
    return "Unable to connect to the server. Check your connection and try again.";
  }

  const status = error.response.status;
  const responseData: unknown = error.response.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData.trim();
  }

  if (responseData && typeof responseData === "object") {
    const apiError = responseData as ApiErrorResponse;

    if (apiError.errors && typeof apiError.errors === "object") {
      const validationMessages = Object.values(apiError.errors)
        .flatMap((value) => (Array.isArray(value) ? value : []))
        .filter(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
        );

      if (validationMessages.length > 0) {
        return validationMessages[0].trim();
      }
    }

    if (typeof apiError.message === "string" && apiError.message.trim()) {
      return apiError.message.trim();
    }

    if (typeof apiError.detail === "string" && apiError.detail.trim()) {
      return apiError.detail.trim();
    }

    if (typeof apiError.title === "string" && apiError.title.trim()) {
      return apiError.title.trim();
    }
  }

  switch (status) {
    case 401:
      return "Your session has expired. Please sign in again.";

    case 403:
      return "You do not have permission to perform this action.";

    case 409:
      return "A conflicting record already exists. Check the details and try again.";

    default:
      return fallbackMessage;
  }
};