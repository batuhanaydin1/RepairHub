
using System.ComponentModel.DataAnnotations;

namespace RepairHub.API.Entities;

public class ServiceRecord
{
    public int Id { get; set; }

    [Required]
    public int CustomerId { get; set; }

    public Customer? Customer { get; set; }

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

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
