
using Microsoft.EntityFrameworkCore;
using RepairHub.API.Entities;

namespace RepairHub.API.Data;

public class RepairHubDbContext : DbContext
{
    public RepairHubDbContext(DbContextOptions<RepairHubDbContext> options)
        : base(options)
    {
    }

    public DbSet<Customer> Customers { get; set; }

    public DbSet<ServiceRecord> ServiceRecords { get; set; }
}
