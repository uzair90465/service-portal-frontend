namespace SoftSolutions.Models
{
    public class ProviderService : BaseModel
    {
        public int ProviderId { get; set; }
        public int ServiceId { get; set; }

        public User Provider { get; set; }
        public Service Service { get; set; }
    }
}
