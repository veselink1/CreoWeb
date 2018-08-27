using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Projector.Utilities;
using Projector.Models;

namespace Projector.Controllers
{
    public class HomeController : Controller
    {
        private ProjectorContext _context;
        public HomeController(ProjectorContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            User user = null;
            if (HttpContext.User.Claims.Count() > 0)
            {
                var email = HttpContext.User.Claims.First().Value;
                user = _context.User.FirstOrDefault(x => x.Email == email);
            }

            try
            {
                ViewData["PrerenderData"] = JsonConvert.SerializeObject(new {
                    User = user == null ? null : Utilities.Controllers.TrimUserForClient(user),
                    Request = new PlainRequest(Request),
                });
                return View();
            }
            catch (Exception e)
            {
                return Error(e);
            }
        }

        public IActionResult Error(Exception e)
        {
            ViewData["Exception"] = e;
            return Index();
        }
    }
}
