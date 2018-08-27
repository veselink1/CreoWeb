using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Projector.Models;
using Projector.Services;

namespace Projector.Controllers
{
    [Route("www")]
    public class UserWwwController : Controller
    {
        private ProjectorContext _db;
        private IUserWwwManager _wm;

        public UserWwwController(ProjectorContext db, IUserWwwManager wm)
        {
            _db = db;
            _wm = wm;
        }

        [HttpGet("{website}/{*path}")]
        public IActionResult Get(string website, string path)
        {
            try
            {
                ContentStream contentStream = _wm.Get(website, Uri.UnescapeDataString(path));
                return new FileStreamResult(contentStream.FileStream, contentStream.ContentType);
            }
            catch (Exception e)
            {
                return NotFound();
            }
        }

        public class UpdateData
        {
            public int? ProjectID { get; set; }
            public IFormFile Archive { get; set; }
        }

        [Authorize]
        [HttpPost("{website}")]
        public async Task<IActionResult> Update(string website, [FromForm] UpdateData updateData)
        {
            if (updateData == null 
                || updateData.Archive == null
                || !updateData.ProjectID.HasValue)
            {
                return new BadRequestResult();
            }

            var email = HttpContext.User.Claims.First().Value;
            var user = _db.User
                .First(x => x.Email == email);
            var projectId = updateData.ProjectID.Value;
            var site = _db.Site.First(x => x.ID == updateData.ProjectID);

            var isAuthorized = site.UserID == user.ID;
                // || JsonConvert.DeserializeObject<List<int>>(site.Contributors).Contains(user.ID);

            if (isAuthorized)
            {
                using (var archiveStream = updateData.Archive.OpenReadStream())
                {
                    ZipArchive zipArchive = null;
                    try
                    {
                        zipArchive = new ZipArchive(archiveStream);
                    }
                    catch (InvalidDataException e)
                    {
                        return new BadRequestResult();
                    }

                    await _wm.UpdateAsync(website, zipArchive);
                    return new JsonResult(new
                    {
                        Ok = true,
                    });
                }
            }
            else
            {
                return new ForbidResult();
            }
        }
    }
}
