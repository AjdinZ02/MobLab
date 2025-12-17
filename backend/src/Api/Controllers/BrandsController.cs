using Infrastructure.Persistence;
using Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BrandsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public BrandsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _db.Brands
                .AsNoTracking()
                .Select(b => new {
                    b.BrandID,
                    b.BrandName,
                    b.ImageID,
                    b.Country,
                    b.YearFounded,
                    b.Description
                })
                .ToListAsync();
            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var brand = await _db.Brands.AsNoTracking().FirstOrDefaultAsync(b => b.BrandID == id);
            if (brand == null) return NotFound();
            return Ok(brand);
        }

        public class BrandCreateDto
        {
            public string? BrandName { get; set; }
            public int? ImageID { get; set; }
            public string? Country { get; set; }
            public int? YearFounded { get; set; }
            public string? Description { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BrandCreateDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.BrandName))
                return BadRequest("BrandName je obavezan.");

            var entity = new Brand
            {
                BrandName = dto.BrandName?.Trim(),
                ImageID = dto.ImageID,
                Country = dto.Country?.Trim(),
                YearFounded = dto.YearFounded,
                Description = dto.Description?.Trim()
            };

            _db.Brands.Add(entity);
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return Problem(ex.InnerException?.Message ?? ex.Message, statusCode: 400);
            }
            return CreatedAtAction(nameof(GetById), new { id = entity.BrandID }, entity);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] BrandCreateDto dto)
        {
            var entity = await _db.Brands.FirstOrDefaultAsync(b => b.BrandID == id);
            if (entity == null) return NotFound();

            entity.BrandName = dto.BrandName?.Trim();
            entity.ImageID = dto.ImageID;
            entity.Country = dto.Country?.Trim();
            entity.YearFounded = dto.YearFounded;
            entity.Description = dto.Description?.Trim();

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
            var entity = await _db.Brands.FirstOrDefaultAsync(b => b.BrandID == id);
            if (entity == null) return NotFound();

            _db.Brands.Remove(entity);
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // U slučaju FK ograničenja vraćamo 409
                return Conflict("Brisanje nije moguće zbog povezanih zapisa (FK).");
            }
            return NoContent();
        }

        public class LogoDto { public int? ImageID { get; set; } public string? ImagePath { get; set; } }

        [HttpPut("{id:int}/logo")]
        public async Task<IActionResult> SetLogo(int id, [FromBody] LogoDto dto)
        {
            var brand = await _db.Brands.FirstOrDefaultAsync(b => b.BrandID == id);
            if (brand == null) return NotFound();

            int? imageId = dto.ImageID;
            if (imageId == null && !string.IsNullOrWhiteSpace(dto.ImagePath))
            {
                var img = new Image { ImagePath = dto.ImagePath.Trim() };
                _db.Images.Add(img);
                await _db.SaveChangesAsync();
                imageId = img.ImageID;
            }

            brand.ImageID = imageId;
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}


