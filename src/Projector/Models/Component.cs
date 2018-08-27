using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace Projector.Models
{
    public partial class Component
    {
        public int ID { get; set; }
        public int SiteID { get; set; }
        public string ComponentText { get; set; }
        public bool IsPage { get; set; }
        public bool IsPrefab { get; set; }
        public string Name { get; set; }
        public string Screenshot { get; set; }
        public DateTime CreationDate { get; set; }
        public int Creator { get; set; }
        public DateTime LastEdited { get; set; }
        public int LastEditedBy { get; set; }
        public string Resources { get; set; }
        public string Description { get; set; }
        public int AccessLevel { get; set; }
        public string Path { get; set; }

        /*public int size { get; set; }

        public int GetSize()
        {
            return 4 + 4 + ComponentText.Length * 2 + 1 + 1 + Name.Length * 2 + Screenshot.Length * 2 + 3 + 4 + 3 + 4 + Resources.Length * 2 + Description.Length * 2 + 4 + Path.Length * 2;
        }*/

    }
}
