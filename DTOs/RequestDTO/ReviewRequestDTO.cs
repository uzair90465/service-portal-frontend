namespace SoftSolutions.DTOs.RequestDTO
{
    public class ReviewRequestDTO
    {
        public int OrderId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
    }
}
