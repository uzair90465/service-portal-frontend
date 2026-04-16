using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSolutions.Database;
using SoftSolutions.DTOs.RequestDTO;
using SoftSolutions.DTOs.ResponseDTO;
using SoftSolutions.Models;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;

namespace SoftSolutions.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceController : ControllerBase
    {
        private readonly DB _context;
        private readonly IMapper _mapper;

        public ServiceController(DB context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // ================= GET ALL SERVICES =================
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var services = await _context.Services
                .Include(s => s.Category)
                .ToListAsync();
            var result = _mapper.Map<List<ServiceResponseDTO>>(services);
            return Ok(result);
        }

        // ================= GET BY ID =================
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var service = await _context.Services
                .Include(s => s.Category)
                .FirstOrDefaultAsync(s => s.Id == id);
            if (service == null)
                return NotFound();
            var result = _mapper.Map<ServiceResponseDTO>(service);
            return Ok(result);
        }

        // ================= GET BY CATEGORY =================
        [AllowAnonymous]
        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetByCategory(int categoryId)
        {
            var services = await _context.Services
                .Where(s => s.CategoryId == categoryId)
                .Include(s => s.Category)
                .ToListAsync();
            var result = _mapper.Map<List<ServiceResponseDTO>>(services);
            return Ok(result);
        }

        // ================= CREATE SERVICE =================
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(ServiceRequestDTO dto)
        {
            var service = _mapper.Map<Service>(dto);
            _context.Services.Add(service);
            await _context.SaveChangesAsync();
            var result = _mapper.Map<ServiceResponseDTO>(service);
            return Ok(result);
        }

        // ================= UPDATE SERVICE =================
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ServiceRequestDTO dto)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
                return NotFound();
            _mapper.Map(dto, service);
            await _context.SaveChangesAsync();
            var result = _mapper.Map<ServiceResponseDTO>(service);
            return Ok(result);
        }

        // ================= DELETE SERVICE =================
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
                return NotFound();
            _context.Services.Remove(service);
            await _context.SaveChangesAsync();
            return Ok("Service deleted successfully");
        }
    }
}