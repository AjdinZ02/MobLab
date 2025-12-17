using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class Inventory
{
    public int InventoryID { get; set; }

    public int? WarehouseID { get; set; }

    public int? VersionID { get; set; }

    public int? Quantity { get; set; }

    public DateOnly? LastUpdated { get; set; }

    public virtual ProductVersion? Version { get; set; }

    public virtual Warehouse? Warehouse { get; set; }
}
