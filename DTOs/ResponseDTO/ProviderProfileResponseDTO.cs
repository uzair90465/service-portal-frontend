namespace SoftSolutions.DTOs.ResponseDTO
{
    public class ProviderProfileResponseDTO
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int ExperienceYears { get; set; }
        public bool IsAvailable { get; set; }
        public decimal? Rating { get; set; }
    }
}
