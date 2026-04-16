using System;

namespace SoftSolutions.Models
{
    public class RequestOffer
    {
        public int Id { get; set; }

        public int RequestId { get; set; }

        public int ProviderId { get; set; }

        public decimal OfferedPrice { get; set; }

        public string Message { get; set; }

        public string Status { get; set; }

        public DateTime CreatedAt { get; set; }

        public ServiceRequest ServiceRequest { get; set; }

        public User Provider { get; set; }
    }
}