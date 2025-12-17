using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class Warehouse
{
    public int WarehouseID { get; set; }

    public string? WarehouseName { get; set; }

    public string? City { get; set; }

    public int? SurfaceArea { get; set; }

    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
}
