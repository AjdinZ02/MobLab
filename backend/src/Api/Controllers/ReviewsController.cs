
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;
using Application.DTOs;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]   // ruta: /api/reviews
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ReviewsController(AppDbContext db) { _db = db; }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reviews = await _db.Reviews
                .Select(r => new ReviewDto
                {
                    ReviewID    = r.ReviewID,
                    ProductName = r.ProductName,
                    UserName    = r.UserName,
                    Rating      = r.Rating ?? 0,
                    Comment     = r.Comment ?? string.Empty,
                    UserID      = r.UserID
                })
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpPost]
        public async Task<IActionResult> AddReview([FromBody] ReviewDto reviewDto)
        {
            if (reviewDto == null ||
                string.IsNullOrWhiteSpace(reviewDto.Comment) ||
                reviewDto.Rating < 1 || reviewDto.Rating > 5 ||
                string.IsNullOrWhiteSpace(reviewDto.ProductName) ||
                string.IsNullOrWhiteSpace(reviewDto.UserName))
            {
                return BadRequest("Nevažeći podaci o recenziji.");
            }

            int? userIdFromToken = null;
            var nameId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(nameId, out var parsedId))
                userIdFromToken = parsedId;

            var review = new Infrastructure.Persistence.Entities.Review
            {
                Rating      = reviewDto.Rating,
                Comment     = reviewDto.Comment,
                ProductName = reviewDto.ProductName,
                UserName    = reviewDto.UserName,
                UserID      = userIdFromToken
            };

            _db.Reviews.Add(review);
            await _db.SaveChangesAsync();
            return Ok(new { Message = "Recenzija je uspješno dodana." });
        }

        [Authorize]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDto dto)
        {
            if (dto == null || (dto.Rating is not null && (dto.Rating < 1 || dto.Rating > 5)))
                return BadRequest("Nevažeći podaci.");

            var review = await _db.Reviews.FindAsync(id);
            if (review == null) return NotFound("Recenzija nije pronađena.");

            if (!CanActOnReview(User, review)) return Forbid();

            if (dto.Rating is not null)  review.Rating  = dto.Rating.Value;
            if (dto.Comment is not null) review.Comment = dto.Comment;

            await _db.SaveChangesAsync();
            return Ok(new { Message = "Recenzija je uspješno ažurirana." });
        }

        [Authorize]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _db.Reviews.FindAsync(id);
            if (review == null) return NotFound("Recenzija nije pronađena.");

            if (!CanActOnReview(User, review)) return Forbid();

            _db.Reviews.Remove(review);
            await _db.SaveChangesAsync();
            return Ok(new { Message = "Recenzija je uspješno obrisana." });
        }

        // Zajednička provjera dozvole (Admin OR Owner + fallback po imenu)
        private static bool CanActOnReview(ClaimsPrincipal user, Infrastructure.Persistence.Entities.Review review)
        {
            var currentUserRole = user.FindFirstValue(ClaimTypes.Role) ?? "";
            var nameIdentifier  = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = string.Equals(currentUserRole, "Admin", StringComparison.OrdinalIgnoreCase);

            bool isOwner = false;
            if (review.UserID is int reviewOwnerId && !string.IsNullOrEmpty(nameIdentifier))
            {
                if (int.TryParse(nameIdentifier, out var currentUserId))
                    isOwner = reviewOwnerId == currentUserId;
            }

            if (!isOwner && review.UserID == null)
            {
                var fullName = user.Claims.FirstOrDefault(c => c.Type == "fullName")?.Value;
                if (!string.IsNullOrWhiteSpace(fullName) && !string.IsNullOrWhiteSpace(review.UserName))
                {
                    string Norm(string s) => s.Trim().ToLowerInvariant();
                    var a = Norm(fullName);
                    var b = Norm(review.UserName);
                    var aFirst = a.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? a;
                    isOwner = a == b || a.Contains(b) || b == aFirst;
                }
                       }

            return isAdmin || isOwner;
        }
    }
}