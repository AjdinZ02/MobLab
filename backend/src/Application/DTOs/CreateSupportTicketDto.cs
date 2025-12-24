
namespace Application.Dtos
{
    public class CreateSupportTicketDto
    {
        public string Subject { get; set; } = default!;
        public string Description { get; set; } = default!;
        public int? UserID { get; set; } 
    }
}
