namespace SoftSolutions.DTOs.RequestDTO
{
    public class BecomeProviderDTO
    {
        public int UserId { get; set; }
        public int ExperienceYears { get; set; }
        public bool IsAvailable { get; set; }
        public List<int> ServiceIds { get; set; } = new();
        public List<int> LocationIds { get; set; } = new();
    }
}
