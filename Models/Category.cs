namespace SoftSolutions.Models
{
    public class Category:BaseModel
    {
        public string Name { get; set; }
        public int? ParentId { get; set; }
        public Category Parent { get; set; }
        public List<Category> Children { get; set; }
        public List<Service> Services { get; set; }
    }
}
