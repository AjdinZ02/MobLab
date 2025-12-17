using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class Product
{
    public int ProductID { get; set; }

    public int? BrandID { get; set; }

    public string? ModelName { get; set; }

    public decimal? Price { get; set; }

    public virtual ICollection<ProductDetail> ProductDetails { get; set; } = new List<ProductDetail>();

    public virtual ICollection<ProductVersion> ProductVersions { get; set; } = new List<ProductVersion>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
}
