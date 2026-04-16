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
    public class CategoriesController : ControllerBase
    {
        private readonly DB _context;
        private readonly IMapper _mapper;

        public CategoriesController(DB context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // ================= CREATE CATEGORY =================
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(CategoryRequestDTO dto)
        {
            var category = _mapper.Map<Category>(dto);
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            var result = _mapper.Map<CategoryResponseDTO>(category);
            return Ok(result);
        }

        // ================= GET ALL =================
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _context.Categories.ToListAsync();
            var result = _mapper.Map<List<CategoryResponseDTO>>(categories);
            return Ok(result);
        }

        // ================= GET BY ID =================
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();
            var result = _mapper.Map<CategoryResponseDTO>(category);
            return Ok(result);
        }

        // ================= UPDATE CATEGORY =================
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CategoryRequestDTO dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();
            _mapper.Map(dto, category);
            await _context.SaveChangesAsync();
            var result = _mapper.Map<CategoryResponseDTO>(category);
            return Ok(result);
        }

        // ================= DELETE CATEGORY =================
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return Ok("Category deleted");
        }
    }
}