namespace SoftSolutions.DTOs.RequestDTO
{
    public class ServiceRequestDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public double? BasePrice { get; set; }
        public int CategoryId { get; set; }
    }
}
