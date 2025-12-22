
namespace Application.Dtos
{
    public class SupportTicketDto
    {
        public int TicketID { get; set; }
        public int? UserID { get; set; }
        public string Subject { get; set; } = default!;
        public string Description { get; set; } = default!;
        public string Status { get; set; } = default!;
    }
}
