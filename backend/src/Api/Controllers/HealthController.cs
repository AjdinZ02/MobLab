using Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly AppDbContext _db;
        public HealthController(AppDbContext db) { _db = db; }

        [HttpGet("db")]
        public async Task<IActionResult> Db()
        {
            var can = await _db.Database.CanConnectAsync();
            return can ? Ok(new { db = "ok" }) : StatusCode(500, new { db = "fail" });
        }
    }
}


