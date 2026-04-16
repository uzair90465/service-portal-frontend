using AutoMapper;
using SoftSolutions.DTOs.RequestDTO;
using SoftSolutions.DTOs.ResponseDTO;
using SoftSolutions.Models;

namespace SoftSolutions.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // ================= USER =================
            CreateMap<User, UserResponseDTO>();
            CreateMap<UserRequestDTO, User>();

            //CreateMap<UserRequestDTO, User>();
            //CreateMap<User, UserResponseDTO>();

            // ================= CATEGORY =================
            CreateMap<Category, CategoryResponseDTO>();
            CreateMap<CategoryRequestDTO, Category>();

            // ================= LOCATION =================
            CreateMap<Location, LocationResponseDTO>();
            CreateMap<LocationRequestDTO, Location>();

            // ================= SERVICE =================
            CreateMap<Service, ServiceResponseDTO>()
                .ForMember(dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Category.Name));

            CreateMap<ServiceRequestDTO, Service>();

            // ================= PROVIDER PROFILE =================
            CreateMap<ProviderProfile, ProviderProfileResponseDTO>()
                .ForMember(dest => dest.UserName,
                    opt => opt.MapFrom(src => src.User.Name));

            CreateMap<ProviderProfileRequestDTO, ProviderProfile>();

            //================= SERVICE REQUEST =================
            //Console.WriteLine(savedRequest.Service?.Title);
            //Console.WriteLine(savedRequest.Location?.Name);
            CreateMap<ServiceRequest, ServiceRequestResponseDTO>()
    .ForMember(dest => dest.ServiceTitle,
        opt => opt.MapFrom(src => src.Service.Title))
    .ForMember(dest => dest.LocationName,
        opt => opt.MapFrom(src => src.Location.Name))
    .ForMember(dest => dest.UserId,
        opt => opt.MapFrom(src => src.UserId)); // ADD THIS LINE
            CreateMap<ServiceRequestRequestDTO, ServiceRequest>();

            // ================= ORDER =================
            CreateMap<Order, OrderResponseDTO>();
            CreateMap<OrderRequestDTO, Order>();

            // ================= REVIEW =================
            CreateMap<Review, ReviewResponseDTO>();
            CreateMap<ReviewRequestDTO, Review>();

            CreateMap<RequestOffer, RequestOfferResponseDTO>()
    .ForMember(dest => dest.ProviderName,
        opt => opt.MapFrom(src => src.Provider.Name));

            CreateMap<RequestOfferRequestDTO, RequestOffer>();




            CreateMap<Message, MessageResponseDTO>()
    .ForMember(dest => dest.SenderName,
        opt => opt.MapFrom(src => src.Sender.Name))
    .ForMember(dest => dest.ReceiverName,
        opt => opt.MapFrom(src => src.Receiver.Name));

            CreateMap<MessageRequestDTO, Message>();



            CreateMap<Review, ReviewResponseDTO>();
            CreateMap<ReviewRequestDTO, Review>();


            CreateMap<Category, CategoryResponseDTO>();
            CreateMap<CategoryRequestDTO, Category>();


            CreateMap<Location, LocationResponseDTO>();
            CreateMap<LocationRequestDTO, Location>();



            // Provider Profile
            CreateMap<ProviderProfile, ProviderProfileResponseDTO>()
                .ForMember(dest => dest.UserName,
                    opt => opt.MapFrom(src => src.User.Name));

            CreateMap<ProviderProfileRequestDTO, ProviderProfile>();

            // Provider Service
            CreateMap<ProviderService, ProviderServiceResponseDTO>();
            CreateMap<ProviderServiceRequestDTO, ProviderService>();

            // Provider Location
            CreateMap<ProviderLocation, ProviderLocationResponseDTO>();
            CreateMap<ProviderLocationRequestDTO, ProviderLocation>();



        }
    }
}