using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class ProductVersion
{
    public int VersionID { get; set; }

    public int? ProductID { get; set; }

    public int? ImageID { get; set; }

    public string? Color { get; set; }

    public string? Storage { get; set; }

    public virtual Image? Image { get; set; }

    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual Product? Product { get; set; }
}
