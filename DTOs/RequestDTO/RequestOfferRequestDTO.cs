namespace SoftSolutions.DTOs.RequestDTO
{
    public class RequestOfferRequestDTO
    {
        public int RequestId { get; set; }

        public int ProviderId { get; set; }

        public decimal OfferedPrice { get; set; }

        public string Message { get; set; }
    }
}