using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Projector.Services;
using Projector.Models;
using System.IO;
using Newtonsoft.Json.Linq;
using Microsoft.Net.Http.Headers;
using Microsoft.AspNetCore.Http;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Projector.Controllers
{
    // This is the user packages API controller.
    // It manages the installation and removal of the user's NPM packages.
    [Route("api/[controller]")]
    public class UserFilesController : Controller
    {
        // An instance to the UserPacakgeManager service.
        private readonly IUserFileManager _fm;
        // An instance to the Database service.
        private readonly ProjectorContext _db;

        // Construct the UserFilesController using instances to it's dependencies using Dependency Injection.
        public UserFilesController(IUserFileManager fm, ProjectorContext db)
        {
            _fm = fm;
            _db = db;
        }

        public class FileData
        {
            public string Path { get; set; }
            public string ContentType { get; set; }
            public IFormFile File { get; set; }
        }

        // POST api/userfiles/project-name/write
        // This route handles the writing of a file.
        [Authorize]
        [HttpPost("{project}/write")]
        public async Task<IActionResult> WriteFile(int project, [FromForm] FileData data)
        {
            if (data.File == null || data.ContentType == null)
            {
                return BadRequest();
            }

            var userDomain = HttpContext.User.Claims.First().Value.Replace("@", "-at-");
            if (data.File == null)
            {
                return BadRequest();
            }
            using (var fileStream = data.File.OpenReadStream())
            {
                UserFile file = await _fm.WriteAsync(userDomain, project.ToString(), data.Path, fileStream, data.ContentType);
                return new JsonResult(new
                {
                    ok = true,
                    file = SelectUserFileMeta(file),
                });
            }
        }

        public class FileSelector
        {
            public string Path { get; set; }
        }

        // POST api/userfiles/project-name/read
        // This route handles the reading of a file.
        [Authorize]
        [HttpGet("{project}/read/{*filepath}")]
        public async Task<IActionResult> ReadFile(int project, string filepath)
        {
            if (filepath == null)
            {
                return BadRequest();
            }

            var parsedFilePath = Uri.UnescapeDataString(filepath);
            var userDomain = HttpContext.User.Claims.First().Value.Replace("@", "-at-");
            var userFileStream = await _fm.ReadAsync(userDomain, project.ToString(), parsedFilePath);
            return new FileStreamResult(userFileStream.Stream, userFileStream.MetaData.ContentType);
        }

        // POST api/userfiles/project-name/delete
        // This route handles the deletion of a file.
        [Authorize]
        [HttpPost("{project}/delete")]
        public async Task<IActionResult> DeleteFile(int project, [FromBody] FileSelector data)
        {
            if (data.Path == null)
            {
                return BadRequest();
            }

            var userDomain = HttpContext.User.Claims.First().Value.Replace("@", "-at-");
            await _fm.DeleteAsync(userDomain, project.ToString(), data.Path);
            return new JsonResult(new
            {
                ok = true
            });
        }

        public class FilePathChange
        {
            public string OldPath { get; set; }
            public string NewPath { get; set; }
        }

        // POST api/userfiles/project-name/rename
        // This route handles the renaming of a file.
        [Authorize]
        [HttpPost("{project}/rename")]
        public async Task<IActionResult> RenameFile(int project, [FromBody] FilePathChange data)
        {
            if (data.OldPath == null || data.NewPath == null)
            {
                return BadRequest();
            }

            var userDomain = HttpContext.User.Claims.First().Value.Replace("@", "-at-");
            await _fm.RenameAsync(userDomain, project.ToString(), data.OldPath, data.NewPath);
            return new JsonResult(new
            {
                ok = true
            });
        }

        // GET api/userfiles/my-project/list
        [Authorize]
        [HttpGet("{project}/list")]
        public async Task<IActionResult> GetFiles(int project)
        {
            var userDomain = HttpContext.User.Claims.First().Value.Replace("@", "-at-");
            var fileMeta = (await _fm.GetFilesAsync(userDomain, project.ToString()))
                .Select(SelectUserFileMeta);
            return new JsonResult(fileMeta);
        }

        object SelectUserFileMeta(UserFile x)
        {
            return new
            {
                Path = x.VirtualPath,
                ContentType = x.ContentType,
                FileSize = x.FileSize,
            };
        }

    }
}
