using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class Role
{
    public int RoleID { get; set; }

    public string? RoleName { get; set; }

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
