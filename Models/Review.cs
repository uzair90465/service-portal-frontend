namespace SoftSolutions.Models
{
    public class Review : BaseModel
    {
        public int OrderId { get; set; }

        public int Rating { get; set; }
        public string Comment { get; set; }
        public Order Order { get; set; }
    }
}
