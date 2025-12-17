
namespace Application.DTOs
{
    public record RegisterDto(string Name, string Email, string Password);
    public record LoginDto(string Email, string Password);
    public record AuthResponse(int Id, string Name, string Email, string Role, string Token);
}
