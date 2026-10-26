using System.ComponentModel.DataAnnotations;

namespace RepairHub.API.DTOs;

public class UpdateCustomerDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(255)]
    [EmailAddress]
    public string? Email { get; set; }
}