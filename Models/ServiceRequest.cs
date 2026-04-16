namespace SoftSolutions.Models
{
    public class ServiceRequest : BaseModel
    {
        public int UserId { get; set; }
        public int ServiceId { get; set; }
        public string ProblemDescription { get; set; }
        public int LocationId { get; set; }
        public string Status { get; set; }
        public User User { get; set; }
        public Service Service { get; set; }
        public Location Location { get; set; }
        public Order Order { get; set; }
    }
}
