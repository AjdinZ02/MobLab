
using System.Collections.Generic;

namespace Application.Dtos
{
    public class OrderDto
    {
        public int OrderID { get; set; }
        public string? OrderDate { get; set; }        // yyyy-MM-dd
        public decimal TotalAmount { get; set; }
        public string? Status { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }
}
