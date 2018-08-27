using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Projector.Models
{
    public partial class ProjectorContext : DbContext
    {
        public ProjectorContext(DbContextOptions<ProjectorContext> options): base(options)
    { }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(@"Data Source=projector.database.windows.net;Initial Catalog=projector_db;User ID=projector;Password=PAss1234;MultipleActiveResultSets=true");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.ID).IsRequired();
            });

            modelBuilder.Entity<Site>(entity =>
            {
                entity.Property(e => e.ID).IsRequired();
            });
            modelBuilder.Entity<Component>(entity =>
            {
                entity.Property(e => e.ID).IsRequired();
            });
            modelBuilder.Entity<File>(entity =>
            {
                entity.Property(e => e.ID).IsRequired();
            });
        }

        public virtual DbSet<User> User { get; set; }
        public virtual DbSet<Site> Site { get; set; }
        public virtual DbSet<Component> Component { get; set; }
        public virtual DbSet<File> Address { get; set; }
    }
}
