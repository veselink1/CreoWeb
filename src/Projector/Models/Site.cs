using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace Projector.Models
{
    public partial class Site
    {
        public int ID { get; set; }
        public int UserID { get; set; }
        public string SiteName { get; set; }
        public string Description { get; set; }
        public string Favicon { get; set; }
        public bool IsPublic { get; set; }
        public bool IsHosted { get; set; }
        public string Url { get; set; }
        public int Storage { get; set; }
        public string Resources { get; set; }
        public string Contributors { get; set; }
        public int MainPage { get; set; }
       /* public int size { get; set; } 
        public int GetSize()
        {
            return 4 + 4 + SiteName.Length * 2 + Description.Length * 2 + Favicon.Length * 2 + 1 + 1 + Url.Length * 2 + 4 + Resources.Length * 2 + Contributors.Length * 2 + 4;
        }*/
    }
}
