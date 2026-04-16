using Microsoft.EntityFrameworkCore;
using SoftSolutions.Models;

namespace SoftSolutions.Database
{
    public class DB: DbContext
    {
        public DB(DbContextOptions<DB> options) : base(options) { }

        public DbSet<RequestOffer> RequestOffers { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<ProviderLocation> ProviderLocations { get; set; }
        public DbSet<ProviderProfile> ProviderProfiles  { get; set; }
        public DbSet<ProviderService> ProviderServices { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<ServiceRequest> ServiceRequests { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ================= EXISTING CONFIG =================
            modelBuilder.Entity<Order>()
                .Property(o => o.CommissionPercentage)
                .HasPrecision(18, 4);

            modelBuilder.Entity<ProviderProfile>()
                .Property(o => o.Rating)
                .HasPrecision(18, 4);

            // ================= REQUEST OFFER CONFIG =================

            modelBuilder.Entity<RequestOffer>()
                .Property(x => x.OfferedPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<RequestOffer>()
                .Property(x => x.Status)
                .HasDefaultValue("Pending");

            modelBuilder.Entity<RequestOffer>()
                .Property(x => x.Message)
                .HasMaxLength(500);

            // ================= RELATIONSHIPS =================

            modelBuilder.Entity<RequestOffer>()
                .HasOne(o => o.Provider)
                .WithMany()
                .HasForeignKey(o => o.ProviderId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<RequestOffer>()
                .HasOne(o => o.ServiceRequest)
                .WithMany()
                .HasForeignKey(o => o.RequestId)
                .OnDelete(DeleteBehavior.Cascade);

            base.OnModelCreating(modelBuilder);
        }
    }
}
