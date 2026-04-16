namespace SoftSolutions.DTOs.RequestDTO
{
    public class OrderRequestDTO
    {
        public int Id {  get; set; }
        public int ServiceRequestId { get; set; }
        public double? TotalAmount { get; set; }
        public decimal? CommissionPercentage { get; set; }
        public double? CommissionAmount { get; set; }
        public double? ProviderEarning { get; set; }
        public string PaymentStatus { get; set; }
        public string Status { get; set; }
    }
}
