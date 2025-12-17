using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class Payment
{
    public int PaymentID { get; set; }

    public int? OrderID { get; set; }

    public DateOnly? PaymentDate { get; set; }

    public string? PaymentMethod { get; set; }

    public decimal? Amount { get; set; }

    public virtual Order? Order { get; set; }
}
