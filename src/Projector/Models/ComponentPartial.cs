using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Projector.Models
{
    public partial class ComponentPartial
    {
        public int ID { get; set; }
        public int SiteID { get; set; }
        public string ComponentText { get; set; }
        public bool? IsPage { get; set; }
        public bool? IsPrefab { get; set; }
        public string Name { get; set; }
        public string Screenshot { get; set; }
        public DateTime CreationDate { get; set; }
        public int? Creator { get; set; }
        public DateTime LastEdited { get; set; }
        public int? LastEditedBy { get; set; }
        public string Resources { get; set; }
        public string Description { get; set; }
        public int? AccessLevel { get; set; }
        public string Path { get; set; }
        public Int64 size { get; set; }
        public int GetSize()
        {
            return 4 + 4 + ComponentText.Length * 2 + 1 + 1 + Name.Length * 2 + Screenshot.Length * 2 + 3 + 4 + 3 + 4 + Resources.Length * 2 + Description.Length * 2 + 4 + Path.Length * 2;
        }
        public ComponentPartial()
        {
        }
        public ComponentPartial(Component c)
        {
            ID = c.ID;
            SiteID = c.SiteID;
            ComponentText = c.ComponentText;
            IsPage = c.IsPage;
            IsPrefab = c.IsPrefab;
            Name = c.Name;
            Screenshot = c.Screenshot;
            CreationDate = c.CreationDate;
            Creator = c.Creator;
            LastEdited = c.LastEdited;
            LastEditedBy = c.LastEditedBy;
            Resources = c.Resources;
            Description = c.Description;
            AccessLevel = c.AccessLevel;
            Path = c.Path;
            size = GetSize();
        }
        public Component ToComponent()
        {
            Component c = new Component();
            c.ID = ID;
            c.SiteID = SiteID;
            c.ComponentText = ComponentText;
            c.IsPage = (bool)IsPage;
            c.IsPrefab = (bool)IsPrefab;
            c.Name = Name;
            c.Screenshot = Screenshot;
            c.CreationDate = CreationDate;
            c.Creator = (int)Creator;
            c.LastEdited = LastEdited;
            c.LastEditedBy = (int)LastEditedBy;
            c.Resources = Resources;
            c.Description = Description;
            c.AccessLevel = (int)AccessLevel;
            c.Path = Path;
            return c;
        }
    }
}
