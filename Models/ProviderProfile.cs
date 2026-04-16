namespace SoftSolutions.Models
{
    public class ProviderProfile:BaseModel
    {
        public int UserId { get; set; }
        public int ExperienceYears { get; set; }
        public bool IsAvailable { get; set; }
        public decimal? Rating { get; set; }
        public User User { get; set; }

    }
}
