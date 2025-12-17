using Infrastructure.Persistence;
using Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductDetailsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ProductDetailsController(AppDbContext db) { _db = db; }

        public class DetailsDto
        {
            public string? Display { get; set; }
            public string? Battery { get; set; }
            public string? Camera { get; set; }
        }

        [HttpGet("product/{productId:int}")]
        public async Task<IActionResult> GetByProduct(int productId)
        {
            var detail = await _db.ProductDetails.AsNoTracking().FirstOrDefaultAsync(d => d.ProductID == productId);
            if (detail == null) return NotFound();
            return Ok(detail);
        }

        [HttpPut("product/{productId:int}")]
        public async Task<IActionResult> Upsert(int productId, [FromBody] DetailsDto dto)
        {
            var detail = await _db.ProductDetails.FirstOrDefaultAsync(d => d.ProductID == productId);
            if (detail == null)
            {
                detail = new ProductDetail
                {
                    ProductID = productId,
                    Display = dto.Display?.Trim(),
                    Battery = dto.Battery?.Trim(),
                    Camera = dto.Camera?.Trim()
                };
                _db.ProductDetails.Add(detail);
            }
            else
            {
                detail.Display = dto.Display?.Trim();
                detail.Battery = dto.Battery?.Trim();
                detail.Camera = dto.Camera?.Trim();
            }

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return Problem(ex.InnerException?.Message ?? ex.Message, statusCode: 400);
            }
            return Ok(detail);
        }
    }
}


