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
    public class MessagesController : ControllerBase
    {
        private readonly DB _context;
        private readonly IMapper _mapper;

        public MessagesController(DB context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // ================= SEND MESSAGE =================
        [Authorize(Roles = "User,Provider")]
        [HttpPost]
        public async Task<IActionResult> SendMessage(MessageRequestDTO dto)
        {
            var message = _mapper.Map<Message>(dto);
            message.SentAt = DateTime.Now;
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
            var result = _mapper.Map<MessageResponseDTO>(message);
            return Ok(result);
        }

        // ================= GET CHAT BY SERVICE REQUEST =================
        [Authorize(Roles = "User,Provider,Admin")]
        [HttpGet("request/{requestId}")]
        public async Task<IActionResult> GetChat(int requestId)
        {
            var messages = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.ServiceRequestId == requestId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();
            var result = _mapper.Map<List<MessageResponseDTO>>(messages);
            return Ok(result);
        }

        // ================= GET USER CHAT HISTORY =================
        [Authorize(Roles = "User,Provider,Admin")]
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserMessages(int userId)
        {
            var messages = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();
            var result = _mapper.Map<List<MessageResponseDTO>>(messages);
            return Ok(result);
        }

        // ================= GET ALL MESSAGES =================
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var messages = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();
            var result = _mapper.Map<List<MessageResponseDTO>>(messages);
            return Ok(result);
        }

        // ================= UPDATE MESSAGE =================
        [Authorize(Roles = "User,Provider")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, MessageRequestDTO dto)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null)
                return NotFound();
            message.MessageText = dto.MessageText;
            await _context.SaveChangesAsync();
            var result = _mapper.Map<MessageResponseDTO>(message);
            return Ok(result);
        }

        // ================= DELETE MESSAGE =================
        [Authorize(Roles = "User,Provider,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null)
                return NotFound();
            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();
            return Ok("Message deleted");
        }
    }
}