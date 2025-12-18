
namespace Application.DTOs
{
    public class ReviewDto
    {
        public int ReviewID { get; set; }
        public string? ProductName { get; set; }
        public string? UserName { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public int? UserID { get; set; }
    }

    public class UpdateReviewDto
       {
        public int? Rating { get; set; }
        public string? Comment { get; set; }
    }
}