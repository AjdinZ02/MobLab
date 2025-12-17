using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class Wishlist
{
    public int WishlistID { get; set; }

    public int? UserID { get; set; }

    public int? ProductID { get; set; }

    public DateOnly? DateAdded { get; set; }

    public virtual Product? Product { get; set; }

    public virtual User? User { get; set; }
}
