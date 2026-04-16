namespace SoftSolutions.DTOs.RequestDTO
{
    public class ServiceRequestRequestDTO
    {
        public int UserId { get; set; }
        public int ServiceId { get; set; }
        public string ProblemDescription { get; set; }
        public int LocationId { get; set; }
    }
}
