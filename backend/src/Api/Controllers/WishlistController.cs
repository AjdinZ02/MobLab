using System.Security.Claims;
using Application.Dtos;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] 
    public class WishlistController : ControllerBase
    {
        private readonly AppDbContext _db;
        public WishlistController(AppDbContext db) => _db = db;

        private int? GetUserId()
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(idStr, out var id) ? id : (int?)null;
        }

        // GET: /api/wishlist
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WishlistItemDto>>> GetMine()
        {
            var userId = GetUserId();
            if (userId is null) return Unauthorized();

            var items = await _db.Wishlists
                .Where(w => w.UserID == userId)
                .OrderByDescending(w => w.DateAdded)
                .Join(
                    _db.Products,
                    w => w.ProductID,
                    p => p.ProductID,
                    (w, p) => new WishlistItemDto
                    {
                        WishlistID = w.WishlistID,
                        ProductID  = w.ProductID ?? 0,
                        DateAdded  = w.DateAdded.HasValue ? w.DateAdded.Value.ToString("yyyy-MM-dd") : null,
                        ModelName  = p.ModelName ?? string.Empty,
                        Price      = p.Price,

                       
                        ImagePath  = _db.ProductVersions
                                        .Where(v => v.ProductID == p.ProductID)
                                        .Join(_db.Images,
                                              v => v.ImageID,
                                              i => i.ImageID,
                                              (v, i) => i.ImagePath)
                                        .FirstOrDefault()
                    }
                )
                .AsNoTracking()
                .ToListAsync();

            return Ok(items);
        }

        // POST: /api/wishlist/{productId}
        [HttpPost("{productId:int}")]
        public async Task<IActionResult> Add(int productId)
        {
            var userId = GetUserId();
            if (userId is null) return Unauthorized();

            var existsProduct = await _db.Products.AnyAsync(p => p.ProductID == productId);
            if (!existsProduct) return NotFound("Proizvod ne postoji.");

            var already = await _db.Wishlists.AnyAsync(w => w.UserID == userId && w.ProductID == productId);
            if (!already)
            {
                var item = new Wishlist
                {
                    UserID = userId,
                    ProductID = productId,
                    DateAdded = DateOnly.FromDateTime(DateTime.UtcNow)
                };
                _db.Wishlists.Add(item);
                try
                {
                    await _db.SaveChangesAsync();
                }
                catch (DbUpdateException)
                {
                    
                    return NoContent();
                }
            }
            return NoContent();
        }

        // DELETE: /api/wishlist/{wishlistId}
        [HttpDelete("{wishlistId:int}")]
        public async Task<IActionResult> Remove(int wishlistId)
        {
            var userId = GetUserId();
            if (userId is null) return Unauthorized();

            await _db.Wishlists
                .Where(w => w.WishlistID == wishlistId && w.UserID == userId)
                .ExecuteDeleteAsync(); 

            return NoContent();
        }

        // DELETE: /api/wishlist/product/{productId}
        [HttpDelete("product/{productId:int}")]
        public async Task<IActionResult> RemoveByProduct(int productId)
        {
            var userId = GetUserId();
            if (userId is null) return Unauthorized();

            await _db.Wishlists
                .Where(w => w.UserID == userId && w.ProductID == productId)
                .ExecuteDeleteAsync();

            return NoContent();
        }

        // DELETE: /api/wishlist (clear all)
        [HttpDelete]
        public async Task<IActionResult> Clear()
        {
            var userId = GetUserId();
            if (userId is null) return Unauthorized();

            await _db.Wishlists
                .Where(w => w.UserID == userId)
                .ExecuteDeleteAsync();

            return NoContent();
        }
    }
}
