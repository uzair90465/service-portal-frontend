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
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly DB _context;
        private readonly IMapper _mapper;

        public ReviewsController(DB context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // ================= ADD REVIEW =================
        [HttpPost]
        public async Task<IActionResult> CreateReview(ReviewRequestDTO dto)
        {
            var order = await _context.Orders
                .Include(o => o.ServiceRequest)
                .FirstOrDefaultAsync(o => o.Id == dto.OrderId);

            if (order == null)
                return NotFound("Order not found");

            if (order.Status != "Completed")
                return BadRequest("Order not completed yet");

            var exists = await _context.Reviews
                .AnyAsync(r => r.OrderId == dto.OrderId);

            if (exists)
                return BadRequest("Review already exists");

            var review = _mapper.Map<Review>(dto);
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var result = _mapper.Map<ReviewResponseDTO>(review);
            return Ok(result);
        }

        // ================= GET REVIEWS BY ORDER =================
        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetByOrder(int orderId)
        {
            var review = await _context.Reviews
                .Where(r => r.OrderId == orderId)
                .FirstOrDefaultAsync();

            if (review == null)
                return NotFound();

            var result = _mapper.Map<ReviewResponseDTO>(review);
            return Ok(result);
        }

        // ================= GET ALL REVIEWS =================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reviews = await _context.Reviews
                .Include(r => r.Order)
                    .ThenInclude(o => o.ServiceRequest)
                .ToListAsync();

            var requestIds = reviews
                .Select(r => r.Order.ServiceRequestId)
                .Distinct()
                .ToList();

            var acceptedOffers = await _context.RequestOffers
                .Include(o => o.Provider)
                .Where(o => requestIds.Contains(o.RequestId) && o.Status == "Accepted")
                .ToListAsync();

            var result = reviews.Select(r =>
            {
                var dto = _mapper.Map<ReviewResponseDTO>(r);
                var offer = acceptedOffers
                    .FirstOrDefault(o => o.RequestId == r.Order.ServiceRequestId);
                dto.ProviderName = offer?.Provider?.Name ?? "N/A";
                return dto;
            }).ToList();

            return Ok(result);
        }

        // ================= UPDATE REVIEW =================
        [HttpPut("{orderId}")]
        public async Task<IActionResult> Update(int orderId, ReviewRequestDTO dto)
        {
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.OrderId == orderId);
            if (review == null)
                return NotFound("Review not found");

            _mapper.Map(dto, review);
            await _context.SaveChangesAsync();

            var result = _mapper.Map<ReviewResponseDTO>(review);
            return Ok(result);
        }

        // ================= DELETE REVIEW =================
        [HttpDelete("{orderId}")]
        public async Task<IActionResult> Delete(int orderId)
        {
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.OrderId == orderId);
            if (review == null)
                return NotFound();

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return Ok("Review deleted successfully");
        }
    }
}