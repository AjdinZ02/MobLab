
namespace Application.Dtos
{
    public class WishlistItemDto
    {
        public int WishlistID { get; set; }
        public int ProductID { get; set; }
        public string ModelName { get; set; } = string.Empty;
        public decimal? Price { get; set; }
        public string? ImagePath { get; set; }
        // ⬇ umjesto DateTime? koristimo string (ISO yyyy-MM-dd)
        public string? DateAdded { get; set; }
    }
}
