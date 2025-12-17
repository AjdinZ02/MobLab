using Infrastructure.Persistence;
using Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ProductsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var items = await _db.Products
                .AsNoTracking()
                .Select(p => new {
                    id = p.ProductID,
                    name = p.ModelName,
                    price = p.Price,
                    brandID = p.BrandID,
                    imagePath = _db.ProductVersions
                        .Where(v => v.ProductID == p.ProductID)
                        .OrderByDescending(v => v.VersionID)
                        .Select(v => v.Image != null ? v.Image.ImagePath : null)
                        .FirstOrDefault()
                })
                .ToListAsync();
            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.ProductID == id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        public class ProductDto
        {
            public string? ModelName { get; set; }
            public int? BrandID { get; set; }
            public decimal? Price { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.ModelName))
                return BadRequest("ModelName je obavezan.");

            var entity = new Product
            {
                ModelName = dto.ModelName?.Trim(),
                BrandID = dto.BrandID,
                Price = dto.Price
            };
            _db.Products.Add(entity);
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return Problem(ex.InnerException?.Message ?? ex.Message, statusCode: 400);
            }
            return CreatedAtAction(nameof(GetById), new { id = entity.ProductID }, entity);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductDto dto)
        {
            var entity = await _db.Products.FirstOrDefaultAsync(p => p.ProductID == id);
            if (entity == null) return NotFound();

            entity.ModelName = dto.ModelName?.Trim();
            entity.BrandID = dto.BrandID;
            entity.Price = dto.Price;

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return Problem(ex.InnerException?.Message ?? ex.Message, statusCode: 400);
            }
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _db.Products.FirstOrDefaultAsync(p => p.ProductID == id);
            if (entity == null) return NotFound();

            _db.Products.Remove(entity);
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict("Brisanje nije moguće zbog povezanih zapisa (FK).");
            }
            return NoContent();
        }

        public class ProductImageDto
        {
            public int? ImageID { get; set; }
            public string? ImagePath { get; set; }
            public string? Color { get; set; }
            public string? Storage { get; set; }
        }

        [HttpPost("{id:int}/image")]
        public async Task<IActionResult> AddImage(int id, [FromBody] ProductImageDto dto)
        {
            var product = await _db.Products.FirstOrDefaultAsync(p => p.ProductID == id);
            if (product == null) return NotFound();

            int? imageId = dto.ImageID;
            if (imageId == null && !string.IsNullOrWhiteSpace(dto.ImagePath))
            {
                var img = new Image { ImagePath = dto.ImagePath.Trim() };
                _db.Images.Add(img);
                await _db.SaveChangesAsync();
                imageId = img.ImageID;
            }

            var version = new ProductVersion
            {
                ProductID = id,
                ImageID = imageId,
                Color = dto.Color?.Trim(),
                Storage = dto.Storage?.Trim()
            };
            _db.ProductVersions.Add(version);
            await _db.SaveChangesAsync();
            return Ok(new { version.VersionID, version.ProductID, version.ImageID, version.Color, version.Storage });
        }
    }
}