namespace SoftSolutions.Models
{
    public class Message:BaseModel
    {
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public int ServiceRequestId { get; set; }
        public string MessageText { get; set; }
        public DateTime SentAt { get; set; }
        public User Sender { get; set; }
        public User Receiver { get; set; }
        public ServiceRequest ServiceRequest { get; set; }
    }
}