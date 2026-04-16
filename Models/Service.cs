namespace SoftSolutions.Models
{
    public class Service : BaseModel
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public double? BasePrice { get; set; }
        public int CategoryId { get; set; }
        public Category Category { get; set; }
        public List<ProviderService> ProviderServices { get; set; }
    }
}
