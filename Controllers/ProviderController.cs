using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSolutions.Database;
using SoftSolutions.Models;
using SoftSolutions.DTOs.RequestDTO;
using SoftSolutions.DTOs.ResponseDTO;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;

namespace SoftSolutions.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProviderController : ControllerBase
    {
        private readonly DB _context;
        private readonly IMapper _mapper;

        public ProviderController(DB context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // ================= CREATE PROVIDER PROFILE =================
        [AllowAnonymous]
        [HttpPost("create-profile")]
        public async Task<IActionResult> CreateProfile(ProviderProfileRequestDTO dto)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
            if (!userExists)
                return BadRequest("User not found");

            var profile = _mapper.Map<ProviderProfile>(dto);
            _context.ProviderProfiles.Add(profile);
            await _context.SaveChangesAsync();

            var result = _mapper.Map<ProviderProfileResponseDTO>(profile);
            return Ok(result);
        }

        // ================= ASSIGN SERVICES =================
        [AllowAnonymous]
        [HttpPost("assign-services")]
        public async Task<IActionResult> AssignServices(ProviderServiceRequestDTO dto)
        {
            var exists = await _context.ProviderServices
                .AnyAsync(x => x.ProviderId == dto.ProviderId && x.ServiceId == dto.ServiceId);

            if (exists)
                return BadRequest("Service already assigned");

            var entity = _mapper.Map<ProviderService>(dto);
            _context.ProviderServices.Add(entity);
            await _context.SaveChangesAsync();

            return Ok("Service assigned successfully");
        }

        // ================= ASSIGN LOCATIONS =================
        [AllowAnonymous]
        [HttpPost("assign-locations")]
        public async Task<IActionResult> AssignLocations(ProviderLocationRequestDTO dto)
        {
            var exists = await _context.ProviderLocations
                .AnyAsync(x => x.ProviderId == dto.ProviderId && x.LocationId == dto.LocationId);

            if (exists)
                return BadRequest("Location already assigned");

            var entity = _mapper.Map<ProviderLocation>(dto);
            _context.ProviderLocations.Add(entity);
            await _context.SaveChangesAsync();

            return Ok("Location assigned successfully");
        }

        // ================= GET PROVIDER BY USER ID =================
        [AllowAnonymous]
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetProvider(int userId)
        {
            var profile = await _context.ProviderProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return NotFound();

            var services = await _context.ProviderServices
                .Where(x => x.ProviderId == userId)
                .ToListAsync();

            var locations = await _context.ProviderLocations
                .Where(x => x.ProviderId == userId)
                .ToListAsync();

            var result = new ProviderFullResponseDTO
            {
                Profile = _mapper.Map<ProviderProfileResponseDTO>(profile),
                Services = _mapper.Map<List<ProviderServiceResponseDTO>>(services),
                Locations = _mapper.Map<List<ProviderLocationResponseDTO>>(locations)
            };

            return Ok(result);
        }

        // ================= GET ALL PROVIDERS =================
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var profiles = await _context.ProviderProfiles
                .Include(p => p.User)
                .ToListAsync();
            var result = _mapper.Map<List<ProviderProfileResponseDTO>>(profiles);
            return Ok(result);
        }

        // ================= UPDATE PROVIDER PROFILE =================
        [AllowAnonymous]
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateProfile(int userId, ProviderProfileRequestDTO dto)
        {
            var profile = await _context.ProviderProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
                return NotFound();

            _mapper.Map(dto, profile);
            await _context.SaveChangesAsync();

            var result = _mapper.Map<ProviderProfileResponseDTO>(profile);
            return Ok(result);
        }

        // ================= DELETE PROVIDER PROFILE =================
        [AllowAnonymous]
        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteProfile(int userId)
        {
            var profile = await _context.ProviderProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
                return NotFound();

            _context.ProviderProfiles.Remove(profile);
            await _context.SaveChangesAsync();
            return Ok("Provider profile deleted");
        }

        // ================= REMOVE ASSIGNED SERVICE =================
        [AllowAnonymous]
        [HttpDelete("remove-service/{providerId}/{serviceId}")]
        public async Task<IActionResult> RemoveService(int providerId, int serviceId)
        {
            var entity = await _context.ProviderServices
                .FirstOrDefaultAsync(x => x.ProviderId == providerId && x.ServiceId == serviceId);
            if (entity == null)
                return NotFound();

            _context.ProviderServices.Remove(entity);
            await _context.SaveChangesAsync();
            return Ok("Service removed");
        }

        // ================= REMOVE ASSIGNED LOCATION =================
        [AllowAnonymous]
        [HttpDelete("remove-location/{providerId}/{locationId}")]
        public async Task<IActionResult> RemoveLocation(int providerId, int locationId)
        {
            var entity = await _context.ProviderLocations
                .FirstOrDefaultAsync(x => x.ProviderId == providerId && x.LocationId == locationId);
            if (entity == null)
                return NotFound();

            _context.ProviderLocations.Remove(entity);
            await _context.SaveChangesAsync();
            return Ok("Location removed");
        }
    }
}