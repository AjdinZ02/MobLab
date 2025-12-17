
namespace Application.DTOs
{
    public class UserProfileDto
    {
        public int UserID { get; set; }
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string RoleName { get; set; } = "User";
    }
}