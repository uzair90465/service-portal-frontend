namespace SoftSolutions.Models
{
    public class Role:BaseModel
    {
        public string Name { get; set; }
        public List<UserRole> userRoles { get; set; }
    }
}
