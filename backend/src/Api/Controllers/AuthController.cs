
using Application.DTOs;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IPasswordHasher<User> _hasher;
        private readonly IConfiguration _cfg;

        public AuthController(AppDbContext db, IPasswordHasher<User> hasher, IConfiguration cfg)
        {
            _db = db;
            _hasher = hasher;
            _cfg = cfg;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            // 1) Validacija ulaza 
            var name = dto?.Name?.Trim();
            var emailRaw = dto?.Email?.Trim();
            var password = dto?.Password;

            if (string.IsNullOrWhiteSpace(name) ||
                string.IsNullOrWhiteSpace(emailRaw) ||
                string.IsNullOrWhiteSpace(password))
            {
                return BadRequest("Unesite ime, email i lozinku.");
            }
            if (password.Length < 6)
                return BadRequest("Lozinka mora imati najmanje 6 znakova.");

            var email = emailRaw.ToLowerInvariant();

            // 2) Postojeći korisnik?
            if (await _db.Users.AnyAsync(u => u.Email == email))
                return Conflict("Email je već registrovan.");

            // 3) Kreiranje user-a
            var user = new User
            {
                FullName = name,
                Email = email,
                RoleID = await _db.Roles
                    .Where(r => r.RoleName == "User")
                    .Select(r => (int?)r.RoleID)
                    .FirstOrDefaultAsync()
            };

            // 4) Hash lozinke
            user.PasswordHash = _hasher.HashPassword(user, password);

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // 5) Token + sigurne vrijednosti u odgovoru
            var token = GenerateJwt(user);
            var safeName = user.FullName ?? string.Empty;
            var safeEmail = user.Email ?? string.Empty;
            var roleName = RoleName(user.RoleID);

            return Ok(new AuthResponse(user.UserID, safeName, safeEmail, roleName, token));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            // 1) Validacija ulaza 
            var emailRaw = dto?.Email?.Trim();
            var password = dto?.Password;

            if (string.IsNullOrWhiteSpace(emailRaw) ||
                string.IsNullOrWhiteSpace(password))
                return BadRequest("Unesite email i lozinku.");

            var email = emailRaw.ToLowerInvariant();

            // 2) Nađi user-a
            var user = await _db.Users
                .Include(u => u.Role)
                .SingleOrDefaultAsync(u => u.Email == email);

            if (user is null)
                return Unauthorized("Pogrešan email ili lozinka.");

            // 3) PasswordHash može biti null
            var storedHash = user.PasswordHash;
            if (string.IsNullOrEmpty(storedHash))
                return BadRequest("Korisnik nema postavljenu lozinku.");

            // 4) Verifikacija lozinke
            var result = _hasher.VerifyHashedPassword(user, storedHash, password);
            if (result == PasswordVerificationResult.Failed)
                return Unauthorized("Pogrešan email ili lozinka.");

            // 5) Token + sigurne vrijednosti u odgovoru
            var token = GenerateJwt(user);
            var safeName = user.FullName ?? string.Empty;
            var safeEmail = user.Email ?? string.Empty;
            var roleName = RoleName(user.RoleID);

            return Ok(new AuthResponse(user.UserID, safeName, safeEmail, roleName, token));
        }

        private string GenerateJwt(User user)
        {
            // sigurne (non-null) claim vrijednosti
            var roleName = RoleName(user.RoleID) ?? "User";
            var email = user.Email ?? string.Empty;
            var fullName = user.FullName ?? string.Empty;

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserID.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                new Claim(ClaimTypes.Role, roleName),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim("fullName", fullName)
            };

            var keyStr = _cfg["Jwt:Key"] ?? throw new InvalidOperationException("Missing Jwt:Key");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _cfg["Jwt:Issuer"],
                audience: _cfg["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(30),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string RoleName(int? roleId)
            => _db.Roles.Where(r => r.RoleID == roleId).Select(r => r.RoleName!).FirstOrDefault() ?? "User";
    }
}
