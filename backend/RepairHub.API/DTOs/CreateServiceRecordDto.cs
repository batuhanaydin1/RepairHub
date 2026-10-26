
using System.ComponentModel.DataAnnotations;

namespace RepairHub.API.DTOs;

public class CreateServiceRecordDto
{
    [Required]
    public int CustomerId { get; set; }

    [Required]
    [MaxLength(100)]
    public string DeviceName { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string ProblemDescription { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Onarım bekliyor";

    [Range(0, 100000000)]
    public decimal? Price { get; set; }
}
