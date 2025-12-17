using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities;

public partial class SupportTicket
{
    public int TicketID { get; set; }

    public int? UserID { get; set; }

    public string? Subject { get; set; }

    public string? Description { get; set; }

    public string? Status { get; set; }

    public virtual User? User { get; set; }
}
