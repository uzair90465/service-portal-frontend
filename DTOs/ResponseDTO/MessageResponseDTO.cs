namespace SoftSolutions.DTOs.ResponseDTO
{
    public class MessageResponseDTO
    {
        public int SenderId { get; set; }
        public string SenderName { get; set; }   // ⭐ ADD (UI ke liye)

        public int ReceiverId { get; set; }
        public string ReceiverName { get; set; } // ⭐ ADD

        public int ServiceRequestId { get; set; }

        public string MessageText { get; set; }

        public DateTime SentAt { get; set; }
    }
}
