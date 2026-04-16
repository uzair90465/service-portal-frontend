namespace SoftSolutions.DTOs.ResponseDTO
{
    public class RequestOfferResponseDTO
    {
        public int Id { get; set; }

        public int RequestId { get; set; }

        public int ProviderId { get; set; }

        public string ProviderName { get; set; }  // useful for UI

        public decimal OfferedPrice { get; set; }

        public string Message { get; set; }

        public string Status { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}