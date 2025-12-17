using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class Carrier
{
    public int CarrierID { get; set; }

    public string? CarrierName { get; set; }

    public decimal? ShippingCost { get; set; }

    public virtual ICollection<Shipping> Shippings { get; set; } = new List<Shipping>();
}
