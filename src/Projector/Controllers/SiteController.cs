using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Projector.Models;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.Text;
using Newtonsoft.Json;
using Projector.Utilities;
using System.IO;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Projector.Controllers
{
    [Route("api/Site")]
    public class SiteController : Controller
    {
        private ProjectorContext _context;
        private string _defaultSiteResources = null;

        public SiteController(ProjectorContext context)
        {
            _context = context;
        }
#if DEBUG
        [HttpGet("DeleteAll")]
        public object DeleteAll()
        {
            var users = _context.User.Where(x => x.ID == x.ID);
            foreach (var user in users)
            {
                if (user.Email != "test.user@mymail.me")
                {
                    var sites = _context.Site.Where(x => x.UserID == user.ID);
                    foreach (var site in sites)
                    {
                        var components = _context.Component.Where(x => x.SiteID == site.ID);
                        foreach (var component in components)
                        {
                            _context.Component.Remove(component);
                        }
                        _context.Site.Remove(site);
                    }
                    _context.User.Remove(user);
                }
            }
            _context.SaveChanges();
            return new { Success = true };
        }
#endif
        // GET: api/values
        [Authorize]
        [HttpPost("AddSite")]
        public async Task<object> AddSite([FromBody]Site site)
        {
            var email = HttpContext.User.Claims.First().Value;
            var user = _context.User.First(x => x.Email == email);

            if (_defaultSiteResources == null)
            {
                _defaultSiteResources = await AsyncIO.ReadAllTextAsync(Directory.GetCurrentDirectory() + @"\StaticData\Defaults\global-res.json", Encoding.UTF8);
            }
            if (site.Favicon.Length > 46600) site.Favicon = "data:image/png;base64,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";
            site.UserID = user.ID;
            site.IsPublic = false;
            site.MainPage = 0;
            site.Resources = _defaultSiteResources;
            site.Contributors = "{}";
            _context.Site.Add(site);
            _context.SaveChanges();
            site = _context.Site.OrderByDescending(x => x.ID).First(x => x.UserID == user.ID);
            Component component = new Component();
            component.ComponentText = "{}";
            component.SiteID = site.ID;
            component.Name = "HomePage";
            component.IsPage = true;
            component.IsPrefab = false;
            component.Screenshot = "";
            component.CreationDate = DateTime.Now;
            component.Creator = user.ID;
            component.LastEdited = DateTime.Now;
            component.LastEditedBy = user.ID;
            component.Description = "The default homepage.";
            component.AccessLevel = 0;
            component.Path = "/";
            component.Resources = "{}";
            _context.Component.Add(component);
            _context.SaveChanges();
            component = _context.Component.OrderByDescending(x => x.ID).First(x => x.SiteID == site.ID);
            site.MainPage = component.ID;
            _context.Site.Update(site);
            _context.SaveChanges();
            var u = new { ID = user.ID, username = user.Username };
            return new { Success = true, ID = site.ID, Size = new SitePartial(site).size, Main = new { ID = component.ID, SiteID = component.SiteID, ComponentText = component.ComponentText, Size = new ComponentPartial(component).size, IsPage = component.IsPage, IsPrefab = component.IsPrefab, Name = component.Name, Screenshot = component.Screenshot, CreationDate = component.CreationDate, Creator = u, LastEdited = component.LastEdited, LastEditedBy = u, Resources = component.Resources, Description = component.Description, AccessLevel = component.AccessLevel, Path = component.Path } };
        }

        [Authorize]
        [HttpPost("EditSite")]
        public object EditSite([FromBody]SitePartial site)
        {
            var email = HttpContext.User.Claims.First().Value;
            var user = _context.User.First(x => x.Email == email);
            var oldSite = _context.Site.First(x => x.ID == site.ID);
            if (user.ID == oldSite.UserID)
            {
                if (site.SiteName != null) oldSite.SiteName = site.SiteName;
                if (site.Description != null) oldSite.Description = site.Description;
                if (site.Favicon != null) oldSite.Favicon = site.Favicon;
                if (site.IsPublic != null) oldSite.IsPublic = site.IsPublic.Value;
                if (site.IsHosted != null) oldSite.IsHosted = site.IsHosted.Value;
                if (site.Url != null) oldSite.Url = site.Url;
                if (site.Storage != null) oldSite.Storage = site.Storage.Value;
                if (site.Contributors != null) oldSite.Contributors = site.Contributors;
                if (site.MainPage != null) oldSite.MainPage = site.MainPage.Value;
                if (site.Resources != null) oldSite.Resources = site.Resources;
                if (site.Storage != null) oldSite.Storage = site.Storage.Value;
                _context.Site.Update(oldSite);
                _context.SaveChanges();
                site = new SitePartial(oldSite);
                return new { Success = true, Size = site.size };
            }
            else
            {
                return NotFound(new { Success = false });
            }
        }
        [Authorize]
        [HttpPost("AddComponent")]
        public object AddComponent([FromBody]Component component)
        {
            var email = HttpContext.User.Claims.First().Value;
            var user = _context.User.First(x => x.Email == email);
            var site = _context.Site.First(x => x.ID == component.SiteID);
            if (site.UserID == user.ID)
            {
                component.CreationDate = DateTime.Now;
                component.Creator = user.ID;
                component.LastEdited = DateTime.Now;
                component.LastEditedBy = user.ID;
                component.Resources = "{}";
                component.AccessLevel = 0;
                component.Path = "/";
                if ((component.Description == null) || (component.Description == "")) component.Description = "";
                var u = new { ID = user.ID, username = user.Username };
                _context.Component.Add(component);
                _context.SaveChanges();
                component = _context.Component.OrderByDescending(x => x.ID).First(x => x.SiteID == site.ID);
                return new { Success = true, ID = component.ID, Creator = u, LastEditedBy = u, Size = new ComponentPartial(component) };
            }
            else
            {
                return NotFound(new { Success = false });
            }
        }
        [Authorize]
        [HttpPost("DeleteComponent")]
        public object DeleteComponent([FromBody]Component component)
        {
            var email = HttpContext.User.Claims.First().Value;
            var user = _context.User.First(x => x.Email == email);
            component = _context.Component.Last(x => x.ID == component.ID);
            var site = _context.Site.First(x => x.ID == component.SiteID);
            if (site.UserID == user.ID)
            {
                _context.Component.Remove(component);
                _context.SaveChanges();
                return new { Success = true };
            }
            else
            {
                return NotFound(new { Success = false });
            }
        }

        [Authorize]
        [HttpGet("ComponentData")]
        public object GetComponentText([FromQuery]int componentId)
        {
            var email = HttpContext.User.Claims.First().Value;
            var user = _context.User.First(x => x.Email == email);
            Component component = _context.Component.Last(x => x.ID == componentId);
            var site = _context.Site.First(x => x.ID == component.SiteID);
            if (site.UserID == user.ID)
            {
                return new { Success = true, Data = JsonConvert.DeserializeObject(component.ComponentText) };
            }
            else
            {
                return NotFound(new { Success = false });
            }
        }

        public class ResourceDataRequest
        {
            public int? ComponentId { get; set; }
            public int? SiteId { get; set; }
        }

        [Authorize]
        [HttpGet("ResourceData")]
        public object GetResourceData([FromQuery]ResourceDataRequest data)
        {
            var email = HttpContext.User.Claims.First().Value;
            var user = _context.User.First(x => x.Email == email);
            if (data.ComponentId.HasValue)
            {
                Component component = _context.Component.Last(x => x.ID == data.ComponentId.Value);
                var site = _context.Site.First(x => x.ID == component.SiteID);
                if (site.UserID == user.ID)
                {
                    return new { Success = true, Data = JsonConvert.DeserializeObject(component.Resources) };
                }
                else
                {
                    return NotFound(new { Success = false });
                }
            }
            if (data.SiteId.HasValue)
            {
                var site = _context.Site.First(x => x.ID == data.SiteId.Value);
                if (site.UserID == user.ID)
                {
                    return new { Success = true, Data = JsonConvert.DeserializeObject(site.Resources) };
                }
                else
                {
                    return NotFound(new { Success = false });
                }
            }
            return BadRequest();
        }

        public class ComponentTextPostBody
        {
            public int ComponentId { get; set; }
            public string ComponentText { get; set; }
        }

        [Authorize]
        [HttpPost("EditComponent")]
        public object EditComponent([FromBody]ComponentPartial component)
        {
            var email = HttpContext.User.Claims.First().Value;
            var user = _context.User.First(x => x.Email == email);
            var oldComponent = _context.Component.First(x => x.ID == component.ID);
            var site = _context.Site.First(x => x.ID == oldComponent.SiteID);
            if (user.ID == site.UserID)
            {
                if (component.Name != null) oldComponent.Name = component.Name;
                if (component.ComponentText != null) oldComponent.ComponentText = component.ComponentText;
                if (component.IsPage != null) oldComponent.IsPage = component.IsPage.Value;
                if (component.IsPrefab != null) oldComponent.IsPrefab = component.IsPrefab.Value;
                if (component.Screenshot != null) oldComponent.Screenshot = component.Screenshot;
                if (component.AccessLevel != null) oldComponent.AccessLevel = component.AccessLevel.Value;
                if (component.Description != null) oldComponent.Description = component.Description;
                if (component.Path != null) oldComponent.Path = component.Path;
                if (component.Resources != null) oldComponent.Resources = component.Resources;
                if (component.Screenshot != null) oldComponent.Screenshot = component.Screenshot;
                oldComponent.LastEdited = DateTime.Now;
                oldComponent.LastEditedBy = user.ID;
                _context.Component.Update(oldComponent);
                _context.SaveChanges();
                component = new ComponentPartial(oldComponent);
                return new { Success = true, Size = component.size };
            }
            else
            {
                return NotFound(new { Success = false });
            }
        }

        [Authorize]
        [HttpPost("DeleteSite")]
        public object DeleteSite([FromBody]Site site)
        {
            var email = HttpContext.User.Claims.First().Value;
            var user = _context.User.First(x => x.Email == email);
            site = _context.Site.First(x => x.ID == site.ID);
            if (user.ID == site.UserID)
            {
                var components = _context.Component.Where(x => x.SiteID == site.ID);
                foreach (var component in components)
                {
                    _context.Component.Remove(component);
                }
                _context.Site.Remove(site);
                _context.SaveChanges();
                return new { Success = true };
            }
            else
            {
                return NotFound(new { Success = false });
            }
        }

        [Authorize]
        [HttpPost("CheckCollaborator")]
        public object CheckCollaborator([FromBody]User user)
        {
            var email = HttpContext.User.Claims.First().Value;
            bool exists = false;
            if (_context.User.Any(x => x.Email == user.Email)) exists = true;
            if (user.Email == email) exists = false;
            if (exists)
            {
                User newUser = _context.User.First(x => x.Email == user.Email);
                user.ID = newUser.ID;
                user.Username = newUser.Username;
                user.FirstName = newUser.FirstName;
                user.LastName = newUser.LastName;
            }
            return new { Exists = exists, User = user };
        }

        [Authorize]
        [HttpGet("GetSites")]
        public object GetSites()
        {
            var email = HttpContext.User.Claims.First().Value;
            var user = _context.User.First(x => x.Email == email);
            var sites = _context.Site.Where(x => x.UserID == user.ID);
            List<SitePartial> sites2 = new List<SitePartial>();
            List<List<ComponentPartial>> pages = new List<List<ComponentPartial>>();
            foreach (var site in sites)
            {
                SitePartial sp = new SitePartial(site);
                sp.UserID = -99999;
                var components = _context.Component.Where(x => x.SiteID == site.ID);
                List<ComponentPartial> components2 = new List<ComponentPartial>();
                foreach (var component in components)
                {
                    ComponentPartial cp = new ComponentPartial(component);
                    cp.ComponentText = null;
                    components2.Add(cp);
                }
                pages.Add(components2);
                sites2.Add(sp);
            }
            return new { Success = true, Sites = sites2, Pages = pages };
        }
        private string ToUnicode(string str)
        {
            Encoding unicode = Encoding.Unicode;
            byte[] unicodeBytes = unicode.GetBytes(str);
            return (unicode.GetString(unicodeBytes, 0, unicodeBytes.Length));
        }

    }
}
