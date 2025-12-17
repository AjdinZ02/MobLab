
using Application.DTOs;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IPasswordHasher<User> _hasher;

        public UsersController(AppDbContext db, IPasswordHasher<User> hasher)
        {
            _db = db;
            _hasher = hasher;
        }

        private async Task<User?> GetCurrentUserAsync()
        {
            var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(idStr)) return null;
            if (!int.TryParse(idStr, out var id)) return null;

            return await _db.Users
                            .Include(u => u.Role)
                            .FirstOrDefaultAsync(u => u.UserID == id);
        }

        // GET /api/users/me
        [HttpGet("me")]
        public async Task<ActionResult<UserProfileDto>> Me()
        {
            var user = await GetCurrentUserAsync();
            if (user is null) return Unauthorized();

            var dto = new UserProfileDto
            {
                UserID = user.UserID,
                FullName = user.FullName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                RoleName = user.Role?.RoleName ?? "User"
            };
            return Ok(dto);
        }

        // PUT /api/users/me
        [HttpPut("me")]
        public async Task<ActionResult<UserProfileDto>> UpdateMe([FromBody] UpdateProfileDto model)
        {
            var user = await GetCurrentUserAsync();
            if (user is null) return Unauthorized();

            // Full name
            if (!string.IsNullOrWhiteSpace(model.FullName))
            {
                user.FullName = model.FullName.Trim();
            }

            // Email
            if (!string.IsNullOrWhiteSpace(model.Email))
            {
                var newEmail = model.Email.Trim().ToLowerInvariant();

                // current email može biti null => pretvori u prazan string
                var currentEmail = (user.Email ?? string.Empty).ToLowerInvariant();

                if (newEmail != currentEmail)
                {
                    var exists = await _db.Users
                        .AnyAsync(u => u.Email == newEmail && u.UserID != user.UserID);

                    if (exists)
                        return Conflict("Email je već zauzet.");

                    user.Email = newEmail;
                }
            }

            await _db.SaveChangesAsync();

            var dto = new UserProfileDto
            {
                UserID = user.UserID,
                FullName = user.FullName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                RoleName = user.Role?.RoleName ?? "User"
            };
            return Ok(dto);
        }

        // PUT /api/users/change-password
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            var user = await GetCurrentUserAsync();
            if (user is null) return Unauthorized();

            if (string.IsNullOrWhiteSpace(model.CurrentPassword) ||
                string.IsNullOrWhiteSpace(model.NewPassword))
            {
                return BadRequest("Lozinke su obavezne.");
            }

            if (model.NewPassword.Length < 6)
            {
                return BadRequest("Nova lozinka mora imati najmanje 6 znakova.");
            }

            // PasswordHash može biti null -> zaštiti prije verifikacije
            var storedHash = user.PasswordHash;
            if (string.IsNullOrEmpty(storedHash))
            {
                return BadRequest("Korisnik nema postavljenu lozinku.");
            }

                       var verify = _hasher.VerifyHashedPassword(user, storedHash, model.CurrentPassword);
            if (verify == PasswordVerificationResult.Failed)
            {
                return BadRequest("Trenutna lozinka nije tačna.");
            }

            user.PasswordHash = _hasher.HashPassword(user, model.NewPassword);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}