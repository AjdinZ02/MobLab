
namespace Application.Dtos
{
    public class OrderItemDto
    {
        public int? VersionID { get; set; }
        public string ModelName { get; set; } = string.Empty;
        public string? Variant { get; set; } // npr. "Blue / 128GB"
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
    }
}
