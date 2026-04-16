namespace SoftSolutions.DTOs.ResponseDTO
{
    public class OrderResponseDTO
    {
        public int ServiceRequestId { get; set; }
        public double? TotalAmount { get; set; }
        public decimal? CommissionPercentage { get; set; }
        public double? CommissionAmount { get; set; }
        public double? ProviderEarning { get; set; }
        public string PaymentStatus { get; set; }
        public string Status { get; set; }
    }
}
