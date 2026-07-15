using System.ComponentModel.DataAnnotations;
using StockSync.DTOs;

namespace StockSync.Tests;

/// <summary>
/// Verifies the validation rules applied to stock-assignment quantities.
/// </summary>
public class AssignStockValidationTests
{
    /// <summary>
    /// Confirms that a negative available quantity is rejected.
    /// </summary>
    [Fact]
    public void QuantityAvailable_WhenNegative_IsInvalid()
    {
        // Arrange
        var dto = new AssignStockDto
        {
            QuantityAvailable = -1
        };

        // Act
        var validationResults = ValidateQuantityAvailable(dto);

        // Assert
        Assert.Contains(
            validationResults,
            result => result.ErrorMessage ==
                "Quantity available must be greater than zero.");
    }

    /// <summary>
    /// Confirms that assigning zero available units is rejected.
    /// </summary>
    [Fact]
    public void QuantityAvailable_WhenZero_IsInvalid()
    {
        // Arrange
        var dto = new AssignStockDto
        {
            QuantityAvailable = 0
        };

        // Act
        var validationResults = ValidateQuantityAvailable(dto);

        // Assert
        Assert.Contains(
            validationResults,
            result => result.ErrorMessage ==
                "Quantity available must be greater than zero.");
    }

    /// <summary>
    /// Confirms that a positive available quantity is valid.
    /// </summary>
    [Fact]
    public void QuantityAvailable_WhenPositive_IsValid()
    {
        // Arrange
        var dto = new AssignStockDto
        {
            QuantityAvailable = 1
        };

        // Act
        var validationResults = ValidateQuantityAvailable(dto);

        // Assert
        Assert.Empty(validationResults);
    }

    /// <summary>
    /// Validates only the QuantityAvailable property so unrelated
    /// DTO rules do not affect these focused tests.
    /// </summary>
    private static List<ValidationResult> ValidateQuantityAvailable(
        AssignStockDto dto)
    {
        var validationResults = new List<ValidationResult>();

        var validationContext = new ValidationContext(dto)
        {
            MemberName = nameof(AssignStockDto.QuantityAvailable)
        };

        Validator.TryValidateProperty(
            dto.QuantityAvailable,
            validationContext,
            validationResults);

        return validationResults;
    }
}