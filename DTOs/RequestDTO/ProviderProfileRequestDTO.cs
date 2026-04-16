namespace SoftSolutions.DTOs.RequestDTO
{
    public class ProviderProfileRequestDTO
    {
        public int UserId { get; set; }
        public int ExperienceYears { get; set; }
        public bool IsAvailable { get; set; }
        public decimal? Rating { get; set; }
    }
}
