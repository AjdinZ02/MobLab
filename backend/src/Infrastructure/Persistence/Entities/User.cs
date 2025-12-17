using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class User
{
    public int UserID { get; set; }

    public string? FullName { get; set; }

    public string? Email { get; set; }

    public string? PasswordHash { get; set; }

    public int? RoleID { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual Role? Role { get; set; }

    public virtual ICollection<SupportTicket> SupportTickets { get; set; } = new List<SupportTicket>();

    public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
}
