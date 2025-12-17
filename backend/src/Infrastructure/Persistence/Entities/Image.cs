using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class Image
{
    public int ImageID { get; set; }

    public string? ImagePath { get; set; }

    public virtual ICollection<Brand> Brands { get; set; } = new List<Brand>();

    public virtual ICollection<ProductVersion> ProductVersions { get; set; } = new List<ProductVersion>();
}
