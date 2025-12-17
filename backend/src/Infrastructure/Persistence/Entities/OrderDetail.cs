using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class OrderDetail
{
    public int OrderDetailID { get; set; }

    public int? OrderID { get; set; }

    public int? VersionID { get; set; }

    public int? Quantity { get; set; }

    public decimal? UnitPrice { get; set; }

    public virtual Order? Order { get; set; }

    public virtual ProductVersion? Version { get; set; }
}
