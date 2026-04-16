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
    public class LocationsController : ControllerBase
    {
        private readonly DB _context;
        private readonly IMapper _mapper;

        public LocationsController(DB context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // ================= CREATE LOCATION =================
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(LocationRequestDTO dto)
        {
            var location = _mapper.Map<Location>(dto);
            _context.Locations.Add(location);
            await _context.SaveChangesAsync();
            var result = _mapper.Map<LocationResponseDTO>(location);
            return Ok(result);
        }

        // ================= GET ALL =================
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var locations = await _context.Locations.ToListAsync();
            var result = _mapper.Map<List<LocationResponseDTO>>(locations);
            return Ok(result);
        }

        // ================= GET BY ID =================
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return NotFound();
            var result = _mapper.Map<LocationResponseDTO>(location);
            return Ok(result);
        }

        // ================= UPDATE LOCATION =================
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, LocationRequestDTO dto)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return NotFound();
            _mapper.Map(dto, location);
            await _context.SaveChangesAsync();
            var result = _mapper.Map<LocationResponseDTO>(location);
            return Ok(result);
        }

        // ================= DELETE LOCATION =================
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return NotFound();
            _context.Locations.Remove(location);
            await _context.SaveChangesAsync();
            return Ok("Location deleted");
        }
    }
}