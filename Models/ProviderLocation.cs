namespace SoftSolutions.Models
{
    public class ProviderLocation: BaseModel
    {
        public int ProviderId { get; set; }
        public int LocationId { get; set; }

        public User Provider { get; set; }
        public Location Location { get; set; }
    }
}
