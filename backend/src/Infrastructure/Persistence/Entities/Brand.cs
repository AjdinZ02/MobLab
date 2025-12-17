using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class Brand
{
    public int BrandID { get; set; }

    public string? BrandName { get; set; }

    public int? ImageID { get; set; }

    public string? Country { get; set; }

    public int? YearFounded { get; set; }

    public string? Description { get; set; }

    public virtual Image? Image { get; set; }
}
