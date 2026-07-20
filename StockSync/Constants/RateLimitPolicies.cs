namespace StockSync.Constants;

/// <summary>
/// Provides the names of the rate-limiting policies used by the API.
/// </summary>
public static class RateLimitPolicies
{
    /// <summary>
    /// Limits repeated login requests.
    /// </summary>
    public const string Login = "login";

    /// <summary>
    /// Limits repeated registration requests.
    /// </summary>
    public const string Register = "register";

    /// <summary>
    /// Provides a general request limit for API endpoints.
    /// </summary>
    public const string GeneralApi = "general-api";
}