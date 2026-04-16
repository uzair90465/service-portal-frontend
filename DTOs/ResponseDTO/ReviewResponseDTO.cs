namespace SoftSolutions.DTOs.ResponseDTO
{
    public class ReviewResponseDTO
    {
        public int OrderId { get; set; }   // ⭐ ADD THIS (IMPORTANT)

        public string ProviderName { get; set; }
        public int Rating { get; set; }

        public string Comment { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
