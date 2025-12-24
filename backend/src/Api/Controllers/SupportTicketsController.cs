
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Application.Dtos;
using Infrastructure.Persistence;            
using Infrastructure.Persistence.Entities;  

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SupportTicketsController : ControllerBase
    {
        private readonly AppDbContext _db;

        // Dozvoljeni statusi
        private static readonly string[] AllowedStatuses = new[] { "Pending", "InProgress", "Completed" };

        public SupportTicketsController(AppDbContext db)
        {
            _db = db;
        }

        // POST: /api/supporttickets
        // Kreira ticket sa default statusom "Pending" (Na čekanju)
        [HttpPost]
        public async Task<ActionResult<SupportTicketDto>> Create([FromBody] CreateSupportTicketDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Subject) || string.IsNullOrWhiteSpace(dto.Description))
                return BadRequest("Subject i Description su obavezni.");

            int? userId = null;
            var userIdClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var parsed)) userId = parsed;
            if (dto.UserID.HasValue) userId = dto.UserID;

            var ticket = new SupportTicket
            {
                Subject = dto.Subject,
                Description = dto.Description,
                Status = "Pending", // default
                UserID = userId
            };

            _db.SupportTickets.Add(ticket);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = ticket.TicketID }, ToDto(ticket));
        }

        // GET: /api/supporttickets/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<SupportTicketDto>> GetById(int id)
        {
            var ticket = await _db.SupportTickets.FirstOrDefaultAsync(t => t.TicketID == id);
            if (ticket == null) return NotFound();
            return ToDto(ticket);
        }

        // GET: /api/supporttickets
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SupportTicketDto>>> GetAll([FromQuery] int take = 50)
        {
            var items = await _db.SupportTickets
                                 .OrderByDescending(t => t.TicketID)
                                 .Take(take)
                                 .ToListAsync();
            return items.Select(ToDto).ToList();
        }

        // GET: /api/supporttickets/by-user/{userId}?status=Pending|InProgress|Completed
        [HttpGet("by-user/{userId:int}")]
        public async Task<ActionResult<IEnumerable<SupportTicketDto>>> GetByUser(int userId, [FromQuery] string? status = null)
        {
            var query = _db.SupportTickets.Where(t => t.UserID == userId);
            if (!string.IsNullOrWhiteSpace(status))
            {
                if (!AllowedStatuses.Contains(status)) return BadRequest("Nepoznat status.");
                query = query.Where(t => t.Status == status);
            }

            var items = await query.OrderByDescending(t => t.TicketID).ToListAsync();
            return items.Select(ToDto).ToList();
        }

        // GET: /api/supporttickets/mine?status=...
        // koristi userId iz JWT clafima (NameIdentifier)
        [HttpGet("mine")]
        public async Task<ActionResult<IEnumerable<SupportTicketDto>>> GetMine([FromQuery] string? status = null)
        {
            var userIdClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId)) return Unauthorized("Nema korisničkog ID-a.");
            return await GetByUser(userId, status);
        }

        // PATCH: /api/supporttickets/{id}/status?value=Pending|InProgress|Completed
        [HttpPatch("{id:int}/status")]
        public async Task<ActionResult<SupportTicketDto>> UpdateStatus(int id, [FromQuery] string value)
        {
            var ticket = await _db.SupportTickets.FirstOrDefaultAsync(t => t.TicketID == id);
            if (ticket == null) return NotFound();

            if (string.IsNullOrWhiteSpace(value)) return BadRequest("Status je obavezan.");
            if (!AllowedStatuses.Contains(value)) return BadRequest("Dozvoljeni statusi su: Pending, InProgress, Completed.");

            ticket.Status = value;
            await _db.SaveChangesAsync();

            return ToDto(ticket);
        }

        private static SupportTicketDto ToDto(SupportTicket t) => new SupportTicketDto
        {
            TicketID = t.TicketID,
            UserID = t.UserID,
            Subject = t.Subject ?? "",
            Description = t.Description ?? "",
            Status = t.Status ?? "Pending"
        };
    }
}
