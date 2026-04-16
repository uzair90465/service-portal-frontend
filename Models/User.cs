namespace SoftSolutions.Models
{
    public class User:BaseModel
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public List<UserRole> UserRoles { get; set; }
        public ProviderProfile ProviderProfile { get; set; }
        public List<ServiceRequest> ServiceRequests { get; set; }
    }
}
