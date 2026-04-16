namespace SoftSolutions.DTOs.ResponseDTO
{
    public class ProviderFullResponseDTO
    {
        public ProviderProfileResponseDTO Profile { get; set; }
        public List<ProviderServiceResponseDTO> Services { get; set; }
        public List<ProviderLocationResponseDTO> Locations { get; set; }
    }
}
