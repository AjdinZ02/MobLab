using Infrastructure.Persistence;
using Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImagesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ImagesController(AppDbContext db) { _db = db; }

        public class ImageDto
        {
            public string ImagePath { get; set; } = string.Empty;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ImageDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ImagePath)) return BadRequest("ImagePath je obavezan.");
            var img = new Image { ImagePath = dto.ImagePath.Trim() };
            _db.Images.Add(img);
            await _db.SaveChangesAsync();
            return Ok(new { img.ImageID, img.ImagePath });
        }
    }
}


