
using System.ComponentModel.DataAnnotations;
using RepairHub.API.DTOs;
using Microsoft.EntityFrameworkCore;
using RepairHub.API.Data;
using RepairHub.API.Entities;

var builder = WebApplication.CreateBuilder(args);

// PostgreSQL / Supabase bağlantısı
builder.Services.AddDbContext<RepairHubDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// React frontend için CORS ayarı
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "https://repair-hub-jade.vercel.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

// CORS middleware'i endpointlerden önce çalışır
app.UseCors("Frontend");

// Tüm müşterileri listele
app.MapGet("/api/customers", async (RepairHubDbContext db) =>
{
    var customers = await db.Customers.ToListAsync();
    return Results.Ok(customers);
});

// ID ile müşteri getir
app.MapGet("/api/customers/{id:int}", async (
    int id,
    RepairHubDbContext db) =>
{
    var customer = await db.Customers.FindAsync(id);

    if (customer is null)
        return Results.NotFound();

    return Results.Ok(customer);
});

// Yeni müşteri oluştur
app.MapPost("/api/customers", async (
    CreateCustomerDto dto,
    RepairHubDbContext db) =>
{
    var validationResults = new List<ValidationResult>();
    var validationContext = new ValidationContext(dto);

    if (!Validator.TryValidateObject(
        dto, validationContext, validationResults, true))
    {
        return Results.BadRequest(
            validationResults.Select(result => result.ErrorMessage));
    }

    var customer = new Customer
    {
        FullName = dto.FullName,
        Phone = dto.Phone,
        Email = dto.Email
    };

    db.Customers.Add(customer);
    await db.SaveChangesAsync();

    return Results.Created(
        $"/api/customers/{customer.Id}", customer);
});

// Müşteri güncelle
app.MapPut("/api/customers/{id:int}", async (
    int id,
    UpdateCustomerDto dto,
    RepairHubDbContext db) =>
{
    var validationResults = new List<ValidationResult>();
    var validationContext = new ValidationContext(dto);

    if (!Validator.TryValidateObject(
        dto, validationContext, validationResults, true))
    {
        return Results.BadRequest(
            validationResults.Select(result => result.ErrorMessage));
    }

    var customer = await db.Customers.FindAsync(id);

    if (customer is null)
        return Results.NotFound();

    customer.FullName = dto.FullName;
    customer.Phone = dto.Phone;
    customer.Email = dto.Email;

    await db.SaveChangesAsync();

    return Results.Ok(customer);
});

// Müşteri sil
app.MapDelete("/api/customers/{id:int}", async (
    int id,
    RepairHubDbContext db) =>
{
    var customer = await db.Customers.FindAsync(id);

    if (customer is null)
        return Results.NotFound();

    db.Customers.Remove(customer);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

// Tüm servis kayıtlarını listele
app.MapGet("/api/service-records", async (RepairHubDbContext db) =>
{
    var records = await db.ServiceRecords
        .Include(record => record.Customer)
        .OrderByDescending(record => record.CreatedAt)
        .ToListAsync();

    return Results.Ok(records);
});

// Servis kaydını güncelle
app.MapPut("/api/service-records/{id:int}", async (
    int id,
    UpdateServiceRecordDto dto,
    RepairHubDbContext db) =>
{
    var validationResults = new List<ValidationResult>();
    var validationContext = new ValidationContext(dto);

    if (!Validator.TryValidateObject(
        dto, validationContext, validationResults, true))
    {
        return Results.BadRequest(
            validationResults.Select(result => result.ErrorMessage));
    }

    var record = await db.ServiceRecords.FindAsync(id);

    if (record is null)
        return Results.NotFound();

    var customerExists = await db.Customers
        .AnyAsync(customer => customer.Id == dto.CustomerId);

    if (!customerExists)
        return Results.BadRequest("Belirtilen müşteri bulunamadı.");

    record.CustomerId = dto.CustomerId;
    record.DeviceName = dto.DeviceName;
    record.ProblemDescription = dto.ProblemDescription;
    record.Status = dto.Status;
    record.Price = dto.Price;

    await db.SaveChangesAsync();

    return Results.Ok(record);
});

// Servis kaydını sil
app.MapDelete("/api/service-records/{id:int}", async (
    int id,
    RepairHubDbContext db) =>
{
    var record = await db.ServiceRecords.FindAsync(id);

    if (record is null)
        return Results.NotFound();

    db.ServiceRecords.Remove(record);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

// Yeni servis kaydı oluştur
app.MapPost("/api/service-records", async (
    CreateServiceRecordDto dto,
    RepairHubDbContext db) =>
{
    var validationResults = new List<ValidationResult>();
    var validationContext = new ValidationContext(dto);

    if (!Validator.TryValidateObject(
        dto, validationContext, validationResults, true))
    {
        return Results.BadRequest(
            validationResults.Select(result => result.ErrorMessage));
    }

    var customerExists = await db.Customers
        .AnyAsync(customer => customer.Id == dto.CustomerId);

    if (!customerExists)
        return Results.BadRequest("Belirtilen müşteri bulunamadı.");

    var record = new ServiceRecord
    {
        CustomerId = dto.CustomerId,
        DeviceName = dto.DeviceName,
        ProblemDescription = dto.ProblemDescription,
        Status = dto.Status,
        Price = dto.Price
    };

    db.ServiceRecords.Add(record);
    await db.SaveChangesAsync();

    return Results.Created(
        $"/api/service-records/{record.Id}", record);
});

// Geliştirme ortamında OpenAPI belgesi
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Ana sayfa
app.MapGet("/", () => "RepairHub API çalışıyor!");

app.Run();
