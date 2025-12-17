using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class Shipping
{
    public int ShippingID { get; set; }

    public int? OrderID { get; set; }

    public int? CarrierID { get; set; }

    public string? Address { get; set; }

    public string? City { get; set; }

    public string? Status { get; set; }

    public virtual Carrier? Carrier { get; set; }

    public virtual Order? Order { get; set; }
}
