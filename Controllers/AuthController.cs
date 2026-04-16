using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SoftSolutions.Database;
using SoftSolutions.DTOs.RequestDTO;
using SoftSolutions.DTOs.ResponseDTO;
using SoftSolutions.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SoftSolutions.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly DB _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;

        public AuthController(DB context, IMapper mapper, IConfiguration config)
        {
            _context = context;
            _mapper = mapper;
            _config = config;
        }

        // ================= REGISTER =================
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRequestDTO dto)
        {
            var exists = await _context.Users
                .AnyAsync(u => u.Email == dto.Email);
            if (exists)
                return BadRequest("Email already exists");

            var user = _mapper.Map<User>(dto);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // ✅ Auto assign "User" role
            var userRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.Name == "User");

            if (userRole != null)
            {
                _context.UserRoles.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = userRole.Id,
                    CreatedBy = user.Id,
                    UpdatedBy = user.Id,
                });
                await _context.SaveChangesAsync();
            }

            var result = _mapper.Map<UserResponseDTO>(user);
            return Ok(result);
        }
        // ================= LOGIN =================
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequestDTO dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email == dto.Email &&
                    u.Password == dto.Password);

            if (user == null)
                return Unauthorized("Invalid email or password");

            // Get user role
            var userRole = await _context.UserRoles
                .Include(ur => ur.Role)
                .Where(ur => ur.UserId == user.Id)
                .Select(ur => ur.Role.Name)
                .FirstOrDefaultAsync() ?? "User";

            // Generate JWT Token
            var token = GenerateToken(user, userRole);

            return Ok(new LoginResponseDTO
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = userRole,
                Token = token
            });
        }

        // ================= GET ME =================
        [Authorize]
        [HttpGet("me")]

        public async Task<IActionResult> GetMe()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userIdClaim));
            if (user == null)
                return NotFound();

            var result = _mapper.Map<UserResponseDTO>(user);
            return Ok(result);
        }

        // ================= GENERATE TOKEN =================
        private string GenerateToken(User user, string role)
        {
            var keyString = "SoftSolutionsJwtKeyForAuthentication2024SecureKey";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Name),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Role, role)
    };

            var token = new JwtSecurityToken(
                issuer: "SoftSolutions",
                audience: "SoftSolutionsUsers",
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ================= BECOME PROVIDER =================

        
       
        //[Authorize]
        [HttpPost("become-provider")]
        public async Task<IActionResult> BecomeProvider(BecomeProviderDTO dto)
        {
            var alreadyProvider = await _context.ProviderProfiles
                .AnyAsync(p => p.UserId == dto.UserId);
            if (alreadyProvider)
                return BadRequest("Already a provider");

            var providerRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.Name == "Provider");
            if (providerRole == null)
                return BadRequest("Provider role not found");

            // User role remove karo
            var userRole = await _context.UserRoles
                .FirstOrDefaultAsync(ur => ur.UserId == dto.UserId);
            if (userRole != null)
                _context.UserRoles.Remove(userRole);

            // Provider role add karo
            _context.UserRoles.Add(new UserRole
            {
                UserId = dto.UserId,
                RoleId = providerRole.Id,
                CreatedBy = dto.UserId,
                UpdatedBy = dto.UserId,
            });

            // Provider profile create karo
            _context.ProviderProfiles.Add(new ProviderProfile
            {
                UserId = dto.UserId,
                ExperienceYears = dto.ExperienceYears,
                IsAvailable = dto.IsAvailable,
                CreatedBy = dto.UserId,
                UpdatedBy = dto.UserId,
            });

            await _context.SaveChangesAsync();

            // Services assign karo
            foreach (var serviceId in dto.ServiceIds)
            {
                _context.ProviderServices.Add(new ProviderService
                {
                    ProviderId = dto.UserId,
                    ServiceId = serviceId,
                    CreatedBy = dto.UserId,
                    UpdatedBy = dto.UserId,
                });
            }

            // Locations assign karo
            foreach (var locationId in dto.LocationIds)
            {
                _context.ProviderLocations.Add(new ProviderLocation
                {
                    ProviderId = dto.UserId,
                    LocationId = locationId,
                    CreatedBy = dto.UserId,
                    UpdatedBy = dto.UserId,
                });
            }

            await _context.SaveChangesAsync();

            // New token generate karo
            var user = await _context.Users.FindAsync(dto.UserId);
            var token = GenerateToken(user, "Provider");

            return Ok(new
            {
                message = "You are now a Provider!",
                token = token,
                role = "Provider"
            });
        }
    }
}