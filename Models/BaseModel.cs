using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoftSolutions.Models
{
    public class BaseModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public bool IsActive { get; set; } = true;

        public Guid GlobalId { get; set; } = Guid.NewGuid();

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        public int CreatedBy { get; set; }

        public int? UpdatedBy { get; set; }
        public int? DeletedBy { get; set; }
    }
}
