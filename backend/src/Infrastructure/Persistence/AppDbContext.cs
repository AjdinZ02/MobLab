using System;
using System.Collections.Generic;
using Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Brand> Brands { get; set; }

    public virtual DbSet<Carrier> Carriers { get; set; }

    public virtual DbSet<Image> Images { get; set; }

    public virtual DbSet<Inventory> Inventories { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<ProductDetail> ProductDetails { get; set; }

    public virtual DbSet<ProductVersion> ProductVersions { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Shipping> Shippings { get; set; }

    public virtual DbSet<SupportTicket> SupportTickets { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Warehouse> Warehouses { get; set; }

    public virtual DbSet<Wishlist> Wishlists { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Server=LAPTOP-G61D82DJ\\SQLEXPRESS;Database=MobLab;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Brand>(entity =>
        {
            entity.HasKey(e => e.BrandID).HasName("PK__Brands__DAD4F3BE3F51FF50");

            entity.Property(e => e.BrandName).HasMaxLength(50);
            entity.Property(e => e.Country).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(255);

            entity.HasOne(d => d.Image).WithMany(p => p.Brands)
                .HasForeignKey(d => d.ImageID)
                .HasConstraintName("FK__Brands__ImageID__571DF1D5");
        });

        modelBuilder.Entity<Carrier>(entity =>
        {
            entity.HasKey(e => e.CarrierID).HasName("PK__Carriers__CB8205792C7DF4D1");

            entity.Property(e => e.CarrierName).HasMaxLength(100);
            entity.Property(e => e.ShippingCost).HasColumnType("decimal(10, 2)");
        });

        modelBuilder.Entity<Image>(entity =>
        {
            entity.HasKey(e => e.ImageID).HasName("PK__Images__7516F4EC329AB438");

            entity.Property(e => e.ImagePath).HasMaxLength(100);
        });

        modelBuilder.Entity<Inventory>(entity =>
        {
            entity.HasKey(e => e.InventoryID).HasName("PK__Inventor__F5FDE6D389102C7A");

            entity.ToTable("Inventory");

            entity.HasOne(d => d.Version).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.VersionID)
                .HasConstraintName("FK__Inventory__Versi__5812160E");

            entity.HasOne(d => d.Warehouse).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.WarehouseID)
                .HasConstraintName("FK__Inventory__Wareh__59063A47");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderID).HasName("PK__Orders__C3905BAF7A150433");

            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .HasForeignKey(d => d.UserID)
                .HasConstraintName("FK__Orders__UserID__5BE2A6F2");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailID).HasName("PK__OrderDet__D3B9D30CD8C7DF0B");

            entity.Property(e => e.UnitPrice).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.OrderID)
                .HasConstraintName("FK__OrderDeta__Order__59FA5E80");

            entity.HasOne(d => d.Version).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.VersionID)
                .HasConstraintName("FK__OrderDeta__Versi__5AEE82B9");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentID).HasName("PK__Payments__9B556A586FF6760A");

            entity.Property(e => e.Amount).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.PaymentMethod).HasMaxLength(50);

            entity.HasOne(d => d.Order).WithMany(p => p.Payments)
                .HasForeignKey(d => d.OrderID)
                .HasConstraintName("FK__Payments__OrderI__5CD6CB2B");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductID).HasName("PK__Products__B40CC6ED09C57AB4");

            entity.Property(e => e.ModelName).HasMaxLength(100);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
        });

        modelBuilder.Entity<ProductDetail>(entity =>
        {
            entity.HasKey(e => e.DetailID).HasName("PK__ProductD__135C314D12C2A59E");

            entity.Property(e => e.Battery).HasMaxLength(50);
            entity.Property(e => e.Camera).HasMaxLength(50);
            entity.Property(e => e.Display).HasMaxLength(50);

            entity.HasOne(d => d.Product).WithMany(p => p.ProductDetails)
                .HasForeignKey(d => d.ProductID)
                .HasConstraintName("FK__ProductDe__Produ__5DCAEF64");
        });

        modelBuilder.Entity<ProductVersion>(entity =>
        {
            entity.HasKey(e => e.VersionID).HasName("PK__ProductV__16C6402FAEE55AB9");

            entity.Property(e => e.Color).HasMaxLength(50);
            entity.Property(e => e.Storage).HasMaxLength(50);

            entity.HasOne(d => d.Image).WithMany(p => p.ProductVersions)
                .HasForeignKey(d => d.ImageID)
                .HasConstraintName("FK__ProductVe__Image__5FB337D6");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductVersions)
                .HasForeignKey(d => d.ProductID)
                .HasConstraintName("FK__ProductVe__Produ__60A75C0F");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewID).HasName("PK__Reviews__74BC79AE4A396035");

            entity.Property(e => e.Comment).HasMaxLength(255);

            entity.HasOne(d => d.Product).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.ProductID)
                .HasConstraintName("FK__Reviews__Product__619B8048");

            entity.HasOne(d => d.User).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.UserID)
                .HasConstraintName("FK__Reviews__UserID__628FA481");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleID).HasName("PK__Roles__8AFACE3A8B8DD55C");

            entity.Property(e => e.RoleName).HasMaxLength(50);
        });

        modelBuilder.Entity<Shipping>(entity =>
        {
            entity.HasKey(e => e.ShippingID).HasName("PK__Shipping__5FACD460AF57EDD7");

            entity.ToTable("Shipping");

            entity.Property(e => e.Address).HasMaxLength(255);
            entity.Property(e => e.City).HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(50);

            entity.HasOne(d => d.Carrier).WithMany(p => p.Shippings)
                .HasForeignKey(d => d.CarrierID)
                .HasConstraintName("FK__Shipping__Carrie__6383C8BA");

            entity.HasOne(d => d.Order).WithMany(p => p.Shippings)
                .HasForeignKey(d => d.OrderID)
                .HasConstraintName("FK__Shipping__OrderI__6477ECF3");
        });

        modelBuilder.Entity<SupportTicket>(entity =>
        {
            entity.HasKey(e => e.TicketID).HasName("PK__SupportT__712CC62719F21F1F");

            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.Subject).HasMaxLength(100);

            entity.HasOne(d => d.User).WithMany(p => p.SupportTickets)
                .HasForeignKey(d => d.UserID)
                .HasConstraintName("FK__SupportTi__UserI__656C112C");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserID).HasName("PK__Users__1788CCAC7E368D1D");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534C5E997A7").IsUnique();

            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleID)
                .HasConstraintName("FK__Users__RoleID__66603565");
        });

        modelBuilder.Entity<Warehouse>(entity =>
        {
            entity.HasKey(e => e.WarehouseID).HasName("PK__Warehous__2608AFD9C2EB432A");

            entity.Property(e => e.City).HasMaxLength(50);
            entity.Property(e => e.WarehouseName).HasMaxLength(100);
        });

        modelBuilder.Entity<Wishlist>(entity =>
        {
            entity.HasKey(e => e.WishlistID).HasName("PK__Wishlist__233189CB0E72F674");

            entity.ToTable("Wishlist");

            entity.HasOne(d => d.Product).WithMany(p => p.Wishlists)
                .HasForeignKey(d => d.ProductID)
                .HasConstraintName("FK__Wishlist__Produc__6754599E");

            entity.HasOne(d => d.User).WithMany(p => p.Wishlists)
                .HasForeignKey(d => d.UserID)
                .HasConstraintName("FK__Wishlist__UserID__68487DD7");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
