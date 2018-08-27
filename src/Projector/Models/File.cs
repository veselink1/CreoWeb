using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace Projector.Models
{
    public partial class File
    {
        public int ID { get; set; }
        public int SiteID { get; set; }
        public byte[] FileContent { get; set; }
        public string Path { get; set; }
    }
}
