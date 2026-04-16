using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoftSolutions.Database;
using SoftSolutions.DTOs.ResponseDTO;
using SoftSolutions.Models;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;

namespace SoftSolutions.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly DB _context;
        private readonly IMapper _mapper;

        public OrdersController(DB context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _context.Orders
                .Include(o => o.ServiceRequest)
                .ToListAsync();
            var result = _mapper.Map<List<OrderResponseDTO>>(orders);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.ServiceRequest)
                .FirstOrDefaultAsync(o => o.Id == id);
            if (order == null)
                return NotFound();
            var result = _mapper.Map<OrderResponseDTO>(order);
            return Ok(result);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var orders = await _context.Orders
                .Include(o => o.ServiceRequest)
                .Where(o => o.ServiceRequest.UserId == userId)
                .ToListAsync();
            var result = _mapper.Map<List<OrderResponseDTO>>(orders);
            return Ok(result);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound();
            order.Status = status;
            await _context.SaveChangesAsync();
            return Ok("Order status updated");
        }

        [HttpPost("{id}/complete")]
        public async Task<IActionResult> CompleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound();
            order.Status = "Completed";
            order.PaymentStatus = "Paid";
            await _context.SaveChangesAsync();
            return Ok("Order completed successfully");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound();
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return Ok("Order deleted");
        }
    }
}