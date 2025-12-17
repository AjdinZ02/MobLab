using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class ProductDetail
{
    public int DetailID { get; set; }

    public int? ProductID { get; set; }

    public string? Display { get; set; }

    public string? Battery { get; set; }

    public string? Camera { get; set; }

    public virtual Product? Product { get; set; }
}
