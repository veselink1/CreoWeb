using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Projector.Models
{
    public class SitePartial
    {
        public int ID { get; set; }
        public int UserID { get; set; }
        public string SiteName { get; set; }
        public string Description { get; set; }
        public string Favicon { get; set; }
        public bool? IsPublic { get; set; }
        public bool? IsHosted { get; set; }
        public string Url { get; set; }
        public int? Storage { get; set; }
        public string Resources { get; set; }
        public string Contributors { get; set; }
        public int? MainPage { get; set; }
        public Int64 size { get; set; }
        public List<Collaborator> Collaborators { get; set; }
        public int GetSize()
        {
            return 4 + 4 + SiteName.Length * 2 + Description.Length * 2 + Favicon.Length * 2 + 1 + 1 + Url.Length * 2 + 4 + Resources.Length * 2 + Contributors.Length * 2 + 4;
        }
        public SitePartial(Site s)
        {
            ID = s.ID;
            UserID = s.UserID;
            SiteName = s.SiteName;
            Description = s.Description;
            Favicon = s.Favicon;
            IsPublic = s.IsPublic;
            IsHosted = s.IsHosted;
            Url = s.Url;
            Storage = s.Storage;
            Resources = s.Resources;
            Contributors = s.Contributors;
            MainPage = s.MainPage;
            size = GetSize();
        }
        public SitePartial()
        {
        }
        public Site ToSite()
        {
            Site s = new Site();
            s.ID =ID;
            s.UserID = UserID;
            s.SiteName=SiteName;
            s.Description=Description;
            s.Favicon=Favicon;
            s.IsPublic= (bool)IsPublic;
            s.IsHosted = (bool)IsHosted;
            s.Url = Url;
            s.Storage =(int)Storage;
            s.Resources = Resources;
            s.Contributors = Contributors;
            s.MainPage = (int)MainPage;
            return s;
        }
    }
    public class Collaborator
    {
        public string Email { get; set; }
        public int Level { get; set; }
    }
}
