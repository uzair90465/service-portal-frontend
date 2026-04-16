using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using SoftSolutions.Database;
using SoftSolutions.DTOs.RequestDTO;
using SoftSolutions.DTOs.ResponseDTO;
using SoftSolutions.Models;
using AutoMapper;

namespace SoftSolutions.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceRequestController : ControllerBase
    {
        private readonly DB _context;
        private readonly IMapper _mapper;

        public ServiceRequestController(DB context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // ================= CREATE REQUEST =================
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Create(ServiceRequestRequestDTO dto)
        {
            var request = _mapper.Map<ServiceRequest>(dto);
            request.Status = "Pending";
            _context.ServiceRequests.Add(request);
            await _context.SaveChangesAsync();

            var savedRequest = await _context.ServiceRequests
                .Include(r => r.Service)
                .Include(r => r.Location)
                .FirstOrDefaultAsync(r => r.Id == request.Id);

            var result = _mapper.Map<ServiceRequestResponseDTO>(savedRequest);
            return Ok(result);
        }

        // ================= GET ALL =================
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var requests = await _context.ServiceRequests
                .Include(r => r.Service)
                .Include(r => r.Location)
                .Include(r => r.User)
                .ToListAsync();

            var result = _mapper.Map<List<ServiceRequestResponseDTO>>(requests);
            return Ok(result);
        }

        // ================= GET BY USER =================
        [AllowAnonymous]
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var requests = await _context.ServiceRequests
                .Include(r => r.Service)
                .Include(r => r.Location)
                .Where(r => r.UserId == userId)
                .ToListAsync();

            var result = _mapper.Map<List<ServiceRequestResponseDTO>>(requests);
            return Ok(result);
        }

        // ================= GET FOR PROVIDER =================
        [AllowAnonymous]
        [HttpGet("provider/{providerId}")]
        public async Task<IActionResult> GetForProvider(int providerId)
        {
            var providerServices = await _context.ProviderServices
                .Where(p => p.ProviderId == providerId)
                .Select(p => p.ServiceId)
                .ToListAsync();

            var requests = await _context.ServiceRequests
                .Include(r => r.Service)
                .Include(r => r.Location)
                .Where(r =>
                    r.Status == "Pending"
                    && providerServices.Contains(r.ServiceId)
                )
                .ToListAsync();

            var result = _mapper.Map<List<ServiceRequestResponseDTO>>(requests);
            return Ok(result);
        }

        // ================= UPDATE STATUS =================
        [AllowAnonymous]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, string status)
        {
            var request = await _context.ServiceRequests.FindAsync(id);
            if (request == null)
                return NotFound();

            request.Status = status;
            await _context.SaveChangesAsync();
            return Ok("Status updated");
        }

        // ================= UPDATE REQUEST =================
        [AllowAnonymous]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ServiceRequestRequestDTO dto)
        {
            var request = await _context.ServiceRequests.FindAsync(id);
            if (request == null)
                return NotFound();

            if (request.Status != "Pending")
                return BadRequest("Cannot edit a request that is already accepted or in progress.");

            _mapper.Map(dto, request);
            await _context.SaveChangesAsync();

            var result = _mapper.Map<ServiceRequestResponseDTO>(request);
            return Ok(result);
        }

        // ================= DELETE REQUEST =================
        [AllowAnonymous]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var request = await _context.ServiceRequests.FindAsync(id);
            if (request == null)
                return NotFound();

            if (request.Status == "Accepted")
                return BadRequest("Cannot delete an accepted request.");

            _context.ServiceRequests.Remove(request);
            await _context.SaveChangesAsync();
            return Ok("Service request deleted successfully");
        }
    }
}