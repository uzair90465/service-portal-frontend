namespace SoftSolutions.Models
{
    public class Location : BaseModel
    {
        public string Name { get; set; }
        public int? ParentId { get; set; }

        public Location Parent { get; set; }
        public List<Location> Children { get; set; }
    }
}
